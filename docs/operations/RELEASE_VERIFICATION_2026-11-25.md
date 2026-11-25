# RACCN Code release verification — 2026-11-25

This record covers the initial portfolio launch and the subsequent architecture,
navigation and pricing releases described at the end of this document.

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

## Page navigation positioning

Source revision `7a9ddd464cd419c921cc29d5cdf38256c4890e00`, branch
`fix/page-navigation-scroll`, fixes a reproduced navigation defect: selecting the
header brand from `/systems/architecture` at `scrollY=1100` left the homepage at
the same scroll position. The reset previously lived only in the secondary shell.

A shared positioning wrapper now runs when each destination's lazy page has
actually committed, including the homepage. Non-anchor navigation starts at zero,
including Back/Forward. Existing section/hash navigation remains unchanged. One
next-frame correction handles outgoing cleanup and is cancelled if another
navigation starts. There are no continuous scroll handlers or local UI-state resets.

Six maintained browser regressions cover the original failure, desktop/mobile
cross-page links, cached history, genuinely delayed lazy loading, delayed CMS
anchors, homepage section history and navigation while a gallery is open. All pass
in the complete release suite alongside 33 total browser tests, 38 frontend unit
tests, 106 Django tests (one PostgreSQL-only skip), 11 compatibility tests, lint,
build, migration drift and CMS/media/contact/metadata smoke checks.

The readiness-gated production release succeeded with entry
`/assets/index-CnViFC4U.js`. All six navigation regressions passed against the live
site, as did the twelve-route/twenty-redirect/eleven-image public smoke. A tab held
open across deployment retained working navigation; after refresh its mid-page
Systems-to-home transition ended at exactly `scrollY=0`, with no script errors or
failed assets. Existing tabs need one refresh to receive the new navigation code.

Web and worker run `7a9ddd4` with zero restarts. Original CMS and inquiry content
fingerprints are unchanged; the outbox is empty. Configuration is identical except
expected Dokku revision metadata, with the catalog-import flag still absent. All
twenty prior reachable code chunks pass public MIME/hash checks, and the twelve
unrelated containers are unchanged. Private rollback checksums were verified under
`/var/backups/raccn/20261125-scroll-navigation`. No test inquiry or provider message
was sent; the established verification limits above still apply.

## Canonical domain and estimator pricing refinement

The owner confirmed `https://raccncode.com/` as production and requested slightly
lower configurator prices. Application revision
`a3894a0e58c6376f54df1f0533266f066a72e30b`, branch `refinement/estimate-pricing`,
changes only the five indicative budget bands, approximately 10% lower with
whole-thousand rounding:

| Previous | Current |
| --- | --- |
| $12k–$20k | $11k–$18k |
| $20k–$35k | $18k–$32k |
| $35k–$50k | $32k–$45k |
| $50k–$75k | $45k–$68k |
| $75k–$120k | $68k–$108k |

Scoring, bucket thresholds, timelines, scope, notes, SaaS and unknown-project
semantics are unchanged. The frozen 81-case fixture is retained; regression tests
explicitly apply the new price mapping and compare all other output unchanged.
Saved definitions recalculate against the current bands. An illustrative estimate
still does not become the visitor's selected product or optional inquiry metadata.

The exact apex already served the approved redesign. Its www alias now returns
308 directly to the HTTPS apex, preserving path, query and method through the
reviewed persistent nginx include. Both domain certificates remain in use. The
old GitHub Pages address returns 404, the retired design subdomain returns 410,
and prototype page URLs return 404. No application, database or historical source
was deleted to change public routing.

The full release suite passed: frontend lint/unit/build, 106 Django tests (one
PostgreSQL-only skip), migration drift, 34 browser regressions, 11 compatibility
packaging tests, and CMS/media/contact/metadata smokes. No real inquiry or external
provider notification was sent by these checks.

The readiness-gated release now serves `/assets/index-Cu1AKQAi.js` at the exact
public apex. All twelve canonical pages, twenty legacy redirects, eleven published
images and six CMS projects passed the public smoke, including desktop/mobile
gallery and Start navigation. A tab kept open on the preceding `CnViFC4U` entry
navigated successfully across the switch and received the new entry after refresh;
its cross-page scroll reset remained zero, with no script errors or failed assets.
Only the immediately preceding reachable JS/CSS graph is retained for existing
tabs: thirteen copied files (422,706 bytes), seven reused byte-identical files,
all twenty verified over HTTP with correct MIME types and SHA256 hashes. This does
not expose the old website's HTML, media or prototype presentation.

Independent production browser verification confirmed the revised SaaS Lean,
unknown Balanced and restored advanced Marketplace prices, unchanged timelines,
summary/share behavior and optional inquiry identity. Desktop and 390px mobile
reduced-motion views passed without JavaScript errors or submissions.

Web and worker run `a3894a0` with zero restarts. Original CMS/media/link/inquiry
fingerprints are unchanged: ten projects, twenty-three images, five links and
thirteen inquiries; six projects are published and the outbox is empty. Runtime
settings are unchanged except the expected Git revision, and the one-shot catalog
flag remains absent. All twelve unrelated containers are unchanged; protected BGM
homepage/store/services return 200. nginx validation passed, and the canonical
redirect remains active after the Dokku release.

Restricted rollback material is verified under
`/var/backups/raccn/20261125-estimate-pricing`: the preceding running `7a9ddd4`
image archive, database/media/configuration and pre-redirect nginx snapshots.
Temporary rehearsal containers were removed. The earlier documented provider,
Safari, external-cache and backup-retention limitations remain unchanged.

## Employer-audit follow-up: pricing and CI runner

