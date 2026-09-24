"""Run the root CI-equivalent suite locally; temporary data, no deployment/provider delivery."""
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]


def main():
    with tempfile.TemporaryDirectory(prefix='raccn-release-check-') as directory:
        env = os.environ.copy()
        env.update(DJANGO_ENV='test', DJANGO_DEBUG='false', DJANGO_DB_SSL='false',
                   DJANGO_SERVE_MEDIA='true', DJANGO_SECURE_SSL_REDIRECT='false',
                   DJANGO_ALLOWED_HOSTS='localhost,127.0.0.1,testserver',
                   DATABASE_URL=f'sqlite:///{directory}/checks.sqlite3', TELEGRAM_BOT_TOKEN='',
                   DJANGO_TRUSTED_PROXY_CIDRS='', DJANGO_TRUST_PROXY_CLIENT_IP='false')
        def run(command, cwd=ROOT):
            print('+ ' + ' '.join(command), flush=True)
            subprocess.run(command, cwd=cwd, env=env, check=True)
        for command in [['npm', '--prefix', 'app', 'run', 'lint'], ['npm', '--prefix', 'app', 'test'], ['npm', '--prefix', 'app', 'run', 'build']]:
            run(command)
        for args in [['test', '--noinput'], ['makemigrations', '--check', '--dry-run']]:
            run([sys.executable, 'manage.py', *args], ROOT / 'backend')
        with socket.socket() as listener:
            listener.bind(('127.0.0.1', 0))
            port = listener.getsockname()[1]
        env['RACCN_TEST_URL'] = f'http://127.0.0.1:{port}'
        with (Path(directory) / 'preview.log').open('w') as logs:
            # Direct Node child so termination also stops the server, not only npm.
            server = subprocess.Popen(['node', 'node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', str(port), '--strictPort'], cwd=ROOT / 'app', env=env, stdout=logs, stderr=logs)
            try:
                for _ in range(100):
                    try:
                        urllib.request.urlopen(env['RACCN_TEST_URL'], timeout=1).close()
                        break
                    except OSError:
                        if server.poll() is not None:
                            raise RuntimeError('Preview failed to start; inspect local configuration.')
                        time.sleep(.1)
                else:
                    raise RuntimeError('Preview did not become ready.')
                for script in ['definition_browser.py', 'contact_browser.py']:
                    run([sys.executable, f'app/tests/{script}'])
            finally:
                server.terminate()
                server.wait(timeout=10)
        for script in ['cms_media_smoke.py', 'contact_reliability_smoke.py', 'site_metadata_smoke.py']:
            run([sys.executable, f'scripts/{script}'])
        print('Release regression suite PASS. No deployment or provider delivery performed.', flush=True)


if __name__ == '__main__':
    main()
