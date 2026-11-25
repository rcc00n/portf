"""Runtime contracts are tested without production credentials or providers."""
import ipaddress
import json
import os
import runpy
from pathlib import Path
import subprocess
import sys
import tempfile
from unittest.mock import Mock, patch

from django.db import OperationalError
from django.http import HttpResponse
from django.test import RequestFactory, SimpleTestCase, TestCase, override_settings

from config.middleware import TrustedProxyMiddleware
from leads.abuse import client_ip
from deployment_ready import NoRedirect, check_readiness


class DeploymentProbeTests(SimpleTestCase):
    def test_gunicorn_binds_runtime_port_without_shell_expansion(self):
        configuration = Path(__file__).resolve().parents[1] / 'gunicorn.conf.py'
        for environment, expected in [({}, '0.0.0.0:8000'), ({'PORT': '8321'}, '0.0.0.0:8321'), ({'PORT': ''}, '0.0.0.0:8000')]:
            with self.subTest(environment=environment), patch.dict(os.environ, environment, clear=True):
                self.assertEqual(runpy.run_path(str(configuration))['bind'], expected)

    def test_dokku_startup_command_uses_supported_argv_array(self):
        # Dokku 0.34.7 decodes Healthcheck.Command into []string. A shell string
        # can pass application tests yet prevent the actual release from booting.
        backend = Path(__file__).resolve().parents[1]
        manifest_path = next(path for path in (backend / 'app.json', backend.parent / 'app.json') if path.is_file())
        manifest = json.loads(manifest_path.read_text())
        checks = manifest['healthchecks']['web']
        self.assertTrue(checks)
        for check in checks:
            command = check['command']
            self.assertIsInstance(command, list)
            self.assertTrue(command)
            self.assertTrue(all(isinstance(arg, str) and arg for arg in command))

    def probe(self, status=200, body=b'{"ok": true}'):
        response = Mock(status=status)
        response.read.return_value = body
        context = Mock()
        context.__enter__ = Mock(return_value=response)
        context.__exit__ = Mock(return_value=False)
        opener = Mock()
        opener.open.return_value = context
        return opener

    @patch.dict(os.environ, {'PORT': '8123', 'DJANGO_CANONICAL_ORIGIN': 'https://site.example'})
    def test_checks_local_container_with_valid_host_and_bounded_timeout(self):
        opener = self.probe()
        with patch('deployment_ready.build_opener', return_value=opener) as build:
            self.assertTrue(check_readiness())
        request = opener.open.call_args.args[0]
        self.assertEqual(request.full_url, 'http://127.0.0.1:8123/ready/')
        self.assertEqual(request.get_header('Host'), 'site.example')
        self.assertEqual(opener.open.call_args.kwargs['timeout'], 4)
        self.assertEqual(build.call_args.args[0].proxies, {})

    def test_rejects_bad_readiness_and_network_failure(self):
        for status, body in [(503, b'{"ok": false}'), (200, b'not-json'), (200, b'{"ok": false}'), (200, b'{}')]:
            with self.subTest(status=status, body=body), patch('deployment_ready.build_opener', return_value=self.probe(status, body)):
                self.assertFalse(check_readiness())
        with patch('deployment_ready.build_opener', side_effect=OSError('private detail')):
            self.assertFalse(check_readiness())

    def test_never_follows_external_redirects(self):
        self.assertIsNone(NoRedirect().redirect_request(None, None, 302, '', {}, 'https://site.example/ready/'))

    def test_invalid_local_port_fails_without_request(self):
        for port in ['bad', '0', '65536']:
            with patch.dict(os.environ, {'PORT': port}), patch('deployment_ready.build_opener') as build:
                self.assertFalse(check_readiness())
                build.assert_not_called()


class ProductionSettingsTests(SimpleTestCase):
    def load(self, **overrides):
        env = {key: value for key, value in os.environ.items() if not key.startswith(('DJANGO_', 'DATABASE_', 'CORS_', 'INQUIRY_'))}
        env.update(DJANGO_ENV='production', DJANGO_SECRET_KEY='test-only-not-a-production-secret-' * 3,
                   DATABASE_URL='postgresql://localhost/raccn_test', DJANGO_ALLOWED_HOSTS='site.example',
                   DJANGO_CANONICAL_ORIGIN='https://site.example', DJANGO_MEDIA_ROOT='/tmp/isolated-media',
                   DJANGO_SERVE_MEDIA='true')
        env.update(overrides)
        return subprocess.run([sys.executable, '-c', 'import config.settings'], cwd=Path(__file__).resolve().parents[1], env=env, capture_output=True)

    def test_valid_production_configuration_loads_without_database_access(self):
        self.assertEqual(self.load().returncode, 0)

    def test_production_rejects_unsafe_defaults(self):
        for settings in [dict(DJANGO_SECRET_KEY=''), dict(DATABASE_URL=''), dict(DATABASE_URL='sqlite:///:memory:'),
                         dict(DJANGO_ALLOWED_HOSTS=''), dict(DJANGO_ALLOWED_HOSTS='*'), dict(DJANGO_DEBUG='true'),
                         dict(DJANGO_CANONICAL_ORIGIN=''), dict(DJANGO_CANONICAL_ORIGIN='http://site.example'),
                         dict(DJANGO_MEDIA_ROOT=''), dict(DJANGO_SERVE_MEDIA='false'), dict(DJANGO_CSRF_COOKIE_SECURE='false'),
                         dict(DJANGO_SESSION_COOKIE_SECURE='false'), dict(DJANGO_SECURE_SSL_REDIRECT='false'),
                         dict(DJANGO_TRUSTED_PROXY_CIDRS='0.0.0.0/0'), dict(DJANGO_CSP_CONNECT_ORIGINS="https://api.example;script-src")]:
            with self.subTest(keys=settings):
                self.assertNotEqual(self.load(**settings).returncode, 0)

    def test_explicit_test_and_build_modes_allow_isolated_sqlite(self):
        for mode in ['test', 'build', 'development']:
            self.assertEqual(self.load(DJANGO_ENV=mode, DJANGO_SECRET_KEY='', DATABASE_URL='sqlite:///:memory:').returncode, 0)


