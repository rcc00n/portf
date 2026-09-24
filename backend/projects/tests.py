import io
import tempfile
from pathlib import Path
from urllib.parse import urlsplit
from unittest.mock import patch

from PIL import Image
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import connection, IntegrityError, transaction
from django.db.migrations.executor import MigrationExecutor
from django.test import TestCase, TransactionTestCase, override_settings
from django.urls import reverse

from .checks import media_configuration
from .models import Project, ProjectImage, ProjectLink


def uploaded_image(name="evidence.png", color="blue"):
    stream = io.BytesIO()
    Image.new("RGB", (16, 12), color).save(stream, format="PNG")
    return SimpleUploadedFile(name, stream.getvalue(), content_type="image/png")


@override_settings(DEBUG=False, SERVE_MEDIA=True, MEDIA_URL="/media/", SECURE_SSL_REDIRECT=False)
class ProjectContractTests(TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "dist").mkdir()
        (self.root / "static").mkdir()
        (self.root / "dist/index.html").write_text('<title>RACCN</title><div id="root"></div>')
        self.settings_override = override_settings(MEDIA_ROOT=self.root / "uploads", FRONTEND_DIST_DIR=self.root / "dist", STATIC_ROOT=self.root / "static")
        self.settings_override.enable()
        self.addCleanup(self.settings_override.disable)
        self.project = Project.objects.create(title="CMS evidence", slug="renter", is_published=True, featured_placement="lead", order=10)

    def image(self, **kwargs):
        return ProjectImage.objects.create(project=self.project, image=uploaded_image(), **kwargs)

    def test_publication_order_and_explicit_featured_identity(self):
        Project.objects.create(title="A Renter-like title", slug="not-renter", is_published=True, order=1, featured_placement="supporting", featured_order=4)
        Project.objects.create(title="Unpublished", slug="hidden", is_published=False, order=0)
        response = self.client.get('/api/projects/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Cache-Control'], 'no-store')
        data = response.json()
        self.assertEqual([item['slug'] for item in data], ['not-renter', 'renter'])
        self.assertEqual(data[0]['featured_order'], 4)
        self.assertIsNone(data[0]['case_path'])
        self.assertEqual(data[1]['case_path'], '/work/renter')
        self.project.title = 'Renamed project'
        self.project.save()
        self.assertEqual(Project.objects.get(pk=self.project.pk).slug, 'renter')

    def test_ordered_media_alt_links_and_compatibility_urls(self):
        second = self.image(alt="Owner-provided second view", order=9)
        first = self.image(alt="Owner-provided primary view", order=1)
        ProjectLink.objects.create(project=self.project, label="Second", href="https://example.org/second", order=9)
        ProjectLink.objects.create(project=self.project, label="First", href="https://example.org/first", order=1)
        with self.assertNumQueries(3):
            response = self.client.get('/api/projects/')
        item = response.json()[0]
        self.assertEqual([image['id'] for image in item['media']], [first.pk, second.pk])
        self.assertEqual(item['media'][0]['alt'], first.alt)
        self.assertEqual(item['images'], [image['url'] for image in item['media']])
        self.assertEqual([link['label'] for link in item['links']], ['First', 'Second'])
        self.assertTrue(item['media'][0]['url'].startswith('http://testserver/media/projects/'))

    def test_admin_upload_to_persistent_path_api_and_public_http(self):
        user = get_user_model().objects.create_superuser(username="test-admin", password="local-test-only")
        self.client.force_login(user)
        response = self.client.post(reverse('admin:projects_projectimage_add'), {'project':self.project.pk, 'image':uploaded_image(), 'alt':'Uploaded through admin', 'order':0, '_save':'Save'})
        self.assertEqual(response.status_code, 302)
        image = ProjectImage.objects.get()
        self.assertTrue(Path(image.image.path).is_relative_to(self.root / 'uploads'))
        self.assertTrue(Path(image.image.path).is_file())
        self.client.logout()
        url = self.client.get('/api/projects/').json()[0]['media'][0]['url']
        response = self.client.get(urlsplit(url).path)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'image/png')
        self.assertEqual(response['X-Content-Type-Options'], 'nosniff')
        self.assertEqual(response['Cache-Control'], 'public, max-age=0, must-revalidate')
        self.assertTrue(b''.join(response.streaming_content).startswith(b'\x89PNG'))
        etag = response['ETag']
        self.assertEqual(self.client.get(urlsplit(url).path, HTTP_IF_NONE_MATCH=etag).status_code, 304)
        self.assertEqual(self.client.head(urlsplit(url).path).status_code, 200)
        self.project.is_published = False
        self.project.save()
        self.assertEqual(self.client.get(urlsplit(url).path, HTTP_IF_NONE_MATCH=etag).status_code, 404)

    def test_admin_model_form_rejects_valid_but_unsupported_image_formats(self):
        from django.forms import modelform_factory
        buffer = io.BytesIO()
        Image.new("RGB", (16, 12), "blue").save(buffer, format="BMP")
        form_class = modelform_factory(ProjectImage, fields=["project", "image", "alt", "order"])
        form = form_class(data={"project":self.project.pk, "alt":"Example", "order":0}, files={"image":SimpleUploadedFile("evidence.bmp", buffer.getvalue(), content_type="image/bmp")})
        self.assertFalse(form.is_valid())
        self.assertIn("Use a JPEG", str(form.errors["image"]))

    def test_missing_unregistered_and_unsafe_media_are_404(self):
        image = self.image()
        url = image.image.url
        Path(image.image.path).unlink()
        self.assertEqual(self.client.get(url).status_code, 404)
        for path in ['/media/projects/1/missing.png','/media/.env','/media/../config/settings.py','/media/projects/%2e%2e/private.png','/media/projects/%5c..%5csecret.png']:
            self.assertEqual(self.client.get(path).status_code, 404, path)
        unregistered = self.root / 'uploads/projects/unregistered.png'
        unregistered.write_bytes(uploaded_image().read())
        self.assertEqual(self.client.get('/media/projects/unregistered.png').status_code, 404)

    def test_symlink_and_non_image_records_cannot_expose_files(self):
        image = self.image()
        outside = self.root / 'outside.png'
        outside.write_bytes(uploaded_image().read())
        path = Path(image.image.path)
        path.unlink()
        path.symlink_to(outside)
        self.assertEqual(self.client.get(image.image.url).status_code, 404)
        path.unlink()
        path.write_text('<script>alert(1)</script>')
        self.assertEqual(self.client.get(image.image.url).status_code, 404)

    def test_static_and_media_are_separate_and_serving_can_be_disabled(self):
        image = self.image()
        static = self.root / 'dist/assets'
        static.mkdir()
        (static / 'test.png').write_bytes(uploaded_image().read())
        self.assertEqual(self.client.get('/assets/test.png').status_code, 200)
        self.assertEqual(self.client.get('/media/assets/test.png').status_code, 404)
        self.assertEqual(media_configuration(None), [])
        with override_settings(STATIC_URL='/media/'):
            self.assertIn('projects.E003', [item.id for item in media_configuration(None)])
        with override_settings(MEDIA_ROOT=self.root / 'dist'):
            self.assertIn('projects.E002', [item.id for item in media_configuration(None)])
        with override_settings(SERVE_MEDIA=False):
            self.assertEqual(self.client.get(image.image.url).status_code, 404)

    def test_drafts_have_private_staff_preview_only(self):
        image = self.image()
        self.project.is_published=False
        self.project.save()
        self.assertEqual(self.client.get(image.image.url).status_code, 404)
        user = get_user_model().objects.create_superuser(username="preview-admin", password="local-test-only")
        self.client.force_login(user)
        response=self.client.get(image.image.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Cache-Control'], 'private, no-store')
        response.close()

    def test_empty_catalog_and_case_publication_gate(self):
        self.assertEqual(self.client.get('/work/renter').status_code, 200)
        self.assertEqual(self.client.get('/work/not-a-real-case').status_code, 404)
        Project.objects.create(title='Not a case', slug='not-a-real-case', is_published=True)
        self.assertEqual(self.client.get('/work/not-a-real-case').status_code, 404)
        Project.objects.update(is_published=False)
        self.assertEqual(self.client.get('/api/projects/').json(), [])
        response = self.client.get('/work/renter')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response['X-Robots-Tag'], 'noindex')
        self.assertEqual(response['Cache-Control'], 'no-store')

    def test_default_draft_and_unique_lead(self):
        project = Project.objects.create(title='A draft')
        self.assertFalse(project.is_published)
        self.assertNotEqual(project.slug, self.project.slug)
        with self.assertRaises(IntegrityError), transaction.atomic():
            Project.objects.create(title='Another lead', is_published=True, featured_placement='lead')

    def test_case_database_failure_is_503_not_false_404(self):
        from django.db import OperationalError
        with patch('config.views.published_case_exists', side_effect=OperationalError):
            self.assertEqual(self.client.get('/work/renter').status_code, 503)


class ProjectIdentityMigrationTests(TransactionTestCase):
    def test_forward_migration_assigns_neutral_unique_slugs_without_guessing_titles(self):
        old = [('projects','0002_pricing_tier')]
        new = [('projects','0003_alter_project_options_project_featured_order_and_more')]
        executor = MigrationExecutor(connection)
        executor.migrate(old)
        try:
            ProjectBefore = executor.loader.project_state(old).apps.get_model('projects','Project')
            rows = [ProjectBefore.objects.create(title=title, is_published=published) for title,published in [('Renter',True),('Renter',False),('',True)]]
            executor = MigrationExecutor(connection)
            executor.migrate(new)
            ProjectAfter = executor.loader.project_state(new).apps.get_model('projects','Project')
            for row in rows:
                migrated = ProjectAfter.objects.get(pk=row.pk)
                self.assertEqual(migrated.slug, f'project-{row.pk}')
                self.assertEqual(migrated.is_published, row.is_published)
                self.assertEqual(migrated.featured_placement, '')
                self.assertEqual(migrated.headline, '')
                self.assertEqual(migrated.status, '')
        finally:
            MigrationExecutor(connection).migrate(new)
