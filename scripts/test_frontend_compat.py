"""Isolated compatibility-asset safety checks; no network, Docker or real builds."""
import hashlib
from pathlib import Path
import tempfile
import unittest

from prepare_frontend_compat import collect


class FrontendCompatibilityTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        self.previous, self.current, self.output = (root / name for name in ("previous", "current", "output"))
        for build in (self.previous, self.current):
            (build / "assets").mkdir(parents=True)
            (build / "index.html").write_text('<script src="/assets/main-abcdefgh.js"></script>')
        self.write("main-abcdefgh.js", 'import "./route-12345678.js";')
        self.write("route-12345678.js", 'export const loaded=true;')

    def write(self, name, text, build=None):
        path = (build or self.previous) / "assets" / name
        path.write_text(text)
        return path

    def collect(self):
        return collect(self.previous, self.current, self.output)

    def assert_rejected_without_output(self):
        with self.assertRaises(ValueError):
            self.collect()
        self.assertFalse(self.output.exists())

    def test_recursive_js_css_references_are_retained_with_stable_hash_manifest(self):
        self.write("route-12345678.js", 'const deps=["assets/style-abcd1234.css"]; import("./deep-87654321.js");')
        self.write("deep-87654321.js", 'import "./main-abcdefgh.js";')  # Cycles are finite.
        self.write("style-abcd1234.css", '@import url("./theme-abcde123.css");')
        self.write("theme-abcde123.css", 'body { color: white; }')
        result = self.collect()
        expected = {"main-abcdefgh.js", "route-12345678.js", "deep-87654321.js", "style-abcd1234.css", "theme-abcde123.css"}
        self.assertEqual({path.name for path in self.output.iterdir()}, expected)
        self.assertEqual(result["copied_count"], 5)
        self.assertEqual(result["reused_count"], 0)
        for entry in result["files"]:
            data = (self.output / entry["name"]).read_bytes()
            self.assertEqual(entry["sha256"], hashlib.sha256(data).hexdigest())
            self.assertEqual(entry["bytes"], len(data))
            self.assertEqual(entry["status"], "copied")
        self.assertFalse((self.output / "index.html").exists())

    def test_unreachable_and_non_code_assets_never_get_copied(self):
        self.write("route-12345678.js", 'const docs="React/Next.js"; const media=["/assets/photo-abcdefgh.png", "./font-abcdefgh.woff2", "./main-abcdefgh.js.map", "/.env", "./leads.sqlite3"];')
        for name in ("abandoned-abcdefgh.js", "photo-abcdefgh.png", "font-abcdefgh.woff2", "main-abcdefgh.js.map", ".env", "leads.sqlite3"):
            self.write(name, "not public compatibility code")
        result = self.collect()
        self.assertEqual(result["copied_count"], 2)
        self.assertEqual({path.suffix for path in self.output.iterdir()}, {".js"})

    def test_referenced_symlink_is_rejected(self):
        target = self.previous / "assets" / "route-12345678.js"
        target.unlink()
        target.symlink_to(self.previous / "index.html")
        self.assert_rejected_without_output()

    def test_symlinked_current_asset_is_not_considered_an_identical_safe_file(self):
        (self.current / "assets" / "main-abcdefgh.js").symlink_to(self.previous / "assets" / "main-abcdefgh.js")
        self.assert_rejected_without_output()

    def test_missing_dependency_and_immutable_collision_leave_no_partial_output(self):
        (self.previous / "assets" / "route-12345678.js").unlink()
        self.assert_rejected_without_output()
        self.write("route-12345678.js", "export const restored=true;")
        self.write("route-12345678.js", "different bytes", self.current)
        self.assert_rejected_without_output()

    def test_identical_current_names_are_reused_but_their_missing_dependencies_are_retained(self):
        data = (self.previous / "assets" / "main-abcdefgh.js").read_text()
        self.write("main-abcdefgh.js", data, self.current)
        result = self.collect()
        self.assertEqual((result["copied_count"], result["reused_count"]), (1, 1))
        self.assertEqual([path.name for path in self.output.iterdir()], ["route-12345678.js"])
        self.assertEqual((self.current / "assets" / "main-abcdefgh.js").read_text(), data)

    def test_path_traversal_and_nested_chunk_paths_are_rejected(self):
        for reference in ("../secret-abcdefgh.js", "/private/secret-abcdefgh.js", "./nested/secret-abcdefgh.js"):
            self.write("route-12345678.js", f'import "{reference}";')
            self.assert_rejected_without_output()

    def test_failure_preserves_an_existing_empty_output_and_input_builds(self):
        self.output.mkdir()
        before = (self.previous / "assets" / "main-abcdefgh.js").read_bytes()
        (self.previous / "assets" / "route-12345678.js").unlink()
        with self.assertRaises(ValueError):
            self.collect()
        self.assertEqual(list(self.output.iterdir()), [])
        self.assertEqual((self.previous / "assets" / "main-abcdefgh.js").read_bytes(), before)
        self.assertEqual(list((self.current / "assets").iterdir()), [])

    def test_symlinked_output_and_output_inside_an_input_are_rejected(self):
        empty = self.output.parent / "empty"
        empty.mkdir()
        self.output.symlink_to(empty, target_is_directory=True)
        with self.assertRaises(ValueError):
            self.collect()
        self.assertEqual(list(empty.iterdir()), [])
        with self.assertRaises(ValueError):
            collect(self.previous, self.current, self.current / "compat")
        self.assertFalse((self.current / "compat").exists())

    def test_external_urls_are_not_fetched_or_copied(self):
        self.write("route-12345678.js", 'const links=["https://cdn.example.test/external-abcdefgh.js", "//cdn.example.test/external-abcdefgh.css"];')
        self.assertEqual(self.collect()["copied_count"], 2)

    def test_existing_empty_output_is_supported_but_nonempty_output_is_preserved(self):
        self.output.mkdir()
        self.assertEqual(self.collect()["copied_count"], 2)
        before = {path.name: path.read_bytes() for path in self.output.iterdir()}
        with self.assertRaises(ValueError):
            self.collect()
        self.assertEqual(before, {path.name: path.read_bytes() for path in self.output.iterdir()})


if __name__ == "__main__":
    unittest.main()
