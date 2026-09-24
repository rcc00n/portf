"""Browser regression against a running local build; inquiry requests are mocked.

RACCN_TEST_URL=http://127.0.0.1:8001 python3 app/tests/definition_browser.py
Requires Python Playwright and its Chromium browser. Never sends a real inquiry.
"""
import json
import os
import re
import unittest
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import sync_playwright, expect


class DefinitionBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)
        cls.base = os.environ.get("RACCN_TEST_URL", "http://127.0.0.1:8001").rstrip("/")

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 1440, "height": 1000})
        self.page = self.context.new_page()
        self.errors = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))
        # Always intercept submissions, including tests which should not submit.
        self.page.route("**/api/contacts/", lambda route: route.abort())

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [])

    def visit(self, path):
        self.page.goto(self.base + path)
        expect(self.page.locator("h1")).to_be_visible()

    def fill_inquiry(self):
        self.page.locator("#start-name").fill("Regression visitor")
        self.page.locator("#start-email").fill("regression@example.test")
        self.page.locator("#start-message").fill("The product type is still undecided.")

    def test_unknown_url_summary_failure_retry_and_submission(self):
        self.visit("/start/define?product=unknown&complexity=medium")
        expect(self.page.locator('input[value="unsure"]')).to_be_checked()
        expect(self.page.locator("#summary h2")).to_have_text("Not sureBalanced scope.")
        expect(self.page.locator(".site-estimate-result")).to_contain_text("Example assumptions: CRM product")
        share = self.page.get_by_role("link", name="Open definition link").get_attribute("href")
        self.assertEqual(parse_qs(urlparse(share).query), {"product": ["unsure"], "complexity": ["Balanced"]})
        self.page.get_by_role("link", name="Discuss this project definition").click()
        expect(self.page.locator(".site-include-definition")).to_contain_text("Not sure / Balanced scope")
        self.fill_inquiry()
        submitted = []

        def respond(route):
            submitted.append(route.request.post_data_json)
            route.fulfill(status=503 if len(submitted) == 1 else 200,
                          json={"error": "Temporary failure"} if len(submitted) == 1 else {"ok": True, "id": 1})

        self.page.route("**/api/contacts/", respond)
        self.page.locator('button[type="submit"]').click()
        expect(self.page.locator("form")).to_have_attribute("data-state", "error")
        expect(self.page.locator("#start-message")).to_have_value("The product type is still undecided.")
        expect(self.page.locator("#start-name")).to_have_value("Regression visitor")
        expect(self.page.locator("#start-email")).to_have_value("regression@example.test")
        self.page.locator('button[type="submit"]').click()
        expect(self.page.locator("form")).to_have_attribute("data-state", "success")
        self.assertEqual(submitted[0], submitted[1])
        payload = submitted[1]
        self.assertEqual(payload["qualification"]["projectType"], {"value": "unsure", "label": "Not sure"})
        self.assertEqual(payload["source"], "site-start:unsure/Balanced/unspecified/unspecified")
        self.assertNotIn("CRM", json.dumps(payload))

    def test_legacy_saved_uncertainty_survives_changes_reload_and_share(self):
        self.visit("/start/define")
        self.page.evaluate("""() => {
          localStorage.setItem('qualificationGate', JSON.stringify({projectType:'unsure',complexity:'medium'}));
          localStorage.setItem('estimateSnapshot', JSON.stringify({product:'CRM',team:'Core'}));
        }""")
        self.page.reload()
        expect(self.page.locator('input[value="unsure"]')).to_be_checked()
        self.page.get_by_role("radio", name=re.compile("^Heavy")).check()
        snapshot = self.page.evaluate("JSON.parse(localStorage.getItem('estimateSnapshot'))")
        self.assertEqual(snapshot["product"], "unsure")
        self.assertEqual(snapshot["version"], 2)
        self.page.reload()
        expect(self.page.locator('input[value="unsure"]')).to_be_checked()
        expect(self.page.locator('input[value="Heavy"]')).to_be_checked()
        self.page.get_by_role("radio", name=re.compile("^SaaS")).check()
        self.page.reload()
        expect(self.page.locator('input[value="SaaS"]')).to_be_checked()
        self.page.get_by_role("radio", name=re.compile("^Not sure")).check()
        self.page.get_by_role("link", name="Open definition link").click()
        expect(self.page.locator("#summary h2")).to_contain_text("Not sure")

    def test_planning_only_never_submits_example_defaults(self):
        self.visit("/start/define")
        self.assertEqual(self.page.locator('input[type="radio"]:checked').count(), 0)
        self.page.get_by_label("Budget preference").select_option("10_25k")
        self.page.get_by_role("link", name="Discuss this project definition").click()
        expect(self.page.locator(".site-include-definition")).to_contain_text("product not specified")
        sent = []
        self.page.route("**/api/contacts/", lambda route: (sent.append(route.request.post_data_json), route.fulfill(json={"ok": True, "id": 2})))
        self.fill_inquiry()
        self.page.locator('button[type="submit"]').click()
        expect(self.page.locator("form")).to_have_attribute("data-state", "success")
        self.assertEqual(set(sent[0]["qualification"]), {"budget"})
        self.assertNotIn("CRM", json.dumps(sent[0]))

    def test_inquiry_definition_remains_optional(self):
        self.visit("/start?definition=1&product=unsure")
        self.page.locator('.site-include-definition input').uncheck()
        sent = []
        self.page.route("**/api/contacts/", lambda route: (sent.append(route.request.post_data_json), route.fulfill(json={"ok": True, "id": 3})))
        self.fill_inquiry()
        self.page.locator('button[type="submit"]').click()
        expect(self.page.locator("form")).to_have_attribute("data-state", "success")
        self.assertNotIn("qualification", sent[0])
        self.assertEqual(sent[0]["source"], "site-start")

    def test_mobile_reduced_motion_keyboard_selection_and_layout(self):
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.page.emulate_media(reduced_motion="reduce")
        self.visit("/start/define")
        unknown = self.page.locator('input[value="unsure"]')
        unknown.focus()
        unknown.press("Space")
        expect(unknown).to_be_checked()
        expect(self.page.locator("#summary h2")).to_contain_text("Not sure")
        self.assertTrue(self.page.evaluate("document.documentElement.scrollWidth <= innerWidth"))
        self.page.get_by_role("link", name="Discuss this project definition").click()
        expect(self.page.locator(".site-include-definition")).to_contain_text("Not sure")
        self.assertEqual(self.page.locator("input[required], textarea[required]").count(), 3)
        self.assertTrue(self.page.evaluate("document.documentElement.scrollWidth <= innerWidth"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
