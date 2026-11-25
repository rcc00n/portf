# Local selected work

Rentino and Bad Guy Motors are loaded into the development CMS, not used as a frontend fallback. Screenshots were captured from the supplied public homepages on 2026-09-24, with cookie/subscription overlays dismissed, and encoded as WebP. Text describes visible public functionality; no performance metrics or technology claims are assumed.

From the repository root, after installing the dependencies described in the main README:

```sh
export DJANGO_ENV=development DJANGO_DEBUG=true DJANGO_DB_SSL=false
export DJANGO_SERVE_MEDIA=true DJANGO_SECURE_SSL_REDIRECT=false
python3 backend/manage.py migrate
python3 scripts/seed_local_showcase.py
python3 backend/manage.py runserver 127.0.0.1:8001
```

In another terminal:

```sh
npm --prefix app run dev -- --host 127.0.0.1
```

Open http://127.0.0.1:5173/#work. The loader requires development mode and SQLite, updates only the two named projects, and can be rerun without duplicating their images. Local database and uploaded CMS media are ignored by git. Nothing is deployed.
