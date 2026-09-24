"""Contact UI regression: all submissions intercepted, never a real inquiry."""
import os
import unittest

from playwright.sync_api import sync_playwright, expect


class ContactBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)
        cls.base = os.environ.get("RACCN_TEST_URL", "http://127.0.0.1:4173").rstrip("/")

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 1440, "height": 1000})
        self.page = self.context.new_page()
        self.errors = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))
        self.page.route("**/api/contacts/", lambda route: route.abort())
        self.page.goto(self.base + "/start")
        expect(self.page.locator("#start-name")).to_be_visible()

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [])

    def fill(self):
        self.page.locator("#start-name").fill("Regression visitor")
        self.page.locator("#start-email").fill("regression@example.test")
        self.page.locator("#start-message").fill("A project inquiry for a browser regression.")

    def submit(self):
        self.page.locator('button[type="submit"]').click()

    def retained(self):
        expect(self.page.locator("form")).to_have_attribute("data-state", "error")
        expect(self.page.locator("#start-name")).to_have_value("Regression visitor")
        expect(self.page.locator("#start-email")).to_have_value("regression@example.test")
        expect(self.page.locator("#start-message")).to_have_value("A project inquiry for a browser regression.")
        expect(self.page.locator('button[type="submit"]')).to_be_enabled()

    def test_confirmed_success_only_clears_form(self):
        sent = []
        self.page.route("**/api/contacts/", lambda route: (sent.append(route.request), route.fulfill(json={"ok": True, "id": 123})))
        self.fill()
        self.submit()
        expect(self.page.locator("form")).to_have_attribute("data-state", "success")
        expect(self.page.locator(".hp-start-form__success")).to_contain_text("reply by email")
        self.assertEqual(self.page.locator("#start-name").count(), 0)
        self.assertRegex(sent[0].headers["idempotency-key"], r"^[0-9a-f-]{36}$")
        self.assertEqual(sent[0].post_data_json["website"], "")
        self.assertNotIn("qualification", sent[0].post_data_json)

    def test_local_and_server_validation_keep_native_controls(self):
        self.submit()
        expect(self.page.locator("#start-name")).to_be_focused()
        self.fill()
        self.page.route("**/api/contacts/", lambda route: route.fulfill(status=400, json={"ok": False, "errors": {"email": "Use a valid email address."}}))
        self.submit()
        self.retained()
        expect(self.page.locator("#start-email")).to_be_focused()
        expect(self.page.locator("#start-email-error")).to_have_text("Use a valid email address.")

    def test_server_error_retry_reuses_token_and_body(self):
        requests = []

        def respond(route):
            requests.append((route.request.headers["idempotency-key"], route.request.post_data))
            route.fulfill(status=503 if len(requests) == 1 else 200,
                          json={"ok": False, "errors": {"request": "Unavailable"}} if len(requests) == 1 else {"ok": True, "id": 17})

        self.page.route("**/api/contacts/", respond)
        self.fill()
        self.submit()
        self.retained()
        expect(self.page.locator(".hp-start-form__status")).to_contain_text("couldn’t confirm")
        self.submit()
        expect(self.page.locator("form")).to_have_attribute("data-state", "success")
        self.assertEqual(requests[0], requests[1])

    def test_lost_response_retries_the_same_identity(self):
        requests = []

        def respond(route):
            requests.append(route.request.headers["idempotency-key"])
            if len(requests) == 1:
                route.abort("connectionclosed")
            else:
                route.fulfill(json={"ok": True, "id": 18})

        self.page.route("**/api/contacts/", respond)
        self.fill()
        self.submit()
        self.retained()
        self.submit()
        expect(self.page.locator("form")).to_have_attribute("data-state", "success")
        self.assertEqual(requests[0], requests[1])

    def test_network_timeout_keeps_form_and_retry_identity(self):
        self.page.clock.install()
        requests = []
        held = []

        def respond(route):
            requests.append(route.request.headers["idempotency-key"])
            if len(requests) == 1:
                held.append(route)
            else:
                route.fulfill(json={"ok": True, "id": 19})

        self.page.route("**/api/contacts/", respond)
        self.fill()
        self.submit()
        expect(self.page.locator("form")).to_have_attribute("data-state", "loading")
        self.page.wait_for_timeout(50)
        self.page.clock.fast_forward(21000)
        self.retained()
        expect(self.page.locator(".hp-start-form__status")).to_contain_text("Please retry")
        self.submit()
        expect(self.page.locator("form")).to_have_attribute("data-state", "success")
        self.assertEqual(requests[0], requests[1])
        for route in held:
            route.abort()

    def test_unconfirmed_200_never_clears_and_edits_get_new_identity(self):
        requests = []
        self.page.route("**/api/contacts/", lambda route: (requests.append(route.request.headers["idempotency-key"]), route.fulfill(json={"ok": True})))
        self.fill()
        self.submit()
        self.retained()
        self.page.locator("#start-message").fill("A different, deliberately edited inquiry.")
        self.submit()
        expect(self.page.locator("form")).to_have_attribute("data-state", "error")
        self.assertNotEqual(requests[0], requests[1])

    def test_mobile_field_blocks_focus_and_only_three_visible_fields(self):
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.page.emulate_media(reduced_motion="reduce")
        for number, field in (("01", "name"), ("02", "email"), ("03", "message")):
            self.page.locator(f'.hp-form-field[data-field="{number}"] small').click()
            expect(self.page.locator(f"#start-{field}")).to_be_focused()
        self.assertEqual(self.page.locator("form input:visible, form textarea:visible").count(), 3)
        self.assertEqual(self.page.locator("form [required]").count(), 3)
        self.assertTrue(self.page.evaluate("document.documentElement.scrollWidth <= innerWidth"))
        self.fill()
        self.page.route("**/api/contacts/", lambda route: route.fulfill(status=429, json={"ok": False, "errors": {"request": "Wait"}}))
        self.submit()
        self.retained()
        expect(self.page.locator(".hp-start-form__status")).to_contain_text("Please wait")


if __name__ == "__main__":
    unittest.main(verbosity=2)
