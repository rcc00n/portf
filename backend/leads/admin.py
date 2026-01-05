from django.contrib import admin

from .models import ContactRequest, TelegramRecipient


@admin.register(TelegramRecipient)
class TelegramRecipientAdmin(admin.ModelAdmin):
    list_display = ("chat_id", "label", "is_active", "updated_at")
    list_editable = ("is_active",)
    search_fields = ("chat_id", "label")
    ordering = ("-is_active", "chat_id")


@admin.register(ContactRequest)
class ContactRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "status", "created_at", "telegram_sent")
    list_filter = ("status", "telegram_sent", "created_at")
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
