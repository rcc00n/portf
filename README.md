# RACCN Code

Public portfolio and engineering evidence site: React/Vite frontend, Django CMS/admin and PostgreSQL production data. The approved Control Plane design is unchanged. Django controls project publication, ordered copy/media/links, raw route metadata and durable inquiry acceptance.

## Repository

- `app/`: public frontend and unit/browser regressions.
- `backend/`: CMS, registered-image serving, inquiry API/outbox and server metadata.
- `scripts/`: isolated integration checks.
- `.github/workflows/ci.yml`: lint/build/tests; no deployment.
- [DOKKU.md](DOKKU.md): production environment, media, proxy and worker contract.
- [docs/](docs/README.md): operations and clearly labelled historical reviews.

## Local development

Use Node 22 (at least 22.13) and Python 3.12 (CI/container target; backend also tested locally on 3.10). No secrets or production data are needed.

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.txt
npm --prefix app ci
export DJANGO_ENV=development DJANGO_DEBUG=true DJANGO_DB_SSL=false
export DJANGO_SERVE_MEDIA=true DJANGO_SECURE_SSL_REDIRECT=false
python backend/manage.py migrate
python backend/manage.py createsuperuser
python backend/manage.py runserver 127.0.0.1:8001
```

In a second terminal run `npm --prefix app run dev -- --host 127.0.0.1`. Vite proxies `/api` and `/media` to port 8001. Templates in `.env.example` are safe examples; export values explicitly (Django does not load dotenv). For built Django rendering set `DJANGO_FRONTEND_DIST_DIR` to the absolute `app/dist` path after building. Empty CMS produces an intentional empty state; no seed fallback republishes unpublished projects.

## CMS and inquiry operation

Admin: create a project, assign a stable unique slug, publication and ordering/featured placement, then ordered image/alt and link records. Only the approved `renter` identity has a case route; other/unknown case slugs are real 404s. Do not infer identity from titles. Owner must verify factual copy/links before publication. Uploaded files belong in persistent MEDIA_ROOT, separate from Vite assets and WhiteNoise static. See [CMS contract](docs/hardening/CMS_MEDIA_HARDENING.md).

A confirmed inquiry means a committed lead and durable outbox record. UUID retries recover the same acceptance; Telegram never blocks POST acceptance. Production runs one separately supervised `python manage.py process_inquiry_notifications` worker with the same DB and private Telegram configuration. Do not start a worker against real data during tests. Staff inspect failed/pending notifications in admin and can retry failed delivery without duplicating a lead. See [contact contract](docs/hardening/CONTACT_RELIABILITY.md).

## Tests and production build

```sh
pip install -r app/tests/requirements.txt
python -m playwright install chromium
python scripts/check_release.py
```

The maintained runner performs lint, 81-combination estimator/unit coverage, build, backend tests/migration drift, contact/definition browser tests, and CMS/media/contact/metadata integrations using temporary SQLite/media and mocked/disabled Telegram. Individual commands live in root CI and the runner. Browser binaries and virtual environments are local, ignored material.

`npm --prefix app run build` produces `app/dist`; Docker builds the same frontend and runs `collectstatic` for Django/admin. `npm ci` and exact backend pins reproduce dependency selections. OS/base-image digests are not locked/attested yet. Dokku topology is nginx → Gunicorn → PostgreSQL + persistent media, plus one notification worker. Read [production prerequisites](DOKKU.md) before any release; default production settings intentionally fail without explicit secrets/database/hosts/origin/media configuration.

## Release status

Repository/operations hardening only. No staging/production deploy or merge to main. Owner/legal facts, actual PostgreSQL/media/proxy/worker behavior, backups and image verification remain staging gates. Historical audits are evidence from their original phase, not current production-readiness claims.
