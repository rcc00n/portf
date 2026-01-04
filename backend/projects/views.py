from django.http import JsonResponse
from django.views.decorators.http import require_GET

from .models import Project


def _absolute_url(request, url):
    if url.startswith("http://") or url.startswith("https://"):
        return url
    return request.build_absolute_uri(url)


@require_GET
def project_list(request):
    projects = (
        Project.objects.filter(is_published=True)
        .prefetch_related("links", "images")
        .order_by("order", "-created_at")
    )

    payload = []
    for project in projects:
        links = project.links.all().order_by("order", "id")
        images = project.images.all().order_by("order", "id")
        payload.append(
            {
                "title": project.title,
                "impact": project.impact,
                "blurb": project.blurb,
                "url": project.url,
                "tags": project.tags or [],
                "links": [{"label": link.label, "href": link.href} for link in links],
                "images": [_absolute_url(request, img.image.url) for img in images],
            }
        )

    return JsonResponse(payload, safe=False)
