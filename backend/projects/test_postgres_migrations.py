"""Exercise the legacy-to-CMS migration on the production database engine."""
from unittest import skipUnless

from django.db import IntegrityError, connection, transaction
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase


@skipUnless(connection.vendor == "postgresql", "Requires the PostgreSQL CI service")
class ProjectAuthorityMigrationTests(TransactionTestCase):
    def test_populated_legacy_catalog_migrates_without_duplicate_slug_index(self):
        executor = MigrationExecutor(connection)
        latest = executor.loader.graph.leaf_nodes()
        self.addCleanup(lambda: MigrationExecutor(connection).migrate(latest))
        before = [("projects", "0002_pricing_tier")]
        executor.migrate(before)
        previous = executor.loader.project_state(before).apps
        LegacyProject = previous.get_model("projects", "Project")
        LegacyImage = previous.get_model("projects", "ProjectImage")
        LegacyLink = previous.get_model("projects", "ProjectLink")
        first = LegacyProject.objects.create(title="Renter", order=4, is_published=True)
        second = LegacyProject.objects.create(title="Renter research notes", order=1, is_published=False)
        image = LegacyImage.objects.create(project=first, image=f"projects/{first.pk}/fixture.png", alt="Existing evidence", order=3)
        link = LegacyLink.objects.create(project=first, label="Repository", href="https://example.com/source", order=2)

        executor = MigrationExecutor(connection)
        executor.migrate(latest)
        current = executor.loader.project_state(latest).apps
        Project = current.get_model("projects", "Project")
        ProjectImage = current.get_model("projects", "ProjectImage")
        ProjectLink = current.get_model("projects", "ProjectLink")
        self.assertEqual(list(Project.objects.values_list("pk", "slug", "is_published", "featured_placement")), [
            (second.pk, f"project-{second.pk}", False, ""),
            (first.pk, f"project-{first.pk}", True, ""),
        ])
        preserved_image = ProjectImage.objects.get(pk=image.pk)
        self.assertEqual((preserved_image.image.name, preserved_image.alt, preserved_image.order),
                         (f"projects/{first.pk}/fixture.png", "Existing evidence", 3))
        preserved_link = ProjectLink.objects.get(pk=link.pk)
        self.assertEqual((preserved_link.href, preserved_link.order), ("https://example.com/source", 2))
        with self.assertRaises(IntegrityError), transaction.atomic():
            Project.objects.create(title="Different record", slug=f"project-{first.pk}")
