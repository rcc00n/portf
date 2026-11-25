"""Employer-facing evidence and the reproduced native demo dialog scroll defect."""
import os
import re
import unittest
from playwright.sync_api import sync_playwright, expect


class EmployerBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()
        cls.base = os.environ.get('RACCN_TEST_URL', 'http://127.0.0.1:4173').rstrip('/')

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.page = self.browser.new_page(viewport={'width':1440, 'height':800}, reduced_motion='reduce')
        self.errors = []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))
        self.page.route('**/api/contacts/', lambda route: route.abort())
        self.page.route('**/api/projects/', lambda route: route.fulfill(json=[]))

    def tearDown(self):
        self.page.close()
        self.assertEqual(self.errors, [])

    def open_transaction(self):
        self.page.locator('.site-demo-layout > nav').get_by_role('button', name=re.compile('^Transactions')).click()
        opener = self.page.locator('.site-demo-transactions button').first
        opener.scroll_into_view_if_needed()
        opener.click()
        expect(self.page.get_by_role('dialog')).to_be_visible()
        return opener

    def test_demo_modal_blocks_background_scroll_and_restores_keyboard_focus(self):
        for width in [1440, 390]:
            with self.subTest(width=width):
                self.page.set_viewport_size({'width':width, 'height':800})
                self.page.goto(self.base + '/systems/demo')
                opener = self.open_transaction()
                anchor = self.page.locator('.site-demo-header')
                before = anchor.bounding_box()['y']
                self.page.mouse.move(width - 3, 600)
                self.page.mouse.wheel(0, 600)
                self.page.wait_for_timeout(180)
                self.assertAlmostEqual(anchor.bounding_box()['y'], before, delta=1)
                self.page.keyboard.press('Escape')
                expect(self.page.get_by_role('dialog')).not_to_be_visible()
                expect(opener).to_be_focused()
                self.assertEqual(self.page.evaluate('document.body.style.position'), '')
                self.assertTrue(self.page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
                opener.click()
                self.page.get_by_role('dialog').get_by_role('button', name='Close', exact=True).click()
                expect(opener).to_be_focused()

    def test_navigation_cleans_up_demo_scroll_lock(self):
        self.page.goto(self.base + '/systems')
        self.page.locator('a[href="/systems/demo"]').first.click()
        self.open_transaction()
        self.page.go_back()
        expect(self.page).to_have_url(self.base + '/systems')
        expect(self.page.locator('.site-system-overview')).to_be_visible()
        self.assertEqual(self.page.evaluate('document.body.style.position'), '')
        expect(self.page.locator('body')).not_to_have_css('position', 'fixed')
        self.assertLessEqual(self.page.evaluate('scrollY'), 1)

    def test_engineer_context_and_real_link_purpose(self):
        self.page.goto(self.base + '/approach')
        section = self.page.locator('#practice')
        expect(section).to_contain_text('Rudenko.')
        expect(section.locator('a[href="https://github.com/rcc00n"]')).to_be_visible()
        expect(section.locator('a[href$="engineering-portfolio.pdf"]')).to_be_visible()
        record = {'id':1,'slug':'code','title':'Source-backed evidence','is_published':True,
                  'order':0,'featured_order':0,'featured_placement':'supporting','impact':'System',
                  'blurb':'A fictional record for testing link expectations.','url':'',
                  'links':[{'label':'Source code','href':'https://github.com/rcc00n/QUANTIX'}],
                  'media':[{'id':1,'order':0,'url':self.base+'/raccn-mark.svg','alt':'Synthetic evidence'}]}
        self.page.route('**/api/projects/', lambda route: route.fulfill(json=[record]))
        self.page.goto(self.base + '/work')
        card = self.page.locator('[data-project-slug="code"]')
        expect(card).to_contain_text('View source')
        expect(card).not_to_contain_text('Visit project')
        expect(card.get_by_role('link', name=re.compile('^View source: Source-backed'))).to_have_attribute('href', record['links'][0]['href'])


if __name__ == '__main__':
    unittest.main(verbosity=2)
