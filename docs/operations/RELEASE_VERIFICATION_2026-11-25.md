# RACCN Code release verification — 2026-11-25

This record covers the initial portfolio launch and the subsequent architecture
interaction release described at the end of this document.

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

## Architecture interaction follow-up

The owner explicitly authorized production deployment of the final interactive
architecture refinement after the local review. Deployed source revision:
`ed05f5b14fe20efb79e2fbf4cc1f1ef7d9867e6f`, branch
`refinement/architecture-interaction`. Application code is unchanged from the
reviewed `8bdafe8` frontend; the additional commit hardens release packaging.
Backend source, schema, estimator semantics and the approved homepage are unchanged.

The explorer has nine meaningful product/scale configurations, specialized
queue/cache/read-model responsibilities, selectable connected layers, and finite
workflow playback with pause/resume/replay. Mobile layouts, native keyboard
controls, reduced motion and interruption cleanup are regression protected.

Pre-deployment checks passed: lint, production build, 38 frontend unit tests,
106 Django tests (one PostgreSQL-only test skipped under SQLite), migration drift,
27 browser tests and all CMS/media/contact/metadata smoke checks. An independent
browser pass exercised the three complete Scale workflows, rapid mid-flow changes,
offscreen pause/resume, live reduced-motion changes and visible keyboard focus at
320/390px. No new interaction defect was found. Only Chromium was available;
headless tab switching did not produce real hidden-tab state, so that specific
browser event was not represented as an observed verification.

One release-specific defect was reproduced: a browser holding an old entry script
could navigate to a missing lazy route chunk and produce an empty React root.
The tested packaging collector now retains only the preceding approved release's
reachable hashed JavaScript/CSS. Eleven isolated tests cover dependency traversal,
missing files, immutable-name collisions, symlinks, unsafe paths and output safety.
The actual artifacts require 13 copied chunks (399,796 bytes) and reuse six
byte-identical chunks. No old HTML, images, media, fonts, maps or private records
are copied. See the [release runbook](RELEASE_RUNBOOK.md) for the reproducible
derived-image recipe and bounded retention policy.

The readiness-gated production switch succeeded. Public HTML now references
`/assets/index-BAtIGee2.js`. Post-switch checks passed:

- All six maintained architecture browser regressions ran against production,
  including all nine configurations, playback, interruption, keyboard selection,
  mobile and reduced motion.
- A real browser tab was kept open on `/approach` with the previous entry
  `/assets/index-CH-0_JcY.js` across the switch. It navigated to Systems and the old
  architecture explorer without a reload, missing assets or JavaScript errors.
  Refreshing then loaded the new explorer. This verifies actual rollout continuity,
  not only a mocked missing-file case.
- Twelve canonical pages, twenty legacy redirects, genuine 404s, all six published
  projects and eleven public images passed the external smoke checks. Retired
  identifying-media URLs remain 404. Desktop/mobile gallery and Start paths passed.
- Protected BGM homepage, store and services each returned HTTP 200.
- Independent live visual/keyboard inspection passed at 1440px, 390px and 320px
  with normal/reduced motion. The homepage Control Plane and all six projects
  remain intact; no console errors, failed assets, overflow or write requests were
  observed.

Only compatibility JavaScript/CSS was added to the tested candidate image. Every
existing frontend file and runtime setting in that image remained byte-identical;
the final default-command smoke verified all nineteen previous reachable chunks
over HTTP with correct MIME types and SHA256 hashes, and the new HTML entrypoint.
No new inquiry or real provider notification was sent by this verification.

The final web and notification worker both run `ed05f5b`, with zero restarts during
verification and the existing bounded restart policy. Content fingerprints for all
ten projects, twenty-three images, five links and thirteen inquiries match the
pre-release snapshot; six projects remain published and the outbox is empty.
Secret key, database, provider and proxy settings are unchanged, and the one-shot
catalog flag remains absent. nginx validation passed. The twelve unrelated running
containers retained their IDs, start times and restart counts.

Fresh restricted rollback material is stored at
`/var/backups/raccn/20261125-architecture-8bdafe8`: the actual preceding running
image archive, database/media/config snapshots and compatibility-asset provenance.
Earlier backups remain retained. These are private operational artifacts, not Git
source. The earlier documented provider/Safari/backup-retention limitations still
apply; no new external delivery guarantee is implied by the release.
