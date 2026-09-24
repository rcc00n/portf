import ipaddress
import json
import math
import os
import urllib.request

from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import ContactRequest, TelegramRecipient


CONTACT_LIMITS = {"name": 120, "email": 254, "company": 200, "message": 5000}


def _get_client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip()
    for value in (forwarded, request.META.get("REMOTE_ADDR")):
        try:
            return str(ipaddress.ip_address(value))
        except ValueError:
            continue
    return None


def _clean_value(value):
    if isinstance(value, str):
        return value.strip()
    return ""


def _clean_int(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value) if math.isfinite(value) else None
    if isinstance(value, str):
        value = value.strip()
        if value.isdigit():
            return int(value)
    return None


def _clean_qualification(payload):
    if not isinstance(payload, dict):
        return None
    cleaned = {}
    for key in ("projectType", "complexity", "budget", "timeline"):
        item = payload.get(key)
        if not isinstance(item, dict):
            continue
        value = _clean_value(item.get("value"))
        label = _clean_value(item.get("label"))
        if key == "projectType" and value.lower() in {"unsure", "unknown", "not sure", "not sure yet"}:
            value, label = "unsure", "Not sure"
        rating = _clean_int(item.get("rating"))
        total = _clean_int(item.get("total"))
        if not any([value, label, rating, total]):
            continue
        cleaned[key] = {
            "value": value,
            "label": label,
            "rating": rating,
            "total": total,
        }
    return cleaned or None


def _truncate(text, limit=3500):
    if len(text) <= limit:
        return text
    return text[: max(limit - 3, 0)] + "..."


def _format_qualification_lines(qualification):
    if not isinstance(qualification, dict):
        return []
    labels = {
        "projectType": "Project type",
        "complexity": "Complexity",
        "budget": "Budget",
        "timeline": "Timeline",
    }
    ordered_keys = ("projectType", "complexity", "budget", "timeline")
    lines = []
    for key in ordered_keys:
        item = qualification.get(key)
        if not isinstance(item, dict):
            continue
        rating = item.get("rating")
        rating_part = "-"
        if isinstance(rating, int):
            rating_part = str(rating)
        label = item.get("label") or item.get("value")
        title = labels.get(key, key)
        if label:
            lines.append(f"{title}: {rating_part} ({label})")
        else:
            lines.append(f"{title}: {rating_part}")
    return lines


def _format_message(lead):
    lines = [
        "New order received",
        f"ID: {lead.id}",
        f"Name: {lead.name}",
        f"Email: {lead.email}",
    ]
    if lead.company:
        lines.append(f"Company: {lead.company}")
    if lead.message:
        lines.append("Message:")
        lines.append(lead.message)
    if lead.qualification:
        lines.append("Qualification:")
        lines.extend(_format_qualification_lines(lead.qualification))
    if lead.source:
        lines.append(f"Source: {lead.source}")
    return _truncate("\n".join(lines))


def _send_telegram_message(token, chat_id, text):
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return 200 <= response.status < 300


def _notify_telegram(lead):
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        return False, "Missing TELEGRAM_BOT_TOKEN"

    recipients = list(TelegramRecipient.objects.filter(is_active=True))
    if not recipients:
        return False, "No active Telegram recipients"

    text = _format_message(lead)
    errors = []
    sent_any = False

    for recipient in recipients:
        try:
            if _send_telegram_message(token, recipient.chat_id, text):
                sent_any = True
            else:
                errors.append(f"{recipient.chat_id}: HTTP error")
        except Exception:
            # Transport exceptions can contain the request URL and bot token.
            errors.append(f"{recipient.chat_id}: Telegram delivery failed")

    if sent_any:
        return True, "; ".join(errors)
    return False, "; ".join(errors) if errors else "Unknown error"


@csrf_exempt
@require_POST
def contact_request(request):
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    if not isinstance(payload, dict):
        return JsonResponse({"error": "Expected a JSON object"}, status=400)

    name = _clean_value(payload.get("name"))
    email = _clean_value(payload.get("email"))
    company = _clean_value(payload.get("company"))
    message = _clean_value(payload.get("message"))
    source = _clean_value(
        payload.get("source")
        or request.META.get("HTTP_ORIGIN")
        or request.META.get("HTTP_REFERER")
    )
    qualification = _clean_qualification(payload.get("qualification"))
    if source:
        source = source[:120]

    errors = {}
    if not name:
        errors["name"] = "Required"
    if not email:
        errors["email"] = "Required"
    if not message:
        errors["message"] = "Required"

    for field, value in (("name", name), ("email", email), ("company", company), ("message", message)):
        if len(value) > CONTACT_LIMITS[field]:
            errors[field] = f"Use {CONTACT_LIMITS[field]:,} characters or fewer."
    if email and "email" not in errors:
        try:
            validate_email(email)
        except ValidationError:
            errors["email"] = "Use a valid email address."

    if errors:
        return JsonResponse({"error": "Check the highlighted fields", "fields": errors}, status=400)

    lead = ContactRequest.objects.create(
        name=name,
        email=email,
        company=company,
        message=message,
        source=source,
        qualification=qualification,
        ip_address=_get_client_ip(request),
        user_agent=_clean_value(request.META.get("HTTP_USER_AGENT", ""))[:255],
    )

    sent, error = _notify_telegram(lead)
    if sent or error:
        lead.telegram_sent = sent
        lead.telegram_error = error or ""
        lead.save(update_fields=["telegram_sent", "telegram_error", "updated_at"])

    return JsonResponse({"ok": True, "id": lead.id})
