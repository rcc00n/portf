import tempfile
from pathlib import Path

from django.test import SimpleTestCase

from .views import FRONTEND_ROUTES, FRONTEND_REDIRECTS


class FrontendRoutingTests(SimpleTestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "frontend_dist"
        self.root.mkdir()
        (self.root / "index.html").write_text('<!doctype html><title>RACCN Code</title><div id="root"></div>')
        self.override = self.settings(FRONTEND_DIST_DIR=self.root)
        self.override.enable()
        self.addCleanup(self.override.disable)
        self.assets = {
            "robots.txt": (b"User-agent: *\n", "text/plain"),
            "sitemap.xml": (b"<urlset></urlset>", "application/xml"),
            "raccn-mark.svg": (b'<svg xmlns="http://www.w3.org/2000/svg"/>', "image/svg+xml"),
            "favicon.ico": (b"icon", "image/vnd.microsoft.icon"),
            "social/raccn-code.png": (b"social image", "image/png"),
            "prototype/fonts/instrument-sans-latin.woff2": (b"font", "font/woff2"),
            "home/media/worlddoc.webp": (b"webp", "image/webp"),
            "assets/index-AbCd1234.js": (b"console.log('RACCN');", "text/javascript"),
            "assets/index-AbCd1234.css": (b"body { color: white; }", "text/css"),
        }
        for name, (data, _) in self.assets.items():
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)

    def test_known_deep_links_queries_and_trailing_slashes_return_shell(self):
        for route in FRONTEND_ROUTES:
            with self.subTest(route=route):
                response = self.client.get(route)
                self.assertEqual(response.status_code, 200)
                self.assertContains(response, 'id="root"')
                self.assertEqual(response["Cache-Control"], "no-cache")
        self.assertEqual(self.client.get("/start?source=homepage").status_code, 200)
        self.assertEqual(self.client.get("/privacy/").status_code, 200)

    def test_unknown_route_returns_not_found_shell_with_http_404(self):
        response = self.client.get("/this-page-does-not-exist")
        self.assertEqual(response.status_code, 404)
        self.assertIn(b'id="root"', response.content)
        self.assertEqual(response["X-Robots-Tag"], "noindex")
        self.assertEqual(response["Cache-Control"], "no-store")

    def test_public_assets_are_served_from_dist_with_correct_content_type(self):
        for name, (data, content_type) in self.assets.items():
            with self.subTest(asset=name):
                response = self.client.get("/" + name + "?v=test")
                self.assertEqual(response.status_code, 200)
                actual_type = response["Content-Type"].split(";")[0]
                if name.endswith(".ico"):
                    self.assertIn(actual_type, ("image/vnd.microsoft.icon", "image/x-icon"))
                else:
                    self.assertEqual(actual_type, content_type)
                self.assertEqual(b"".join(response.streaming_content), data)
                self.assertIn("Last-Modified", response)
                self.assertIn("ETag", response)

    def test_missing_assets_never_return_the_spa_shell(self):
        for path in ("/assets/missing.js", "/home/media/missing.webp", "/social/missing.png", "/robots-missing.txt", "/prototype/fonts/missing.woff2"):
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 404)
                self.assertNotIn(b'id="root"', response.content)

    def test_arbitrary_files_and_path_traversal_are_not_exposed(self):
        secret = Path(self.temp.name) / "secret.txt"
        secret.write_text("PRIVATE TEST CONTENT")
        (self.root / "assets" / ".env").write_text("PRIVATE TEST CONTENT")
        (self.root / "private.txt").write_text("PRIVATE TEST CONTENT")
        (self.root / "assets" / "outside.txt").symlink_to(secret)
        for path in ("/assets/../private.txt", "/assets/%2e%2e/%2e%2e/secret.txt", "/assets/outside.txt", "/assets/.env", "/private.txt", "/assets/%5c..%5csecret.txt"):
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 404)
                self.assertNotIn(b"PRIVATE TEST CONTENT", response.content)

    def test_cache_lifetimes_and_conditional_get(self):
        response = self.client.get("/assets/index-AbCd1234.js")
        self.assertEqual(response["Cache-Control"], "public, max-age=31536000, immutable")
        response.close()
        cached = self.client.get("/assets/index-AbCd1234.js", HTTP_IF_NONE_MATCH=response["ETag"])
        self.assertEqual(cached.status_code, 304)
        self.assertEqual(cached.content, b"")
        modified = self.client.get("/assets/index-AbCd1234.js", HTTP_IF_NONE_MATCH='"old-version"')
        self.assertEqual(modified.status_code, 200)
        modified.close()
        public = self.client.get("/robots.txt")
        self.assertEqual(public["Cache-Control"], "public, max-age=300")
        public.close()
        dated = self.client.get("/robots.txt", HTTP_IF_MODIFIED_SINCE=public["Last-Modified"])
        self.assertEqual(dated.status_code, 304)

    def test_head_requests_and_non_get_methods(self):
        self.assertEqual(self.client.head("/privacy").status_code, 200)
        head = self.client.head("/social/raccn-code.png")
        self.assertEqual(head.status_code, 200)
        self.assertEqual(b"".join(head.streaming_content), b"")
        self.assertEqual(self.client.post("/privacy").status_code, 405)

    def test_missing_build_is_a_real_404(self):
        (self.root / "index.html").unlink()
        self.assertEqual(self.client.get("/privacy").status_code, 404)

    def test_legacy_urls_redirect_directly_to_existing_canonical_routes(self):
        for old, target in FRONTEND_REDIRECTS.items():
            with self.subTest(old=old):
                response = self.client.get(old + "/")
                self.assertEqual(response.status_code, 301)
                self.assertEqual(response["Location"], target)
                self.assertEqual(self.client.get(target.split("#")[0]).status_code, 200)

    def test_definition_redirect_retains_valid_inputs_and_discards_unrelated_values(self):
        response = self.client.get("/summary?product=Marketplace&complexity=Advanced&team=Core&integrations=Heavy&email=private@example.test&next=https://example.com")
        self.assertEqual(response.status_code, 301)
        self.assertEqual(response["Location"], "/start/define?product=Marketplace&complexity=Advanced&team=Core&integrations=Heavy#summary")
        contact = self.client.get("/contact?product=saas&complexity=medium&maturity=mvp")
        self.assertEqual(contact["Location"], "/start?product=saas&complexity=medium&maturity=mvp&definition=1")
        invalid = self.client.get("/estimate?product=Invalid&team=Unknown")
        self.assertEqual(invalid["Location"], "/start/define")

    def test_invalid_case_and_prototype_paths_are_real_404s(self):
        for path in ("/work/not-a-case", "/systems/not-a-tool", "/prototype/not-a-study"):
            self.assertEqual(self.client.get(path).status_code, 404)
        self.assertEqual(self.client.get("/systems/demo")["X-Robots-Tag"], "noindex")
