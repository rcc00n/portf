import hashlib
import json
import logging
from functools import wraps
import uuid

from django.conf import settings
from django.core.exceptions import RequestDataTooBig, ValidationError
from django.core.validators import validate_email
from django.db import DatabaseError, IntegrityError, transaction
from django.http import JsonResponse
from django.utils.crypto import constant_time_compare
from django.views.decorators.csrf import csrf_exempt

from .abuse import allow_request, client_ip
from .models import ContactRequest, InquiryNotification, TelegramRecipient
from .validation import CONTACT_LIMITS, _clean_qualification, _clean_value

MAX_BODY_BYTES = 32768


def error_response(code, status=400, fields=None):
    errors = fields or {"request": code}
    response = JsonResponse({"ok": False, "errors": errors, "fields": errors, "error": code}, status=status)
    response["Cache-Control"] = "no-store"
    if status == 429:
        response["Retry-After"] = "3600"
    return response


def accepted(lead, digest):
    if not constant_time_compare(lead.submission_digest, digest):
        return error_response("Submission key already used for different content.", 409)
    response = JsonResponse({"ok": True, "id": lead.pk})
    response["Cache-Control"] = "no-store"
    return response


def database_failure_boundary(view):
    @wraps(view)
    def wrapped(request):
        try:
            return view(request)
        except DatabaseError:
            logging.getLogger(__name__).error("Inquiry database operation failed; acceptance unconfirmed.")
            return error_response("Acceptance could not be confirmed. Retry with the same submission key.", 503)
    return wrapped


@csrf_exempt
@database_failure_boundary
def contact_request(request):
    if request.method != "POST":
        response = error_response("Use POST.", 405)
        response["Allow"] = "POST"
        return response
    if request.content_type != "application/json":
        return error_response("Use application/json.", 415)
    # Bounded read also applies when Content-Length is missing or dishonest.
    try:
        raw = request.read(MAX_BODY_BYTES + 1)
    except RequestDataTooBig:
        return error_response("Request is too large.", 413)
    if len(raw) > MAX_BODY_BYTES:
        return error_response("Request is too large.", 413)
    try:
        payload = json.loads(raw.decode("utf-8"), parse_constant=lambda _: None, parse_int=lambda value: int(value) if len(value) < 32 else None)
    except (ValueError, UnicodeError, RecursionError):
        return error_response("Invalid JSON.")
    if not isinstance(payload, dict):
        return error_response("Expected a JSON object.")
    origin = request.META.get("HTTP_ORIGIN")
    if origin and settings.INQUIRY_ALLOWED_ORIGINS and origin not in settings.INQUIRY_ALLOWED_ORIGINS:
        return error_response("Origin is not allowed.", 403)
    try:
        raw_key = request.headers.get("Idempotency-Key", "")
        key = uuid.UUID(raw_key)
        if len(raw_key) != 36 or key.version != 4 or str(key) != raw_key.lower():
            raise ValueError
    except (ValueError, AttributeError):
        return error_response("A UUID v4 Idempotency-Key header is required.")
    # Honeypot never gives a false acceptance and cannot enqueue a notification.
    if payload.get("website") not in (None, ""):
        return error_response("Submission could not be accepted.")

    values = {field: _clean_value(payload.get(field)) for field in CONTACT_LIMITS}
    errors = {field: "Required" for field in ("name", "email", "message") if not values[field]}
    for field, limit in CONTACT_LIMITS.items():
        if len(values[field]) > limit:
            errors[field] = f"Use {limit:,} characters or fewer."
    if values["email"] and "email" not in errors:
        try:
            validate_email(values["email"])
        except ValidationError:
            errors["email"] = "Use a valid email address."
    if errors:
        return error_response("Check the highlighted fields.", fields=errors)
    values.update(
        source=_clean_value(payload.get("source") or origin or request.META.get("HTTP_REFERER"))[:120],
        qualification=_clean_qualification(payload.get("qualification")),
    )
    digest = hashlib.sha256(json.dumps(values, sort_keys=True, ensure_ascii=True).encode()).hexdigest()
    existing = ContactRequest.objects.filter(submission_key=key).first()
    if existing:
        return accepted(existing, digest)
    ip = client_ip(request)
    if not allow_request(ip):
        return error_response("Please wait before sending another inquiry.", 429)
    try:
        with transaction.atomic():
            lead = ContactRequest.objects.create(
                **values, submission_key=key, submission_digest=digest,
                ip_address=ip, user_agent=_clean_value(request.META.get("HTTP_USER_AGENT"))[:255],
            )
            # Snapshot configured destinations, not any user-supplied URL or chat ID.
            destinations = {chat: {"status": "pending", "error": ""} for chat in
                            TelegramRecipient.objects.filter(is_active=True).values_list("chat_id", flat=True)}
            InquiryNotification.objects.create(lead=lead, deliveries=destinations)
    except IntegrityError:
        # Unique database constraint serializes simultaneous retries across workers.
        existing = ContactRequest.objects.filter(submission_key=key).first()
        if existing:
            return accepted(existing, digest)
        raise
    return accepted(lead, digest)
