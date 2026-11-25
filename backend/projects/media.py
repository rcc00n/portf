"""Registered project images only; intentionally usable behind Gunicorn with DEBUG=False."""
from pathlib import Path

from PIL import Image, UnidentifiedImageError
from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse, HttpResponseNotModified
from django.utils.http import http_date, parse_etags
from django.views.decorators.http import require_safe

from .models import ProjectImage
from .validators import IMAGE_TYPES


def _project_media(request, path):
    if not settings.SERVE_MEDIA:
        raise Http404("Media unavailable")
    relative = Path(path)
    if not path.startswith("projects/") or "\\" in path or any(part.startswith(".") for part in relative.parts):
        raise Http404("Image not found")
    record = ProjectImage.objects.select_related("project").filter(image=path).first()
    staff_preview = request.user.is_active and request.user.is_staff and request.user.has_perm("projects.view_projectimage")
    if not record or (not record.project.is_published and not staff_preview):
        raise Http404("Image not found")
    root = Path(settings.MEDIA_ROOT).resolve()
    filename = (root / relative).resolve()
    if not filename.is_relative_to(root) or not filename.is_file():
        raise Http404("Image not found")
    try:
        handle = filename.open("rb")
        try:
            image = Image.open(handle)
            content_type = IMAGE_TYPES.get(image.format)
            if not content_type:
                raise Http404("Unsupported image")
            handle.seek(0)
            stat = filename.stat()
            etag = f'W/"{stat.st_mtime_ns:x}-{stat.st_size:x}"'
            cache = "private, no-store" if staff_preview else "public, max-age=0, must-revalidate"
            tags = parse_etags(request.headers.get("If-None-Match", ""))
            if not staff_preview and ("*" in tags or etag.removeprefix("W/") in {t.removeprefix("W/") for t in tags}):
                handle.close()
                response = HttpResponseNotModified()
            else:
                response = FileResponse(handle, content_type=content_type)
            response["ETag"] = etag
            response["Last-Modified"] = http_date(stat.st_mtime)
            response["Cache-Control"] = cache
            response["X-Content-Type-Options"] = "nosniff"
            return response
        except Exception:
            handle.close()
            raise
    except (OSError, UnidentifiedImageError, Image.DecompressionBombError):
        raise Http404("Image not found") from None


@require_safe
def project_media(request, path):
    try:
        return _project_media(request, path)
    except Http404:
        return HttpResponse("Image not found", status=404, content_type="text/plain", headers={"Cache-Control":"no-store", "X-Content-Type-Options":"nosniff", "X-Robots-Tag":"noindex"})
