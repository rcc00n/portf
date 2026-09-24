"""Request limits use a verified proxy identity or the conservative socket peer."""
import ipaddress
from datetime import timedelta

from django.conf import settings
from django.db.models import F
from django.utils import timezone
from django.utils.crypto import salted_hmac

from .models import InquiryRateBucket


def client_ip(request):
    try:
        return str(ipaddress.ip_address(getattr(request, "trusted_client_ip", None) or request.META.get("REMOTE_ADDR", "")))
    except ValueError:
        return None


def allow_request(ip):
    # No email/name fingerprint. A generous shared-network limit; configure only
    # after measuring real traffic. A sanitized proxy is an operational concern.
    limit = settings.INQUIRY_RATE_LIMIT
    window = int(timezone.now().timestamp()) // 3600
    identity = ip or "unavailable"
    if ip and ":" in ip:
        identity = str(ipaddress.ip_network(f"{ip}/64", strict=False))
    key = salted_hmac("inquiry-rate", f"{identity}:{window}", algorithm="sha256").hexdigest()
    bucket, _ = InquiryRateBucket.objects.get_or_create(
        key=key, defaults={"expires_at": timezone.now() + timedelta(hours=2)}
    )
    return bool(InquiryRateBucket.objects.filter(pk=bucket.pk, count__lt=limit).update(count=F("count") + 1))
