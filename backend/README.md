# Portfolio content and lead backend

Django owns published projects, galleries, pricing and project enquiries. Its
admin interface manages content and lead status; Telegram delivery is optional.
See the [repository overview](../README.md) and [frontend guide](../app/README.md).

## Local setup

From the repository root, use a fresh local checkout and Python 3.12:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt

export DJANGO_DEBUG=true
export DJANGO_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')"
export DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
export CORS_ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173

python backend/manage.py migrate
python backend/manage.py createsuperuser
python backend/manage.py runserver 127.0.0.1:8000
```

The default database is local SQLite. Leave `DATABASE_URL` unset for that local
setup; an explicit database URL selects a different database. Open
**http://127.0.0.1:8000/admin/** to add projects and pricing.

Settings read the process environment directly. This checkout does not ship the
previously referenced `.env.example`, and `manage.py` does not automatically load
an `.env` file. Export the values above or use a separate environment loader.
Keep the generated secret private and stable for the lifetime of a local session.

## JSON endpoints

| Method and path | Behavior |
| --- | --- |
| `GET /api/projects/` | Published projects, ordered links and image URLs |
| `GET /api/pricing/` | Ordered pricing tiers and points |
| `POST /api/contacts/` | Validate and persist an enquiry and its qualification data |
| `GET /health/` | Application health response |
| `/admin/` | Authenticated Django content and lead administration |

The full URL configuration is in [`config/urls.py`](config/urls.py). In a Vite
development process use `VITE_API_BASE=http://127.0.0.1:8000`; configure the allowed
frontend origin in `CORS_ALLOWED_ORIGINS` as above.

## Media and optional delivery

Uploaded project images use `backend/media/`. `DJANGO_SERVE_MEDIA` controls Django
media serving and defaults to the debug setting. Production media persistence and
serving are separate deployment decisions.

To enable enquiry notifications, provide `TELEGRAM_BOT_TOKEN` privately and manage
active `TelegramRecipient` records in Django admin. No token is required to browse
the repository or manage local content.

The root [Dockerfile](../Dockerfile) combines the built frontend with Django;
[`DOKKU.md`](../DOKKU.md) records deployment commands. Hostnames, secrets, TLS,
database and media storage must be configured for the intended environment.
