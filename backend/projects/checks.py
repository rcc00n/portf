from pathlib import Path
from urllib.parse import urlsplit
from django.conf import settings
from django.core.checks import Error, register


@register()
def media_configuration(app_configs, **kwargs):
    if not settings.SERVE_MEDIA:
        return []
    errors = []
    url = urlsplit(settings.MEDIA_URL)
    if url.scheme or url.netloc or url.query or url.fragment or settings.MEDIA_URL != "/media/":
        errors.append(Error("Local project media serving requires DJANGO_MEDIA_URL=/media/.", id="projects.E001"))
    root = Path(settings.MEDIA_ROOT).resolve()
    for name in ("STATIC_ROOT", "FRONTEND_DIST_DIR"):
        other = Path(getattr(settings, name)).resolve()
        if root.is_relative_to(other) or other.is_relative_to(root):
            errors.append(Error(f"MEDIA_ROOT must be separate from {name}.", id="projects.E002"))
    if settings.STATIC_URL.startswith(settings.MEDIA_URL) or settings.MEDIA_URL.startswith(settings.STATIC_URL):
        errors.append(Error("Static and media URL namespaces must not overlap.", id="projects.E003"))
    if settings.STORAGES["default"]["BACKEND"] != "django.core.files.storage.FileSystemStorage":
        errors.append(Error("Local project media serving requires FileSystemStorage; set DJANGO_SERVE_MEDIA=false with externally served storage.", id="projects.E004"))
    return errors
