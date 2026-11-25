# RACCN Code release verification — 2026-11-25

## Scope and source

The owner explicitly authorized the production configuration update, secret-key
rotation, migrations, notification worker and deployment of Dokku `portf`. The
approved Control Plane geometry, choreography and estimator semantics are unchanged.
This release adds the six reviewed CMS projects, accessible evidence galleries,
restrained desktop contact rail and slightly tighter editorial spacing.
MilkRoute retains its stable `milk-vancouver` identity and has only a source link.

Release application revision: `7f0bff4bb0e1f1668061064717ed4752713eaa05`.
Branch: `release/portfolio-launch`; no merge into `main`.
Subsequent CI/documentation commits do not change the deployed application files.

## Public release verification

The new image passed Dokku startup readiness and public traffic switched
successfully. Independent external checks against `https://raccncode.com` passed:

- All 12 canonical routes, 20 exact legacy redirects and genuine unknown-route 404s.
- Six published projects in the approved order; original Renter ID 7 and BGM ID 5
  retained. MilkRoute has only the requested GitHub source link.
- All 11 registered public images return HTTP 200 with image MIME types and HTTPS
  URLs. Retired identifying static/uploaded URLs return 404.
- Raw titles/canonicals, robots/sitemap and optional demo noindex behavior.
- `/health/` and `/ready/` return 200; protected admin login returns 200 with secure
  CSRF cookie and no-store caching. HTTP redirects to HTTPS.
- Chromium at 1440px and 390px, each with normal and reduced motion:
  homepage/Work/Start, Control Plane repeat activation and event cleanup, all six
  projects, gallery keyboard navigation/Escape/focus/scroll return, three complete
  form-block focus states and correct rail visibility. No horizontal overflow,
  JavaScript exceptions or failed media. No inquiry was submitted by these checks.
- Protected BGM homepage, `/store/` and `/services/` still return 200. Its processes
  and configuration were outside this deployment's mutation scope.

Final maintained local suite also passed: lint, 33 frontend unit tests, production
build, 106 Django tests (one PostgreSQL-only test skipped under SQLite), migration
drift, 21 browser regressions, CMS/media smoke, contact persistence/idempotency/
worker-race smoke and metadata smoke. The PostgreSQL migration regression was run
separately against real PostgreSQL 17.5. The default-image startup test passed both
locally and against the isolated restored PostgreSQL/media environment.

## Live runtime and data preservation

- One web process and one separate notification worker run application revision
  `7f0bff4`, with no unexpected restarts during verification. Docker restart policy
  is `on-failure` with a maximum of ten retries.
- Web and worker use the same persistent PostgreSQL database. All 13 pre-release
  inquiries and their original field values are unchanged; no notification jobs
  were fabricated for historical inquiries. The verified outbox was empty.
- Production mode and `DEBUG=false` are active, the replacement stable secret key
  satisfies validation, media is mounted persistently, and the exact trusted proxy
  boundary is configured. Existing authenticated sessions were invalidated by key
  rotation; stored admin passwords were not changed.
- The worker runs `python manage.py process_inquiry_notifications`. Provider
  configuration is present and two configured recipients are enabled; this verifies
  configuration, not successful delivery to the external provider.
- The one-shot catalog import flag was removed without restarting the application.
  Later routine releases run migrations only and preserve subsequent CMS edits.
- nginx configuration validation passed and nginx remains active.

## Rehearsal and release defects caught

The private PostgreSQL dump and persistent media backup were restored in isolation.
Historical inquiries were compared using content fingerprints without printing
personal data. Release catalog import was tested twice to verify idempotency and
preservation of the existing Renter and BGM record identities.

Three actual release defects were fixed and regression protected:

1. PostgreSQL 17 rejected duplicate slug LIKE-index creation in the transitional
   migration. The temporary nullable field now has `db_index=False`; the final
   unique identity schema is unchanged. CI includes a populated legacy migration
   test on PostgreSQL 17.5.
2. Installed Dokku 0.34.7 requires a healthcheck command argument array. `app.json`
   now uses `["python", "deployment_ready.py"]`.
3. Dokku expanded the shell-based port expression before runtime configuration was
   available. Gunicorn now starts directly, resolving `PORT` inside its Python
   configuration. The actual image default command was tested on port 8321 against
   the isolated PostgreSQL/media copy with production settings and provider access
   disabled. `/ready/` passed, port 8321 listened and port 8000 did not.

Readiness prevented unsuccessful candidate containers from receiving public
traffic. Release-phase database migrations/imports had already completed; they
were not rolled back or replayed destructively.

## Privacy and Git history

The current public build no longer contains the retired identifying project-image
collection. Registered Renter evidence uses explicitly labelled redactions; old
unregistered uploaded URLs and retired static paths return 404. Private originals
and rollback material remain outside Git under restricted access.

All five writable GitHub branch histories were rewritten only to remove the ten
reviewed identifying image blobs, including compressed duplicates in a historical
nested Git backup. Existing commit authors, dates and messages were preserved;
no contribution activity was fabricated. Main branch protection was restored.
All local branch tips were aligned with the rewritten history to prevent accidental
reintroduction. Old clones must not merge or push the removed history back.

The obsolete GitHub Pages site was disabled and its previously exposed image URLs
were verified to return 404 after CDN expiry. `portf` remains public as requested.

**Provider follow-up remains:** a closed/merged pull request retains an old
read-only GitHub ref and cached image. Normal branch rewriting cannot remove that
provider-owned ref. A private, unsent GitHub Support draft was prepared for the
owner. Do not claim the cached pull request, third-party clones or all historical
downloads have been erased.

The original GreenContract repository is private. The approved neutral
[`contract-workflow`](https://github.com/rcc00n/contract-workflow) repository is
public with sanitized reachable history. Its application was not deployed by this
release. Targeted sanitization tests pass; three inherited OCR test failures remain
documented in that separate repository.

## Rollback material

Restricted host backup directory: `/var/backups/raccn/20261125-prelaunch`.
It contains the private runtime snapshot, PostgreSQL dump, media archive, checksums
and a verified compressed copy of the original running image. The image archive
survives scheduled Docker pruning; a tag alone would not guarantee that.

Use the [release runbook](RELEASE_RUNBOOK.md). Preserve any inquiries accepted after
the snapshot; never restore the old database blindly. The legacy image's media
behavior also depends on its historical runtime settings, so image rollback alone
is not an adequate configuration rollback.

## Verification limits

- No synthetic inquiry or real Telegram message was sent to production recipients.
  Provider delivery is covered by isolated/mocked regressions, not claimed as a live
  delivery check.
- Browser evidence uses Chromium. Real Safari/iOS behavior is not certified.
- Legal copy, ownership/permission for public evidence and remaining factual claims
  remain owner responsibilities; this technical release is not legal verification.
- Long-term alerting, off-host backup retention and a future full disaster-recovery
  exercise are not established by this single-host restore rehearsal.
- Host reboot and recovery after exhausting the container restart limit were not
  rehearsed on the shared production host.

See [portfolio decisions](PORTFOLIO_RELEASE.md) for publication and media provenance.
