"""Architecture interaction regressions; read-only, no production/provider writes.

RACCN_TEST_URL=http://127.0.0.1:4173 python app/tests/architecture_browser.py
Requires a current local frontend build and Python Playwright Chromium.
"""
import os
import unittest

from playwright.sync_api import expect, sync_playwright


class ArchitectureBrowserTests(unittest.TestCase):
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
        self.context = self.browser.new_context(
            viewport={"width": 1440, "height": 1000}, has_touch=True
        )
        self.page = self.context.new_page()
        self.errors = []
        self.writes = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))

        def protect_requests(route):
            if route.request.method not in ("GET", "HEAD", "OPTIONS"):
                self.writes.append(route.request.method)
                route.abort()
            else:
                route.continue_()

        self.page.route("**/*", protect_requests)
        self.page.route("**/api/projects/", lambda route: route.fulfill(json=[]))
        self.page.goto(self.base + "/systems/architecture")
        self.explorer = self.page.locator(".architecture-explorer")
        expect(self.explorer).to_be_visible()
        self.inspector = self.page.locator(".arch-inspector")

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [])
        self.assertEqual(self.writes, [])

    def select(self, name, value):
        self.page.locator(f'input[name="architecture-{name}"][value="{value}"]').check()
        expect(self.explorer).to_have_attribute(f"data-{name}", value)

    def node(self, identifier):
        return self.page.locator(f'.arch-node[data-node="{identifier}"]')

    def selected_node(self):
        return self.page.locator('.arch-node[aria-pressed="true"]').get_attribute("data-node")

    def graph_signature(self):
        return self.page.locator(".arch-route[data-edge]").evaluate_all(
            "paths => paths.map(p => [p.dataset.edge, p.getAttribute('d')])"
        )

    def assert_layout(self):
        self.assertTrue(self.page.evaluate("document.documentElement.scrollWidth <= innerWidth"))
        boxes = self.page.locator(".arch-node").evaluate_all("""nodes => nodes.map(node => {
          const r = node.getBoundingClientRect();
          return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
        })""")
        width = self.page.viewport_size["width"]
        for box in boxes:
            self.assertGreaterEqual(box["x"], 0)
            self.assertLessEqual(box["right"], width)
            self.assertGreaterEqual(box["width"], 44)
            self.assertGreaterEqual(box["height"], 44)
        for index, first in enumerate(boxes):
            for second in boxes[index + 1:]:
                overlap_x = min(first["right"], second["right"]) - max(first["x"], second["x"])
                overlap_y = min(first["bottom"], second["bottom"]) - max(first["y"], second["y"])
                self.assertFalse(overlap_x > 1 and overlap_y > 1, "Clickable architecture nodes overlap")

    def test_product_and_scale_change_real_topology_and_explanation(self):
        self.page.emulate_media(reduced_motion="reduce")
        signatures = []
        descriptions = []
        for product in ("CRM", "Marketplace", "E-commerce"):
            self.select("product", product)
            for scale in ("MVP", "Growth", "Scale"):
                with self.subTest(product=product, scale=scale):
                    self.select("scale", scale)
                    expect(self.page.locator(".arch-node")).to_have_count(6 if scale == "MVP" else 8)
                    expect(self.node("cache")).to_have_count(1 if scale == "Growth" else 0)
                    expect(self.node("replica")).to_have_count(1 if scale == "Scale" else 0)
                    expect(self.node("queue")).to_have_count(0 if scale == "MVP" else 1)
                    self.node("backend").click()
                    expect(self.node("backend")).to_have_attribute("aria-pressed", "true")
                    self.assertTrue(self.inspector.locator("h2").inner_text())
                    signatures.append(str(self.graph_signature()))
                    descriptions.append(self.inspector.inner_text())
                    self.assert_layout()
        self.assertEqual(len(set(signatures)), 9, "Selections must change graph topology, not only copy")
        self.assertEqual(len(set(descriptions)), 9, "Inspector must explain each product/scale decision")

    def test_node_selection_keyboard_and_repeat_activation(self):
        self.page.emulate_media(reduced_motion="reduce")
        previous = self.inspector.inner_text()
        for identifier, key in (("frontend", "Enter"), ("database", "Space"), ("integrations", "Enter")):
            node = self.node(identifier)
            node.focus()
            node.press(key)
            expect(node).to_be_focused()
            expect(node).to_have_attribute("aria-pressed", "true")
            expect(self.page.locator('.arch-node[aria-pressed="true"]')).to_have_count(1)
            self.assertNotEqual(self.inspector.inner_text(), previous)
            previous = self.inspector.inner_text()
            node.press(key)
            expect(node).to_be_focused()
            expect(node).to_have_attribute("aria-pressed", "true")
        connection = self.page.locator(".arch-connections button").first
        connection.focus()
        connection.press("Enter")
        # Inspector replacement must not strand keyboard focus on the document.
        expect(self.page.locator('.arch-node[aria-pressed="true"]')).to_be_focused()

    def test_flow_pause_resume_completion_replay_and_manual_cancel(self):
        self.select("product", "Marketplace")
        self.select("scale", "Scale")
        run = self.page.locator(".arch-run")
        run.click()
        expect(self.explorer).to_have_attribute("data-flow", "running")
        expect(self.page.locator(".arch-step").nth(1)).to_have_attribute("aria-current", "step")
        run.click()
        expect(self.explorer).to_have_attribute("data-flow", "paused")
        # Booking returns to the backend later. Repeated node identity must not
        # incorrectly mark that future reconciliation step as already completed.
        progress = self.page.locator(".arch-sequence li").evaluate_all("""items => items.map(item => ({
          current: !!item.querySelector('[aria-current="step"]'),
          reached: item.classList.contains('is-reached')
        }))""")
        current = next(index for index, item in enumerate(progress) if item["current"])
        self.assertEqual([item["reached"] for item in progress], [index <= current for index in range(len(progress))])
        paused_node = self.selected_node()
        self.page.wait_for_timeout(1000)
        self.assertEqual(self.selected_node(), paused_node)
        run.click()
        expect(self.explorer).to_have_attribute("data-flow", "running")
        expect(self.explorer).to_have_attribute("data-flow", "complete", timeout=15000)
        run.click()
        expect(self.explorer).to_have_attribute("data-flow", "running")
        self.node("admin").click()
        expect(self.node("admin")).to_have_attribute("aria-pressed", "true")
        expect(self.explorer).not_to_have_attribute("data-flow", "running")
        self.page.wait_for_timeout(1000)
        expect(self.node("admin")).to_have_attribute("aria-pressed", "true")
        self.page.locator(".arch-step").last.click()
        expect(self.explorer).not_to_have_attribute("data-flow", "running")
        expect(self.page.locator(".arch-step").last).to_have_attribute("aria-current", "step")
        expect(self.page.locator('.arch-node[aria-pressed="true"]')).to_have_count(1)

    def test_filter_changes_cancel_pending_flow_and_keep_keyboard_navigation(self):
        self.page.locator(".arch-run").click()
        expect(self.explorer).to_have_attribute("data-flow", "running")
        for product, scale in (("Marketplace", "Growth"), ("E-commerce", "Scale"), ("CRM", "MVP")):
            self.select("product", product)
            self.select("scale", scale)
        expect(self.explorer).not_to_have_attribute("data-flow", "running")
        self.node("database").click()
        self.page.wait_for_timeout(1000)
        expect(self.node("database")).to_have_attribute("aria-pressed", "true")
        crm = self.page.locator('input[name="architecture-product"][value="CRM"]')
        crm.focus()
        crm.press("ArrowRight")
        expect(self.page.locator('input[name="architecture-product"][value="Marketplace"]')).to_be_checked()
        expect(self.explorer).to_have_attribute("data-product", "Marketplace")
        self.assertEqual(self.page.locator('input[name="architecture-product"]:checked').count(), 1)

    def test_mobile_reduced_motion_has_direct_flow_and_usable_nodes(self):
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.page.emulate_media(reduced_motion="reduce")
        for product in ("CRM", "Marketplace", "E-commerce"):
            self.select("product", product)
            for scale in ("MVP", "Growth", "Scale"):
                self.select("scale", scale)
                self.assert_layout()
        self.node("integrations").tap()
        expect(self.node("integrations")).to_have_attribute("aria-pressed", "true")
        self.page.locator(".arch-run").tap()
        expect(self.explorer).to_have_attribute("data-flow", "complete", timeout=1000)
        self.assertEqual(self.explorer.evaluate("el => el.getAnimations({subtree:true}).filter(a => a.playState === 'running').length"), 0)
        self.node("replica").tap()
        expect(self.node("replica")).to_have_attribute("aria-pressed", "true")

    def test_navigation_cleans_up_an_active_sequence(self):
        self.select("scale", "Scale")
        self.page.locator(".arch-run").click()
        expect(self.explorer).to_have_attribute("data-flow", "running")
        self.page.locator('.site-header a[href="/systems"]').click()
        expect(self.page).to_have_url(self.base + "/systems")
        expect(self.explorer).to_have_count(0)
        self.page.go_back()
        expect(self.explorer).to_be_visible()
        expect(self.explorer).not_to_have_attribute("data-flow", "running")
        expect(self.explorer).to_have_attribute("data-product", "CRM")
        expect(self.explorer).to_have_attribute("data-scale", "MVP")
        self.page.wait_for_timeout(1000)
        expect(self.explorer).not_to_have_attribute("data-flow", "running")


if __name__ == "__main__":
    unittest.main(verbosity=2)
