"""The edge action never competes with the hero, contact form or mobile navigation."""
import os
import unittest
from playwright.sync_api import sync_playwright, expect


class ProjectActionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()
        cls.base = os.environ.get("RACCN_TEST_URL", "http://127.0.0.1:4173").rstrip("/")

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.page = self.browser.new_page(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        self.page.route("**/api/projects/", lambda route: route.fulfill(json=[]))
        self.page.route("**/api/contacts/", lambda route: route.abort())

    def tearDown(self):
        self.page.close()

    def test_home_context_and_semantic_navigation(self):
        self.page.goto(self.base + "/")
        action = self.page.locator(".project-action")
        expect(action).to_have_count(0)
        self.page.locator("#systems").scroll_into_view_if_needed()
        expect(action).to_be_visible()
        action.focus()
        expect(action).to_be_focused()
        self.assertEqual(action.evaluate("n => n.getBoundingClientRect().width"), 44)
        action.press("Enter")
        expect(self.page).to_have_url(self.base + "/start")
        expect(action).to_have_count(0)

    def test_action_yields_to_contact_and_mobile(self):
        self.page.goto(self.base + "/")
        self.page.locator("#systems").scroll_into_view_if_needed()
        expect(self.page.locator(".project-action")).to_be_visible()
        self.page.locator("#start").scroll_into_view_if_needed()
        expect(self.page.locator(".project-action")).to_have_count(0)
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.page.locator("#systems").scroll_into_view_if_needed()
        expect(self.page.locator(".project-action")).to_have_count(0)
        self.assertLessEqual(self.page.evaluate("document.documentElement.scrollWidth"), 390)

    def test_secondary_page_closing_and_no_action_on_sensitive_routes(self):
        self.page.goto(self.base + "/approach")
        expect(self.page.locator(".project-action")).to_have_count(0)
        self.page.locator("#working-together").evaluate("node => node.scrollIntoView({block: 'start'})")
        expect(self.page.locator(".project-action")).to_be_visible()
        self.page.locator(".site-closing").scroll_into_view_if_needed()
        expect(self.page.locator(".project-action")).to_have_count(0)
        for path in ["/privacy", "/terms", "/start/define", "/systems/demo"]:
            self.page.goto(self.base + path)
            self.page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
            expect(self.page.locator(".project-action")).to_have_count(0)


if __name__ == "__main__":
    unittest.main()
