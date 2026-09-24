"""Bounded proxy trust and browser policy; no visitor identifiers are logged."""
import ipaddress
from django.conf import settings


def trusted_peer(request):
    try:
        address = ipaddress.ip_address(request.META.get("REMOTE_ADDR", ""))
    except ValueError:
        return False
    return any(address in network for network in settings.TRUSTED_PROXY_NETWORKS)


class TrustedProxyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.trusted_client_ip = None
        trusted = trusted_peer(request)
        protocol = request.META.get("HTTP_X_FORWARDED_PROTO")
        if not trusted or protocol not in {"http", "https"}:
            request.META.pop("HTTP_X_FORWARDED_PROTO", None)
        # Opt-in contract: nginx OVERWRITES X-Forwarded-For with $remote_addr.
        # Lists are rejected, not interpreted. No public client can nominate peers.
        if trusted and settings.TRUST_PROXY_CLIENT_IP:
            try:
                request.trusted_client_ip = str(ipaddress.ip_address(request.META.get("HTTP_X_FORWARDED_FOR", "")))
            except ValueError:
                pass
        return self.get_response(request)


class ResponsePolicyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()"
        # Django admin has its own scripts/templates; do not silently constrain
        # authenticated CMS editing with the public SPA policy.
        if not request.path.startswith("/admin/"):
            connect = " ".join(["'self'", *settings.CSP_CONNECT_ORIGINS])
            response["Content-Security-Policy"] = (
                "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: blob: https:; font-src 'self'; "
                f"connect-src {connect}; object-src 'none'; base-uri 'self'; "
                "frame-ancestors 'none'; form-action 'self'"
            )
        return response
