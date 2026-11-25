import json
import uuid
from datetime import timedelta
from io import StringIO
from unittest.mock import patch

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.db import IntegrityError, transaction
from django.test import TestCase, TransactionTestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from .admin import ContactRequestAdmin
from .models import ContactRequest, InquiryNotification, InquiryRateBucket, TelegramRecipient
from .notifications import MAX_ATTEMPTS, format_message, process_one, retry_failed, send_telegram_message
from .views import MAX_BODY_BYTES


@override_settings(SECURE_SSL_REDIRECT=False, INQUIRY_RATE_LIMIT=1000)
class ReliabilityTests(TestCase):
    def setUp(self):
        self.url = reverse("contact-request")
        self.payload = {"name": "Visitor", "email": "visitor@example.com", "message": "Project context", "source": "site-start"}
        self.key = str(uuid.uuid4())
        self.transport = patch("leads.notifications.urllib.request.urlopen", side_effect=AssertionError("No live network in tests"))
        self.transport.start()
        self.addCleanup(self.transport.stop)

    def post(self, payload=None, key=None, **kwargs):
        return self.client.post(self.url, data=json.dumps(self.payload if payload is None else payload),
                                content_type="application/json", HTTP_IDEMPOTENCY_KEY=key or self.key, **kwargs)

    def test_one_acceptance_one_job_retry_and_new_submission(self):
        first = self.post()
        second = self.post()
        self.assertEqual(first.json(), second.json())
        self.assertEqual(first["Cache-Control"], "no-store")
        self.assertEqual(ContactRequest.objects.count(), 1)
        self.assertEqual(InquiryNotification.objects.count(), 1)
        new = self.post(key=str(uuid.uuid4()))
        self.assertNotEqual(first.json()["id"], new.json()["id"])
        self.assertEqual(ContactRequest.objects.count(), 2)

    def test_key_cannot_retrieve_unrelated_lead(self):
        self.post()
        response = self.post({**self.payload, "email": "someone-else@example.com"})
        self.assertEqual(response.status_code, 409)
        self.assertNotIn("id", response.json())
        self.assertNotIn("visitor@example.com", response.content.decode())
        self.assertEqual(ContactRequest.objects.count(), 1)

    def test_idempotency_is_database_constrained_and_independent_of_secret_rotation(self):
        self.post()
        with self.assertRaises(IntegrityError), transaction.atomic():
            ContactRequest.objects.create(name="Other", email="other@example.com", message="Other", submission_key=self.key)
        with override_settings(SECRET_KEY="different-worker-secret"):
            self.assertEqual(self.post().status_code, 200)
        self.assertEqual(ContactRequest.objects.count(), 1)

    def test_lead_and_outbox_are_atomic(self):
        with patch("leads.views.InquiryNotification.objects.create", side_effect=IntegrityError("test rollback")):
            self.assertEqual(self.post().status_code, 503)
        self.assertFalse(ContactRequest.objects.exists())
        self.assertFalse(InquiryNotification.objects.exists())

    def test_token_validation(self):
        for key in ("missing", "x" * 500, str(uuid.uuid1()), "", "123", str(uuid.uuid4()).replace("-", "")):
            response = self.client.post(self.url, data=json.dumps(self.payload), content_type="application/json", HTTP_IDEMPOTENCY_KEY=key)
            self.assertEqual(response.status_code, 400)
            self.assertFalse(response.json()["ok"])
        self.assertFalse(ContactRequest.objects.exists())

    def test_json_contract_body_limit_and_recursion(self):
        for content_type in ("text/plain", "application/x-www-form-urlencoded", "text/html"):
            response = self.client.post(self.url, data=json.dumps(self.payload), content_type=content_type)
            self.assertEqual(response.status_code, 415)
            self.assertIn("errors", response.json())
        response = self.client.post(self.url, data=b"x" * (MAX_BODY_BYTES + 1), content_type="application/json")
        self.assertEqual(response.status_code, 413)
        response = self.client.post(self.url, data=b"[" * 2000 + b"]" * 2000, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertFalse(ContactRequest.objects.exists())

    def test_optional_metadata_cannot_break_acceptance(self):
        bad = [-1, 10**200, "²", "１２", "١٢", "number", None, [], {}, True, "-1", 1.5, "9" * 400, float("nan")]
        for value in bad:
            with self.subTest(value=str(value)[:40]):
                response = self.post({**self.payload, "qualification": {"budget": {"label": "To discuss", "rating": value, "total": value}, "ignored": {"value": "not stored"}}}, key=str(uuid.uuid4()))
                self.assertEqual(response.status_code, 200)
                lead = ContactRequest.objects.get(pk=response.json()["id"])
                self.assertIsNone(lead.qualification["budget"]["rating"])
                self.assertIsNone(lead.qualification["budget"]["total"])
                self.assertNotIn("ignored", lead.qualification)
        for value in (None, [], "text", 1, {"projectType": []}):
            response = self.post({**self.payload, "qualification": value}, key=str(uuid.uuid4()))
            self.assertEqual(response.status_code, 200)
            self.assertIsNone(ContactRequest.objects.get(pk=response.json()["id"]).qualification)

    def test_metadata_bounds_and_valid_legacy_numeric_strings(self):
        response = self.post({**self.payload, "qualification": {"budget": {"label": "x" * 300, "value": "x" * 100, "rating": "2", "total": 4.0}}})
        item = ContactRequest.objects.get(pk=response.json()["id"]).qualification["budget"]
        self.assertEqual((len(item["label"]), len(item["value"]), item["rating"], item["total"]), (160, 64, 2, 4))

    def test_surrogates_and_large_json_integer_are_safe(self):
        response = self.post({**self.payload, "qualification": {"budget": {"label": "\ud800"}}})
        self.assertEqual(response.status_code, 200)
        raw = json.dumps(self.payload)[:-1] + ', "qualification":{"budget":{"label":"Unknown", "rating":' + '9' * 5000 + '}}}'
        response = self.client.post(self.url, data=raw, content_type="application/json", HTTP_IDEMPOTENCY_KEY=str(uuid.uuid4()))
        self.assertEqual(response.status_code, 200)

    @override_settings(INQUIRY_RATE_LIMIT=2)
    def test_rate_limits_new_inquiries_but_not_accepted_retries(self):
        self.assertEqual(self.post().status_code, 200)
        self.assertEqual(self.post(key=str(uuid.uuid4())).status_code, 200)
        limited = self.post(key=str(uuid.uuid4()), HTTP_X_FORWARDED_FOR="203.0.113.1")
        self.assertEqual(limited.status_code, 429)
        self.assertEqual(limited["Retry-After"], "3600")
        self.assertEqual(self.post().status_code, 200)
        self.assertEqual(ContactRequest.objects.count(), 2)
        self.assertEqual(InquiryRateBucket.objects.get().count, 2)
        self.assertEqual(self.post(key=str(uuid.uuid4()), REMOTE_ADDR="192.0.2.2").status_code, 200)

    @override_settings(INQUIRY_RATE_LIMIT=1)
    def test_ipv6_addresses_share_a_64_network_budget(self):
        self.assertEqual(self.post(REMOTE_ADDR="2001:db8::1").status_code, 200)
        self.assertEqual(self.post(key=str(uuid.uuid4()), REMOTE_ADDR="2001:db8::2").status_code, 429)

    def test_honeypot_and_unknown_keys(self):
        self.assertEqual(self.post({**self.payload, "website": "spam"}).status_code, 400)
        self.assertFalse(ContactRequest.objects.exists())
        response = self.post({**self.payload, "unknown": "ignored", "chat_id": "attacker"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(InquiryNotification.objects.get().deliveries, {})

    @override_settings(INQUIRY_ALLOWED_ORIGINS=["https://example.com"])
    def test_origin_allowlist_is_supplemental(self):
        self.assertEqual(self.post(HTTP_ORIGIN="https://other.example").status_code, 403)
        self.assertEqual(self.post(HTTP_ORIGIN="https://example.com").status_code, 200)
        self.assertEqual(self.post(key=str(uuid.uuid4())).status_code, 200)


@override_settings(SECURE_SSL_REDIRECT=False, INQUIRY_RATE_LIMIT=1000)
class NotificationTests(TestCase):
    def setUp(self):
        self.recipient = TelegramRecipient.objects.create(chat_id="123", label="Test recipient")
        self.lead = ContactRequest.objects.create(name="Visitor", email="visitor@example.com", message="Message", source="site-start",
            qualification={"projectType": {"value": "unsure", "label": "Not sure"}})
        self.job = InquiryNotification.objects.create(lead=self.lead, deliveries={"123": {"status": "pending", "error": ""}})
        self.env = patch.dict("os.environ", {"TELEGRAM_BOT_TOKEN": "test-only-token"})
        self.env.start()
        self.addCleanup(self.env.stop)
        self.transport = patch("leads.notifications.urllib.request.urlopen", side_effect=OSError("https://api.telegram.org/bottest-only-token/sendMessage"))
        self.network = self.transport.start()
        self.addCleanup(self.transport.stop)

    def make_due(self):
        InquiryNotification.objects.filter(pk=self.job.pk).update(next_attempt_at=timezone.now() - timedelta(seconds=1))

    def test_transport_failure_keeps_lead_and_does_not_leak_token(self):
        process_one()
        self.lead.refresh_from_db()
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "pending")
        self.assertEqual(self.job.attempts, 1)
        self.assertGreater(self.job.next_attempt_at, timezone.now())
        self.assertNotIn("test-only-token", self.job.last_error)
        self.assertNotIn("https://", self.lead.telegram_error)
        self.assertFalse(self.lead.telegram_sent)
        self.network.assert_called_once()
        self.assertFalse(process_one())

    @patch("leads.notifications.send_telegram_message", return_value=("sent", ""))
    def test_success_and_no_duplicate_processing(self, send):
        self.assertTrue(process_one())
        self.assertFalse(process_one())
        self.job.refresh_from_db()
        self.lead.refresh_from_db()
        self.assertEqual(self.job.status, "sent")
        self.assertIsNotNone(self.job.sent_at)
        self.assertTrue(self.lead.telegram_sent)
        send.assert_called_once()

    @patch("leads.notifications.send_telegram_message")
    def test_multiple_recipients_retry_only_failed_destination(self, send):
        TelegramRecipient.objects.create(chat_id="456")
        self.job.deliveries["456"] = {"status": "pending", "error": ""}
        self.job.save()
        send.side_effect = [("sent", ""), ("retry", "Telegram temporarily unavailable.")]
        process_one()
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "pending")
        self.assertEqual(self.job.deliveries["123"]["status"], "sent")
        self.make_due()
        send.side_effect = None
        send.return_value = ("sent", "")
        process_one()
        self.assertEqual(send.call_count, 3)
        self.assertEqual(send.call_args.args[1], "456")
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "sent")

    @patch("leads.notifications.send_telegram_message", return_value=("retry", "Temporary delivery failure."))
    def test_bounded_attempts_and_explicit_staff_retry(self, send):
        for _ in range(MAX_ATTEMPTS):
            self.make_due()
            process_one()
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "failed")
        self.assertEqual(self.job.attempts, MAX_ATTEMPTS)
        self.assertFalse(process_one())
        self.assertTrue(retry_failed(self.job))
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "pending")
        self.assertEqual(self.job.attempts, 0)
        self.assertTrue(ContactRequest.objects.filter(pk=self.lead.pk).exists())

    @patch("leads.notifications.send_telegram_message", return_value=("failed", "Recipient rejected delivery."))
    def test_permanent_failure_is_visible_without_automatic_retries(self, send):
        process_one()
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "failed")
        self.assertFalse(process_one())
        self.assertEqual(send.call_count, 1)

    @patch("leads.notifications.send_telegram_message", return_value=("sent", ""))
    def test_processing_lease_recovers_after_worker_restart(self, send):
        self.job.status = "processing"
        self.job.lease_until = timezone.now() + timedelta(seconds=60)
        self.job.save()
        self.assertFalse(process_one())
        self.job.lease_until = timezone.now() - timedelta(seconds=1)
        self.job.save()
        self.assertTrue(process_one())
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "sent")
        send.assert_called_once()

    @patch("leads.notifications.send_telegram_message")
    def test_removed_recipient_not_notified(self, send):
        self.recipient.delete()
        process_one()
        send.assert_not_called()
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "failed")

    def test_missing_configuration_retries_then_fails(self):
        with patch.dict("os.environ", {"TELEGRAM_BOT_TOKEN": ""}):
            for _ in range(MAX_ATTEMPTS):
                self.make_due()
                process_one()
        self.network.assert_not_called()
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "failed")
        self.assertIn("not configured", self.job.last_error)

    @patch("leads.notifications.send_telegram_message", return_value=("sent", ""))
    def test_empty_destination_snapshot_can_resolve_config_later(self, send):
        self.job.deliveries = {}
        self.job.save()
        self.recipient.delete()
        process_one()
        self.job.refresh_from_db()
        self.assertIn("No active", self.job.last_error)
        TelegramRecipient.objects.create(chat_id="456")
        self.make_due()
        process_one()
        self.assertEqual(send.call_args.args[1], "456")

    @patch("leads.notifications.send_telegram_message")
    def test_exhausted_interrupted_job_does_not_send_again(self, send):
        self.job.status = "processing"
        self.job.attempts = MAX_ATTEMPTS
        self.job.lease_until = timezone.now() - timedelta(seconds=1)
        self.job.save()
        process_one()
        send.assert_not_called()
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "failed")
        self.assertEqual(self.job.attempts, MAX_ATTEMPTS)

    def test_staff_retry_preserves_successful_recipient(self):
        self.job.status = "failed"
        self.job.deliveries = {"123": {"status": "sent", "error": ""}, "456": {"status": "failed", "error": "Rejected"}}
        self.job.save()
        retry_failed(self.job)
        self.job.refresh_from_db()
        self.assertEqual(self.job.deliveries["123"]["status"], "sent")
        self.assertEqual(self.job.deliveries["456"]["status"], "pending")

    def test_message_preserves_metadata_and_marks_utf16_truncation(self):
        self.lead.message = "😀" * 5000
        message = format_message(self.lead)
        self.assertLessEqual(len(message.encode("utf-16-le")) // 2, 3900)
        for value in (f"Lead ID: {self.lead.pk}", self.lead.email, "Source: site-start", "Project type: Not sure", "/admin/leads/contactrequest/", "Message shortened"):
            self.assertIn(value, message)
        self.assertLess(message.index("Project type"), message.index("Message:"))
        self.lead.message = "Short message"
        self.assertNotIn("shortened", format_message(self.lead))

    @patch("leads.notifications.send_telegram_message", return_value=("sent", ""))
    def test_management_command_once_and_expired_bucket_cleanup(self, send):
        InquiryRateBucket.objects.create(key="old", expires_at=timezone.now() - timedelta(seconds=1))
        call_command("process_inquiry_notifications", once=True, stdout=StringIO())
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "sent")
        self.assertFalse(InquiryRateBucket.objects.exists())

    @override_settings(STORAGES={"default": {"BACKEND": "django.core.files.storage.FileSystemStorage"}, "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"}})
    def test_admin_visible_status_and_authentication(self):
        self.assertEqual(ContactRequestAdmin(ContactRequest, admin.site).notification_state(self.lead), "pending")
        url = reverse("admin:leads_contactrequest_change", args=[self.lead.pk])
        self.assertEqual(self.client.get(url).status_code, 302)
        owner = get_user_model().objects.create_superuser(username="owner", email="owner@example.com", password="test-only-password")
        self.client.force_login(owner)
        response = self.client.get(url)
        self.assertContains(response, "pending")
        self.assertContains(response, "Last error")
        self.assertNotContains(response, "Submission key")
        self.assertNotContains(response, "test-only-token")
        self.assertEqual(self.client.get(reverse("admin:leads_inquirynotification_changelist")).status_code, 200)

    def test_transport_checks_telegram_json_and_uses_fixed_destination(self):
        with patch("leads.notifications.urllib.request.urlopen") as urlopen:
            response = urlopen.return_value.__enter__.return_value
            response.read.return_value = b'{"ok":true}'
            self.assertEqual(send_telegram_message("test-token", "123", "Text"), ("sent", ""))
            request = urlopen.call_args.args[0]
            self.assertEqual(request.full_url, "https://api.telegram.org/bottest-token/sendMessage")
            self.assertTrue(json.loads(request.data)["link_preview_options"]["is_disabled"])
            response.read.return_value = b'{"ok":false,"error_code":403,"description":"secret"}'
            state, detail = send_telegram_message("test-token", "123", "Text")
            self.assertEqual(state, "failed")
            self.assertNotIn("secret", detail)