The owner requested a further modest configurator reduction during an employer-facing
GitHub/site audit. Revision `39f477b0d40d725f2769e25da6ba17366ca53732`, branch
`refinement/employer-audit`, changes only the five public budget bands to
`$10k-$16k`, `$16k-$29k`, `$29k-$41k`, `$41k-$61k`, `$61k-$97k`. The original
81-case fixture remains intact; scoring, timelines, notes, scope, SaaS and unknown
intent are unchanged and regression protected.

The audit also identified why recent hosted frontend CI jobs failed before browser
tests could start: `ubuntu-latest` resolved to Ubuntu 26.04, unsupported by the
pinned Playwright 1.55. Frontend CI now explicitly uses Ubuntu 24.04. The exact
candidate passed all four jobs in [GitHub run 45682972736](https://github.com/rcc00n/portf/actions/runs/45682972736),
including browser/smoke checks, backend, PostgreSQL migration and Docker image.
The full isolated local release suite also passed. No test was disabled to obtain
this result, and the production runtime/dependency configuration was unchanged.

The readiness-gated release serves `/assets/index-CKa3oAPA.js`. Public checks pass
for twelve canonical routes, twenty legacy redirects, eleven images, six CMS
projects and desktop/mobile gallery/Start flows. Live SaaS, unknown and restored
Marketplace estimates show the new bands; reload/share/optional inquiry identity
remain correct, with no writes or JavaScript errors.

Web and worker run `39f477b` with zero restarts. Original CMS and inquiry fingerprints
are unchanged, six projects remain public, and the outbox is empty. Runtime settings
differ only by expected revision metadata; the import flag remains absent. The www
308, nginx validation, all twenty prior reachable code chunks, twelve protected
containers and BGM homepage/store/services checks pass. Only twelve missing prior
JS/CSS files (417,153 bytes) were copied, with eight identical files reused.

Private rollback snapshots/checksums are verified at
`/var/backups/raccn/20261125-employer-pricing`. The employer audit itself is a private
review artifact, not application source: it includes private-repository inventory
and sensitive finding locations without secret values. No other repository,
profile pin, visibility setting or main branch was changed by this release.


## Employer evidence and confirmed privacy handling

Application revision `a424cb4b7adc7634db0b88410d438108beba613b` is deployed to
`https://raccncode.com/`, with entry `/assets/index-F0n6KJJu.js`.
[PR #2](https://github.com/rcc00n/portf/pull/2) reconciles the approved release
history and the public default branch without rewriting existing commits.

The owner requested another reduction: the five indicative bands are now
`$8k–$13k`, `$13k–$23k`, `$23k–$33k`, `$33k–$49k`, `$49k–$78k`. The frozen
81-case baseline remains unchanged; only the explicit budget mapping differs.
Scores, thresholds, timelines, SaaS and unknown intent are preserved.

The demonstrated demo-dialog background scroll defect is fixed using the existing
gallery's shared scroll lock/restore behavior. Source-only Work links identify
their actual destination. Approach introduces the engineer with GitHub/PDF links;
Start includes an engineering-role email path. Decisions links a real BGM
implementation/test case instead of repeating a generic principle. Approved
homepage geometry, typography, motion and CMS content are unchanged.

The owner confirmed personal operation by Vadim Rudenko and manual removal of
closed inquiries 12 months after their last communication. Public legal copy now
reflects this and the verified data path/logging configuration. The operational
[retention procedure](PRIVACY_HANDLING.md) covers database, notifications, email,
backups and restoration. No automatic purge, historical inquiry deletion, provider
location guarantee, client-rights certification or legal-compliance claim is made.

### Verification

- Complete isolated local suite: 40 frontend tests, 37 browser regressions,
  106 Django tests (one PostgreSQL-only test skipped under SQLite), 11 compatibility
  tests, lint/build, migration drift and CMS/media/contact/metadata smoke checks.
- All four hosted jobs passed at source revision `81bfee0` in
  [run 45694016132](https://github.com/rcc00n/portf/actions/runs/45694016132), including
  real PostgreSQL migration and Docker image checks. The merge revision has the
  same Git tree. Independent source review and desktop/mobile visual checks passed.
- Production-mode rehearsal restored isolated PostgreSQL/media with external
  networking disabled. Running release twice preserved original records. The
  default command on a non-default port passed readiness and real HTTP/media tests.
- Live smoke: twelve canonical pages, twenty legacy redirects, eleven images,
  six projects, genuine 404s and health/readiness passed. Live SaaS, unknown and
  restored estimates show the new bands; summary/reload/selected identity remain
  correct. Three employer browser regressions passed against the live site.
- A tab held open across deployment retained navigation and loaded the new entry
  after refresh; cross-page scroll ended at zero. All twenty preceding reachable
  JS/CSS chunks passed MIME/hash checks: twelve copied files (417,152 bytes), eight
  identical files reused. No preceding HTML/media/prototype page was republished.
- Original content fingerprints remain equal for ten projects, twenty-three
  images, five links and thirteen inquiries. Six projects are public; outbox empty.
  No test inquiry or real provider notification was sent.
- Web and worker share revision `a424cb4`, zero restarts during inspection. Settings
  differ only by expected Git revision; the one-shot catalog flag remains absent.
  All twelve unrelated containers retain IDs/start times/restart counts. BGM
  homepage/store/services return 200. www preserves path/query through its 308;
  retired design host returns 410 and old GitHub Pages returns 404.

Fresh restricted rollback material and checksums are verified under
`/var/backups/raccn/20261125-employer-readiness`. Temporary restored data, rehearsal
containers and secret files were removed. Provider delivery, Safari/VoiceOver,
provider-region/backup-expiry facts and final rights/legal review remain outside
this verification. Detailed cross-repository audit artifacts remain private and
are not copied into application source.
