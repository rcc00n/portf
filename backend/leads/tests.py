import json
from unittest.mock import patch

from django.test import TestCase
from django.urls import reverse

from .models import ContactRequest, TelegramRecipient
from .views import CONTACT_LIMITS


class ContactRequestTests(TestCase):
    def setUp(self):
        self.url = reverse("contact-request")
        self.payload = {
            "name": "Test visitor",
            "email": "visitor@example.com",
            "message": "A product project to discuss.",
            "source": "homepage-start",
        }
        # Every endpoint test is isolated from live external delivery.
        self.notification = patch("leads.views._notify_telegram", return_value=(False, "Test delivery disabled"))
        self.notify = self.notification.start()
        self.addCleanup(self.notification.stop)

    def post(self, payload):
        return self.client.post(self.url, data=json.dumps(payload), content_type="application/json")

    def test_requires_post(self):
        self.assertEqual(self.client.get(self.url).status_code, 405)

    def test_rejects_non_object_and_malformed_json_without_saving(self):
        for payload in ([], None, "text", 123, True):
            with self.subTest(payload=payload):
                self.assertEqual(self.post(payload).status_code, 400)
        for raw in (b"{", b"\xff"):
            with self.subTest(raw=raw):
                self.assertEqual(self.client.post(self.url, data=raw, content_type="application/json").status_code, 400)
        self.assertEqual(ContactRequest.objects.count(), 0)
        self.notify.assert_not_called()

    def test_required_field_errors_are_identified(self):
        response = self.post({"name": " ", "email": [], "message": None})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(set(response.json()["fields"]), {"name", "email", "message"})
        self.assertFalse(ContactRequest.objects.exists())

    def test_rejects_invalid_email(self):
        for email in ("not-an-email", "name@example", "name @example.com", "a@example.com\nb@example.com"):
            with self.subTest(email=email):
                response = self.post({**self.payload, "email": email})
                self.assertEqual(response.status_code, 400)
                self.assertIn("email", response.json()["fields"])
        self.assertFalse(ContactRequest.objects.exists())

    def test_rejects_oversized_values_before_saving_or_notifying(self):
        for field, limit in CONTACT_LIMITS.items():
            with self.subTest(field=field):
                response = self.post({**self.payload, field: "x" * (limit + 1)})
                self.assertEqual(response.status_code, 400)
                self.assertIn(field, response.json()["fields"])
        self.assertFalse(ContactRequest.objects.exists())
        self.notify.assert_not_called()

    def test_saves_trimmed_inquiry_and_preserves_existing_metadata(self):
        qualification = {"projectType": {"value": "saas", "label": "SaaS", "rating": 2, "total": 4}}
        response = self.post({
            **self.payload,
            "name": "  Test visitor  ",
            "email": " visitor@example.com ",
            "company": " Example company ",
            "message": "  A project outline.  ",
            "qualification": qualification,
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["ok"])
        lead = ContactRequest.objects.get(pk=response.json()["id"])
        self.assertEqual(lead.name, "Test visitor")
        self.assertEqual(lead.email, "visitor@example.com")
        self.assertEqual(lead.company, "Example company")
        self.assertEqual(lead.message, "A project outline.")
        self.assertEqual(lead.source, "homepage-start")
        self.assertEqual(lead.qualification, qualification)
        self.notify.assert_called_once_with(lead)

    def test_accepts_limit_boundaries(self):
        response = self.post({**self.payload, "name": "n" * 120, "company": "c" * 200, "message": "m" * 5000})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(ContactRequest.objects.get().message), 5000)

    def test_invalid_forwarded_ip_falls_back_to_remote_address(self):
        response = self.client.post(self.url, data=json.dumps(self.payload), content_type="application/json", HTTP_X_FORWARDED_FOR="invalid, 192.0.2.1", REMOTE_ADDR="127.0.0.1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(ContactRequest.objects.get().ip_address, "127.0.0.1")

    def test_qualification_nonfinite_number_does_not_crash(self):
        response = self.post({**self.payload, "qualification": {"budget": {"label": "To discuss", "rating": float("inf")}}})
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(ContactRequest.objects.get().qualification["budget"]["rating"])


class TelegramNotificationTests(TestCase):
    def setUp(self):
        TelegramRecipient.objects.create(chat_id="123", label="Test recipient")
        self.payload = {"name": "Test visitor", "email": "visitor@example.com", "message": "A project outline."}

    @patch.dict("os.environ", {"TELEGRAM_BOT_TOKEN": "test-only-secret-token"})
    @patch("leads.views._send_telegram_message", side_effect=Exception("https://api.telegram.org/bottest-only-secret-token/sendMessage"))
    def test_transport_failure_keeps_inquiry_and_does_not_store_token(self, send):
        response = self.client.post(reverse("contact-request"), data=json.dumps(self.payload), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        lead = ContactRequest.objects.get()
        self.assertFalse(lead.telegram_sent)
        self.assertIn("Telegram delivery failed", lead.telegram_error)
        self.assertNotIn("test-only-secret-token", lead.telegram_error)
        self.assertNotIn("https://", lead.telegram_error)
        send.assert_called_once()

    @patch.dict("os.environ", {"TELEGRAM_BOT_TOKEN": "test-only-token"})
    @patch("leads.views._send_telegram_message", return_value=True)
    def test_success_records_notification_result(self, send):
        response = self.client.post(reverse("contact-request"), data=json.dumps(self.payload), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(ContactRequest.objects.get().telegram_sent)
        send.assert_called_once()
