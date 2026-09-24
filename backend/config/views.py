import mimetypes
import re
from pathlib import Path
from urllib.parse import urlencode

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse, HttpResponseNotModified, HttpResponsePermanentRedirect
from django.utils.http import http_date, parse_etags, parse_http_date_safe
from django.views.decorators.http import require_GET, require_safe


# Keep in sync with the public React routes. Unknown routes still receive the
# SPA's not-found screen, but with a real HTTP 404 for clients and crawlers.
FRONTEND_ROUTES = frozenset({
    "/", "/work", "/work/renter", "/systems", "/systems/architecture", "/systems/decisions", "/systems/demo",
    "/approach", "/start", "/start/define", "/privacy", "/terms",
    "/prototype", "/prototype/braided-signal", "/prototype/control-plates", "/prototype/routing-index",
})
FRONTEND_REDIRECTS = {
    "/projects": "/work", "/cases/renter-architecture": "/work/renter", "/engineering": "/systems",
    "/architecture-preview": "/systems/architecture", "/admin-first": "/systems#control", "/production-ready": "/systems#production",
    "/decisions": "/systems/decisions", "/journal": "/systems/decisions", "/admin-demo": "/systems/demo", "/demo/admin": "/systems/demo",
    "/services": "/approach#scope", "/process": "/approach#working-together", "/tech": "/approach#engineering", "/about": "/approach#practice",
    "/not-for-everyone": "/approach#fit", "/pricing": "/approach#engagement", "/contact": "/start", "/estimate": "/start/define",
    "/summary": "/start/define#summary", "/pre-call": "/start#next-step",
}
ROUTING_VALUES = {
    "product": {"CRM", "SaaS", "Marketplace", "E-commerce", "crm", "saas", "marketplace", "commerce", "unsure"},
    "complexity": {"Lean", "Balanced", "Advanced", "simple", "medium", "complex"},
    "team": {"Small", "Core", "Expanded"}, "integrations": {"None", "Standard", "Heavy"},
    "maturity": {"idea", "mvp", "growth", "scale", "unknown"}, "source": {"homepage"}, "definition": {"1"},
}


def _legacy_redirect(request, path):
    target = FRONTEND_REDIRECTS[path]
    base, _, anchor = target.partition("#")
    query = {}
    if base.startswith("/start"):
        query = {key: value for key, value in request.GET.items() if value in ROUTING_VALUES.get(key, set())}
    if path == "/contact" and ("product" in query or "complexity" in query):
        query["definition"] = "1"
    destination = base + ("?" + urlencode(query) if query else "") + ("#" + anchor if anchor else "")
    return HttpResponsePermanentRedirect(destination)


PUBLIC_FILES = frozenset({
    "/robots.txt", "/sitemap.xml", "/raccn-mark.svg", "/favicon.ico",
    "/favicon.svg", "/favicon.png", "/apple-touch-icon.png",
})
PUBLIC_PREFIXES = ("/assets/", "/home/media/", "/prototype/media/", "/prototype/fonts/", "/social/")
PUBLIC_SUFFIXES = frozenset({
    ".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif",
    ".svg", ".ico", ".woff", ".woff2", ".ttf", ".otf", ".txt", ".xml",
})
CONTENT_TYPES = {
    ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
    ".webp": "image/webp", ".woff2": "font/woff2", ".woff": "font/woff",
    ".xml": "application/xml", ".txt": "text/plain",
}
HASHED_ASSET = re.compile(r"-[A-Za-z0-9_-]{8,}\.[A-Za-z0-9]+$")


@require_GET
def healthcheck(_request):
    return HttpResponse("ok")


def _frontend_asset(request, root, path):
    relative = Path(path.lstrip("/"))
    if "\\" in path or any(part.startswith(".") for part in relative.parts):
        raise Http404("Asset not found")
    asset = (root / relative).resolve()
    if not asset.is_relative_to(root) or not asset.is_file() or asset.suffix.lower() not in PUBLIC_SUFFIXES:
        raise Http404("Asset not found")

    stat = asset.stat()
    etag = f'W/"{stat.st_mtime_ns:x}-{stat.st_size:x}"'
    requested_etags = parse_etags(request.headers.get("If-None-Match", ""))
    modified_since = parse_http_date_safe(request.headers.get("If-Modified-Since", ""))
    unchanged = "*" in requested_etags or etag.removeprefix("W/") in {tag.removeprefix("W/") for tag in requested_etags}
    if not requested_etags and modified_since is not None:
        unchanged = int(stat.st_mtime) <= modified_since

    if unchanged:
        response = HttpResponseNotModified()
    else:
        content_type = CONTENT_TYPES.get(asset.suffix.lower()) or mimetypes.guess_type(asset.name)[0] or "application/octet-stream"
        response = FileResponse(asset.open("rb"), content_type=content_type)
    response["ETag"] = etag
    response["Last-Modified"] = http_date(stat.st_mtime)
    if path.startswith("/assets/") and HASHED_ASSET.search(asset.name):
        response["Cache-Control"] = "public, max-age=31536000, immutable"
    else:
        response["Cache-Control"] = "public, max-age=300"
    return response


@require_safe
def frontend_index(request):
    root = Path(settings.FRONTEND_DIST_DIR).resolve()
    path = request.path_info
    if path in PUBLIC_FILES or path.startswith(PUBLIC_PREFIXES):
        return _frontend_asset(request, root, path)
    if Path(path).suffix or "\\" in path or any(part.startswith(".") for part in Path(path).parts):
        raise Http404("Page not found")

    normalized_path = path.rstrip("/") or "/"
    if normalized_path in FRONTEND_REDIRECTS:
        return _legacy_redirect(request, normalized_path)

    index_path = root / "index.html"
    if not index_path.is_file():
        raise Http404("Frontend build not found")
    normalized_path = path.rstrip("/") or "/"
    known_route = normalized_path in FRONTEND_ROUTES
    response = HttpResponse(index_path.read_text(encoding="utf-8"), status=200 if known_route else 404, content_type="text/html")
    response["Cache-Control"] = "no-cache" if known_route else "no-store"
    if not known_route or normalized_path.startswith("/prototype") or normalized_path == "/systems/demo":
        response["X-Robots-Tag"] = "noindex"
    return response
