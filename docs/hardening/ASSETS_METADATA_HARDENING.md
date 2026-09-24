> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# Prototype assets and route metadata — review handoff

Branch: `hardening/assets-route-metadata`, based on approved contact reliability
commit `7a72866b357e50704da13e1d7c4c0927c3337d06`. Phase commit is this branch's HEAD.
No deployment or production data changes. Contact semantics, project schema and
publication authority, estimator arithmetic, Control Plane choreography and page
composition are unchanged.

## Inventory and disposition

The baseline search found 28 tracked matching lines across the following 11 files.
References sharing a source line are listed together. Generated output, local review
artifacts and non-URL uses of the word “prototype” were separately inspected.

| Source at baseline | Matching lines | Classification | Disposition |
|---|---:|---|---|
| `app/index.html` | 3 | LIVE PRODUCTION DEPENDENCY | Three font preloads moved to `/fonts/`; generated head now chooses used weights by route |
| `app/src/home/home.css` | 3 | LIVE PRODUCTION DEPENDENCY | Same three font faces, new URLs only |
| `app/src/site/site.css` | 2 | LIVE PRODUCTION DEPENDENCY | Instrument Sans and Mono 400 moved |
| `app/src/pages/legal/legal.css` | 2 | LIVE PRODUCTION DEPENDENCY | Same two font faces moved |
| `backend/config/views.py` | 2 | LIVE PRODUCTION DEPENDENCY (asset allowlist); PROTOTYPE PAGE ONLY (route entries) | Stable asset prefixes; prototype route entries removed |
| `app/src/main.jsx` | 2 | PROTOTYPE PAGE ONLY | Lazy import and public route removed |
| `app/src/prototype/TracePrototype.jsx` | 4 | PROTOTYPE PAGE ONLY | Study links retained in archived/unmounted source; two evidence URLs updated |
| `app/src/prototype/trace-prototype.css` | 3 | PROTOTYPE PAGE ONLY | Fonts updated; source retained, excluded from production graph |
| `app/public/robots.txt` | 1 | LIVE production policy, obsolete after migration | Static file replaced by Django endpoint; prototype disallow removed |
| `backend/config/tests.py` | 3 | LIVE regression coverage of production assets/routes | Font fixtures updated; negative prototype route cases retained |
| `scripts/cms_media_smoke.py` | 3 | LIVE regression fixture dependency | Renter fixture imports/replacement now use stable evidence files |

At this checkpoint, live Work/Renter imagery already came from the authoritative
CMS API, not hardcoded prototype URLs. The bundled Renter images were still the
source for public prototype studies and isolated CMS test fixtures. They were moved
without introducing any new publishing fallback. Real uploaded ProjectImage paths
and records were not moved or rewritten.

**DEAD after exclusion:** the main-router prototype import/route, server prototype
route allowlist and prototype static prefixes, stale static robots/sitemap copies,
and emitted prototype JS/CSS chunks. Obsolete publishing exposure was removed.
No historical study module was deleted: all four files under `app/src/prototype/`
remain in Git as **HISTORICAL / ARCHIVE**, with updated shared asset references.
They are neither linked from live navigation nor compiled into the production entry.
Non-URL words such as “prototypes” in old presentation/legal prose are not asset or
routing dependencies and were not rewritten as a legal/content change.

Baseline built references were in `dist/index.html`, `dist/robots.txt`, and generated
`home-*.css`, `SiteShell-*.css`, `LegalPages-*.css`, `TracePrototype-*.css`,
`TracePrototype-*.js`, and `index-*.js`. Final dist contains no `/prototype/` strings
in HTML/JS/CSS/JSON/XML/text, no prototype directory and no prototype study chunks.
The new asset checksum manifest intentionally records old paths as historical data.
Negative route tests and this handoff also intentionally name retired URLs.

Existing local historical references were left outside the commit:

- `COMPLETENESS_MIGRATION_AUDIT.md`, `PRIVACY_AUDIT.md`, `PROTOTYPE_REVIEW.md`,
  `PROTOTYPE_2_MOTION_REVIEW.md`, `SITE_CONTINUATION_REVIEW.md`,
  `SITE_PHASE_ONE_REVIEW.md`, `SITE_ROUTE_AUDIT.md`.
