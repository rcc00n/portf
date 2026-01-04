from django.contrib import admin

from .models import Project, ProjectImage, ProjectLink


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1
    fields = ("image", "alt", "order")
    ordering = ("order",)


class ProjectLinkInline(admin.TabularInline):
    model = ProjectLink
    extra = 1
    fields = ("label", "href", "order")
    ordering = ("order",)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "impact", "is_published", "order", "updated_at")
    list_filter = ("is_published",)
    search_fields = ("title", "blurb")
    ordering = ("order", "-updated_at")
    inlines = [ProjectImageInline, ProjectLinkInline]
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "title",
                    "impact",
                    "blurb",
                    "url",
                    "tags",
                    "is_published",
                    "order",
                )
            },
        ),
    )


@admin.register(ProjectImage)
class ProjectImageAdmin(admin.ModelAdmin):
    list_display = ("project", "image", "order")
    list_select_related = ("project",)
    ordering = ("project", "order")


@admin.register(ProjectLink)
class ProjectLinkAdmin(admin.ModelAdmin):
    list_display = ("project", "label", "href", "order")
    list_select_related = ("project",)
    ordering = ("project", "order")
