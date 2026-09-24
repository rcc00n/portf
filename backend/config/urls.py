from django.contrib import admin
from django.urls import path, re_path

from config.views import frontend_index, healthcheck, robots, sitemap
from leads.views import contact_request
from projects.views import pricing_list, project_list
from projects.media import project_media

handler404 = "config.views.not_found"

urlpatterns = [
    path("robots.txt", robots),
    path("sitemap.xml", sitemap),
    path("admin/", admin.site.urls),
    path("api/contacts/", contact_request, name="contact-request"),
    path("api/projects/", project_list, name="project-list"),
    path("api/pricing/", pricing_list, name="pricing-list"),
    path("health/", healthcheck, name="healthcheck"),
]

urlpatterns += [path("media/<path:path>", project_media, name="project-media")]

urlpatterns += [
    re_path(r"^(?!api/|admin/|media/|static/).*$", frontend_index, name="frontend"),
]