- `audit/completeness-2026-09-23/`: asset-inventory.json, browser.json,
  claims-search.txt, frontend-probes.json, http.json, performance.json,
  source-hashes-before.json, source-reachability.json, storage-search.txt.
- `homepage-review/continuation/site/http-qa.json`;
  `homepage-review/motion-pass/performance.json`;
  `homepage-review/refinement/{django-build-qa,home-qa,performance}.json`;
  `homepage-review/site-phase-one/routes/{audit_routes.py,console-checks.json,route-checks.json}`.

No old recordings, screenshots, environment files, databases or temporary output
were staged. Repository history remains recoverable through the baseline commit.

## Stable asset paths and typography

| Previous path | Final public path | Bytes |
|---|---|---:|
| `/prototype/media/renter-market.webp` | `/evidence/renter/customer.webp` | 60,812 |
| `/prototype/media/renter-control.webp` | `/evidence/renter/operator.webp` | 91,690 |
| `/prototype/fonts/instrument-sans-latin.woff2` | `/fonts/instrument-sans-latin.woff2` | 57,332 |
| `/prototype/fonts/ibm-plex-mono-400-latin.woff2` | `/fonts/ibm-plex-mono-400-latin.woff2` | 14,708 |
| `/prototype/fonts/ibm-plex-mono-500-latin.woff2` | `/fonts/ibm-plex-mono-500-latin.woff2` | 14,888 |
| `/prototype/fonts/Instrument-Sans-OFL.txt` | `/fonts/Instrument-Sans-OFL.txt` | 4,403 |
| `/prototype/fonts/IBM-Plex-OFL.txt` | `/fonts/IBM-Plex-OFL.txt` | 4,456 |

SHA-256 checks prove exact equality to checkpoint bytes for all seven moved files
and the unchanged social image. No recompression, new typeface, metric/weight change,
font-display change or compensating layout change. Font MIME is `font/woff2`;
evidence is `image/webp`. Both retain public max-age=300 with ETag/Last-Modified.
Bundled `/evidence/` is deliberately distinct from registered CMS uploads under
`/media/projects/`, whose publication/staff-preview rules remain authoritative.

Homepage and Start/Define preload all three weights. Work, Renter, Systems and legal
routes preload two. Instrument Sans/Mono 400 remain available immediately; Mono 500
loads when CSS actually uses it. Measurement found Start really uses Mono 500, so its
preload was retained. `font-display: swap` remains unchanged. No new invisible-text
phase or font load failure was observed locally; slow-device/network behavior still
needs staging measurements.

## Public routes, robots and sitemap

Every `/prototype` study and unknown child is now HTTP 404/noindex. Former assets
under `/prototype/` also return 404; they are not redirected into unrelated projects
or sent to the homepage. Source studies remain available only in Git/local source.

