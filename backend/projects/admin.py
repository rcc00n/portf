from django.contrib import admin

from .models import PricingPoint, PricingTier, Project, ProjectImage, ProjectLink


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


class PricingPointInline(admin.TabularInline):
    model = PricingPoint
    extra = 1
    fields = ("text", "order")
    ordering = ("order",)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "is_published", "featured_placement", "featured_order", "order", "updated_at")
    list_filter = ("is_published", "featured_placement")
    list_editable = ("is_published", "featured_placement", "featured_order", "order")
    search_fields = ("title", "slug", "blurb")
    ordering = ("order", "id")
    inlines = [ProjectImageInline, ProjectLinkInline]
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "title",
                    "slug",
                    "headline",
                    "status",
                    "featured_placement",
                    "featured_order",
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


@admin.register(PricingTier)
class PricingTierAdmin(admin.ModelAdmin):
    list_display = ("order", "tier", "price", "info", "featured")
    list_filter = ("featured",)
    ordering = ("order",)
    fields = ("tier", "price", "info", "featured", "order")
    inlines = [PricingPointInline]


@admin.register(PricingPoint)
class PricingPointAdmin(admin.ModelAdmin):
    list_display = ("tier", "text", "order")
    list_select_related = ("tier",)
    ordering = ("tier", "order")
