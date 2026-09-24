"""Real HTTP/browser acceptance with isolated SQLite, no worker or external delivery.
Creates synthetic inquiries only in a TemporaryDirectory, then removes everything.
"""
from concurrent.futures import ThreadPoolExecutor
import json
import os
from pathlib import Path
import secrets
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import uuid

REPO = Path(__file__).resolve().parents[1]


def db(action):
    def perform():
        from django.db import connections
        try:
            return action()
        finally:
            connections.close_all()
    with ThreadPoolExecutor(max_workers=1) as executor:
        return executor.submit(perform).result()


def run(root):
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        port = listener.getsockname()[1]
    base = f"http://127.0.0.1:{port}"
    os.environ.update({
        "DJANGO_ENV": "test", "DJANGO_SETTINGS_MODULE": "config.settings", "DJANGO_DEBUG": "false", "DJANGO_DB_SSL": "false",
        "DJANGO_SECURE_SSL_REDIRECT": "false", "DJANGO_ALLOWED_HOSTS": "127.0.0.1,localhost,testserver",
        "DJANGO_FRONTEND_DIST_DIR": str(REPO / "app/dist"), "DJANGO_MEDIA_ROOT": str(root / "media"),
        "DATABASE_URL": f'sqlite:///{root / "db.sqlite3"}', "TELEGRAM_BOT_TOKEN": "",
        "DJANGO_SECRET_KEY": secrets.token_urlsafe(48), "INQUIRY_RATE_LIMIT": "60", "INQUIRY_ALLOWED_ORIGINS": "",
    })
    sys.path.insert(0, str(REPO / "backend"))
    import django
    django.setup()
    from django.core.management import call_command
    from leads.models import ContactRequest, InquiryNotification
    from playwright.sync_api import sync_playwright, expect
    call_command("migrate", verbosity=0, interactive=False)
    logs = open(root / "gunicorn.log", "w")

    def start():
        process = subprocess.Popen([sys.executable, "-m", "gunicorn", "--config", str(REPO / "backend/gunicorn.conf.py"), "config.wsgi:application", "--chdir", str(REPO / "backend"),
                                    "--bind", f"127.0.0.1:{port}", "--workers", "2"], stdout=logs, stderr=logs)
        for _ in range(100):
            try:
                urllib.request.urlopen(base + "/health/", timeout=1).close()
                return process
            except OSError:
                if process.poll() is not None:
                    raise RuntimeError("Isolated server failed to start")
                time.sleep(.1)
        process.terminate()
        process.wait(timeout=10)
        raise RuntimeError("Isolated server readiness timeout")

    process = start()
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            requests = []
            accepted_results = []

            def lose_first_response(route):
                requests.append((route.request.headers["idempotency-key"], route.request.post_data_json))
                response = route.fetch()
                assert response.status == 200
                accepted_results.append(response.json())
                if len(requests) == 1:
                    route.abort("connectionclosed")
                else:
                    route.fulfill(response=response)

            page.route("**/api/contacts/", lose_first_response)
            page.goto(base + "/start?definition=1&product=unsure")
            page.locator("#start-name").fill("Synthetic reliability fixture")
            page.locator("#start-email").fill("fixture@example.test")
            page.locator("#start-message").fill("Temporary isolated regression data, never notify.")
            page.locator('button[type="submit"]').click()
            expect(page.locator("form")).to_have_attribute("data-state", "error")
            assert db(ContactRequest.objects.count) == 1
            assert db(InquiryNotification.objects.count) == 1
            page.screenshot(path="/tmp/raccn-contact-unconfirmed-desktop.png")
            # Retried through newly started workers against the same durable DB.
            process.terminate()
            process.wait(timeout=10)
            process = start()
            page.locator('button[type="submit"]').click()
            expect(page.locator("form")).to_have_attribute("data-state", "success")
            assert requests[0] == requests[1]
            assert accepted_results[0] == accepted_results[1]
            assert db(ContactRequest.objects.count) == 1
            lead = db(ContactRequest.objects.get)
            assert lead.qualification["projectType"]["value"] == "unsure"
            assert lead.telegram_sent is False
            assert db(InquiryNotification.objects.get).status == "pending"
            assert db(InquiryNotification.objects.get).attempts == 0
            page.screenshot(path="/tmp/raccn-contact-confirmed-desktop.png")
            page.set_viewport_size({"width": 390, "height": 844})
            page.evaluate("window.scrollTo({top: 0, behavior: 'instant'})")
            page.screenshot(path="/tmp/raccn-contact-confirmed-mobile.png", full_page=True)
            assert not errors, errors
            browser.close()

        # Two real web workers receive the same new logical submission together.
        key = str(uuid.uuid4())
        body = json.dumps({"name": "Concurrent fixture", "email": "concurrent@example.test", "message": "Isolated race"}).encode()

        def post():
            for _ in range(5):
                request = urllib.request.Request(base + "/api/contacts/", data=body,
                    headers={"Content-Type": "application/json", "Idempotency-Key": key})
                try:
                    with urllib.request.urlopen(request, timeout=5) as response:
                        return json.load(response)
                except urllib.error.HTTPError as exc:
                    if exc.code != 503:
                        raise
                    # SQLite contention is explicitly unconfirmed, safely retried.
                    time.sleep(.05)
            raise AssertionError("Acceptance never confirmed")

        with ThreadPoolExecutor(max_workers=2) as pool:
            first, second = list(pool.map(lambda _: post(), range(2)))
        assert first == second
        assert ContactRequest.objects.count() == 2
        assert InquiryNotification.objects.count() == 2
        assert InquiryNotification.objects.filter(attempts=0, status="pending").count() == 2
        print("PASS: real acceptance, lost response, restart recovery, unknown metadata, two-worker duplicate race; 2 leads / 2 unsent jobs; no external notification.")
    finally:
        process.terminate()
        process.wait(timeout=10)
        logs.close()
        from django.db import connections
        connections.close_all()


if __name__ == "__main__":
    with tempfile.TemporaryDirectory(prefix="raccn-contact-") as directory:
        run(Path(directory))
