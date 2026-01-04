from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, re_path

from config.views import frontend_index, healthcheck
from projects.views import project_list

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/projects/", project_list, name="project-list"),
    path("health/", healthcheck, name="healthcheck"),
]

if settings.SERVE_MEDIA:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    re_path(r"^(?!api/|admin/|media/|static/).*$", frontend_index, name="frontend"),
]
