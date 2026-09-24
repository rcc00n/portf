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
DJANGO_ENV=production
DJANGO_SECRET_KEY=<private stable random value, at least 50 characters>
DJANGO_ALLOWED_HOSTS=<verified domains>
DJANGO_CANONICAL_ORIGIN=https://<verified canonical host>
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
**All visitors share the nginx peer address unless the verified proxy mode below is enabled.** By default forwarded client IP headers are ignored.
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
See [the complete acceptance/retry contract](docs/hardening/CONTACT_RELIABILITY.md).

## Canonical metadata, crawlers and bundled assets

The release image must pair this backend with the matching Vite build. The frontend
build reads `backend/config/route_metadata.json`; the Dockerfile copies that same
source into the Node build stage, and the Python image already includes it. Vite
writes a marked head region. Django replaces only that region on document requests;
page rendering remains React. An old/incompatible build returns 503/noindex rather
than publishing incorrect homepage metadata on every route.

`DJANGO_CANONICAL_ORIGIN` controls absolute canonical, OpenGraph/Twitter and sitemap
URLs at runtime. Production requires an explicit value; development/test builds retain the existing `https://raccncode.com` contract. Domain ownership has not been verified. Set only the reviewed
origin (scheme + host, optional port; no path/query/fragment/credentials). Incoming
Host/X-Forwarded-Host never determines canonical URLs. The rendered head passes the
same origin to React. Staging needs separate indexing/access policy approved by the
operator; do not assume public-site robots rules protect a staging deployment.

Django owns `/robots.txt` and `/sitemap.xml`. The old static copies were removed to
prevent proxy/static hosting from serving a stale host or unpublished case entry.
Verify nginx/CDN forwards both to Django and does not cache the publication-sensitive
sitemap or Renter HTML. Indexable routes are declared in the shared contract; Renter
is included only while its approved slug is published. Demo is 200 with raw/client
`noindex, follow` and an X-Robots-Tag, excluded from the sitemap. Robots allows demo
crawling so crawlers can read noindex. Robots is not access control.

Bundled fonts/licences now live at `/fonts/`; bundled Renter source evidence at
`/evidence/renter/customer.webp` and `/evidence/renter/operator.webp`. These are static
release assets, served by the frontend asset handler with five-minute revalidation
caching, separate from protected CMS uploads under `/media/projects/`. Font/image
bytes are unchanged. Projects continue to render CMS ImageField URLs, without an
editorial fallback overriding publication. `/prototype` and all old prototype page
and asset URLs return 404/noindex; study source remains in Git but is not routed or
included as a prototype JavaScript chunk. Do not add a proxy alias that republishes
an old prototype directory from a previous release.

Before staging, verify target-image construction, proxy/CDN route precedence and
cache invalidation, reviewed canonical origin, externally reachable social preview
and font MIME types, actual published CMS metadata, and staged access/indexing rules.
No production search engine recrawl, social-provider refresh or infrastructure
configuration was verified locally. See [migration and metadata handoff](docs/hardening/ASSETS_METADATA_HARDENING.md).

## Release-hardening runtime requirements

`DJANGO_ENV` defaults to `production`. Startup fails for missing/short secret, missing PostgreSQL URL, missing/wildcard allowed hosts, missing HTTPS canonical origin, DEBUG, disabled secure cookies/redirects, absent absolute media root configuration, or an incompatible media/static URL contract. SQLite and random development keys are allowed only with explicit `development`, `test` or `build`. Never set those modes on a release runtime. Django does not load dotenv automatically. The image uses `DJANGO_ENV=build` only for collectstatic, not as a runtime ENV.

The lockfile pins all Python runtime packages, including transitive dependencies. Docker uses Node 22 and Python 3.12 slim lines; these base tags and Debian repositories still float. A local Python 3.12 image was built and tested, but no registry release image was published or attested. Freeze and verify the final release image digest in a separately approved staging pipeline. Root CI has no deployment jobs; obsolete nested Pages workflows are absent.

### Proxy trust and client address