@override_settings(TRUSTED_PROXY_NETWORKS=[ipaddress.ip_network('192.0.2.0/24')], TRUST_PROXY_CLIENT_IP=True)
class ProxyTests(SimpleTestCase):
    def request(self, peer, forwarded='198.51.100.11', protocol='https'):
        request = RequestFactory().get('/', REMOTE_ADDR=peer, HTTP_X_FORWARDED_FOR=forwarded, HTTP_X_FORWARDED_PROTO=protocol)
        TrustedProxyMiddleware(lambda _: HttpResponse())(request)
        return request

    def test_untrusted_peer_cannot_supply_client_or_protocol(self):
        request = self.request('203.0.113.9')
        self.assertEqual(client_ip(request), '203.0.113.9')
        self.assertNotIn('HTTP_X_FORWARDED_PROTO', request.META)

    def test_trusted_overwriting_proxy_can_supply_single_client(self):
        request = self.request('192.0.2.4')
        self.assertEqual(client_ip(request), '198.51.100.11')
        self.assertEqual(request.META['HTTP_X_FORWARDED_PROTO'], 'https')

    def test_forwarded_chains_malformed_and_missing_fall_back_to_peer(self):
        for value in ['198.51.100.11, 203.0.113.9', 'garbage', '', 'https://evil.example']:
            self.assertEqual(client_ip(self.request('192.0.2.4', value)), '192.0.2.4')
        self.assertNotIn('HTTP_X_FORWARDED_PROTO', self.request('192.0.2.4', protocol='https,http').META)

    @override_settings(TRUST_PROXY_CLIENT_IP=False)
    def test_default_does_not_enable_forwarded_ip_trust(self):
        self.assertEqual(client_ip(self.request('192.0.2.4')), '192.0.2.4')


@override_settings(SECURE_SSL_REDIRECT=False)
class ReadinessTests(TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        (root / 'index.html').write_text('<html></html>')
        self.override = override_settings(MEDIA_ROOT=root, FRONTEND_DIST_DIR=root)
        self.override.enable()
        self.addCleanup(self.override.disable)

    def test_readiness_uses_migrated_database_media_and_build(self):
        response = self.client.get('/ready/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'ok': True})
        self.assertEqual(response['Cache-Control'], 'no-store')
        self.assertEqual(response['X-Robots-Tag'], 'noindex')

    def test_database_failure_is_generic_and_liveness_is_independent(self):
        with patch('config.readiness.connection.cursor', side_effect=OperationalError('private-provider-information')):
            response = self.client.get('/ready/')
            self.assertEqual(response.status_code, 503)
            self.assertEqual(response.json(), {'ok': False})
            self.assertEqual(self.client.get('/health/').status_code, 200)

    def test_missing_media_or_frontend_is_not_ready(self):
        for key in ['MEDIA_ROOT', 'FRONTEND_DIST_DIR']:
            with override_settings(**{key: Path(self.temp.name) / 'absent'}):
                self.assertEqual(self.client.get('/ready/').status_code, 503)

    def test_pending_migrations_are_not_ready(self):
        with patch('config.readiness.MigrationExecutor.migration_plan', return_value=[object()]):
            self.assertEqual(self.client.get('/ready/').status_code, 503)

    def test_no_telegram_dependency(self):
        with patch('leads.notifications.process_one', side_effect=AssertionError('must not deliver')):
            self.assertEqual(self.client.get('/ready/').status_code, 200)

    def test_public_security_policy_and_admin_boundary(self):
        response = self.client.get('/health/')
        self.assertIn("script-src 'self'", response['Content-Security-Policy'])
        self.assertNotIn("script-src 'self' 'unsafe-inline'", response['Content-Security-Policy'])
        self.assertEqual(response['X-Content-Type-Options'], 'nosniff')
        self.assertEqual(response['X-Frame-Options'], 'DENY')
        self.assertEqual(response['Referrer-Policy'], 'strict-origin-when-cross-origin')
        self.assertIn('camera=()', response['Permissions-Policy'])
        with override_settings(STORAGES={'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'}, 'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'}}):
            admin = self.client.get('/admin/login/')
        self.assertEqual(admin.status_code, 200)
        self.assertNotIn('Content-Security-Policy', admin)
        self.assertEqual(admin['X-Frame-Options'], 'DENY')

    @override_settings(SECURE_HSTS_SECONDS=3600)
    def test_hsts_only_on_secure_response(self):
        self.assertNotIn('Strict-Transport-Security', self.client.get('/health/'))
        self.assertIn('max-age=3600', self.client.get('/health/', secure=True)['Strict-Transport-Security'])