class InquiryMigrationTests(TransactionTestCase):
    def test_forward_migration_preserves_historical_leads_without_tokens_or_resend(self):
        from django.db import connection
        from django.db.migrations.executor import MigrationExecutor
        old = [("leads", "0002_contactrequest_qualification")]
        new = [("leads", "0003_inquiryratebucket_contactrequest_submission_digest_and_more")]
        executor = MigrationExecutor(connection)
        executor.migrate(old)
        try:
            Before = executor.loader.project_state(old).apps.get_model("leads", "ContactRequest")
            row = Before.objects.create(name="Historical", email="history@example.com", message="Preserve",
                                        status="done", telegram_sent=True, qualification={"projectType": {"value": "unsure"}})
            executor = MigrationExecutor(connection)
            executor.migrate(new)
            After = executor.loader.project_state(new).apps.get_model("leads", "ContactRequest")
            migrated = After.objects.get(pk=row.pk)
            self.assertIsNone(migrated.submission_key)
            self.assertEqual(migrated.submission_digest, "")
            self.assertEqual(migrated.qualification, row.qualification)
            self.assertEqual(migrated.status, "done")
            self.assertTrue(migrated.telegram_sent)
            self.assertFalse(InquiryNotification.objects.exists())
        finally:
            MigrationExecutor(connection).migrate(new)
