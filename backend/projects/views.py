from django.http import JsonResponse
from django.views.decorators.http import require_GET

from .models import PricingTier, Project
from .publication import CASE_ROUTES


def _absolute_url(request, url):
    if url.startswith("http://") or url.startswith("https://"):
        return url
    return request.build_absolute_uri(url)


@require_GET
def project_list(request):
    projects = (
        Project.objects.filter(is_published=True)
        .prefetch_related("links", "images")
        .order_by("order", "id")
    )

    payload = []
    for project in projects:
        links = project.links.all()
        images = project.images.all()
        payload.append(
            {
                "id": project.pk,
                "slug": project.slug,
                "is_published": True,
                "order": project.order,
                "featured_placement": project.featured_placement,
                "featured_order": project.featured_order,
                "case_path": CASE_ROUTES.get(project.slug),
                "headline": project.headline,
                "status": project.status,
                "title": project.title,
                "impact": project.impact,
                "blurb": project.blurb,
                "url": project.url,
                "tags": project.tags or [],
                "links": [{"id": link.pk, "label": link.label, "href": link.href, "order": link.order} for link in links],
                "images": [_absolute_url(request, img.image.url) for img in images],
                "media": [{"id": img.pk, "url": _absolute_url(request, img.image.url), "alt": img.alt, "order": img.order} for img in images],
            }
        )

    response = JsonResponse(payload, safe=False)
    response["Cache-Control"] = "no-store"
    return response


@require_GET
def pricing_list(request):
    tiers = PricingTier.objects.prefetch_related("points").order_by("order", "id")
    payload = []
    for tier in tiers:
        points = tier.points.all()
        payload.append(
            {
                "tier": tier.tier,
                "price": tier.price,
                "info": tier.info,
                "featured": tier.featured,
                "points": [point.text for point in points],
            }
        )

    return JsonResponse(payload, safe=False)
