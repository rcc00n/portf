"""Durable, bounded notification delivery. Never imported into request acceptance."""
import json
import logging
import os
import urllib.error
import urllib.request
import uuid
from datetime import timedelta

from django.db.models import F, Q
from django.utils import timezone

from .models import ContactRequest, InquiryNotification, TelegramRecipient
from .validation import _clean_qualification

logger = logging.getLogger(__name__)
MAX_ATTEMPTS = 5
BACKOFF_SECONDS = (60, 300, 1800, 7200)
LEASE_SECONDS = 60


def _units(text):
    return len(text.encode("utf-16-le", errors="replace")) // 2


def _cut(text, units):
    return text.encode("utf-16-le", errors="replace")[:max(0, units) * 2].decode("utf-16-le", errors="ignore")


def format_message(lead):
    admin_path = f"/admin/leads/contactrequest/{lead.pk}/change/"
    lines = ["Project inquiry", f"Lead ID: {lead.pk}", f"Name: {lead.name[:120]}",
             f"Email: {lead.email[:254]}", f"Source: {lead.source[:120] or 'Not specified'}",
             f"Full inquiry (staff): {admin_path}"]
    if lead.company:
        lines.append(f"Company: {lead.company[:200]}")
    for key, item in (_clean_qualification(lead.qualification) or {}).items():
        title = {"projectType": "Project type", "complexity": "Complexity", "budget": "Budget", "timeline": "Timeline"}[key]
        detail = item["label"] or item["value"] or "Not specified"
        if item["rating"] is not None:
            detail += f" ({item['rating']}/{item['total'] if item['total'] is not None else '?'})"
        lines.append(f"{title}: {detail}")
    header = "\n".join(lines) + "\nMessage:\n"
    suffix = "\n[Message shortened. Open the full inquiry using the staff path above.]"
    available = 3900 - _units(header)
    if _units(lead.message) > available:
        return header + _cut(lead.message, available - _units(suffix)) + suffix
    return header + lead.message


def send_telegram_message(token, chat_id, text):
    # URL and credentials are exclusively operator-configured, never lead input.
    request = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=json.dumps({"chat_id": chat_id, "text": text, "link_preview_options": {"is_disabled": True}}).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            payload = json.loads(response.read(16384))
            if payload.get("ok") is True:
                return "sent", ""
            code = payload.get("error_code")
    except urllib.error.HTTPError as exc:
        code = exc.code
    except Exception:
        # Exception strings and response descriptions may contain tokens/PII.
        return "retry", "Telegram transport failed."
    if code in (400, 401, 403, 404):
        return "failed", "Telegram rejected delivery; review token and recipient configuration."
    return "retry", "Telegram temporarily unavailable."


def process_one():
    now = timezone.now()
    due = Q(status="pending", next_attempt_at__lte=now) | Q(status="processing", lease_until__lte=now)
    candidate = InquiryNotification.objects.filter(due).order_by("next_attempt_at", "pk").first()
    if candidate is None:
        return False
    token = uuid.uuid4()
    exhausted = candidate.attempts >= MAX_ATTEMPTS
    claimed = InquiryNotification.objects.filter(pk=candidate.pk, attempts=candidate.attempts).filter(due).update(
        status="processing", lease_token=token, lease_until=now + timedelta(seconds=LEASE_SECONDS),
        attempts=F("attempts") if exhausted else F("attempts") + 1, last_attempt_at=now,
    )
    if not claimed:
        return True
    job = InquiryNotification.objects.select_related("lead").get(pk=candidate.pk)
    owned = InquiryNotification.objects.filter(pk=job.pk, lease_token=token, status="processing")
    error = ""
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    deliveries = job.deliveries
    if not deliveries:
        deliveries = {chat: {"status": "pending", "error": ""} for chat in
                      TelegramRecipient.objects.filter(is_active=True).values_list("chat_id", flat=True)}
        owned.update(deliveries=deliveries)
    if exhausted:
        error = "Delivery attempt limit reached after interrupted processing."
    elif not bot_token:
        error = "Notification token is not configured."
    elif not deliveries:
        error = "No active notification recipients are configured."
    else:
        text = format_message(job.lead)
        for chat_id, result in deliveries.items():
            if result["status"] in ("sent", "failed"):
                continue
            if not owned.update(lease_until=timezone.now() + timedelta(seconds=LEASE_SECONDS)):
                return True
            if not TelegramRecipient.objects.filter(chat_id=chat_id, is_active=True).exists():
                state, detail = "failed", "Recipient removed or disabled."
            else:
                state, detail = send_telegram_message(bot_token, chat_id, text)
            deliveries[chat_id] = {"status": state, "error": detail}
            if not owned.update(deliveries=deliveries):
                return True
        error = next((result["error"] for result in deliveries.values() if result["status"] != "sent"), "")

    complete = bool(deliveries) and all(result["status"] == "sent" for result in deliveries.values())
    if complete:
        error = ""
    retryable = not deliveries or any(result["status"] in ("pending", "retry") for result in deliveries.values())
    status = "sent" if complete else "pending" if retryable and job.attempts < MAX_ATTEMPTS else "failed"
    finished = timezone.now()
    updated = owned.update(
        status=status, deliveries=deliveries, last_error=error[:240],
        sent_at=finished if complete else None, lease_token=None, lease_until=None,
        next_attempt_at=finished + timedelta(seconds=BACKOFF_SECONDS[min(job.attempts - 1, 3)]),
    )
    if updated:
        ContactRequest.objects.filter(pk=job.lead_id).update(
            telegram_sent=any(result["status"] == "sent" for result in deliveries.values()), telegram_error=error[:240],
        )
        if status == "failed":
            logger.error("Inquiry notification failed: job=%s lead=%s reason=%s", job.pk, job.lead_id, error)
    return True


def retry_failed(job):
    """Explicit staff retry; never resend successful recipient deliveries."""
    deliveries = {chat: result if result["status"] == "sent" else {"status": "pending", "error": ""}
                  for chat, result in job.deliveries.items()}
    return InquiryNotification.objects.filter(pk=job.pk, status="failed").update(
        status="pending", attempts=0, next_attempt_at=timezone.now(), last_error="", deliveries=deliveries,
        lease_token=None, lease_until=None,
    )
