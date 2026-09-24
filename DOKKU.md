# Django + Vite on Dokku: application and uploaded media

No deployment was performed in the CMS/media hardening phase. Review this contract
before applying it to staging. The actual Dokku version, domain, proxy and volume
permissions still require operator verification.

## Runtime contract

The Dockerfile builds Vite into `/srv/app/frontend_dist` and runs Django through
Gunicorn on `PORT` (default 8000). Dokku's nginx proxies requests to Gunicorn.

- `/assets/`, shipped fonts/images and the HTML shell come from the frontend build.
- `/static/` is collected Django/admin static content, served by WhiteNoise.
- `/media/projects/...` is uploaded ProjectImage content on the persistent mount.
  It is served by `projects.media.project_media`, independent of DEBUG. Only a
  registered, published project's supported raster image is publicly readable.
  Authorized staff can preview unpublished images with private/no-store caching.
- Do **not** add an nginx public `/media/` alias: it would bypass publication and
  staff-preview checks. Inspect existing custom nginx snippets for such aliases.
- WhiteNoise must not serve uploads. Its documentation explicitly separates
  [user-uploaded media](https://whitenoise.readthedocs.io/en/stable/django.html#serving-media-files).

This deliberately keeps the existing single-container architecture. Django uses
[FileResponse](https://docs.djangoproject.com/en/5.2/ref/request-response/#fileresponse-objects)
for streaming; it does not load whole files into response memory. It is appropriate
for this staff-managed project-image catalog. It uses Gunicorn capacity while
serving files; production traffic/load and worker sizing have not been verified.
A future internal nginx offload or object store must preserve the authorization
contract and have its own integration tests; neither is configured here.

## Environment

Set secret values outside Git and Docker build arguments. Review actual values in
Dokku without printing them into audit logs.

```text
DJANGO_SECRET_KEY=<secret>
DJANGO_ALLOWED_HOSTS=<verified domains>
DJANGO_DEBUG=false
DJANGO_SERVE_MEDIA=true
DJANGO_MEDIA_ROOT=/srv/app/media
DJANGO_MEDIA_URL=/media/
DJANGO_SECURE_SSL_REDIRECT=true
DJANGO_SESSION_COOKIE_SECURE=true
DJANGO_CSRF_COOKIE_SECURE=true
DJANGO_CSRF_TRUSTED_ORIGINS=https://<verified domain>
DATABASE_URL=<managed PostgreSQL connection>
DJANGO_DB_SSL=<actual database TLS requirement>
```

`DJANGO_SERVE_MEDIA` is the environment variable; it sets Django's `SERVE_MEDIA`.
Local serving requires `/media/`, FileSystemStorage and separate media/static/build
roots. Django system checks reject incompatible configurations. The proxy must
set trustworthy forwarded protocol headers, preserve the verified Host and avoid
cached project API responses; the API emits `Cache-Control: no-store`.

## Frontend build arguments

The Dockerfile retains `VITE_BASE=/` and optional `VITE_API_BASE`. Prefer an empty
API base for this same-origin deployment. If using a separate API hostname, it must
read the same authoritative database as the Django frontend case-route gate; verify
CORS, allowed hosts and generated HTTPS media URLs. Do not point the frontend at an
unrelated catalog. Supply build arguments explicitly rather than copying `.env` files
into the image.

## Persistent mount

The required host-to-container mapping remains:

```text
/var/lib/dokku/data/storage/portf-media -> /srv/app/media
```

The app's `MEDIA_ROOT` must match the container side, **not** the host path. Create
and mount persistent storage with syntax supported by the installed Dokku version.
For versions supporting the repository's existing legacy form:

```sh
dokku storage:ensure-directory /var/lib/dokku/data/storage/portf-media
dokku storage:mount portf /var/lib/dokku/data/storage/portf-media:/srv/app/media
```

Newer versions support named storage (`storage:create`, then `storage:mount` with
`--container-dir`). Consult the installed `dokku storage:help` and the official
[persistent storage documentation](https://dokku.com/docs/advanced-usage/persistent-storage/)
before changing an existing mount. Do not replace or unmount a populated volume.
Mount changes require a restart through the operator's reviewed staging procedure.
Verify the runtime UID/GID can read/write the mount; do not make it world writable.

The runtime database and every web process must refer to the same persistent media
content. Horizontal/multi-host storage and backup/restore are NOT VERIFIED.
Back up PostgreSQL and the media directory together; restoring only one can leave
broken image references. Existing unreferenced files are not deleted by this change.

## Image response contract

- Public raster images: HTTP 200, detected image MIME, Content-Length, ETag,
  Last-Modified, `X-Content-Type-Options: nosniff`.
- Public cache: `public, max-age=0, must-revalidate`; unchanged conditional GET is
  304, after the publication check. Unpublishing prevents subsequent reads/304s.
- Staff previews: `private, no-store`. Missing/blocked images: 404, `no-store`.
- No directory listing, arbitrary file serving, SVG/HTML delivery, unregistered
  files or symlink escape from MEDIA_ROOT. Supported formats: JPEG, PNG, WebP,
  GIF and AVIF when supported by the installed Pillow build.
- Changing an upload normally creates a new storage filename; frontend always uses
  the current ordered API media URL, never a hardcoded fallback image.

## Verification and staging handoff

Local maintained command (temporary database/media, Gunicorn, DEBUG=false):

```sh
npm --prefix app run build
python3 scripts/cms_media_smoke.py
```

Install `backend/requirements.txt`, `app/tests/requirements.txt` and Playwright's
Chromium first. The test creates fixtures, changes order/media/publication, checks
HTTP and browser behavior, then removes the temporary data and server.

After owner review, a staging operator still needs to verify:

1. Backups and forward migration on a copy of the actual PostgreSQL dataset.
2. Assign reviewed project slugs/placements; no automatic title-to-Renter mapping.
3. Admin image upload over HTTPS, persistence across container restart, public URL,
   MIME/cache/conditional GET, and staff-only access after unpublishing.
4. No nginx alias/cache intercepts `/media/` or `/api/projects/`; Host and protocol
   are correct. Admin CSRF/login and the body upload limit work through the proxy.
5. A new container/image uses the same media mount and correct file ownership.
6. Database/media restore rehearsal and worker/load suitability.

No production push, migration, storage change or record edit is authorized by this
document. Stop for the phase review before staging or production actions.

## Inquiry notification worker (contact reliability phase)

The root `Procfile` is copied to the final Docker image's `/srv/app/Procfile`.
It defines `web` (the existing Gunicorn server) and `worker`
(`python manage.py process_inquiry_notifications`). Procfile commands take
precedence over Docker CMD when supported by the installed Dokku builder.
Process scale/restart is managed separately. See
[Dokku process management](https://dokku.com/docs/processes/process-management/).

No worker has been started on staging or production by this change. After explicit
release review, the operator should apply the migration **before** new web/worker
code runs, confirm the image's Procfile is recognized, and configure **one** worker.
Example commands for that later approved operation, not commands run in this phase:

```sh
dokku run portf python manage.py migrate --noinput
dokku ps:scale portf web=1 worker=1
dokku ps:restart portf worker
```

Keep the app's existing web scale if it differs from the example. Verify the installed
Dokku restart policy and that worker processes recover after host/container restart.
The worker exits on a database error so its supervisor can restart it; it handles
SIGTERM/SIGINT, stops taking new jobs, and finishes the current bounded delivery round.
A killed process leaves a 60-second recoverable lease. Give shutdown enough grace
for the actual configured recipient count (10-second transport timeout per recipient).
No release hook, automatic deployment, or automatic worker scaling was added.

Web and worker need the **same database**, a stable `DJANGO_SECRET_KEY`, and matching
Django settings. Only worker needs `TELEGRAM_BOT_TOKEN`; keep it outside Git and logs.
Add reviewed active `TelegramRecipient` records through authenticated Django admin.
The worker polls every 2 seconds, cleans expired throttle buckets, and processes one
job at a time. `--once` drains currently due jobs and exits; it does not wait for future
backoff times. Do not run this command against real data during automated tests.

`INQUIRY_RATE_LIMIT` defaults to 60 new valid submissions per socket peer per UTC hour.
**All visitors may share the nginx peer address.** Forwarded IP headers are ignored.
Verify the actual REMOTE_ADDR distribution before staging; size this shared budget
for expected traffic. Apply per-client nginx limits only at a proxy that sanitizes
client identity. Do not “fix” this by trusting arbitrary X-Forwarded-For.
`INQUIRY_ALLOWED_ORIGINS` optionally contains comma-separated exact verified browser
origins. Missing Origin is allowed; origin checks and CORS are not authentication.
Prefer same-origin requests; configured CORS permits `Idempotency-Key` for a reviewed
separate frontend. Add a contact-location proxy request body cap (at least 32 KiB),
header limits and timeouts without reducing the separate admin media upload allowance.
The application enforces its own 32 KiB JSON body cap.

In admin, inspect Contact requests → Notification, or Inquiry notifications filtered
by pending/processing/failed. Final delivery failures emit a safe job/lead ID log
message; tokens and raw Telegram errors are not logged. Staff can select failed jobs
and use **Retry failed notifications** after fixing configuration. Already delivered
recipients are preserved. Do not delete/recreate a lead to retry delivery.
Monitor old pending jobs as well as failures: an absent worker creates no attempt/error
until it runs. `/health/` remains independent of Telegram and does not prove queue health.
Queue age alerts, log routing, database backups and restore rehearsals remain operator
checks. Backups must include inquiries, notification state, and idempotency keys.
See [the complete acceptance/retry contract](CONTACT_RELIABILITY.md).
