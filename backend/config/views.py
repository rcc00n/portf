import mimetypes
import re
from pathlib import Path
from urllib.parse import urlencode

from django.conf import settings
from django.db import DatabaseError
from .metadata import ROUTES, case_project, canonical_origin, render_document, render_head, route_metadata
from xml.sax.saxutils import escape as xml_escape
from django.http import FileResponse, Http404, HttpResponse, HttpResponseNotModified, HttpResponsePermanentRedirect
from django.utils.http import http_date, parse_etags, parse_http_date_safe
from django.views.decorators.http import require_GET, require_safe


# Keep in sync with the public React routes. Unknown routes still receive the
# SPA's not-found screen, but with a real HTTP 404 for clients and crawlers.
FRONTEND_ROUTES = frozenset(ROUTES)

FRONTEND_REDIRECTS = {
    "/projects": "/work", "/cases/renter-architecture": "/work/renter", "/engineering": "/systems",
    "/architecture-preview": "/systems/architecture", "/admin-first": "/systems#control", "/production-ready": "/systems#production",
    "/decisions": "/systems/decisions", "/journal": "/systems/decisions", "/admin-demo": "/systems/demo", "/demo/admin": "/systems/demo",
    "/services": "/approach#scope", "/process": "/approach#working-together", "/tech": "/approach#engineering", "/about": "/approach#practice",
    "/not-for-everyone": "/approach#fit", "/pricing": "/approach#engagement", "/contact": "/start", "/estimate": "/start/define",
    "/summary": "/start/define#summary", "/pre-call": "/start#next-step",
}
ROUTING_VALUES = {
    "product": {"CRM", "SaaS", "Marketplace", "E-commerce", "crm", "saas", "marketplace", "commerce", "unsure", "unknown", "not sure", "Not sure", "not sure yet"},
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
    "/raccn-mark.svg", "/favicon.ico",
    "/favicon.svg", "/favicon.png", "/apple-touch-icon.png",
})
PUBLIC_PREFIXES = ("/assets/", "/home/media/", "/evidence/", "/fonts/", "/social/")
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
    project = None
    status = 200 if known_route else 404
    if ROUTES.get(normalized_path, {}).get("caseSlug"):
        try:
            project = case_project(ROUTES[normalized_path]["caseSlug"])
            status = 200 if project else 404
        except DatabaseError:
            status = 503
    meta = route_metadata(normalized_path, project, 'error' if status == 503 else 'ready')
    try:
        document = render_document(index_path.read_text(encoding="utf-8"), meta)
    except ValueError:
        return HttpResponse('Frontend build unavailable.', status=503, headers={"X-Robots-Tag":"noindex", "Cache-Control":"no-store"})
    response = HttpResponse(document, status=status, content_type="text/html")
    response["Cache-Control"] = "no-cache" if status == 200 and not project else "no-store"
    if meta.get('noindex'):
        response["X-Robots-Tag"] = "noindex, follow"
    return response


def not_found(request, exception=None):
    # Missing assets/API/media endpoints never receive the SPA shell or homepage SEO.
    meta = route_metadata('/404')
    body = '<!doctype html><html lang="en"><head>' + render_head(meta) + '</head><body><h1>Page not found</h1></body></html>'
    return HttpResponse(body, status=404, content_type='text/html', headers={'X-Robots-Tag':'noindex, follow','Cache-Control':'no-store'})


@require_safe
def robots(request):
    body = 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: ' + canonical_origin() + '/sitemap.xml\n'
    return HttpResponse(body, content_type='text/plain', headers={'Cache-Control':'no-cache'})


@require_safe
def sitemap(request):
    paths = []
    try:
        for path, meta in ROUTES.items():
            if not meta.get('noindex') and (not meta.get('caseSlug') or case_project(meta['caseSlug'])):
                paths.append(path)
    except DatabaseError:
        return HttpResponse('Sitemap temporarily unavailable.', status=503, headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex'})
    urls = ''.join('<url><loc>' + xml_escape(canonical_origin() + path) + '</loc></url>' for path in paths)
    body = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls + '</urlset>'
    return HttpResponse(body, content_type='application/xml', headers={'Cache-Control':'no-store'})