Django now serves robots and sitemap dynamically; the old static copies were removed.
Robots allows public pages, `/fonts/`, `/evidence/` and `/media/` to be crawled. It
retains `/admin/` and `/api/` crawl exclusions. Demo is not disallowed: crawlers need
to fetch it to see its noindex directive. Robots does not protect access or replace
HTTP status/indexing controls, consistent with
[Google's robots guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

```text
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: <configured origin>/sitemap.xml
```

Sitemap has these ten unconditional indexable routes:
`/`, `/work`, `/systems`, `/systems/architecture`, `/systems/decisions`, `/approach`,
`/start`, `/start/define`, `/privacy`, `/terms`.
It adds `/work/renter` only while the exact approved CMS slug is published (11 total).
No demo, prototype, redirect, arbitrary project slug, API/admin/media or query variants.
Database failure returns 503/noindex rather than fabricating publication state.
Sitemap and case HTML use no-store so publication changes are immediately observable
at the application boundary; actual proxy/CDN behavior remains an operator check.

## One metadata contract and raw head examples

`backend/config/route_metadata.json` is the single route copy/default-origin/social
contract. Django reads it directly; Vite/React import that same file. Vite emits a
marked metadata head; Django replaces only that region for each direct request.
No SSR framework or second unrelated route-copy map was introduced. Python and JS
resolver parity plus full rendered-head parity are executable integration tests.

`DJANGO_CANONICAL_ORIGIN` is the runtime origin override. The default retains the
repository's existing `https://raccncode.com`; its ownership/DNS has not been newly
verified. No different production domain was invented. Origin cannot contain paths,
credentials, query or fragment and never comes from the incoming Host header.
Django passes it to React through a head meta tag, preserving it during navigation.

Representative raw responses, using the retained default origin:

| Request | Raw title | Canonical | Robots/status |
|---|---|---|---|
| `/work` | Selected work — RACCN Code | `https://raccncode.com/work` | index, follow / 200 |
| `/systems/architecture` | Architecture explorer — RACCN Code | `https://raccncode.com/systems/architecture` | index, follow / 200 |
| `/start/define?product=unknown` | Project definition — RACCN Code | `https://raccncode.com/start/define` | index, follow / 200 |
| `/privacy` | Privacy Policy — RACCN Code | `https://raccncode.com/privacy` | index, follow / 200 |
| `/terms` | Terms of Use — RACCN Code | `https://raccncode.com/terms` | index, follow / 200 |
| `/systems/demo` | Operational demo — RACCN Code | `https://raccncode.com/systems/demo` | noindex, follow / 200 |
| `/work/renter`, published | `{CMS title} — RACCN Code` | `https://raccncode.com/work/renter` | index, follow / 200 |
| `/work/renter`, missing/unpublished | Page not found — RACCN Code | absent | noindex, follow / 404 |

For example `/start/define` returns, before JavaScript:

```html
<title>Project definition — RACCN Code</title>
<meta name="description" content="An optional estimator for indicative timeline, budget, and system responsibilities." />
<link rel="canonical" href="https://raccncode.com/start/define" />
<meta property="og:title" content="Project definition — RACCN Code" />
<meta property="og:url" content="https://raccncode.com/start/define" />
<meta property="og:image" content="https://raccncode.com/social/raccn-code.png" />
<meta name="twitter:card" content="summary_large_image" />
```

All routes also receive matching OG/Twitter descriptions/titles/images, site name,
image dimensions and alt. Case description uses the authoritative CMS blurb, including
an empty blurb rather than invented fallback facts. CMS HTML-special characters are
escaped. Only explicitly approved case identity is eligible; arbitrary slugs cannot
become pages or sitemap entries. Missing/unpublished case metadata remains explicitly
404/noindex; transient catalog errors are 503/noindex. React uses its existing case
catalog request to update the same contract, without adding another fetch.

The existing global PNG remains 1200×630, HTTP 200 `image/png`, byte-identical.
No project-specific social image or rights assertion was invented.

Trailing-slash canonical routes retain their existing 200 behavior and normalize
only metadata URLs to the no-trailing-slash route (except `/`). Existing 20 legacy
301s remain intact. Functional estimator queries and hash navigation remain intact;
canonical/OG URL omit query/hash to avoid duplicate documents. Unknown public/work/
systems routes, prototype pages and missing assets are real 404s. 404 HTML has
noindex and no canonical/OG URL; missing media keeps its plain 404 body and now also
has an explicit noindex header. No error advertises the homepage canonical.

## Visual and performance verification

Cold Chromium contexts, local Gunicorn + isolated SQLite/CMS fixtures, no CPU/network
throttling, reduced motion, 1440×1000 desktop and 390×844 mobile. Both runs used the
same fixtures and measurement procedure. Totals below are encoded resource body bytes
(excluding the document), not full transfer bytes including headers. This is a local
sample, not a field Core Web Vitals result or evidence of a statistically significant
speed change.

| Initial route | Font requests / preloads before → after | Resource bodies before → after | JS bodies before → after | CSS bodies before → after |
|---|---|---|---|---|
| `/` | 3/3 → 3/3 | 484,980 → 485,638 | 261,104 → 261,814 | 134,796 → 134,766 |
| `/work` | 3/3 → 2/2 | 584,236 → 569,430 | 244,201 → 244,325 | 95,333 → 95,313 |
| `/work/renter` | 3/3 → 2/2 | 581,116 → 566,310 | 244,201 → 244,325 | 95,333 → 95,313 |
| `/systems` | 3/3 → 2/2 | 501,272 → 487,052 | 256,047 → 256,757 | 95,333 → 95,313 |
| `/start` | 3/3 → 3/3 | 485,027 → 485,687 | 256,901 → 257,611 | 141,198 → 141,148 |

Desktop and mobile requested the same resource byte totals in this sample. Fonts are
86,928 bytes for all three, 72,040 bytes for the two-weight routes: 14,888 avoided bytes
where Mono 500 is unused. Main JS grows about 710 raw bytes for the shared metadata
behavior; case JS shrinks about 586 bytes by removing its separate metadata writer.
The unrequested prototype chunks no longer ship (about 21.74 kB JS + 21.26 kB CSS).
Homepage LCP sample: desktop **512 → 564 ms**, mobile **432 → 428 ms**. Treat these
single-run timing differences as noisy observations, not an improvement claim.

Ten before/after viewport screenshots (five routes × two sizes) have **zero changed
pixels** after fonts settle. Homepage desktop/mobile, Work, Renter, Systems and Start
were also visually inspected. No typography, spacing or image-rendering difference
was found. Control Plane keyboard/reduced-motion activation still passes the existing
production smoke; its geometry/choreography source was not changed. Browser tests
scroll canonical pages and detect no prototype asset requests or broken loaded images.
No compensating design edits were made.

Measurements/screenshots remain under `/tmp/raccn-performance-{before,after}.json`
and `/tmp/raccn-{before,after}-<route>-<viewport>.png`, excluded from Git. Reproduce
fresh review samples with `RACCN_MEASURE_LABEL=review python3 scripts/cms_media_smoke.py`.

## Tests, CI and review boundary

Before changes, the full existing CI-equivalent baseline passed: 66 Django tests,
29 Node tests, lint/build, 12 contact/definition browser cases, CMS/media and contact
Gunicorn smoke tests, and migration check.

Final checks passed:

- 75 Django tests: nine new raw-head/crawler/configuration groups plus existing
  contact, project, media, canonical route and all 20 legacy redirect coverage.
- 33 frontend unit tests: four metadata/asset groups added; all existing estimator
  combinations, corrected SaaS/unknown intent, CMS selection and idempotency retained.
- 12 existing browser regressions for definition and contact passed unchanged.
- Existing production-style CMS/media and contact reliability smoke tests passed.
- New `scripts/site_metadata_smoke.py` passes all 12 raw/client head comparisons,
  client navigation, custom runtime origin, CMS publication, sitemap/robots, demo and
  404 indexing, exact migrated asset HTTP bodies/MIME, no prototype requests/bundles,
  and executable Python/JS resolver parity.
- Frontend lint and production build passed; migration drift check passed. No schema
  migration or dependency upgrade was required. Root CI runs the new smoke alongside
  the existing suite; no deploy job added.

**OWNER INPUT REQUIRED:** confirm the final public canonical origin before staging;
review actual Renter CMS title/blurb/publication data for factual accuracy; confirm
staging access/indexing policy. The existing global social image remains approved;
case-specific social-image rights are not assumed. Prior contact/legal/operational
owner decisions remain pending as documented in the preceding phase.

**NOT VERIFIED:** Docker image construction on the target platform; actual Dokku
proxy/CDN route precedence or stale static robots/sitemap/prototype aliases; production
DNS/TLS/canonical host ownership; actual PostgreSQL/project records; externally fetched
OG/Twitter previews and search-engine recrawl; Safari/device/slow-network loading and
field LCP. The local canonical-origin override test used `https://canonical.example`
only in an isolated test, never as a production configuration.

See [Dokku operational requirements](DOKKU.md#canonical-metadata-crawlers-and-bundled-assets).
Review before staging. No staging or production deployment was performed.
