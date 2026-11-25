"""Dokku startup probe: check this container, never a proxy or external provider."""
import json
import os
from urllib.error import URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, ProxyHandler, Request, build_opener


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def check_readiness():
    try:
        port = int(os.environ.get("PORT", "8000"))
        if not 1 <= port <= 65535:
            return False
        host = urlsplit(os.environ.get("DJANGO_CANONICAL_ORIGIN", "http://localhost")).netloc
        if not host or any(character in host for character in "\r\n@"):
            return False
        request = Request(f"http://127.0.0.1:{port}/ready/", headers={"Host": host})
        # Ignore ambient HTTP_PROXY. A redirect must not accidentally check an old
        # public container and pass while the new container is unhealthy.
        opener = build_opener(ProxyHandler({}), NoRedirect())
        with opener.open(request, timeout=4) as response:
            return response.status == 200 and json.loads(response.read(2048)) == {"ok": True}
    except (URLError, OSError, ValueError):
        return False


if __name__ == "__main__":
    ready = check_readiness()
    print("ready" if ready else "not ready")
    raise SystemExit(0 if ready else 1)
