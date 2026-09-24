import tempfile
from html.parser import HTMLParser
from pathlib import Path
from unittest.mock import patch
from xml.etree import ElementTree

from django.db import OperationalError
from django.test import TestCase, override_settings
from projects.models import Project
from .metadata import CONTRACT, ROUTES, canonical_origin


class Head(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = {}
        self.canonical = None
        self.title = ''
        self.in_title = False
        self.preloads = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'title': self.in_title = True
        if tag == 'meta': self.tags[attrs.get('name', attrs.get('property'))] = attrs.get('content')
        if tag == 'link' and attrs.get('rel') == 'canonical': self.canonical = attrs.get('href')
        if tag == 'link' and attrs.get('as') == 'font': self.preloads.append(attrs.get('href'))

    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False

    def handle_data(self, data):
        if self.in_title: self.title += data


@override_settings(DEBUG=False, SECURE_SSL_REDIRECT=False, CANONICAL_ORIGIN='https://canonical.example')
class RouteMetadataTests(TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'index.html').write_text('<!doctype html><head><!--raccn-head:start--><!--raccn-head:end--></head><div id="root"></div>')
        override = self.settings(FRONTEND_DIST_DIR=self.root)
        override.enable()
        self.addCleanup(override.disable)
        self.project = Project.objects.create(slug='renter', title='Reviewed Renter', blurb='Authoritative project description.', is_published=True)

    def head(self, path, status=200):
        response = self.client.get(path)
        self.assertEqual(response.status_code, status)
        return Head(response.content.decode()), response

    def test_all_canonical_heads_are_route_appropriate_and_complete(self):
        for path, entry in ROUTES.items():
            with self.subTest(path=path):
                head, response = self.head(path)
                title = 'Reviewed Renter — RACCN Code' if path == '/work/renter' else entry['title']
                description = self.project.blurb if path == '/work/renter' else entry['description']
                self.assertEqual(head.title, title)
                self.assertEqual(head.tags['description'], description)
                self.assertEqual(head.canonical, 'https://canonical.example' + path)
                self.assertEqual(head.tags['og:url'], head.canonical)
                for prefix in ('og', 'twitter'):
                    self.assertEqual(head.tags[prefix + ':title'], title)
                    self.assertEqual(head.tags[prefix + ':description'], description)
                    self.assertEqual(head.tags[prefix + ':image'], 'https://canonical.example/social/raccn-code.png')
                self.assertEqual(head.tags['og:image:width'], '1200')
                self.assertEqual(head.tags['og:image:height'], '630')
                self.assertEqual(head.tags['twitter:card'], 'summary_large_image')
                self.assertEqual(head.tags['robots'], 'noindex, follow' if path == '/systems/demo' else 'index, follow')
                self.assertEqual(len(head.preloads), 3 if path in ('/', '/start', '/start/define') else 2)
                self.assertTrue(all(font.startswith('/fonts/') for font in head.preloads))
                if path == '/systems/demo': self.assertIn('noindex', response['X-Robots-Tag'])

    def test_query_slash_and_host_do_not_change_canonical_or_definition_state(self):
        head, _ = self.head('/start/define/?product=unknown&complexity=Heavy')
        self.assertEqual(head.canonical, 'https://canonical.example/start/define')
        response = self.client.get('/estimate?product=unknown')
        self.assertEqual(response['Location'], '/start/define?product=unknown')
        with override_settings(ALLOWED_HOSTS=['alternate.example']):
            response = self.client.get('/work', HTTP_HOST='alternate.example')
            self.assertEqual(Head(response.content.decode()).canonical, 'https://canonical.example/work')

    def test_unpublished_case_never_advertises_factual_metadata_or_canonical(self):
        self.project.is_published = False
        self.project.save()
        head, response = self.head('/work/renter', 404)
        self.assertEqual(head.title, CONTRACT['notFound']['title'])
        self.assertIsNone(head.canonical)
        self.assertNotIn(self.project.blurb, response.content.decode())
        self.assertNotIn('og:url', head.tags)
        self.assertIn('noindex', head.tags['robots'])
        self.project.delete()
        self.head('/work/renter', 404)

    def test_case_cms_html_is_escaped_and_global_social_image_is_retained(self):
        self.project.title = 'Renter <script> & "reviewed"'
        self.project.blurb = '</head><script>alert(1)</script>'
        self.project.save()
        head, response = self.head('/work/renter')
        self.assertEqual(head.title, self.project.title + ' — RACCN Code')
        self.assertEqual(head.tags['description'], self.project.blurb)
        self.assertNotIn('<script>alert(1)</script>', response.content.decode())
        self.assertTrue(head.tags['og:image'].endswith('/social/raccn-code.png'))

    def test_arbitrary_cms_slug_unknown_routes_and_prototypes_are_404_noindex(self):
        Project.objects.create(slug='unapproved', title='Not an approved case', is_published=True)
        for path in ('/no-such-page', '/work/unapproved', '/systems/unknown', '/prototype', '/prototype/control-plates', '/prototype/braided-signal', '/prototype/routing-index', '/prototype/unknown.html', '/prototype/fonts/instrument-sans-latin.woff2', '/assets/missing.js', '/static/missing.css'):
            with self.subTest(path=path):
                head, response = self.head(path, 404)
                self.assertIsNone(head.canonical)
                self.assertIn('noindex', head.tags['robots'])
                self.assertIn('noindex', response['X-Robots-Tag'])
        missing = self.client.get('/media/projects/missing.png')
        self.assertEqual(missing.status_code, 404)
        self.assertIn('noindex', missing['X-Robots-Tag'])

    def test_sitemap_includes_only_published_indexable_canonical_routes(self):
        def locations():
            response = self.client.get('/sitemap.xml')
            self.assertEqual(response.status_code, 200)
            return {node.text for node in ElementTree.fromstring(response.content).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
        expected = {'https://canonical.example' + path for path, meta in ROUTES.items() if not meta.get('noindex')}
        self.assertEqual(locations(), expected)
        self.project.is_published = False
        self.project.save()
        self.assertEqual(locations(), expected - {'https://canonical.example/work/renter'})

    def test_robots_allows_assets_and_demo_crawling_to_see_noindex(self):
        response = self.client.get('/robots.txt')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content.decode(), 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: https://canonical.example/sitemap.xml\n')

    def test_database_failure_is_503_noindex_and_sitemap_never_fabricates_publication(self):
        with patch('config.views.case_project', side_effect=OperationalError):
            head, response = self.head('/work/renter', 503)
            self.assertIsNone(head.canonical)
            self.assertIn('noindex', response['X-Robots-Tag'])
            self.assertEqual(self.client.get('/sitemap.xml').status_code, 503)

    def test_canonical_configuration_cannot_contain_credentials_or_paths(self):
        from django.core.exceptions import ImproperlyConfigured
        for origin in ('javascript:alert(1)', 'https://user:password@example.com', 'https://example.com/path', 'https://example.com?next=elsewhere'):
            with self.settings(CANONICAL_ORIGIN=origin), self.assertRaises(ImproperlyConfigured):
                canonical_origin()
