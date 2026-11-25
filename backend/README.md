# RACCN Code backend

Django owns published projects, registered images, inquiry acceptance and the
notification outbox. PostgreSQL and persistent media back production; isolated
SQLite is supported for development and tests.

## Local setup

Use Python 3.12 from the repository root:

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.txt
export DJANGO_ENV=development DJANGO_DEBUG=true DJANGO_DB_SSL=false
export DJANGO_SERVE_MEDIA=true DJANGO_SECURE_SSL_REDIRECT=false
python backend/manage.py migrate
python backend/manage.py createsuperuser
python backend/manage.py runserver 127.0.0.1:8001
```

Settings read process environment; `.env.example` is not loaded automatically.
Never use production databases, secrets or provider accounts for local checks.
Development defaults do not apply to production, which requires explicit stable
secret/database/origin/hosts and persistent media settings.

## Contracts

| Endpoint | Behavior |
| --- | --- |
| `GET /api/projects/` | Published records, stable slugs, ordering, links, image alt and registered URLs |
| `GET /api/pricing/` | Preserved backend capability; not the public estimator source |
| `POST /api/contacts/` | JSON validation, durable acceptance and UUID retry protection |
| `GET /health/` | Process liveness independent of providers |
| `GET /ready/` | Internal DB/migration/frontend/media readiness |
| `/admin/` | Authenticated content, leads and notification state |

Only registered project images are publicly served; arbitrary filesystem paths
are not exposed. See the [CMS/media contract](../docs/hardening/CMS_MEDIA_HARDENING.md).

Telegram delivery runs separately through `python manage.py process_inquiry_notifications`.
Failed notification never invalidates a saved inquiry. Use mocked/disabled providers
in tests; see the [contact contract](../docs/hardening/CONTACT_RELIABILITY.md).

Follow the [root setup and checks](../README.md), [CI](../.github/workflows/ci.yml),
[Dokku contract](../DOKKU.md) and [release runbook](../docs/operations/RELEASE_RUNBOOK.md).
