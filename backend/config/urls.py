from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, re_path

from config.views import frontend_index, healthcheck
from leads.views import contact_request
from projects.views import pricing_list, project_list

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/contacts/", contact_request, name="contact-request"),
    path("api/projects/", project_list, name="project-list"),
    path("api/pricing/", pricing_list, name="pricing-list"),
    path("health/", healthcheck, name="healthcheck"),
]

if settings.SERVE_MEDIA:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    re_path(r"^(?!api/|admin/|media/|static/).*$", frontend_index, name="frontend"),
]
