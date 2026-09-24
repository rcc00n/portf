from django.db import models
from django.utils import timezone


class TelegramRecipient(models.Model):
    label = models.CharField(max_length=120, blank=True)
    chat_id = models.CharField(max_length=64, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_active", "chat_id"]

    def __str__(self):
        return self.label or self.chat_id


class ContactRequest(models.Model):
    STATUS_NEW = "new"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_DONE = "done"
    STATUS_CHOICES = [
        (STATUS_NEW, "New"),
        (STATUS_IN_PROGRESS, "In progress"),
        (STATUS_DONE, "Done"),
    ]

    submission_key = models.UUIDField(null=True, blank=True, unique=True, editable=False)
    submission_digest = models.CharField(max_length=64, blank=True, editable=False)
    name = models.CharField(max_length=120)
    email = models.EmailField()
    company = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    source = models.CharField(max_length=120, blank=True)
    qualification = models.JSONField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.CharField(max_length=255, blank=True)
    telegram_sent = models.BooleanField(default=False)
    telegram_error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.email})"


class InquiryNotification(models.Model):
    """One durable job per inquiry; delivered recipients are never deliberately resent."""
    lead = models.OneToOneField(ContactRequest, on_delete=models.CASCADE, related_name="notification")
    status = models.CharField(max_length=12, default="pending", choices=[
        (state, state.title()) for state in ("pending", "processing", "sent", "failed")
    ])
    deliveries = models.JSONField(default=dict, blank=True)
    attempts = models.PositiveSmallIntegerField(default=0)
    last_attempt_at = models.DateTimeField(null=True, blank=True)
    next_attempt_at = models.DateTimeField(default=timezone.now)
    last_error = models.CharField(max_length=240, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    lease_token = models.UUIDField(null=True, editable=False)
    lease_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["status", "next_attempt_at"], name="inquiry_delivery_due")]


class InquiryRateBucket(models.Model):
    """Bounded fixed-window counters shared across application workers."""
    key = models.CharField(max_length=64, primary_key=True)
    count = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField(db_index=True)
