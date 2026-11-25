"""Cross-route navigation opens at the top; intentional anchors remain usable.

Uses a synthetic CMS catalog and blocks writes. Run against a local build with
RACCN_TEST_URL=http://127.0.0.1:4173 python app/tests/navigation_scroll_browser.py
"""
import os
import re
import unittest

from playwright.sync_api import expect, sync_playwright


class NavigationScrollBrowserTests(unittest.TestCase):
    ready_selectors = {"/": "#top", "/work": "#project-renter",
                       "/approach": "#working-together", "/systems": ".site-system-overview",
                       "/systems/architecture": ".architecture-explorer"}

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
        self.context = self.browser.new_context(
            viewport={"width": 1440, "height": 1000}, reduced_motion="reduce"
        )
        self.page = self.context.new_page()
        self.errors = []
        self.writes = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))

        def protect(route):
            if route.request.method not in ("GET", "HEAD", "OPTIONS"):
                self.writes.append(route.request.method)
                route.abort()
            else:
                route.continue_()

        self.page.route("**/*", protect)
        slugs = ("renter", "bad-guy-motors", "quantix", "quorum", "milk-vancouver", "contract-workflow")
        self.catalog = [{
            "id": index + 1, "slug": slug, "title": "Fixture " + slug,
            "impact": "Navigation regression", "blurb": "Isolated CMS evidence.",
            "is_published": True, "order": index, "featured_order": index,
            "featured_placement": "lead" if index == 0 else "supporting",
            "links": [{"label": "Source", "href": "https://example.test/" + slug}],
            "media": [{"id": index * 2 + image + 1, "order": image,
                       "url": self.base + "/evidence/renter/customer.webp",
                       "alt": f"Synthetic navigation fixture {image + 1}"}
                      for image in range(2)],
        } for index, slug in enumerate(slugs)]
        self.page.route("**/api/projects/", lambda route: route.fulfill(json=self.catalog))

    def tearDown(self):
        self.page.unroute_all(behavior="wait")
        self.context.close()
        self.assertEqual(self.errors, [])
        self.assertEqual(self.writes, [])

    def visit(self, path):
        self.page.goto(self.base + path)
        expect(self.page.locator(self.ready_selectors[path])).to_be_attached()

    def scroll_middle(self):
        self.page.evaluate("scrollTo({top:1100,behavior:'instant'})")
        self.page.wait_for_function("scrollY > 300")

    def assert_top(self, path):
        expect(self.page).to_have_url(self.base + path)
        expect(self.page.locator(self.ready_selectors[path])).to_be_attached()
        self.page.wait_for_function("scrollY <= 1")
        # Include passive cleanup/next-frame effects, not only the first paint.
        self.page.wait_for_timeout(150)
        self.assertLessEqual(self.page.evaluate("scrollY"), 1)

    def assert_anchor(self, identifier):
        target = self.page.locator("#" + identifier)
        expect(target).to_be_attached()
        self.page.wait_for_function("""id => {
          const target = document.getElementById(id);
          if (!target) return false;
          const top = target.getBoundingClientRect().top;
          const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
          return scrollY > 100 && Math.abs(top - margin) <= 3;
        }""", arg=identifier)

    def test_secondary_home_and_work_links_reset_cached_history_positions(self):
        self.visit("/systems/architecture")
        self.scroll_middle()
        self.page.locator(".site-header .site-brand").click()
        self.assert_top("/")
        # This is a real below-the-fold React link, not the homepage section nav.
        self.page.locator(".hp-work-index-link").scroll_into_view_if_needed()
        self.assertGreater(self.page.evaluate("scrollY"), 300)
        self.page.locator(".hp-work-index-link").click()
        self.assert_top("/work")
        expect(self.page.locator("[data-project-slug]")).to_have_count(6)
        self.scroll_middle()
        for action, destination in (("back", "/"), ("back", "/systems/architecture"),
                                    ("forward", "/"), ("forward", "/work")):
            with self.subTest(action=action, destination=destination):
                getattr(self.page, "go_" + action)()
                self.assert_top(destination)

    def test_secondary_navigation_starts_at_top_desktop_and_mobile(self):
        for width in (1440, 390):
            with self.subTest(width=width):
                self.page.set_viewport_size({"width": width, "height": 1000 if width == 1440 else 844})
                self.visit("/systems/architecture")
                for destination in ("/approach", "/work", "/systems"):
                    self.scroll_middle()
                    self.page.locator(f'.site-header a[href="{destination}"]').click()
                    self.assert_top(destination)

    def test_delayed_home_chunk_resolves_at_top_after_navigation(self):
        held = []
        pattern = re.compile(r"/(?:assets/HomePage-[^/?]+\.js|src/home/HomePage\.jsx)(?:\?.*)?$")
        self.page.route(pattern, lambda route: held.append(route))
        self.visit("/systems/architecture")
        self.scroll_middle()
        with self.page.expect_request(pattern):
            self.page.locator(".site-header .site-brand").click()
        expect(self.page).to_have_url(self.base + "/")
        self.page.wait_for_timeout(250)
        self.assertTrue(held, "The test must actually delay a lazy page module")
        # The visitor can scroll a retained screen while its destination loads.
        self.page.evaluate("scrollTo({top:700,behavior:'instant'})")
        for route in held:
            route.continue_()
        self.assert_top("/")

    def test_delayed_cms_project_anchor_is_preserved(self):
        self.visit("/")
        expect(self.page.locator("[data-project-slug]")).to_have_count(6)
        held = []
        self.page.route("**/api/projects/", lambda route: held.append(route))
        link = self.page.locator('a[href="/work#project-milk-vancouver"]')
        with self.page.expect_request("**/api/projects/"):
            link.click()
        expect(self.page).to_have_url(self.base + "/work#project-milk-vancouver")
        expect(self.page.locator("#project-milk-vancouver")).to_have_count(0)
        self.page.wait_for_timeout(250)
        self.assertTrue(held)
        for route in held:
            if not route.request.failure:
                route.fulfill(json=self.catalog)
        self.assert_anchor("project-milk-vancouver")

    def test_homepage_section_links_and_hash_history_still_land_at_targets(self):
        self.visit("/")
        expect(self.page.locator("[data-project-slug]")).to_have_count(6)
        for identifier in ("systems", "approach", "start"):
            self.page.locator(f'.hp-nav a[href="#{identifier}"]').click()
            self.assert_anchor(identifier)
        self.page.go_back()
        self.assert_anchor("approach")
        self.page.go_forward()
        self.assert_anchor("start")
        self.page.locator(".hp-header .hp-brand").click()
        self.page.wait_for_function("scrollY <= 1")

    def test_gallery_cleanup_cannot_restore_previous_scroll_over_a_new_route(self):
        self.visit("/approach")
        self.scroll_middle()
        self.page.locator('.site-header a[href="/work"]').click()
        expect(self.page.locator("[data-project-slug]")).to_have_count(6)
        self.page.locator("#project-milk-vancouver .site-gallery-trigger").click()
        expect(self.page.locator("dialog[open]")).to_be_visible()
        self.page.go_back()
        if self.page.url == self.base + "/work":
            # Some browsers consume Back to close a native modal before traversing.
            expect(self.page.locator("dialog[open]")).to_have_count(0)
            self.page.go_back()
        self.assert_top("/approach")
        expect(self.page.locator("dialog[open]")).to_have_count(0)
        self.assertNotEqual(self.page.locator("body").evaluate("el => el.style.position"), "fixed")


if __name__ == "__main__":
    unittest.main(verbosity=2)
