from django.conf import settings
from django.http import Http404, HttpResponse
from django.views.decorators.http import require_GET


@require_GET
def healthcheck(_request):
    return HttpResponse("ok")


@require_GET
def frontend_index(_request):
    index_path = settings.FRONTEND_DIST_DIR / "index.html"
    if not index_path.exists():
        raise Http404("Frontend build not found")
    return HttpResponse(index_path.read_text(encoding="utf-8"), content_type="text/html")
