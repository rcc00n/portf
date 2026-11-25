import io
import json
import tempfile
from pathlib import Path
from unittest.mock import patch

from PIL import Image
from django.core.files.base import ContentFile
from django.core.management import call_command, CommandError
from django.test import TestCase, override_settings
from projects.models import Project, ProjectImage, ProjectLink


class ReleasePortfolioTests(TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        (self.root / "media").mkdir()
        Image.new("RGB", (4, 4), "blue").save(self.root / "media" / "example.png")
        self.rows = [{"slug": "renter", "title": "Renter", "expected_title": "Renter", "impact": "Marketplace", "blurb": "Reviewed copy", "status": "Case study", "featured_placement": "supporting", "links": [{"href": "https://example.test", "label": "Source"}], "images": [{"file": "example.png", "alt": "Reviewed example"}]}]
        (self.root / "manifest.json").write_text(json.dumps({"version": 1, "projects": self.rows}))
        self.enterContext(patch("projects.management.commands.publish_release_portfolio.SOURCE", self.root))
        self.enterContext(override_settings(MEDIA_ROOT=self.root / "uploads"))

    def run_import(self, *args):
        call_command("publish_release_portfolio", *args, stdout=io.StringIO())

    def test_dry_run_is_read_only(self):
        self.run_import("--replace-selection")
        self.assertFalse(Project.objects.exists())
        self.assertFalse((self.root / "uploads").exists())

    def test_idempotent_mapping_keeps_original_images_and_unpublishes_without_deleting(self):
        project = Project.objects.create(pk=42, slug="project-42", title="Renter", is_published=True)
        other = Project.objects.create(title="Old evidence", is_published=True)
        original = ProjectImage.objects.create(project=project, image=ContentFile((self.root / "media" / "example.png").read_bytes(), name="original.png"), alt="Original evidence")
        for _ in range(2):
            self.run_import("--apply", "--replace-selection", "--map", "renter:42")
        project.refresh_from_db(); other.refresh_from_db(); original.refresh_from_db()
        self.assertEqual(project.slug, "renter")
        self.assertTrue(project.is_published)
        self.assertFalse(other.is_published)
        self.assertEqual(project.images.count(), 2)
        self.assertEqual(project.links.count(), 1)
        self.assertEqual(project.images.first().alt, "Reviewed example")
        self.assertEqual(original.order, 1)
        self.assertTrue(original.image.storage.exists(original.image.name))
        self.assertEqual(Project.objects.count(), 2)

    def test_ambiguous_or_wrong_mapping_rejected_before_changes(self):
        project = Project.objects.create(pk=42, slug="project-42", title="Different project")
        with self.assertRaises(CommandError):
            self.run_import("--apply", "--map", "renter:42")
        project.refresh_from_db()
        self.assertEqual(project.slug, "project-42")
        self.assertEqual(ProjectImage.objects.count(), 0)

    def test_missing_release_asset_cannot_partially_publish(self):
        (self.root / "media" / "example.png").unlink()
        with self.assertRaises(CommandError):
            self.run_import("--apply")
        self.assertEqual(Project.objects.count(), 0)

    def test_only_explicitly_retired_link_is_removed(self):
        project = Project.objects.create(slug="renter", title="Renter")
        retired = ProjectLink.objects.create(project=project, href="https://retired.example", label="Old showcase")
        retained = ProjectLink.objects.create(project=project, href="https://retained.example", label="Reviewed reference")
        self.rows[0]["retired_links"] = [retired.href]
        (self.root / "manifest.json").write_text(json.dumps({"version": 1, "projects": self.rows}))
        self.run_import("--apply")
        self.assertFalse(ProjectLink.objects.filter(pk=retired.pk).exists())
        self.assertTrue(ProjectLink.objects.filter(pk=retained.pk).exists())