Default: trust no proxy networks. Do not set `0.0.0.0/0` or `::/0` (startup rejects them). Gunicorn's independent forwarding/scheme-header interpretation is disabled in `backend/gunicorn.conf.py`, explicitly loaded by Procfile/Docker CMD and all smoke servers; Django validates the actual socket peer. Relying only on --chdir does not reliably load that config.

After verifying the actual network path, set `DJANGO_TRUSTED_PROXY_CIDRS` to only the nginx-to-container peer address(es)/small subnet. nginx must overwrite `X-Forwarded-Proto` from its verified transport, preserve Host, and prevent direct external access to Gunicorn. The application accepts only a single `http`/`https` value from a trusted peer. Other values are stripped. Incorrect trust configuration causes an HTTPS redirect loop; verify before admitting traffic.

For contact rate limiting, optional `DJANGO_TRUST_PROXY_CLIENT_IP=true` accepts a **single** IP in X-Forwarded-For from that trusted peer. nginx must **overwrite**, not append or relay, the incoming header. For a directly internet-facing Dokku nginx, the documented configuration uses `dokku nginx:set <app> x-forwarded-for-value '$remote_addr'`. This command was not run. Inspect generated nginx config and the installed Dokku version first. See [Dokku header configuration](https://dokku.com/docs/networking/proxies/nginx/). A CDN/load-balancer topology needs its own reviewed trusted real-IP boundary; do not copy this setting blindly behind another proxy. Lists/malformed values fall back to the socket peer. `X-Real-IP` and Forwarded are not read.

Staging must demonstrate: spoofed incoming XFF/protocol headers cannot choose the app identity; two real clients receive distinct buckets; direct Gunicorn access is blocked; socket-peer CIDRs remain stable across restarts. Until then the conservative shared-peer 60/hour limit remains and may undercount real client capacity. No production proxy was inspected.

### Health, readiness and monitoring

- `/health/`: process liveness only, no DB or Telegram dependency.
- `/ready/`: migrated database, readable/writable media directory and built index present; 200 `{ "ok": true }` or generic 503 `{ "ok": false }`, no-store/noindex. No secrets or provider details. Both endpoints are exempt from application HTTPS redirect for private health probes; Host validation still applies.
- Readiness does **not** prove that a directory is a persistent mount, storage has free capacity, backups work, PostgreSQL is replicated, or a worker is running. Operator monitoring must verify these separately. Avoid high-frequency readiness polling; the check consults the migration table.
- Watch pending/processing queue age, exhausted jobs and fixed-category application logs. Telegram availability never marks the web process unhealthy. No monitoring provider was installed.

### Browser security headers

Public CSP permits same-origin scripts/API/fonts; HTTPS CMS images and data/blob image layers; inline styles required by React/SVG motion. It forbids script eval/inline scripts, objects and framing. Optional `DJANGO_CSP_CONNECT_ORIGINS` accepts explicit HTTP(S) origins for a separately hosted API; prefer same-origin. This cannot substitute for API CORS/CSRF settings. Authenticated Django admin is excluded from the SPA CSP and retains Django CSRF/auth and frame protection; do not impose the SPA policy on admin at the proxy without separate testing.

All responses receive Permissions-Policy disabling camera/microphone/geolocation/payment. Django provides nosniff, DENY framing and strict-origin-when-cross-origin referrer policy. HSTS remains explicitly operator-controlled (`DJANGO_SECURE_HSTS_SECONDS`, default 0) until HTTPS/subdomains are verified. Do not enable includeSubDomains/preload without reviewing every affected host. The proxy/CDN must not duplicate/conflict with these headers. Review [Django deployment checks](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/) against the actual runtime.

### Backup and recovery rehearsal (not executed)

Take coordinated PostgreSQL and persistent-media backups outside the container. Include leads, idempotency and outbox delivery state; encrypt and restrict access to backups. Restore to an isolated private environment with notifications disabled before starting any worker. Verify counts, ordered project image references, publish/unpublish behavior, historical inquiries, migrations and media MIME/cache behavior. Restoring an old outbox snapshot may redeliver already-sent notifications: review delivery state before enabling the worker. Document backup retention, restore duration, acceptable data loss and an accountable operator; no values are assumed here.
