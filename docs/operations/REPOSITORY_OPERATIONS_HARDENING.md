# Repository / operations hardening handoff

Date: 2026-09-24. **No staging/production deployment. No merge into main.**

## Git and scope

- Branch: `hardening/repository-operations`.
- Origin: `git@github.com:rcc00n/portf.git`.
- [GitHub branch](https://github.com/rcc00n/portf/tree/hardening/repository-operations).
- Starting commit: `e1945b6ffb76ad788d9fbcf7e3452c3da0e12163`.
- Consolidation: `9611a2b7863f83519dc666d7e514375051ec0ae8`.
- Verified cleanup: `7fbee7a1618ab4527702708a433af74c9f5aa8a0`.
- Dependency pins: `e02a67b5c7a1623577a7346ea663e3278f096562`.
- Runtime/CI: `3897151c0ca2c5628b1b1d408f4e235f8be42f03`.
- This report/evidence forms the final logical commit. Its exact SHA and remote equality are reported after the push; obtain it with `git rev-parse HEAD` on this branch.

The approved homepage, Control Plane code/choreography, CMS schema, estimator arithmetic and inquiry acceptance/outbox model were not redesigned. No Django migrations were needed.

## Repository completeness

All 15 previously untracked Markdown records and 13 historical QA helpers are preserved under docs. Three existing hardening handoffs moved into docs/hardening. Current README/DOKKU explain the application rather than prototype history. Historical documents have explicit status banners. No nested Pages workflow remains; root CI is authoritative.

The accidentally tracked nested app/.git.bak (106 files, ~21.3 MB) was removed from tracking, preserved locally and excluded from Docker. No history rewrite. Generated screenshot/video/JSON directories remain ignored. Only two compact audit-evidence JSON summaries are committed. Font licenses remain beside production fonts. See [inventory](REPOSITORY_INVENTORY.md).

Final sensitive-pattern scan of tracked text found only the intentional credential-URL rejection fixture in backend/config/test_metadata.py. No tracked databases or real environment files; .env.example files contain safe templates. Earlier nested Git-object scan found no token/private-key pattern. Values were not printed. These scans are not an exhaustive historical secret certification.

Intentionally ignored: app/node_modules, app/dist, Python caches, backend/db.sqlite3, local audit/homepage-review/prototype-review artifacts, app/.git.bak; media/static build directories and real environment files are excluded by policy. No meaningful source/test/config/docs should remain untracked after the report commit.

## Dependency and production contract

[Dependency decisions and support sources](DEPENDENCIES.md) list every exact version/advisory disposition. Django 5.2.17 LTS, Pillow 12.3.0, Gunicorn 26.2.0, WhiteNoise 6.12.0, cors-headers 4.9.0, dj-database-url 3.1.2; React/DOM 19.3.0, Router 7.18.4, Vite 7.3.6, ESLint 10.11.0. All backend runtime packages and frontend direct versions are pinned; npm lock includes transitive integrity. Removed framer-motion/lucide-react after zero-live-import proof. Final npm audit and pip-audit: zero known advisories, no suppression/accepted advisory.

Production is the default environment and refuses a missing/weak private secret, missing PostgreSQL DB, wildcard/missing hosts, DEBUG, missing HTTPS canonical origin, insecure cookies/redirect settings or missing explicit media contract. Development/test/build are explicit modes. Build-only settings do not leak into runtime ENV. No real infrastructure values invented.

Dokku model: nginx → Gunicorn web → PostgreSQL + persistent registered-image storage; one separate durable notification worker → PostgreSQL outbox/Telegram. Same DB/settings across processes; private token only required for worker. Existing bounded retries/admin retry and lease recovery retained. [DOKKU.md](../../DOKKU.md) covers scale, graceful restart, mount, migrations, collectstatic, backups and restore rehearsal.

/health/ remains process-only. /ready/ checks DB/migration state, media directory permissions and built index; generic 503 on failure, no-store/noindex, no Telegram call. Readiness does not establish persistence, capacity, backup quality or worker queue health.

Public CSP and Permissions-Policy added; nosniff, DENY and referrer policy explicit. Inline styles and data/blob images remain for approved React/SVG motion. No inline/eval scripts. Admin stays outside SPA CSP with existing auth/CSRF/frame protection. HSTS remains 0 pending verified TLS scope; deployment check passes with exactly that documented W004 warning, no suppressed errors.

Proxy/IP default remains conservative. Only explicit trusted CIDRs can supply protocol; opt-in client-IP mode requires nginx to overwrite XFF with one verified IP. Chained/malformed/untrusted values fall back to peer. Real HTTP regression found and fixed Gunicorn's independent default protocol trust; all web launchers now explicitly load config with independent scheme-header interpretation disabled. Staging must verify distinct real-client rate buckets and header sanitization; no claim about current Dokku topology.

## Cleanup and measurements

[Exact cleanup inventory](LEGACY_CLEANUP.md): 17 obsolete files deleted, five historical prototype/Renter files relocated outside the build. Preserved all live architectureData/estimateData/productionReadyData/demoData. Removed only named dead background selectors/keyframes. Old project PNGs remain **PENDING PRODUCTION DATA VERIFICATION**. No persistent uploads, projects, leads, model capabilities or migrations deleted.

| Measurement | Before | After |
| --- | ---: | ---: |
| app/src files | 61 | 40 |
| app/src JS/JSX/CSS lines | 14,504 | 7,412 |
| app/src bytes (including assets) | 12,454,544 | 303,907 |
| Public asset bytes | 10,041,231 | 10,039,734 |
| Total emitted JS bytes (all chunks) | 338,565 | 389,085 |
| Total emitted CSS bytes | 172,959 | 126,921 |
| Lockfile packages (all platforms) | 257 | 243 |
| Unreachable app/src files | 21 | 0 |
| Direct frontend dependencies (runtime) | 5 | 3 |
| Docker context, decimal MB | 44.56 | 10.95 |

Context baseline is a Git archive of the starting tracked application with its original dockerignore; after is the actual current working-tree Docker build. It is a context transfer measurement, not image size. Source line count excludes historical docs. All public project PNGs are retained, hence the small public-byte reduction. JS grew by 50,520 bytes due to supported React/Router upgrades; CSS shrank 46,038 bytes. This phase prioritizes maintained dependencies and source clarity, not artificially smaller numbers.

## Verification

- Frontend lint, 33 Node tests (including 81 valid estimator combinations and corrected SaaS/unknown intent), production build: PASS.
- Django: 89 tests PASS locally on Python 3.10 and inside the final Python 3.12 image with networking disabled. Migration drift: none.
- Browser: 5 definition + 7 contact tests PASS; success/failure/timeout/retry identity/text preservation/full-field mobile focus retained.
- CMS/media smoke: 12 canonical routes, publishing/unpublishing, ordering/media changes, empty/error distinction, case 404, MIME/cache, desktop/mobile, keyboard/reduced-motion and full topology event under enforced CSP: PASS. Added real forwarded-protocol spoof test: PASS.
- Inquiry smoke: real acceptance, lost-response retry, restart recovery, two-worker race, durable unsent outbox, no external delivery: PASS.
- Metadata smoke: raw/client parity, origin, publication-sensitive sitemap, robots/demo/404/prototype policy, exact asset bytes: PASS. Backend tests cover all 20 redirects and real 404s.
- Ten before/after first-viewport screenshot pairs across Home/Work/Renter/Systems/Start, desktop/mobile reduced motion: identical pixels. Inspected comparison visually; screenshots remain local /tmp artifacts.
- Local Docker image built successfully using Node 22 / Python 3.12; collectstatic and image prerequisites PASS. The installed builder lacks buildx, so local verification used Docker's legacy builder. CI uses its hosted Docker builder; GitHub execution is separate from these local results.
- One intermediate browser route-wait timeout did not reproduce in the subsequent complete serial run; diagnostic route/page/CSP details were added. Final complete maintained runner passed. No flaky test was disabled or timeout increased.
- Django check --deploy with generated test-only settings: no errors; documented HSTS W004 only.

Root CI now includes local image build/prerequisite verification, no registry push/deployment. `python scripts/check_release.py` reproduces the maintained local suite. All notification calls are mocked or disabled; no real inquiry/Telegram message sent. Compact [measurement evidence](../audit-evidence/repository-hardening.json) and [advisory dispositions](../audit-evidence/dependency-disposition.json) are committed.

## OWNER INPUT REQUIRED

1. Confirm final canonical domain/allowed hosts and public legal identity/contact details; privacy/terms accuracy, processor disclosures and retention policy still need owner/legal signoff.
2. Confirm factual project identities/copy/status/links/media rights and which production records reference retained legacy PNGs. Do not delete them until inspected.
3. Assign the operational owner for DB/media backups, restore objectives, notification recipients/failed-job monitoring and HSTS scope. No response-time guarantee is introduced.

## NOT VERIFIED — staging/infrastructure gates

- Actual Dokku version, process/Procfile recognition, configured scales/restarts and worker delivery; Telegram provider/token/recipient correctness.
- PostgreSQL attachment/TLS/access, forward migration against a production copy, persistent media mount/UID/permissions/capacity across restart, coordinated restore rehearsal.
- Actual proxy/CDN topology, sanitized headers and narrow peer CIDRs, distinct client-IP buckets, blocked direct Gunicorn access, admin HTTPS/CSRF/upload behavior, proxy limits/caches.
- Real DNS/TLS/canonical host, HSTS/subdomain/preload suitability, staging access/noindex policy, public social-preview behavior and external services.
- A published/attested release-image digest and OS/base-image advisory review. Base tags/apt repositories remain floating; the locally built image is not an approved production artifact.
- GitHub-hosted CI execution (local equivalents passed); load/capacity, external monitoring/alerts and a production restore test.

**Stop for review. No staging/production deployment or main merge has occurred.**
