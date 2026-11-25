"""Work evidence gallery regression; catalog is isolated, no backend writes."""
import os
import unittest

from playwright.sync_api import expect, sync_playwright


class ProjectGalleryBrowserTests(unittest.TestCase):
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
        self.context = self.browser.new_context(viewport={"width": 1440, "height": 1000}, has_touch=True)
        self.page = self.context.new_page()
        self.errors = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))
        self.page.route("**/api/contacts/", lambda route: route.abort())
        first = {"id": 11, "order": 0, "url": self.base + "/evidence/renter/customer.webp", "alt": "CMS customer surface"}
        second = {"id": 12, "order": 1, "url": self.base + "/home/media/bad-guy-motors.webp", "alt": ""}
        third = {"id": 13, "order": 2, "url": self.base + "/evidence/renter/operator.webp", "alt": "CMS operator surface"}

        def project(identifier, slug, placement, media):
            return {"id": identifier, "slug": slug, "title": slug.title(), "impact": "Synthetic gallery regression",
                    "blurb": "Isolated evidence fixture.", "is_published": True, "order": identifier,
                    "featured_placement": placement, "featured_order": identifier, "media": media,
                    "links": [{"label": "Source", "href": "https://example.test/project"}]}

        catalog = [project(1, "renter", "lead", [third, first, second]),
                   project(2, "supporting", "supporting", [first, second]),
                   project(3, "single", "supporting", [first]),
                   project(4, "archive", "", [first, second])]
        self.page.route("**/api/projects/", lambda route: route.fulfill(json=catalog))
        self.page.goto(self.base + "/work")
        self.trigger = self.page.get_by_role("button", name="Renter: view 3 images")
        expect(self.trigger).to_be_visible()
        self.dialog = self.page.get_by_role("dialog", name="Renter", exact=True)

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [])

    def test_order_alt_and_existing_case_link(self):
        feature = self.page.locator("#project-renter")
        expect(feature.get_by_role("link", name="Explore Renter", exact=True).first).to_have_attribute("href", "/work/renter")
        expect(feature.locator(".site-evidence img")).to_have_attribute("alt", "CMS operator surface")
        self.assertEqual(self.trigger.locator("xpath=ancestor::a").count(), 0)
        self.trigger.click()
        expect(self.dialog.locator("img")).to_have_attribute("alt", "CMS customer surface")
        expect(self.dialog.locator(".site-gallery-count")).to_have_text("01 / 03")
        self.page.keyboard.press("ArrowRight")
        expect(self.dialog.locator("img")).to_have_attribute("alt", "Renter — project image 2")
        self.dialog.get_by_role("button", name="Next image").click()
        expect(self.dialog.locator("img")).to_have_attribute("alt", "CMS operator surface")
        self.page.keyboard.press("ArrowRight")
        expect(self.dialog.locator("img")).to_have_attribute("alt", "CMS customer surface")
        self.page.keyboard.press("ArrowLeft")
        expect(self.dialog.locator("img")).to_have_attribute("alt", "CMS operator surface")

    def test_native_focus_escape_close_and_repeat_open(self):
        self.trigger.focus()
        self.page.keyboard.press("Enter")
        close = self.dialog.get_by_role("button", name="Close")
        expect(close).to_be_focused()
        self.page.keyboard.press("Shift+Tab")
        expect(self.dialog.get_by_role("button", name="Next image")).to_be_focused()
        self.page.keyboard.press("Tab")
        expect(close).to_be_focused()
        self.page.keyboard.press("ArrowRight")
        self.page.keyboard.press("Escape")
        expect(self.dialog).not_to_be_visible()
        expect(self.trigger).to_be_focused()
        self.page.keyboard.press("Space")
        expect(self.dialog.locator(".site-gallery-count")).to_have_text("01 / 03")
        close.click()
        expect(self.trigger).to_be_focused()

    def test_mobile_reduced_motion_and_project_anchors(self):
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.page.emulate_media(reduced_motion="reduce")
        for slug in ("renter", "supporting", "single", "archive"):
            expect(self.page.locator(f"#project-{slug}")).to_have_count(1)
        expect(self.page.locator("#project-single .site-gallery-trigger")).to_have_count(0)
        self.trigger.tap()
        expect(self.dialog).to_be_visible()
        self.assertTrue(self.dialog.evaluate("el => {const r=el.getBoundingClientRect(); return r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=innerHeight;}"))
        self.assertEqual(self.dialog.locator("img").evaluate("el => getComputedStyle(el).animationName"), "none")
        self.assertTrue(self.page.evaluate("document.documentElement.scrollWidth <= innerWidth"))
        for button in self.dialog.locator("button").all():
            bounds = button.bounding_box()
            self.assertGreaterEqual(bounds["width"], 44)
            self.assertGreaterEqual(bounds["height"], 44)
        self.dialog.get_by_role("button", name="Next image").click()
        expect(self.dialog.locator(".site-gallery-count")).to_have_text("02 / 03")

    def test_supporting_link_retained_and_archive_evidence_visible(self):
        support = self.page.locator("#project-supporting")
        expect(support.get_by_role("link", name="Supporting — opens in a new tab")).to_have_attribute("href", "https://example.test/project")
        support.get_by_role("button", name="Supporting: view 2 images").click()
        dialog = self.page.get_by_role("dialog", name="Supporting", exact=True)
        expect(dialog.locator("img")).to_have_attribute("alt", "CMS customer surface")
        dialog.get_by_role("button", name="Close").click()
        archive = self.page.locator("#project-archive")
        archive.locator("summary").click()
        expect(archive.locator("img")).to_have_count(2)
        expect(archive.locator("img").last).to_be_visible()


if __name__ == "__main__":
    unittest.main(verbosity=2)
