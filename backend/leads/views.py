import json
import os
import urllib.request

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import ContactRequest, TelegramRecipient


def _get_client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def _clean_value(value):
    if isinstance(value, str):
        return value.strip()
    return ""


def _truncate(text, limit=3500):
    if len(text) <= limit:
        return text
    return text[: max(limit - 3, 0)] + "..."


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
        except Exception as exc:
            errors.append(f"{recipient.chat_id}: {exc}")

    if sent_any:
        return True, "; ".join(errors)
    return False, "; ".join(errors) if errors else "Unknown error"


@csrf_exempt
@require_POST
def contact_request(request):
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    name = _clean_value(payload.get("name"))
    email = _clean_value(payload.get("email"))
    company = _clean_value(payload.get("company"))
    message = _clean_value(payload.get("message"))
    source = _clean_value(
        payload.get("source")
        or request.META.get("HTTP_ORIGIN")
        or request.META.get("HTTP_REFERER")
    )
    if source:
        source = source[:120]

    errors = {}
    if not name:
        errors["name"] = "Required"
    if not email:
        errors["email"] = "Required"
    if not message:
        errors["message"] = "Required"

    if errors:
        return JsonResponse({"error": "Missing required fields", "fields": errors}, status=400)

    lead = ContactRequest.objects.create(
        name=name,
        email=email,
        company=company,
        message=message,
        source=source,
        ip_address=_get_client_ip(request),
        user_agent=_clean_value(request.META.get("HTTP_USER_AGENT", ""))[:255],
    )

    sent, error = _notify_telegram(lead)
    if sent or error:
        lead.telegram_sent = sent
        lead.telegram_error = error or ""
        lead.save(update_fields=["telegram_sent", "telegram_error", "updated_at"])

    return JsonResponse({"ok": True, "id": lead.id})
