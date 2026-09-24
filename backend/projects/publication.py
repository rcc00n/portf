# Approved editorial cases only. Creating a CMS record does not create a route.
CASE_ROUTES = {"renter": "/work/renter"}


def published_case_exists(slug):
    from .models import Project
    return slug in CASE_ROUTES and Project.objects.filter(slug=slug, is_published=True).exists()
