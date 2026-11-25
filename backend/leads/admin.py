from django.contrib import admin

from .models import ContactRequest, TelegramRecipient, InquiryNotification


@admin.register(TelegramRecipient)
class TelegramRecipientAdmin(admin.ModelAdmin):
    list_display = ("chat_id", "label", "is_active", "updated_at")
    list_editable = ("is_active",)
    search_fields = ("chat_id", "label")
    ordering = ("-is_active", "chat_id")


class NotificationInline(admin.StackedInline):
    model = InquiryNotification
    extra = 0
    can_delete = False
    fields = ("status", "attempts", "last_attempt_at", "next_attempt_at", "sent_at", "last_error", "deliveries")
    readonly_fields = fields

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(InquiryNotification)
class InquiryNotificationAdmin(admin.ModelAdmin):
    list_display = ("lead", "status", "attempts", "last_attempt_at", "sent_at", "last_error")
    list_filter = ("status",)
    search_fields = ("lead__email", "lead__name")
    fields = ("lead", *NotificationInline.fields, "created_at")
    readonly_fields = fields
    actions = ("retry_failed_notifications",)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.action(description="Retry failed notifications (preserve delivered recipients)", permissions=["change"])
    def retry_failed_notifications(self, request, queryset):
        from .notifications import retry_failed
        count = sum(retry_failed(job) for job in queryset.filter(status="failed"))
        self.message_user(request, f"Queued {count} failed notification(s).")


@admin.register(ContactRequest)
class ContactRequestAdmin(admin.ModelAdmin):
    inlines = (NotificationInline,)

    @admin.display(description="Notification")
    def notification_state(self, obj):
        try:
            return obj.notification.status
        except InquiryNotification.DoesNotExist:
            return "Historical — no job"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("notification")

    list_display = ("id", "name", "email", "status", "created_at", "notification_state")
    list_filter = ("status", "notification__status", "telegram_sent", "created_at")
    search_fields = ("name", "email", "company", "message")
    readonly_fields = ("qualification", "created_at", "updated_at", "ip_address", "user_agent", "telegram_sent", "telegram_error")
    fieldsets = (
        (
            None,
            {
                "fields": ("name", "email", "company", "message", "source", "status"),
            },
        ),
        (
            "Qualification",
            {
                "fields": ("qualification",),
            },
        ),
        (
            "Meta",
            {
                "fields": ("ip_address", "user_agent", "created_at", "updated_at"),
            },
        ),
        (
            "Telegram",
            {
                "fields": ("telegram_sent", "telegram_error"),
            },
        ),
    )
