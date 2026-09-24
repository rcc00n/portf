> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# RACCN Code — completeness and migration audit

**Audit date:** 23 September 2026. **Scope:** audit only; no application fixes, redesign, route changes, model changes, dependency installation, production configuration changes, or deployment.

**Current local site:** http://127.0.0.1:8001/ (built frontend served by Django). Source: `/home/raccoon/portf`, branch `redesign/research-and-direction`.

**Historical baseline:** `main`, `origin/main`, `dokku/main`, and the redesign branch HEAD all resolve locally to **`ded2944`**, 5 January 2026. The redesign is in modified/untracked working-tree files, not a sequence of committed redesign revisions. I inspected `main` directly and relevant earlier commits, including `6bf44b8` (qualification storage/notification), `a9c1571` (storage backend), and the initial backend. Remote refs were not fetched; the currently deployed production revision and production database are **NOT VERIFIED**.

**Evidence vocabulary:** **VERIFIED** means exercised locally or directly established by source/history; the distinction is stated. **NOT VERIFIED** means no claim of successful operation is made. Existing review reports helped locate features but were not accepted as proof of integration. Browser submissions were intercepted; endpoint probes used an in-memory database with Telegram mocked. No real inquiry or external notification was sent.

Finding IDs **F01–F26** link the analysis to the ordered master TODO in section 16. That table assigns priority, effort, implementation risk, and dependencies to every actionable finding. “Risk” means risk of carrying out the recommended change; the finding text explains the risk of leaving it unresolved.

## 1. Executive summary

**The visual and URL migration is substantially complete. The production migration is not.** All 12 intended current pages render, all 20 legacy aliases redirect directly, and the original estimator calculations survive. The contact form is a real Django client, not a visual placeholder. The largest disconnect is the project publishing contract: Django still manages projects, but the redesigned featured presentation overrides publication, ordering, and imagery in important places.

The decisive findings are:

1. **F02 — uploaded media fails under the documented production settings.** With `DEBUG=false` and `SERVE_MEDIA=true`, an existing `/media/audit.png` returned 404; the same file returned 200 under DEBUG. Django's development `static()` helper returns no patterns when DEBUG is false. Local bundled WebP screenshots conceal this backend media problem.
2. **F05/F06 — CMS preserved, featured frontend only partly connected.** Renter is hard-coded. Bad Guy Motors and WorldDoc accept some CMS copy/links, but ignore CMS images and use a fixed order. Empty/failed API responses show the same fallback evidence. A project removed from the published API can remain visible as fallback.
3. **F03/F04 — legal and actual deployment facts are not ready to sign off.** Public legal pages visibly contain owner-review placeholders. The final domain, live environment, recipients, retention, TLS, database/media persistence and backups remain NOT VERIFIED.
4. **F07–F10 — contact and dependency hardening remain.** The endpoint has no application rate limit, accepts a cross-origin `text/plain` JSON submission, and a malformed qualification rating reproduces a 500. Notification work is synchronous and can outlast the frontend timeout. Dependency advisories require triage and tested updates.
5. **F11/F12 — SEO has two concrete gaps.** Live Renter media/fonts remain below a robots-disallowed `/prototype/` prefix. Every raw page response still carries homepage title/canonical/OG metadata and an empty application root; route metadata is corrected only by JavaScript.
6. **F01/F15 — the release is not reproducible from git yet.** Much of the implementation and both backend test modules are untracked. Browser QA reports exist, but there is no checked-in executable frontend regression suite or effective root CI workflow.

### Approximate completeness

These are **judgment-based readiness estimates**, rounded to five points, not measured test-coverage percentages or a compliance certification. They assess the approved architecture and useful retained capabilities; intentionally retired agency copy does not count as unfinished design. A high visual score does not override a P0 gate.

| Dimension | Approximate completion | Basis / remaining constraint |
| --- | ---: | --- |
| Visual redesign | **95%** | All intended pages use the approved language; homepage preserved. Remaining work is consistency, content truth, and evidence depth, not another visual direction. |
| Route migration | **95%** | 12 canonical pages, 20 direct 301 aliases, real unknown-page/asset 404s. Production proxy/domain behavior and archive publication still need verification. |
| Functional migration | **80%** | Contact, estimator, storage, architecture, production disclosures, and demo interactions work locally. Project gallery/metadata depth, unknown qualification handling, and some explanatory content are reduced or lost. |
| Backend integration | **60%** | Leads connected; project API only partially authoritative; pricing API unused; production media broken in the documented Django path. Backend models/admin remain. |
| Content migration | **75%** | Core positioning, selected proof and engineering principles retained. Old case constraints/scaling detail, journal depth, quality bars and preparation guidance were substantially compressed; truth must be established before restoring them. |
| Legal/privacy readiness | **40%** | Technical disclosure is substantially accurate, storage clearing works. Operator/provider/retention/rights facts and publication approval are absent. |
| SEO readiness | **65%** | Rendered metadata, sitemap, brand favicon and 404/noindex exist. Raw route metadata, live-asset crawling, final domain and search-engine validation remain. |
| Accessibility readiness | **80%** | Native form surfaces/radios/details/dialog, keyboard control and reduced motion verified. Full assistive-technology, contrast/state, touch-spacing and cross-browser review remains. |
| Performance readiness | **80%** | Small live WebPs, lazy routes/media, bounded activation. Excess CSS/shared imports and unverified edge compression remain; no real-device/field measurements. |
| Production readiness | **50%** | A local production build and 22 backend tests pass. Media, release capture, legal publication, contact resilience and production-environment evidence prevent launch sign-off. |

### Evidence gathered in this audit

- [48 live HTTP probes](audit/completeness-2026-09-23/http.json), including all 20 legacy aliases and their direct destinations.
- [24 fresh browser route visits](audit/completeness-2026-09-23/browser.json): all 12 pages at 1440 and 390px; no uncaught page errors or document overflow; one H1 and one main landmark per page.
- [Controlled frontend probes](audit/completeness-2026-09-23/frontend-probes.json), [isolated Django probes](audit/completeness-2026-09-23/backend-probes.json), [81-case estimator parity](audit/completeness-2026-09-23/estimator-parity.json), [query redirects](audit/completeness-2026-09-23/query-redirects.json).
- [Keyboard/reduced-motion probes](audit/completeness-2026-09-23/accessibility-probes.json), [fresh performance measurements](audit/completeness-2026-09-23/performance.json), [bundle inventory](audit/completeness-2026-09-23/bundle-inventory.json).
- [Source reachability](audit/completeness-2026-09-23/source-reachability.json), [complete asset inventory](audit/completeness-2026-09-23/asset-inventory.json), [claim search](audit/completeness-2026-09-23/claims-search.txt), [repository-wide claim search](audit/completeness-2026-09-23/claims-repository.txt), and [storage search](audit/completeness-2026-09-23/storage-search.txt).
- Lint, separate build into `/tmp/raccn-audit-build`, 22 backend tests, `makemigrations --check --dry-run`, and `check --deploy`: [lint](audit/completeness-2026-09-23/lint.txt), [build](audit/completeness-2026-09-23/build.txt), [tests](audit/completeness-2026-09-23/backend-tests.txt), [migrations](audit/completeness-2026-09-23/migration-check.txt), [deploy checks](audit/completeness-2026-09-23/deploy-check.txt).

Key code anchors: [featured selection](/home/raccoon/portf/app/src/home/homeData.js:36), [Work and Renter rendering](/home/raccoon/portf/app/src/site/WorkPages.jsx:7), [project API](/home/raccoon/portf/backend/projects/views.py:14), [production media routing](/home/raccoon/portf/backend/config/urls.py:18), [qualification parser](/home/raccoon/portf/backend/leads/views.py:36), [contact/notification path](/home/raccoon/portf/backend/leads/views.py:167), [definition mapping](/home/raccoon/portf/app/src/site/definition.js:12), [client metadata](/home/raccoon/portf/app/src/components/RouteMetadata.jsx:18).

## 2. Old → new migration matrix

### Complete old-site inventory

The committed January baseline had **22 explicit public URLs plus a wildcard**, not 24: `/`, `/services`, `/projects`, `/process`, `/pricing`, `/tech`, `/journal`, `/decisions`, `/engineering`, `/architecture-preview`, `/admin-first`, `/production-ready`, `/estimate`, `/cases/renter-architecture`, `/admin-demo`, `/demo/admin`, `/about`, `/not-for-everyone`, `/start`, `/pre-call`, `/summary`, `/contact`. `/privacy` and `/terms` were added during the redesign before the immediately preceding route migration. The earlier 24-route audit counted those intermediate additions. Four prototype routes were also added during redesign; they were not January production features.

The old `App.jsx` contained the home, navigation/footer, gradients/backgrounds, project index/modal/gallery, service/process/about/pricing/stack content, journal/decision records, qualification gate, intake form, pre-call material and HTML summary. Separate modules provided architecture, customer/admin comparison, production checklist, estimator, Renter architecture case and admin simulation.

Old local project seeds: **Bad Guy Motors, SwiftFleet, WorldDoc, NorthPeak, Mobile Arcade, PortfolioSite**. Outcome overrides also named **PDF Creator, Renter, MeatDirect**, but an override is not a verified live CMS record. Production CMS inventory is NOT VERIFIED. Old pricing seeds: CRM Basic `$6k`, Standard `$11k`, Pro `$18k`, Custom Software, AI Bot `$3k`; the API replaced these only when it returned a nonempty array.

Old services included software development, CRM, AI, analytics, support/SLA, launch/GTM, design and growth positioning. The new approved direction intentionally narrows this to product interfaces, operational software and connected systems. Do not mechanically restore growth-agency promises.

### Detailed matrix

“Backend” is **N/A** where a feature was intentionally a local illustration or static editorial content. “Yes” never means live production was verified. Priorities refer to remaining action; a dash means no separate corrective finding.

| OLD FEATURE / CONTENT | OLD LOCATION | NEW LOCATION | STATUS | DATA SOURCE | FUNCTIONAL? | VISUALLY REDESIGNED? | BACKEND CONNECTED? | MISSING BEHAVIOR | RECOMMENDED ACTION | PRIORITY |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home positioning/section journey | `/`, App | `/`, HomePage | FULLY MIGRATED | Editorial + partial project API | Yes, browser | Yes | Partial projects | None requiring redesign | Preserve approved foundation | — |
| Main navigation/CTA hierarchy | App SiteNav/BtnLink | HomeHeader + SiteShell | FULLY MIGRATED | Route constants | Yes | Yes | N/A | Separate home/secondary variants | Keep anchor behavior; consolidate only where safe F26 | P3 |
| Footer | App SiteFooter | HomePage + SiteFooter | DUPLICATED | Static contact/navigation | Yes | Yes | N/A | Two implementations/content sets | Review shared ownership without changing approved home F26 | P3 |
| Project index | `/projects` | `/work` | PARTIALLY MIGRATED | Django + fixed curated objects | Yes, but partial | Yes | Partial | Featured publishing/order/media not authoritative | Fix CMS contract F05/F06 | P1 |
| Renter featured/case | old case + possible CMS | `/work/renter`, home/work | PARTIALLY MIGRATED | Hard-coded copy/WebPs | Yes editorial | Yes | **No** | CMS edits/publishing do not control it | Define static-vs-CMS authority F05/F06 | P1 |
| BGM/WorldDoc copy/link | seed/API | home + `/work` | PARTIALLY MIGRATED | Title-matched API + constants | Yes with fixtures | Yes | Partial | Blank fields replaced by defaults; no stable identity | Explicit identity/fallback rules F05 | P1 |
| Featured project images/order | API images/order | home + `/work` | FUNCTION LOST | Fixed image paths/order | Fixed display only | Yes | **No for these fields** | CMS image/reorder ignored | Reconnect after owner choice F05/F06 | P1 |
| Other published projects | `/projects` API list | `/work` archive disclosures | PARTIALLY MIGRATED | Django API | Yes for unfiltered records | Yes | Yes | Broad title exclusion can hide unmatched records | Replace title heuristics F05 | P1 |
| Project modal/gallery/detail | ProjectDetailsModal/ImageCarousel | archive disclosures; Renter page | PARTIALLY MIGRATED | API images/links | Inline images/links survive | Yes | Partial | Modal/fullscreen carousel, tags/impact/detail treatment reduced | Decide useful detail grammar; do not resurrect modal blindly F06/F13 | P2 |
| SwiftFleet/NorthPeak/Arcade/Portfolio seeds | App projectSeed | no static public equivalent | NEEDS OWNER DECISION | Old seed + possible production CMS | Not in empty local API | No new case | Production inventory unknown | Not guaranteed visible unless real CMS record exists | Approve archive/retire choices; validate links F13/F17 | P1 |
| Pricing API and admin | `/pricing`, `/api/pricing/` | API/admin only | LEGACY ONLY | PricingTier/PricingPoint | API works in isolated DB | Public inventory retired | **Backend preserved; frontend disconnected** | No current route fetches pricing | Decide retained internal purpose F20 | P2 |
| Pricing/service engagement copy | `/pricing`, `/services` | `/approach#scope/#engagement` | PARTIALLY MIGRATED | New editorial copy | Yes | Yes | N/A | Tier inventory and commitments removed | Keep removal unless owner verifies offering F20/F21 | P2 |
| Process/working method | `/process` | `/approach#working-together` | FULLY MIGRATED | Four-step editorial sequence | Yes | Yes | N/A | Weekly/two-week commitments omitted | Owner confirm actual working cadence F13 | P1 |
| Tech stack inventory | `/tech` | Approach + architecture detail | PARTIALLY MIGRATED | Editorial + architectureData | Yes | Yes | N/A | Huge stack list intentionally reduced | Keep tools subordinate to value | — |
| About/fit | `/about`, `/not-for-everyone` | `/approach#practice/#fit` | PARTIALLY MIGRATED | New editorial copy | Yes | Yes | N/A | Operator/role/accountability still vague | Add verified practice facts F13 | P1 |
| Engineering directory | `/engineering` | `/systems` | FULLY MIGRATED | Existing/new local modules | Yes | Yes | N/A | Unbuilt observability/migration promotions removed | Do not invent missing tools | — |
| Architecture product/scale/nodes | `/architecture-preview` | `/systems/architecture` | FULLY MIGRATED | Existing architectureData/buildPreset | Yes | Yes | N/A, same as old | No live system introspection, intentionally | Label conceptual; retain | — |
| Per-layer quality bars | ArchitecturePreview detail | buildPreset data only | LEGACY ONLY | Existing `quality` arrays | No public display | Partial | N/A | Quality list no longer rendered | Restore only useful verified criteria F21 | P2 |
| Customer/admin comparison | `/admin-first` | `/systems#control` | PARTIALLY MIGRATED | Two Renter images + local radio | Yes | Yes | N/A | Four old CRM/RBAC/audit/finance comparisons removed | Assess lost useful explanation F21 | P2 |
| Production checklist | `/production-ready` | `/systems#production` | FULLY MIGRATED | Same 7 CHECKLIST_ITEMS | Native disclosures work | Yes | N/A | Not evidence this website implements every item | Keep questions/controls distinction F13 | P1 |
| Decision records | `/decisions` | `/systems/decisions` | FULLY MIGRATED | Rewritten versions of 3 principles | Yes | Yes | N/A | No verified project-specific decision evidence | Add provenance later F13 | P2 |
| Engineering journal | `/journal` | decisions/further reasoning | PARTIALLY MIGRATED | Compressed editorial material | Yes | Yes | N/A | Most article depth removed | Owner select valuable arguments F21 | P2 |
| Renter constraints/technical architecture | old case | `/work/renter` responsibility map | PARTIALLY MIGRATED | Old claims vs new screenshots/copy | Editorial only | Yes | N/A | Gateway/RBAC/storage/payment topology, constraints, scaling specifics omitted | Restore only source-verified evidence F13 | P1 |
| Renter mistakes/fixes | old case | none | NEEDS OWNER DECISION | Uncorroborated old text | No | No | N/A | No incident proof | Verify or intentionally retire; never copy as fact F13 | P1 |
| Admin demo views/sections | `/admin-demo`, `/demo/admin` | `/systems/demo` | FULLY MIGRATED | Fictional demoData | Local interactions work | Yes | N/A; never real CMS | No real authorization enforcement, deliberately | Keep clear simulation label | — |
| Permissions/pipeline/transaction modal | old AdminDemo | DemoPage | FULLY MIGRATED | React state | Yes; keyboard improved | Yes | N/A | Changes do not persist, deliberately | Keep fixture boundary | — |
| Disputes/settings/audit/customer panels | old AdminDemo | DemoPage | PARTIALLY MIGRATED | Fixtures | Yes at old capability level | Yes | N/A | Some explanatory/profile/IP display trimmed | Do not mistake disabled refunds/read-only settings for new regressions F21 | P3 |
| Four-question qualification gate | old `/start` | optional `/start/define` | FULLY MIGRATED | Local choices/storage | Nonblocking alternative works | Yes | On opt-in inquiry | Mandatory gate intentionally removed | Preserve simple first contact | — |
| Estimator arithmetic | `/estimate` | `/start/define` | FULLY MIGRATED | Same buildEstimate + SaaS extension | 81 old combinations match | Yes | N/A; never pricing API | Business assumptions not verified | Owner validate ranges/currency F13 | P1 |
| Estimator persistence/restoration | old Estimate write-only | definition.js | FULLY MIGRATED | estimateSnapshot | Restore/query precedence verified | Yes | N/A | Old default-overwrite bug fixed in active route | Retire obsolete component after tests F17 | P2 |
| SaaS qualification mapping | old App mapped to CRM | definition.js + estimateData | FULLY MIGRATED | Validated option mapping | Correctly SaaS | Yes | Qualified lead | None for SaaS | Retain regression coverage F15 | — |
| Unknown/“not sure” project type | old qualification | definition.js | PARTIALLY MIGRATED | Legacy storage/query | Falls back to CRM | Yes | Can be sent as CRM | Uncertainty is lost | Preserve unknown intent F14 | P1 |
| Summary/one-pager | `/summary` | `/start/define#summary` | PARTIALLY MIGRATED | Existing estimate blocks/results | Yes | Yes | N/A | Compact combined snapshot, maturity and tailored next-steps reduced | Define useful summary scope F14/F21 | P2 |
| Pre-call resources/prep | `/pre-call` | `/start#next-step` | PARTIALLY MIGRATED | Short next-step copy | Yes | Yes | N/A | Resource links/checklist reduced | Restore only valuable optional prep F21 | P2 |
| Name/email/message intake | `/contact`, old home | home + `/start` shared form | FULLY MIGRATED | Native form → contact API | Browser contract + isolated backend verified | Yes | **Yes** | Live delivery NOT VERIFIED | Harden/verify operational path F07–F09 | P1 |
| Optional company | old ContactForm | blank payload; model/admin retained | OBSOLETE | Backend company field | Backend accepts; no public field | Intentionally removed | Yes | No company input, by brief | Keep backend compatibility, do not add required field | — |
| Source/qualification metadata | old form helpers | StartEditor + form | PARTIALLY MIGRATED | Source string + qualification JSON | Saved in isolated test | Yes | Yes | Ratings gone; maturity no longer derived; team/integration only in source | Confirm owner/reporting needs F14 | P2 |
| Success/error/timeout | ContactForm | HomeStartForm | FULLY MIGRATED | HTTP + JSON `ok:true` | Confirmed-response success; failure retains text | Yes | Yes | Delivery timeout can still follow saved lead | Idempotency/notification separation F09 | P1 |
| Telegram notifications | leads/views | unchanged flow, safer exception text | PARTIALLY MIGRATED | DB recipients/env token | Mocked path works | N/A | Yes server-side | No retry/outbox; live token/recipients unknown | Durable notification handling F09 | P1 |
| Local/session storage | two old local keys | same + two motion session keys | FULLY MIGRATED | Browser storage | Restore/clear verified | Yes | Qualification opt-in only | Unknown-project semantic issue above | Preserve/describe explicit state F14 | P1 |
| Privacy/Terms/storage clear | absent January; added in redesign | `/privacy`, `/terms` | PARTIALLY MIGRATED | Legal draft + native clear action | Clear works | Yes | No server deletion action promised | Owner facts unresolved | Complete publication review F03 | P0 |
| Analytics helpers | utils/analytics + App | helpers + limited calls | LEGACY ONLY | In-memory array | Queue works; no transmission | N/A | **No collector** | No useful reporting; fewer CTA hooks | Decide minimal measurement F19 | P2 |
| Titles/description/social/favicon | old JS metadata + Vite raw HTML | RouteMetadata/index/social asset | PARTIALLY MIGRATED | Static + client route map | Rendered correct | Yes | Generic HTML server | Raw deep-link metadata wrong | Route-specific HTML head F12 | P1 |
| Sitemap/robots/404 | absent sitemap; old blanket 200 | static files + Django route map | PARTIALLY MIGRATED | Canonical whitelist/redirects | Statuses verified | Yes 404 shell | Yes | Live assets under disallowed prefix | Resolve assets/crawl policy F11 | P1 |
| Django CMS/pricing/lead schema/admin | projects/leads | unchanged models/admin | FULLY MIGRATED | Django ORM | Isolated model/API tests | Backend admin unchanged | Yes | End-to-end production admin NOT VERIFIED | Connect frontend contract, verify staging F05/F06 | P1 |
| Uploaded media serving | settings/urls + mount docs | same code | PARTIALLY MIGRATED | FileSystemStorage | Fails DEBUG=false | N/A | **Broken documented path** | Pre-existing defect, still unresolved | Implement production media route/edge serving F02 | P0 |
| Docker/Dokku/database/health | Dockerfile/DOKKU.md | same infra | PARTIALLY MIGRATED | Env/build/database | Local build/health work | N/A | Production unknown | No checked deployment/restore/health integration | Verify release environment F04/F22/F23 | P0/P1 |
| Old App/pages/styles | previous public implementation | unreachable files | LEGACY ONLY | Old source/seeds | Not routed | No longer live | Some dead API callers | ~5,014 lines remain | Conditional cleanup F17/F18 | P2 |
| Prototype studies | redesign-only routes | 4 reachable archive pages | NEEDS OWNER DECISION | Local studies/shared assets | HTTP 200/noindex | Separate historic designs | N/A | Publicly reachable, not private | Decide publication without deleting live assets F11 | P1 |

### Exact current implementation inventory

| Route | Main implementation | Completion / data classification |
| --- | --- | --- |
| `/` | `home/HomePage`, ControlPlane/ControlField, SystemsInstrument, HomeStartForm, useHomeMotion | Complete approved visual experience; partial project API + constant evidence; real contact client. |
| `/work` | `site/WorkPages.WorkPage` | Complete presentation, **partial CMS integration**; fixtures verified copy/link updates; fallback masks empty/error states. |
| `/work/renter` | `site/WorkPages.RenterPage` | Static editorial case, not CMS-backed; evidence/provenance depth incomplete. |
| `/systems` | `site/SystemsPages.SystemsPage`, SystemGraph | Working local conceptual graph, real image comparison and existing checklist; not a live backend diagnostic. |
| `/systems/architecture` | ArchitecturePage, SystemGraph, architectureData | Working local explorer; original presets, rewritten rendering; quality arrays unused. |
| `/systems/decisions` | DecisionsPage | Complete static reasoning page; no database needed; case-specific evidence not established. |
| `/systems/demo` | DemoPage, demoData | Functional **mock/demo** state; never a connection to Django admin. |
| `/approach` | ApproachPage | Complete editorial composition; business facts need owner confirmation. |
| `/start` | StartPage, HomeStartForm, definition | Connected contact experience; optional qualification; operational hardening pending. |
| `/start/define` | DefinePage, definition, estimateData | Functional local estimator; not a pricing API client; unknown-project bug and commercial assumptions remain. |
| `/privacy`, `/terms` | LegalPages inside SiteShell | Functional pages, **publication drafts**; owner input visibly outstanding. |
| `/work/:approved-slug` | Only explicit `renter` exists | No dynamic case framework or other approved slugs. Unknown slug correctly 404s. Do not fabricate cases. |
| Four `/prototype…` pages | TracePrototype/TraceCanvas/useControlPlaneMotion | Reachable archives, noindex; not private. |

Shared secondary components: SiteShell/SiteFooter, PageLead, Evidence, ClosingAction, SignalLink, ChoiceGroup, EstimatorLink, SystemGraph and NotFound. Home keeps its approved shell. The two live shells and two estimator-link style implementations are duplication, not two separate contact backends. Server/client redirect maps and query allowlists are also maintained twice; this is intentional runtime coverage, but requires parity tests to prevent drift (F15/F26).

## 3. Missing or disconnected functionality

### F05/F06 — project publishing is not authoritative

Trace: `HomePage`/`WorkPage` → `loadHomepageProjects()` → `GET /api/projects/` → `project_list()` → published `Project` rows, related images/links. The API correctly filters `is_published`, sorts projects by `order/-created_at`, and sorts related media/links. An isolated database test confirmed that contract.

The break occurs after the response:

- `selectHomepageProjects()` always maps **two curated constants**, not the API list. It updates title, impact/type, blurb and the first acceptable link by title substring. It never copies `images`, never respects API order between those cards, and never removes an unmatched curated project.
- `/work` independently inserts a fixed Renter feature before those two. `/work/renter` never fetches project data.
- Remaining projects are filtered with `/(renter|bad guy|motorcycle|worlddoc|doctor finder)/i`. This differs from the narrower featured matcher. A controlled record named **“The bad guy inventory”** disappeared entirely: excluded from the archive but not selected for the featured card. Other similarly named unrelated projects can suffer the same problem.
- A controlled API response put WorldDoc before BGM and supplied deliberately different images. The rendered order remained BGM → WorldDoc, and the local bundled images remained. Renter CMS copy was ignored. The unfiltered new archive item did appear.
- An empty API response and a 503 API response produced identical Work text. There is no indication of data-load failure and no clear intentional empty-catalog policy.
- The old implementation also silently used seeds on empty/error responses. However, a nonempty old API response replaced the project list; the new fixed curated overlay expands that mismatch.

This is **BACKEND PRESERVED BUT FRONTEND PARTLY DISCONNECTED**, not “the CMS is gone.” Publication, ordering and imagery should become authoritative, or the owner must explicitly approve independently maintained editorial features. A published identifier/slug or explicit featured relation is safer than title matching.

### F14 — qualification meaning is only partly preserved

The active estimator fixes default overwrite and SaaS→CRM. The original 81 valid combinations are exactly equal, including ranges and block tags. Query overrides merge over saved estimate choices, then compatible qualification choices, then example defaults. Storage errors are caught. The old write-only Estimate component remains dead source; its bug must not be reintroduced.

Remaining issues:

- `?product=unsure&complexity=medium`, and a saved `qualificationGate` with those values, become a **CRM / Balanced** definition with `hasInputs=true`. This can describe a choice the visitor did not make.
- Old qualification ratings/totals are no longer generated. Telegram shows a dash where a rating previously appeared. Automatic maturity derivation is gone; an explicit legacy `maturity` query can survive. No backend routing automation was found depending on those old scores, so restoring scoring is an owner/workflow decision, not automatically necessary.
- Team/integration values survive inside `source`, not dedicated qualification fields. Source changed from a route-plus-query convention to `site-start:product/complexity/team/integrations[/maturity]`. The backend's `source` field is still a capped 120-character string. No reporting parser was found in this repository; external consumers are NOT VERIFIED.
- The homepage form does not offer the saved-definition inclusion control found at `/start`; it posts `homepage-start` and the three fields. That is a consistency gap for a visitor who estimates and then uses the homepage contact form, not loss of the ordinary inquiry.
- The old summary's compact snapshot, inferred maturity and product-specific preparation list are not fully reproduced. There never was a PDF export to preserve.

### Contact is connected, with operational gaps rather than a fake UI

Trace: `HomeStartForm.submit` → JSON `POST /api/contacts/` → `contact_request` → `ContactRequest.objects.create` → `_notify_telegram` → JSON `{ok:true,id}`. The three required fields map correctly; `company` is deliberately empty; source and opt-in qualification reach the stored lead in isolated tests.

Success requires both HTTP success and `payload.ok === true`. Invalid JSON/HTTP errors/unconfirmed response/timeout do not clear input. Native field errors receive focus. Pending disables duplicate UI submission. A notification failure still returns success **after the lead is stored**; that is valid acceptance semantics, but it is not proof that the owner was notified.

Remaining contact defects are F07 (abuse control), F08 (malformed qualification), and F09 (notification timeout/reliability). A working browser state machine does not resolve those backend risks.

## 4. Legacy remnants

Static import reachability from current `main.jsx` found **14 unreachable JS/JSX/CSS files, 5,014 lines, 210,076 bytes**. This is source reachability, not 210 KB of current runtime JavaScript.

| Classification | Files / system | Rationale |
| --- | --- | --- |
| **DELETE after replacement verification** | `app/src/App.jsx`, `App.css` | Old routes, header/footer, cards, gradient layout, contact flow, seed catalogs, old metadata and analytics wrappers. Not imported by current entry. |
| **DELETE after content review** | `pages/engineering/EngineeringLanding.jsx`, `ArchitecturePreview.jsx`, `AdminFirst.jsx`, `ProductionReady.jsx`, `Estimate.jsx`, `EngineeringLayout.jsx` | New routes replace presentation. Keep their data modules that remain imported. |
| **MIGRATE or ARCHIVE, then delete presentation** | `pages/cases/RenterArchitectureCase.jsx` | Contains omitted constraints/technical claims/incident stories requiring evidence review. |
| **ARCHIVE or delete after interaction parity** | `pages/admin/AdminDemo.jsx` | Replaced by `site/DemoPage`; old fixtures/presentation duplicated. |
| **DELETE after references rechecked** | `components/DataCard.jsx`, `ToggleGroup.jsx`, `DiagramCanvas.jsx` | Reachable only through dead old pages. |
| **MIGRATE useful content, then delete** | `pages/engineering/adminFirstData.js` | Four comparison modules no longer imported. |
| **KEEP / relocate deliberately** | `architectureData.js`, `estimateData.js`, `productionReadyData.js` | Live business/tool data, despite legacy directory names. |
| **KEEP then trim** | `index.css` | Still imports Tailwind and contains live base styling; its `infinite-bg*` and old keyframes are dead. Do not delete the whole file. |
| **ARCHIVE decision** | `src/prototype/*` and four prototype page URLs | Still reachable, not dead code. Asset directories beneath the same prefix are live dependencies. |
| **KEEP / selectively consolidate** | `src/home/*`, `src/site/*`, `pages/legal/*`, RouteMetadata, analytics | Live. Duplicated font/token/CTA definitions should be handled carefully, not wholesale deleted. |
| **DELETE dependency after source cleanup** | `framer-motion`, `lucide-react` | Imports found only in unreachable old App/AdminDemo. Current custom motion does not use Framer Motion. |
| **ARCHIVE/DELETE obsolete workflow copies** | `app/.github/workflows/deploy.yml`, `pages.yml` | Duplicate GitHub Pages recipes in the wrong directory for root repository Actions. They would also need correct working directories and do not deploy Django. |

**F17/F18:** Tailwind still scans old source, so dead classes contribute generated CSS even though old React modules are not imported. The global CSS chunk is 50,870 bytes raw / 8,844 gzip. Only part is removable; the exact post-cleanup reduction is NOT VERIFIED. Removing Framer/Lucide will shrink dependencies/build surface, but will not magically subtract their full package size from the current browser bundle: they are already unreachable.

### Asset inventory and safe ownership

The inventory covers **30 files, 21.92 MB** across `app/public` and `src/assets`. Public assets total **10.04 MB**. Thirteen old project PNGs alone total **9.58 MB**, are copied into the build, and have no live static source references. Production CMS records could still reference their URLs; that is NOT VERIFIED and is a deletion gate.

| Asset / group | Size | Classification |
| --- | ---: | --- |
| `src/assets/raccoon.gif` | **10,563,283 B** | Old raster animation, no current reference; delete/archive after owner review. |
| `src/assets/raccoon-logo.png` | **1,314,457 B** | Old raster mark, no current reference; vector replacement is live. |
| `public/assets/projects/northpeak/2.png` | **2,330,647 B** | Legacy-only PNG. |
| `…/northpeak/1.png` | **2,100,050 B** | Legacy-only PNG. |
| `…/swiftfleet/1.png` | **1,496,914 B** | Legacy-only PNG. |
| `…/bgm/2.png` | **984,340 B** | Legacy-only PNG. |
| `…/bgm/1.png` | **884,664 B** | Legacy-only PNG. |
| `…/worlddoc/1.png` | **539,660 B** | Legacy-only PNG. |
| `…/swiftfleet/2.png` | **521,313 B** | Legacy-only PNG. |
| Remaining old PNGs | 87–163 KB each | `bgm/3`, `swiftfleet/3`, `worlddoc/2`, `northpeak` covered above, `portfolio/1,2`, `arcade/1`; conditional cleanup. |
| `public/home/media/bad-guy-motors.webp` | 67,744 B | Live; keep. |
| `public/home/media/worlddoc.webp` | 27,066 B | Live; keep. |
| `public/prototype/media/renter-market.webp` | 60,812 B | **Live home/Work/case/Systems dependency.** Migrate URL safely, not delete. |
| `public/prototype/media/renter-control.webp` | 91,690 B | **Live home/case/Systems dependency.** Migrate URL safely, not delete. |
| Three `public/prototype/fonts/*.woff2` | 86,928 B combined | **Live on all routes.** Move with every CSS/preload reference and preserve licence files. |
| Font OFL licence files | 8,859 B combined | Keep with redistributed fonts, despite no browser import. |
| `public/social/raccn-code.png` | 116,178 B | Current 1200×630 social asset; keep. |
| `public/raccn-mark.svg` | 392 B | Current favicon/vector identity; keep. |
| `public/vite.svg`, `src/assets/react.svg` | 1,497 / 4,126 B | Starter assets, no live references; remove after final reference check. |
| `robots.txt`, `sitemap.xml` | 122 / 723 B | Live web infrastructure; fix rules/domain as needed, keep. |

No **byte-identical** duplicate asset files were found. Multiple screenshots of the same project are not automatically duplicates. Exact perceptual equivalence was not established. No live current project WebP exceeds 500 KB. The table flags every discovered >500,000-byte file; >1,000,000-byte files are the GIF, raster logo, two NorthPeak images and SwiftFleet/1.

**F11:** Current production pages absolutely still depend on `/prototype/media/` and `/prototype/fonts/`. Ideal destinations are shared `/media/work/…` or another stable public evidence prefix, and `/fonts/…`, distinct from Django user uploads if appropriate. Update imports, preload URLs, server allowlist, robots and cache behavior together before retiring any old prefix.

## 5. Backend/CMS integration gaps

All business models remain: `Project`, `ProjectImage`, `ProjectLink`, `PricingTier`, `PricingPoint`, `ContactRequest`, `TelegramRecipient`. Four application migrations remain (two projects, two leads); no pending model changes were detected. Admin registrations/inlines, project publication/order, image alt/order, links, pricing slots/points, lead status/meta and recipient activation remain in code.

| Owner action | Backend/admin capability | Effect on redesigned public site |
| --- | --- | --- |
| Add a project | Yes, registered model/admin; model/API probe passed | Appears in archive only if it survives title exclusion; not automatically a proper case page. |
| Hide/publish | API correctly excludes unpublished rows | Archive respects response; curated fallback/Renter can remain visible. |
| Reorder | API ordering works | Archive follows response; selected feature order is fixed. |
| Add/reorder images | Inlines + FileSystemStorage + API URLs | Archive renders returned URLs; featured images ignored; production media serving currently broken. |
| Edit image alt | Field exists in admin | **API omits alt**; frontend generates/fixes alt. This omission predates redesign. |
| Add links | Ordered ProjectLink records | Archive lists links; selected cards use only the first valid link or fallback. |
| Edit copy | title/impact/blurb/tags fields | Some selected copy updates; Renter ignores it; archive lacks full old metadata treatment. |
| Manage pricing | Five-slot tier model and point inlines | No active frontend fetch; changes have no public effect. |
| Inspect/update leads | Registered ContactRequestAdmin | Existing stored fields/status remain; actual production staff access NOT VERIFIED. |
| Manage Telegram recipients | Active toggle/chat IDs remain | Used synchronously when server token exists; live configuration NOT VERIFIED. |

The browser-admin upload/edit workflow itself was not exercised using production credentials. This table distinguishes registered capability + isolated ORM/API behavior from a real owner-session verification.

**F06 schema recommendations, not model changes:** stable public ID/slug; explicit featured/public placement and ordering; hero image selection; image metadata including alt/dimensions; project role/status/date; approved case sections; separate interface, architecture and operator evidence; links with purpose. A compact structured case model or curated case configuration keyed to stable project identity would be enough; do not build a generic page-builder without need. Publication must apply consistently to the index and direct case URL.

**F20 pricing:** retained backend is not inherently a mistake. Choose whether tiers remain internal commercial records, power a carefully limited public module, or are superseded by a separately governed estimator configuration. The estimator has **never** read `/api/pricing/`; the two pricing systems use unrelated constants. Do not silently connect old `$6k/$11k/$18k` tiers to current `$12k–$120k` illustrative ranges.

## 6. UX / conversion gaps

| Area | Visitor question / learning / next action | Assessment and material gap |
| --- | --- | --- |
| Home | What does RACCN build? Products plus systems/operations; explore evidence or start. | Clear offering, visible proof, strong action. First-view comprehension was reviewed, not measured with new visitors. Large wordmark/control remain approved. No redesign recommendation. |
| Work | Have you built something relevant? See product/operator evidence; open Renter or contact. | Good visual proof, but only one internal case. Authorship, project status, timeframe, constraints and independently sourced outcomes remain unclear (F13). External projects open new tabs; no fabricated new cases should fill the gap. |
| Systems | Why does engineering depth matter? Better control, clearer responsibility and recovery; explore/demo/contact. | Concrete operator comparison helps. Technical detail is conceptual and not a live inspection. Product choice redraws the same graph; scale changes node layout. This is an illustration, not a computed architecture recommendation (F21). |
| Approach | Is this a fit and how will we work? Scope, decision process, implementation, production; contact. | Strong principles, less concrete accountability/collaboration detail. Confirm who leads work, how review/hand-over happen and what is actually offered (F13), without reviving unverified team-size promises. |
| Start | What do I send and what happens? Three fields; email conversation; optional definition. | Low friction, no required budget/phone/company. Estimator is clearly optional and full-card interactive. Retain this. Reliability is the significant gap (F07–F09). |
| Define | Can I frame scope before contact? Illustrative timeline/budget and components; discuss definition. | Works, but unknown intent can become CRM; team/currency assumptions require clarity. Summary/next steps could better preserve useful old planning context (F14/F21). |

No canonical page is an obvious action dead end: cases, Systems, architecture, decisions and Approach have contextual Start links; tools have a direct conversation path. Legal pages have global navigation. Avoid adding more CTAs merely to fill space.

**F13:** Trust is the weakest part of SEE → UNDERSTAND → TRUST → WANT → CONTACT. The new site removed unsupported metrics correctly, but truthful specifics have not fully replaced them. Stronger verified case detail and accountable practice facts offer more value than another animation or badge.

**F21:** Content lost during compression is not all obsolete. Specifically review: Renter constraints/architecture decisions; architecture quality bars; CRM/RBAC/audit/finance comparison reasoning; journal arguments; and product-specific preparation steps. Restore only content that helps decisions and can be supported. The old artificial delivery guarantees, giant stack lists and growth-agency positioning do not need migration.

**F26:** Home navigation scrolls within the page, secondary navigation changes routes. This is an approved intentional distinction, not a broken router. Two shell/footer/estimator treatments remain maintenance duplication; any future consolidation must preserve the approved homepage behavior.

## 7. Content / claims issues

Source text alone is not evidence of a business fact. The full claim search is linked in section 1; the following groups cover the material categories rather than treating diagram coordinates and CSS timing numbers as claims.

| Claim group | Where | Classification | Action |
| --- | --- | --- | --- |
| “38% uplift”, “27% shorter cycles”, “3.1x revenue”, “120+ releases”, “6 industries”, “15+ specialists”, “14+ years”, “99.95% uptime” | Dead App content / old main | **REMOVE** from future publication unless independently evidenced | Already absent from canonical pages; do not reactivate with old source. F13/F17. |
| “SOC2-ready”, “GDPR / ISO27001”, “HIPAA-ready”, “24/7 on-call” | Dead App badges/services | **REMOVE** unless precisely verified and approved | No certification/compliance proof found. Source presence is not proof. |
| “Reply/estimate in 24h”, fixed proposal/delivery cadence | Old main/contact/legacy demo | **OWNER CONFIRMATION NEEDED**, otherwise remove | Current canonical form avoids the 24h promise. Dead copies still contain it. |
| Senior-only teams; 2–3 / 4–6 / 7–9 builders | Old marketing; live estimator team assumptions | Old marketing **REMOVE** unless proved; estimator **DEMO/ILLUSTRATIVE** with owner confirmation | Confirm capacity and estimation assumptions; labels must not imply an existing employed team. |
| `$12k–$120k`, `4–28 weeks`; budget/timing preferences | Live estimateData/definition | **DEMO/ILLUSTRATIVE** | Algorithm verified; commercial validity/currency NOT VERIFIED. F13. |
| Old price tiers and SLA/support offerings | Pricing seeds/API | **OWNER CONFIRMATION NEEDED** | Public pricing removed; decide backend purpose. F20. |
| Renter payments/KYC, high-write search, replicas, queues, idempotency incidents | Old case | **OWNER CONFIRMATION NEEDED** | No source system, incident record or ownership proof in this repo. Do not present as observed history. F13. |
| Current Renter, BGM, WorldDoc evidence/roles | Current Work/home | Screenshot files and outbound availability **VERIFIED BY ACTUAL SOURCE**; authorship/status/rights **OWNER CONFIRMATION NEEDED** | Files prove what is displayed, not who built it or what is currently deployed. |
| AI-enabled work / production capability / operational practice | Current Approach/home | **OWNER CONFIRMATION NEEDED** | Explain actual offered scope without invented evidence. |
| Architecture and production checklist controls | Systems | **DEMO/ILLUSTRATIVE** / proposed engineering practice | Explicit conceptual/scope language helps. The portfolio backend itself lacks some listed controls; do not imply universal deployment. |
| 1,284 users, $12.4k revenue, 3.2% conversion, 48h dispute SLA, policy percentages, fixture names/IPs | demoData | **DEMO/ILLUSTRATIVE** | Current demo is clearly fictional/noindex. These are not RACCN performance metrics. |
| Alberta business location / operator identity | Privacy | **OWNER CONFIRMATION NEEDED** | Location is asserted but not proven by repository. Do not infer it from commit timezone or account details. |
| No external analytics; estimator alone submits no inquiry; browser clear behavior | Current privacy/code | **VERIFIED BY ACTUAL SOURCE and local behavior** | Update if measurement/flow changes. |

External checks: current BGM and WorldDoc destinations returned 200. Legacy SwiftFleet `https://rcc00n.github.io/grr/` returned **404**; NorthPeak's legacy SnowPlow destination returned 200. HTTP success does not verify project ownership or exact current features. [Results](audit/completeness-2026-09-23/external-links.json).

## 8. SEO gaps and redirect audit

**What works locally:** all 20 old GET aliases returned 301 directly to a current 200 destination; no chain in the tested local host. `/projects/` also redirects directly. Valid summary/qualification query values survive; invalid/irrelevant parameters are dropped. Specific target fragments, such as `#summary` or `#next-step`, replace obsolete fragments. Other fragments are preserved by the client redirect; browsers normally carry a fragment through an HTTP redirect whose Location has none. Fragments are not sent to Django.

Exact destinations:

| Old URL(s) | Canonical destination |
| --- | --- |
| `/projects` | `/work` |
| `/cases/renter-architecture` | `/work/renter` |
| `/engineering` | `/systems` |
| `/architecture-preview` | `/systems/architecture` |
| `/admin-first` | `/systems#control` |
| `/production-ready` | `/systems#production` |
| `/decisions`, `/journal` | `/systems/decisions` |
| `/admin-demo`, `/demo/admin` | `/systems/demo` |
| `/services` | `/approach#scope` |
| `/process` | `/approach#working-together` |
| `/tech` | `/approach#engineering` |
| `/about` | `/approach#practice` |
| `/not-for-everyone` | `/approach#fit` |
| `/pricing` | `/approach#engagement` |
| `/contact` | `/start` |
| `/estimate` | `/start/define` |
| `/summary` | `/start/define#summary` |
| `/pre-call` | `/start#next-step` |

Unknown public, case, system and prototype URLs returned true HTTP 404s. Missing JS/media assets returned 404s, not SPA HTML with 200. Valid trailing-slash canonical pages still return 200; client canonical strips trailing slashes. Case-sensitive/canonical-host normalization at the production edge is NOT VERIFIED.

**F11 — robots/live assets:** `Disallow: /prototype/` includes current Renter image and font URLs. `Allow: /` does not override that more specific path under Google's longest-match rule. This is a real rule conflict even though ordinary browsers load the assets. `/prototype` without the trailing slash is a distinct path and has a noindex response header. Blocked crawlers may not fetch a page to observe its noindex, so robots is not a reliable privacy or removal mechanism. [Google's rule precedence documentation](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec).

**F12 — raw server metadata:** all 12 raw HTML responses have the homepage title and `https://raccncode.com/` canonical. None includes page H1/body content before JavaScript. React subsequently sets route title/description/canonical/OpenGraph/Twitter correctly. Old **Vite + React** metadata is gone, which is an improvement; generic homepage metadata on every deep link remains a problem for non-JS social fetchers and canonical interpretation. A route-specific HTML head is a launch-sized fix; it does not require replacing the whole SPA. Full prerender/SSR of meaningful marketing content is a separate post-launch improvement.

**F04/F12:** `raccncode.com` is hard-coded in raw HTML, RouteMetadata and sitemap. Domain ownership, chosen canonical host, TLS and deployed redirects are NOT VERIFIED. Do not publish a sitemap/canonical set for an unconfirmed host. The 11-entry sitemap correctly excludes demo/prototypes. Demo/prototype pages have server `X-Robots-Tag: noindex` and rendered meta noindex.

The SVG favicon and social PNG return 200. `/favicon.ico` returns 404, but the declared SVG icon works; an ICO/Apple touch fallback is optional, not a launch blocker. Structured data is absent; add only truthful Organization/Person/WebSite/case information once identity is confirmed (F25). No Search Console, rich-result, crawler rendering or production social-preview validation was performed: **NOT VERIFIED**.

## 9. Legal / privacy gaps, storage and measurement

**F03 — legal pages are explicitly local-review drafts.** They disclose contact fields, database storage, source/IP/user-agent, optional saved definition, optional Telegram forwarding, direct-email providers, browser storage and absence of external analytics. These statements substantially match the code. They also explicitly say operator/provider/retention facts need confirmation. Those visible placeholders must not be mistaken for completed production policies.

Outstanding facts: legal operator and accountable privacy contact; actual location/jurisdiction; hosting/mail/Telegram providers and countries; active recipients; IP/user-agent necessity; retention/deletion for DB, messages, email, logs and backups; access control and privacy-request procedures; project/media rights; and intended terms/jurisdiction. Actual deployed server logging is NOT VERIFIED. No automatic inquiry retention job exists. This is a repository/data-flow review, not a legal compliance opinion.

The form notice explains the core collection and purpose, links Privacy, and does not subscribe people to marketing. Optional definition disclosure at `/start` accurately describes inclusion. `company` appears in backend/Telegram support but is empty in the current public form; that is compatibility, not secret collection. Team/integration context is embedded in `source`; privacy describes routing data generally. If structured fields or analytics are added later, update the disclosure with them.

### Complete browser-state inventory

| State/key | Writer / reader | Contents / lifetime | Clear behavior |
| --- | --- | --- | --- |
| `localStorage.estimateSnapshot` | `site/definition`, formerly Estimate/App | product, complexity, team, integrations, updatedAt; no expiry | Privacy clears; verified. |
| `localStorage.qualificationGate` | optional planning fields; compatible old qualification | old projectType/complexity plus budget/timeline, updatedAt; no expiry | Privacy clears; verified. No renamed replacement key found. |
| `sessionStorage.raccn-home-seen` | useHomeMotion | entrance already seen in this tab | Privacy clears; verified. |
| `sessionStorage.raccn-control-plane-seen` | prototype motion hook | archive entrance already seen in this tab | Privacy clears; verified. Retire with prototype logic if unused. |
| `window.__studioAnalyticsQueue` | analytics utility | page/CTA events and timestamps, memory only | Lost on reload; privacy clear does not empty it. Policy promises to clear saved choices, not all memory, so no demonstrated mismatch. |
| Contact form React state | shared form | name/email/message/status; not persistent browser storage | Cleared on confirmed success/unmount; retained on failure. |
| Demo React state | DemoPage | fictional users/permissions/pipeline/modal selection | Lost on leaving/reload; matches demo notice. |
| Architecture/Systems React state | graph/radio components | product/scale/node/mode | Local, not persisted; no inquiry by itself. |
| URL query/hash | define, redirects, metadata, scroll shell | scope/routing/anchors; potentially copied, logged, or retained in browser history | Browser navigation; clear-storage action does not rewrite shared URLs. Share control includes four scope choices only. |
| `sessionid`, `csrftoken`, possible Django `messages` cookie | Django auth/CSRF/messages framework | Admin sign-in/security/messages; exact lifetime/config depends on deployed defaults/env | Not cleared by public saved-choice action; never promised. Anonymous browser probe had **no cookies**. Actual admin cookie behavior NOT VERIFIED. |

No additional source-defined localStorage/sessionStorage keys, IndexedDB store, service worker or application cache-storage workflow was identified. Clearing all four website keys succeeded. Clearing browser choices does not delete submitted leads, Telegram copies, email or backups; the policy correctly says this.

### F19 — analytics audit

There is **no analytics collector**. `utils/analytics.js` pushes into `window.__studioAnalyticsQueue` and logs in development; it has no fetch, beacon, provider SDK or persistence. The browser network trace showed no analytics transmission. The old baseline used the same in-memory mechanism.

| Event | Current behavior |
| --- | --- |
| Page views | Queued by HomePage/SiteShell; secondary hash changes can rerun the shell effect and count another same-path page view. Development StrictMode can also repeat effects. |
| Homepage primary CTAs | Hero Start and large Start card queue events. |
| Form submit attempt | A CTA event is queued after local validation, before the network request. It is **not** confirmed conversion tracking. |
| Form start, success, server error, timeout | No distinct event tracking. |
| Case views | Generic page-view queue only; no case dimension or backend report. |
| Secondary SignalLink/estimator-card clicks | No dedicated CTA event hooks. Old BtnLink coverage did not migrate. |
| Estimator use/selection/completion | No events. |
| Outbound project links | No events. |
| Retention/delivery/reporting | Memory array grows during a visit, disappears on reload; no dashboard or measurement pipeline. |

Recommended minimal setup, if owner approves: one privacy-conscious collector; deduplicated route views; primary CTA, case-open, estimator-engaged, form-start, **confirmed inquiry accepted**, and form-failure events. Never include names, emails, message text, arbitrary URLs/query strings or stored qualification payloads. Decide provider/retention/consent requirements from actual deployment/jurisdiction facts before installing. Analytics is useful post-launch, not a reason to delay a reliable contact path by itself.

## 10. Accessibility gaps

**Verified improvements over old code:** native encompassing form labels; normal input Tab order; visible block focus/error association; active geometric control with button role, accessible name/pressed state and Enter/Space; native radio keyboard behavior; native production disclosures; native transaction dialog; Escape closes and returns focus; pipeline stage selects supplement drag/drop. Old demo role-radio buttons and a hand-built modal did not offer the same native behavior.

Fresh local checks confirmed:

- Control Plane Enter activates and Space returns to standby; reduced motion retains active state without the dimensional field.
- Architecture arrow-key navigation changes the selected native radio.
- Demo transaction modal Escape/focus return works.
- One H1 and one main per canonical page at 1440/390; no document overflow or page errors in those visits.
- A limited computed text-contrast sampler across home, architecture, demo, Define, Start and Privacy found no confirmed solid-text failure. The outlined CODE mark was a false positive because its fill matches the background while the stroke provides the visible identity; it is also branding. This is not a full contrast certification.

**F16 — still NOT VERIFIED:** NVDA/VoiceOver reading and announcement quality; all hover/focus/error/completed contrast combinations; Safari/iOS SVG focus and input keyboard behavior; 200%/400% zoom/reflow; forced colors; all focus-obscuration cases beneath sticky headers; complete WCAG 2.2 target-spacing checks; and cross-browser dialog behavior. Some footer/text links have ~16–21px line boxes. Inline-link exceptions and surrounding spacing matter, so these are review targets, not automatically failures. The visually hidden 1px native radios have large clickable enclosing labels and should not be falsely flagged as 1px touch targets.

The homepage header/footer sit inside its main element, unlike the secondary shell. Review landmark announcements without disturbing approved composition (F16/F26). Loading fallbacks are blank dark surfaces rather than a labelled loading status; assess this on a throttled connection. CMS image alt text is not delivered through the API (F06); generic generated alt will not replace meaningful editorial descriptions.

Prior browser screenshots/tests cover more widths and form states, but their existence does not substitute for a maintained executable accessibility suite or human assistive-technology review.

## 11. Performance gaps

Fresh measurements used **desktop headless Chromium, 1440×1000, local Django built server, no network/CPU throttling, fresh browser context per route, no request interception**. These are diagnostic local samples, not Lighthouse scores, field Core Web Vitals or a physical-device guarantee.

| Route / state | JS decoded | CSS decoded | Fonts | Images initially loaded | Total resource bodies | Local LCP / CLS |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `/` first viewport | 259,520 B | 134,823 B | 86,928 B | 0 deferred evidence | **481,273 B** | 1,860ms / 0 |
| `/work` | 242,953 B | 95,360 B | 86,928 B | 155,622 B | **580,865 B** | 440ms / 0 |
| `/start/define` | 254,866 B | 141,225 B | 86,928 B | 0 | **483,019 B** | 440ms / 0 |
| `/privacy` | 246,745 B | 99,775 B | 86,928 B | 0 | **433,448 B** | 424ms / 0 |

Totals exclude HTML/header overhead. Scrolling the complete homepage brought its resource bodies to **728,585 B**. The earlier general browser probe used Playwright routing, which disables caching and caused repeated-resource entries; the dedicated performance file above avoids that measurement distortion.

Entry bundle: **219,783 B JS / 70,276 B gzip** and **50,870 B CSS / 8,844 B gzip**. All emitted JS/CSS chunks total **550,262 B raw**, but routes are lazy and do not all download initially. Individual route JS chunks are roughly 4.6–21 KB raw. Gzip figures are computed size estimates; local `/assets/` responses had no Content-Encoding. Production proxy compression is NOT VERIFIED.

The Control Plane's finite event sampled **63 frame intervals in ~1.6s**, median **16.7ms**, p95 **50ms**, no >50ms long tasks observed by the long-task observer, and zero event nodes remaining. A long frame and a main-thread long task are different measurements. Previous isolated comparisons also show a measurable cost relative to the original activation. Do not call this “guaranteed 60fps.” Motion is bounded, scroll work is coalesced, ambient work is visibility/reduced-motion gated, and no rendering library was added. Preserve choreography while checking actual mobile hardware.

**F18 material opportunities:**

- Remove obsolete Tailwind source classes/gradient CSS after source cleanup; quantify the resulting CSS delta.
- `SiteShell` imports `RaccnGlyph` from `ControlPlane.jsx`, pulling control/event JavaScript and CSS into secondary pages. Isolate the shared vector mark without altering Control Plane behavior.
- `/start/define` imports the Start page module, which imports the full homepage stylesheet to reuse the form. It therefore receives homepage CSS even though the estimator does not render that form. Separate dependencies carefully.
- Three fonts are preloaded on every page, including the 500-weight mono face not always needed. Font-face declarations are repeated across home/site/legal/prototype. Consolidate ownership only after measuring rendering and preserving typography.
- The 9.58 MB legacy public image collection is shipped even when no current page requests it, and Docker collectstatic can duplicate public assets on disk. This is artifact/deploy cost, not the measured homepage image cost.
- Live WebPs are already compact. Responsive variants/srcset and a CMS resize/compression pipeline are useful as the catalog grows; they are not justification to replace current approved imagery.

Real mobile/GPU performance, throttled load, INP, concurrent server load, CDN/cache headers and field metrics are NOT VERIFIED. No heavy tool or performance dependency was installed.

## 12. Security / operational gaps

This is a reasonable repository/local launch audit, **not a formal security assessment or penetration test**.

| Finding | Classification | Evidence / impact |
| --- | --- | --- |
| F04 stable secret, production hosts/TLS/database unverified | **BLOCKER to release sign-off** | SECRET_KEY falls back to a freshly generated key; ALLOWED_HOSTS defaults localhost; SQLite fallback is ephemeral in an unmounted container. Actual production values are NOT VERIFIED, not asserted missing. |
| F07 anonymous lead abuse controls | **IMPORTANT** | `@csrf_exempt`, no application rate limiter/honeypot/bot challenge/origin/content-type gate. Four repeated isolated submissions returned 200. `text/plain` JSON from an unrelated Origin was accepted and stored. CORS is not submission-abuse prevention. |
| F08 qualification validation 500 | **IMPORTANT** | `_clean_int('²')` passes `isdigit()` then fails `int()`. An isolated POST with that rating returned 500. Labels/values have no explicit per-field length bound; rating/total ranges are not constrained. |
| F09 notification coupling / duplicates | **IMPORTANT** | Lead saves before synchronous notification. Each recipient can wait 10 seconds; frontend aborts after 20 seconds. Multiple slow recipients can leave a stored lead with an unconfirmed UI and a duplicate on retry. Default Gunicorn worker timeout/capacity also matters. No idempotency/outbox/retry job. |
| F09 notification completeness | **IMPORTANT** | Telegram text truncates at 3,500 characters, while project message accepts 5,000; qualification/source are appended after message and can be omitted. A stored DB lead is complete, but the notification may not be. No admin record link is included. |
| F10 dependency advisories | **IMPORTANT; resolve/triage before release** | Read-only npm/OSV results below. Installed version matches are not proof every vulnerable path is used. |
| F22 recovery / monitoring | **IMPORTANT** | Health responds `ok` without DB/notification readiness; no queued retry, error-monitoring integration, retention job or restore verification in repo. |
| F24 response/proxy hardening | **IMPORTANT or NICE TO HAVE by control** | Django security/frame middleware present; secure-cookie/HTTPS defaults enabled when DEBUG=false. HSTS defaults 0. No app CSP/Permissions-Policy found. Real edge headers and forwarded-IP trust are NOT VERIFIED. |
| F23 environment/build handling | **IMPORTANT** | README suggests a `.env` file but Django does not load it. Docker ignore rules do not explicitly exclude future `.env` secrets; current inspection found only examples. |

The contact endpoint now validates trimmed required fields, email, and name/email/company/message limits (120/254/200/5000). Malformed JSON/nonobject handling and safe Telegram exception text are improvements. An invalid forwarded IP falls back to REMOTE_ADDR, but a syntactically valid attacker-controlled X-Forwarded-For value can still be trusted unless the actual proxy sanitizes it. It must not become an unquestioned rate-limit identity.

CSRF exemption on a public anonymous intake is not automatically an account-takeover flaw. The demonstrated problem is unrestricted cross-origin/spam submission and notification amplification. Choose an appropriate public-form abuse model rather than mechanically adding an unrelated token flow. Django admin continues to use authentication/CSRF middleware. Admin MFA, login throttling, staff permissions and actual account hygiene are NOT VERIFIED.

Request limits currently rely in part on Django defaults and unknown proxy limits; the current local Django default is a general request-body limit rather than a contact-specific JSON contract. Uploaded images are staff-managed ImageFields; no explicit resize/size budget/pipeline exists. No public upload endpoint was found. Never “fix” media by indiscriminately exposing filesystem paths.

### Dependency evidence and applicability

`npm audit` reported **18 affected package entries: 1 critical, 13 high, 3 moderate, 1 low**. Most are build/lint tooling. Runtime entries include React Router 6.30.2 and `@remix-run/router` 1.23.1. The critical entry is dev/build `tar` 7.4.3, not a newly demonstrated browser exploit. [Full npm audit](audit/completeness-2026-09-23/npm-audit.json).

Crucially, the React Router maintainer says the listed open-redirect XSS advisory does **not** affect declarative `<BrowserRouter>` mode, which this application uses. SSR-specific advisories also do not establish an exploit in this client-only configuration. Other returned advisories still need individual applicability review and tested compatible updates; do not blindly run audit-fix or claim 18 exploitable vulnerabilities. [Maintainer advisory](https://github.com/remix-run/react-router/security/advisories/GHSA-2w69-qvjg-hvjx).

Local Python versions: Django **5.2.4**, Pillow **10.4.0**, Gunicorn **23.0.0**, dj-database-url **2.3.0**, WhiteNoise **6.8.2**, django-cors-headers **4.6.0**. OSV queries matched 32 distinct CVE aliases for Django and 17 for Pillow (multiple GHSA/PYSEC records describe the same issue); no records were returned for the other four queried versions. These are version-range matches, not 49 proven reachable exploits. The final Docker environment may resolve different versions because requirements use broad ranges. Its installed inventory is **NOT VERIFIED**. The official Django project has issued later 5.2 security releases, including 5.2.17; do not ship the measured old environment without a supported-version review. [Django security release](https://www.djangoproject.com/weblog/2026/aug/04/security-releases/) · [OSV evidence](audit/completeness-2026-09-23/python-advisories.json).

A names/counts-only scan of current accessible source for common private-key, Telegram, AWS and GitHub token patterns found no matches. This was not exhaustive secret scanning of every historic object or the deployed environment. Secret values were not printed. No conclusion about production secrets is implied.

## 13. Testing gaps

The January baseline has no committed application test suite in the inspected tree. The redesign adds **22 backend tests** in `config/tests.py` and `leads/tests.py`, presently untracked. They pass against isolated SQLite. `makemigrations --check --dry-run` reports no changes. Lint and a separate production build pass. `check --deploy` against audit defaults reports HSTS unset; it cannot inspect real Dokku settings.

| Area | Current evidence | Remaining critical coverage |
| --- | --- | --- |
| Homepage/motion | Prior QA recordings/check artifacts; fresh keyboard/reduced-motion/performance probes | Checked-in repeatable browser tests; physical devices; regression baseline preserving approved animation. |
| Navigation/redirects/404 | Backend tests + fresh 48 HTTP checks | Run against actual release image/proxy; internal navigation/back-forward/fragment regression suite. |
| Contact | Backend validation/notification mocks + browser mock contract | Real isolated staging DB acceptance, timeout/retry/idempotency, spam protections, notification retry without live unsolicited messages. |
| Estimator/storage | 81-case parity + restore/query/clear probes | Durable unit tests for unknown, malformed, blocked storage, defaults, optional metadata and summary. |
| Projects/pricing APIs | Fresh isolated ORM/API probes | Committed publication/order/media/alt/link tests; owner CMS edit→frontend round trip; empty/error data behavior. |
| Legal | Render checks and storage-clear probe | Approved text snapshot/data-flow contract; provider/retention changes reviewed. |
| Systems/demo | Prior interactions + current radio/dialog probes | Committed node/radio/disclosure, permission, keyboard pipeline, modal focus, reset tests. |
| Responsive/accessibility | Existing multi-width artifacts + current 1440/390 visits | Maintain tests at 360, 390, tablet, laptop and desktop; human AT/contrast/zoom review. |
| Production operations | Build/health/deploy-check | Container media/static, Postgres migration, durable mounts, HTTPS/header checks, backup restore and notification failure behavior. |

**F15:** `package.json` has dev/build/lint/preview only; there is no frontend test command. Existing browser evidence is mostly JSON/screenshots and temporary `/tmp` scripts from prior work, not a reproducible CI suite. ESLint includes core/hooks/refresh rules but no full React JSX usage validation; the broad uppercase unused-variable exemption also hides some dead declarations. Lint success is not sufficient proof that every JSX symbol/render state works.

Minimal final pre-deploy suite: (1) backend contact/API/redirect/asset tests; (2) production-image media/static/deep-link smoke; (3) one browser inquiry happy/error/unconfirmed flow with controlled server; (4) estimator/storage/share/unknown regression; (5) CMS publication/order/media contract; (6) keyboard/reduced-motion/demo smoke; (7) multi-width key-route visual checks. Put it in a root CI workflow with no deployment side effect. Add targeted assertions for the failures reproduced in this audit before fixing them.

## 14. Deployment gaps

**F01:** the local redesign cannot be reproduced by checking out the branch's current commit. `main` and redesign HEAD are the same old commit; critical `src/home`, `src/site`, legal pages/assets and backend tests are untracked. Do not follow the existing `git push dokku main` instruction expecting this working-tree redesign to appear. A reviewed release commit and explicit deployment ref are required later; neither was created during this audit.

**F02:** Docker copies the built frontend to `/srv/app/frontend_dist`; Django serves its explicit assets safely. Uploaded content lives separately at `/srv/app/media`. `DOKKU.md` mounts that directory and sets `DJANGO_SERVE_MEDIA=true`, but `urls.py` uses Django's DEBUG-only static helper. With DEBUG=false, no upload route is added, and the SPA fallback explicitly excludes `/media/`. The defect is inherited from the old backend. It is a current launch blocker for CMS media unless an actual verified external media-serving configuration supplies that path.

**F04/F22/F23 environment and release checklist:**

| Configuration / infrastructure | Repository behavior | Production verification needed |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | Random fallback if absent | Stable strong injected value; restart/multi-worker session behavior. |
| `DJANGO_DEBUG` | False default | Actual false; no debug exposure. |
| `DJANGO_ALLOWED_HOSTS` | localhost/127.0.0.1 default | Final domain and appropriate health host. |
| `DATABASE_URL`, `DJANGO_DB_SSL` | Postgres via dj-database-url; SQLite fallback; SSL defaults on outside DEBUG | Actual Postgres link, TLS compatibility, persistence, credentials and backup/restore. |
| `DJANGO_SECURE_SSL_REDIRECT`, secure cookie flags | True outside DEBUG | Trusted proxy forwarding, no redirect loops; actual cookies over HTTPS. |
| HSTS seconds/include-subdomains/preload | Off unless configured | Owner-approved domain/TLS coverage before enabling stronger policy. |
| `DJANGO_CSRF_TRUSTED_ORIGINS`, CORS origins/credentials | Explicit env lists | Needed for actual admin/API topology; avoid broad wildcard assumptions. |
| `DJANGO_MEDIA_URL`, `DJANGO_SERVE_MEDIA`, mount | Local FileSystemStorage; fixed MEDIA_ROOT | Working production URL serving plus durable volume; fix F02. |
| `DJANGO_STATIC_URL`, WhiteNoise, collectstatic | Static collection during image build | Admin static and frontend assets from exact release image; cache/compression at real edge. |
| `VITE_BASE`, `VITE_API_BASE` | Build-time Docker args | Root-host deployment assumed by absolute assets/BrowserRouter. A subpath build is not fully supported just by setting VITE_BASE. |
| `TELEGRAM_BOT_TOKEN` + DB recipients | Optional synchronous notifications | Valid intended recipients/token; controlled delivery check; retry/monitoring plan. |
| `.env` setup | Examples present locally, but Django reads process env only | Export/inject vars or document actual loader; example files are ignored by current `.gitignore` and not tracked. |
| Gunicorn | Shell CMD, default settings unless environment supplies more | Worker count, timeouts, graceful shutdown and sync notification capacity. |
| Health | `/health/` returns `ok` | Actual Dokku check configured; meaningful readiness and alerting; avoid leaking internals. |
| Migrations | Manual post-deploy command in DOKKU.md | Release sequencing, backup, rollback compatibility. No automatic release task found. |
| Domain / TLS | Documentation says replace old duckdns domain; app says raccncode.com | Actual canonical hostname, DNS/TLS, www/http normalization. |
| Build reproducibility | Frontend lockfile; broad Python ranges/base image tags | Lock/record final backend/image inventory; tested image promoted consistently. |
| CI workflows | Two nested GitHub Pages recipes | Root CI for React+Django; no accidental static-only deployment. |

No Docker image was built or deployed during this audit. A separate Vite production build was verified; the local Django preview uses an isolated SQLite database and development runserver with production-like flags, not the real Gunicorn/Dokku network. The current local APIs return empty project/pricing catalogs. Real CMS rows, uploaded files, admin accounts, provider regions, nginx rules, TLS, media mounts, backups and live notification delivery remain **NOT VERIFIED**.

## 15. Ideal final-state recommendations

These are bounded improvements justified by this repository, not a feature wishlist.

| Classification | Recommendation | Reason / related findings |
| --- | --- | --- |
| **LAUNCH ESSENTIAL** | Reproducible reviewed release; verified production configuration and durable media | Local success currently hides release/media/environment gaps. F01/F02/F04. |
| **LAUNCH ESSENTIAL** | Authoritative project publishing contract with stable identity | The owner must be able to control public visibility/copy/media/order reliably. F05/F06. A minimal schema/config change is enough. |
| **LAUNCH ESSENTIAL** | Reliable, bounded, abuse-resistant inquiry acceptance and notification | Contact is the conversion endpoint; persisted acceptance, retries and operational visibility matter more than extra fields. F07–F09/F22. |
| **LAUNCH ESSENTIAL** | Completed legal facts and truthful project/service/estimate claims | Drafts and unverified claims cannot be solved by styling. F03/F13. |
| **LAUNCH ESSENTIAL** | Crawlable live assets, correct raw route metadata and canonical host | Prevent blocked evidence and misleading shared/deep-link metadata. F11/F12. |
| **LAUNCH ESSENTIAL** | Tested dependencies, migration regressions, accessibility and release-image smoke | Fix verified defects and establish repeatable sign-off. F10/F14–F16. |
| **HIGH VALUE POST-LAUNCH** | CMS-backed case sections and approved shareable project slugs | Extend evidence beyond one hard-coded case; do not manufacture cases. F06/F13. |
| **HIGH VALUE POST-LAUNCH** | Minimal conversion analytics and error monitoring | Current event queue offers no useful reporting; owner needs inquiry failure visibility. F19/F22. Error monitoring for contact is preferably part of launch operations. |
| **HIGH VALUE POST-LAUNCH** | Central image/alt/resize pipeline and performance budget | Prevent future uploads undoing current small-image performance. F06/F18. |
| **HIGH VALUE POST-LAUNCH** | Prerender meaningful public content and truthful structured data | Improve non-JS access/discovery after route heads are corrected. F12/F25. |
| **OPTIONAL** | Project-specific social cards, Apple/ICO icon variants, richer preparation handout | Useful refinements after verified proof and contact reliability. F21/F25. |
| **OPTIONAL** | Consolidate home/secondary footer/link primitives | Maintenance benefit only; preserve approved home behavior. F26. |

No need was established for another homepage redesign, WebGL stack, larger required qualification form, real financial demo transactions, or rebuilding every old marketing URL.

## 16. Prioritized master TODO

This is a proposed implementation sequence, **not authorization to start fixing during this audit**. P0 = deployment gate/broken essential capability/material legal or configuration risk; P1 = fix or explicitly resolve before launch; P2 = useful near-term improvement; P3 = optional. Effort is relative to this repository, not a delivery estimate.

| Priority / ID | Task | Why | Files / systems affected | Effort | Risk | Dependencies |
| --- | --- | --- | --- | --- | --- | --- |
| **[P0] F01** | Establish a reviewed, reproducible release baseline and later commit the complete approved changes | Branch HEAD still contains the old site; untracked code/tests/assets will not deploy from git | git working tree, release branch, all new source/assets/tests | Small | Medium | Preserve existing work; owner-approved release process; final release commit after required QA |
| **[P0] F02** | Make uploaded media work with DEBUG=false and verify persistence | Existing uploaded file returns 404 under documented production path | backend/config/urls.py/settings.py, media serving, Dokku nginx/storage | Medium | High | Confirm actual media topology/mount; isolated upload/read test; avoid broad filesystem exposure |
| **[P0] F03** | Complete and approve legal/privacy/rights facts | Public policy/terms are explicitly drafts | LegalPages, form notice, owner/provider/retention policies | Medium | High | Owner facts in section 18; legal review appropriate to actual operator |
| **[P0] F04** | Verify real production domain, secret, hosts, HTTPS, Postgres, mounts and release environment | Local overrides do not prove deployment safety; dangerous fallback behavior if env is absent | Dokku config, DNS/TLS/proxy, settings, Docker/release inventory | Medium | High | Owner deployment access/facts; no secrets in report; F02 for media sign-off |
| **[P1] F15** | Check in the minimal regression suite and root CI before changing affected behavior | Current browser reports are not executable release gates | backend tests, frontend test scripts, root .github/workflows | Medium | Low | Audit reproduction cases; no deployment job required |
| **[P1] F05** | Make project visibility, selection and ordering explicit and authoritative | Unpublished fallback remains; title filters drop unrelated records | homeData.js, HomePage, WorkPages, project API/config | Medium | Medium | Owner static-vs-CMS decision; F15 fixtures |
| **[P1] F06** | Connect project media/alt/links to stable identity; define minimal missing schema | CMS images ignored, alt omitted, Renter unmanaged | projects models/views/admin, WorkPages, shared Evidence | Medium | High | F05 decision, F02 serving, content rights; larger case builder deferred |
| **[P1] F07** | Add an appropriate bounded abuse-control model for public inquiries | Repeated/cross-origin submissions accepted; notification/DB amplification | leads/views, proxy limits, public form feedback | Medium | Medium | Trusted proxy/IP model; privacy assessment; F15 tests |
| **[P1] F08** | Make qualification parsing total and bounded | Unicode numeric input causes server 500; string/rating bounds absent | leads/views `_clean_int`/`_clean_qualification`, tests | Small | Low | Preserve known old/new payload compatibility |
| **[P1] F09** | Separate durable inquiry acceptance from reliable notification, with safe retry semantics | Saved leads can time out in UI; retries duplicate; notifications can be silently incomplete/lost | leads models/views/admin, worker/outbox or equivalent, HomeStartForm | Medium | High | Owner notification workflow; F07/F08; idempotency tests; no new required intake fields |
| **[P1] F10** | Triage advisories, update supported versions, lock/record backend image inventory | Known old local versions and build/runtime advisory matches | package/lock files, requirements, Docker build | Medium | Medium | Applicability review; F15 regression/build checks; avoid blind major-version changes |
| **[P1] F11** | Resolve prototype publication and move/allow live shared assets before archival cleanup | Current crawl rule covers live media/fonts; prototypes remain public | public/prototype, all asset/preload refs, robots, server allowlist, prototype routes | Medium | Medium | Owner archive decision; reference map; cache/404 tests |
| **[P1] F12** | Serve correct raw route metadata/canonicals and validate final social/search URLs | JS-only metadata leaves deep links looking like home to non-JS fetchers | index template, frontend_index, RouteMetadata/seo, sitemap | Medium | Medium | F04 final domain; one shared route metadata source preferred |
| **[P1] F13** | Verify published project/practice claims and estimator assumptions; restore strongest supported proof | Trust depends on facts now missing or unverified | Work/case/Approach/Systems copy, project assets, estimateData | Medium | Medium | Owner evidence/roles/rights, commercial capacity/currency; do not invent outcomes |
| **[P1] F14** | Preserve unknown project intent and agree metadata semantics | “Not sure” becomes CRM; old scoring/maturity/source conventions changed | definition.js, StartPages, HomeStartForm, lead qualification contract | Small | Medium | Owner needs for routing/reporting; F15 tests; homepage remains three fields |
| **[P1] F16** | Complete human accessibility and real-device review; fix only demonstrated issues | Current automation does not prove all keyboard/AT/zoom/state behavior | home/site/legal CSS/components, demo/control/form | Medium | Low | Stable content/components; preserve approved composition/motion |
| **[P1] F22** | Establish inquiry failure monitoring and verify DB/media backup/restore/readiness | `ok` health does not verify data/notification recovery | hosting/DB/media, health, logs/error monitoring, admin workflow | Medium | Medium | Owner retention/operations policy, F02/F04/F09 |
| **[P1] F23** | Correct deployment/local-env docs and exclude secret files from build context | Nested Pages recipes are obsolete; .env instructions do not configure Django; release instructions target old main | DOKKU.md, backend README, .dockerignore, env examples/workflows | Small | Low | F04 confirmed topology; F01 release process |
| **[P2] F17** | Remove/archive verified dead presentation and unused dependencies/assets | ~5,014 dead source lines, old claims and 9.58 MB public PNGs remain | Section 17 cleanup list | Medium | Low | F05/F06/F13/F15/F21; production CMS URL reference check |
| **[P2] F18** | Trim shared CSS/control imports and confirm production compression/performance | Secondary pages load control CSS/JS; Define loads home CSS; legacy CSS remains | index.css, SiteShell glyph import, StartPages imports, asset serving | Medium | Medium | F17 where relevant; measured budgets; preserve visuals/choreography |
| **[P2] F19** | Decide and implement minimal privacy-conscious measurement | Current queue is not analytics; confirmed conversions unmeasured | analytics utility/hooks, collector/config, Privacy | Medium | Medium | Owner provider/retention/privacy choice; no inquiry PII in events |
| **[P2] F20** | Decide the retained pricing CMS's purpose | Admin edits currently have no public effect; estimator uses unrelated rules | PricingTier/Point admin/API, estimateData, owner commercial model | Small | Low | Owner decision; do not remove backend capability blindly |
| **[P2] F21** | Review omitted useful technical/preparation content and migrate only what earns its place | Quality bars, case constraints and preparation depth were compressed away | architectureData, old case/journal/adminFirstData, Systems/Start content | Medium | Low | F13 verification; avoid reinstating old routes/card inventories |
| **[P2] F24** | Review edge/security headers and proxy trust; add justified controls | HSTS off by default; no CSP; forwarded-IP trust unknown | Django settings, proxy headers, CSP policy | Small | Medium | Confirm TLS/subdomain coverage; CSP must permit current inline styles/data-SVG event or provide compatible alternatives |
| **[P2] F25** | Add truthful structured data and consider prerendered public content | No structured data and raw body empty | SEO/templates/build, approved identity/case data | Medium | Low | F03/F04/F13; raw-head fix F12 first; richer social cards optional |
| **[P3] F26** | Consolidate duplicate shell/footer/link/token ownership selectively | Reduces drift, not a new design need | HomeHeader/footer, SiteShell, estimator CSS, font declarations | Small | Medium | Approved visual regression baseline; no change to homepage composition/navigation intent |

Release sign-off should require the P0 items resolved with evidence and P1 items fixed or explicitly accepted with a concrete rationale. A passing local build is not a substitute for that evidence.

## 17. Safe cleanup list

**Nothing below was removed.** “Safe” means dependency analysis indicates a candidate **after the stated replacement/content checks**, not unconditional deletion now.

### Presentation candidates

- `app/src/App.jsx` and `app/src/App.css`: no current entry import. Before removal, resolve unverified seeds/claims, old project gallery content, journal/pre-call details and qualification metadata requirements.
- `app/src/pages/engineering/EngineeringLanding.jsx`
- `app/src/pages/engineering/ArchitecturePreview.jsx`
- `app/src/pages/engineering/AdminFirst.jsx`
- `app/src/pages/engineering/ProductionReady.jsx`
- `app/src/pages/engineering/Estimate.jsx`
- `app/src/pages/engineering/EngineeringLayout.jsx`
- `app/src/components/DataCard.jsx`
- `app/src/components/ToggleGroup.jsx`
- `app/src/components/DiagramCanvas.jsx`
- `app/src/pages/engineering/adminFirstData.js`: migrate valuable explanatory content first.
- `app/src/pages/cases/RenterArchitectureCase.jsx`: verify/archive claims before deleting.
- `app/src/pages/admin/AdminDemo.jsx`: validate retained simulation behavior first.
- Dead `.infinite-bg*` rules and their keyframes inside `app/src/index.css`: remove selectively, keeping needed base/reset styling.
- `framer-motion` and `lucide-react`: remove package dependencies only after deleting their dead import sites and rerunning build/lint/tests. Do not remove React, Router, or Tailwind merely because the new layouts use custom CSS.
- The two nested `app/.github/workflows/*.yml` GitHub Pages recipes: archive/remove after documenting the actual root deployment workflow.

### Asset candidates

- `app/src/assets/raccoon.gif`, `raccoon-logo.png`, `react.svg`; `app/public/vite.svg`: no live references found.
- All 13 `app/public/assets/projects/` PNGs: `arcade/1`, `bgm/1–3`, `northpeak/1–2`, `portfolio/1–2`, `swiftfleet/1–3`, `worlddoc/1–2`. **First query/inspect production CMS references and decide which historic projects remain published.** They can be referenced by stored data even when source search says unused.
- Old social raster mark references are dead; keep the current `public/social/raccn-code.png`.
- Review screenshots/recordings and audit artifacts can live outside deploy artifacts or be retained in a documented archive; no need to ship them to the app image. Do not delete evidence before review.

### Explicitly unsafe to delete wholesale

- `app/public/prototype/`: live Renter imagery and three fonts sit here. Keep font licence notices.
- `architectureData.js`, `estimateData.js`, `productionReadyData.js`: actively imported logic/data.
- `site/demoData.js`: live fictional demo data, not accidentally disconnected production records.
- Django project/pricing/lead models, migrations, admin, APIs, media volume or database: retained infrastructure.
- The 20 legacy URL aliases: these are useful compatibility infrastructure, not obsolete presentation.
- Prototype page code until its publication/archive decision is explicit: it is still routed.

A final grep is not enough for externally stored media URLs. Source graph + production data inventory + built-route test are the cleanup gate.

## 18. Owner input required and final verification limits

The following cannot safely be determined from this repository:

1. **Release facts:** what is actually deployed, intended release branch/ref, final domain/canonical host, DNS/TLS/proxy topology, host provider and deployment access. No production configuration or server was changed.
2. **Legal identity:** operator/legal name, business location (including the current Alberta statement), accountable privacy contact, appropriate terms/jurisdiction, and review authority.
3. **Providers and retention:** hosting/database/email providers and countries; Telegram enabled/recipients; IP/user-agent necessity; retention/deletion across database, messages, email, logs and backups; privacy request procedures.
4. **Notification workflow:** how quickly inquiries are reviewed, who owns failed-delivery follow-up, desired retry/escalation and whether Telegram should carry full project context or a minimal admin link. No response-time promise should be invented.
5. **Projects:** actual production CMS inventory; featured project publication authority; ownership/role/status/date; screenshot permission; Renter architecture/incident evidence; which old seeds deserve archive visibility; whether external repositories are intended to be public proof.
6. **Commercial model:** real offered scope, team/collaboration capacity, estimator currency/ranges/team assumptions, current price tiers and whether the pricing CMS still has a purpose. No unsupported statistics or certifications should return.
7. **Definition metadata:** whether old ratings/maturity are useful, whether any off-repository tooling parses `source`/qualification, and how unknown project type should be represented.
8. **Archive policy:** whether prototype page URLs should remain publicly reachable/noindex, be excluded from release, or require real access control. Their shared live assets must be preserved regardless.
9. **Measurement:** whether analytics is desired; collector/provider, retention, consent/privacy requirements and useful outcomes. Current queue provides no reporting.
10. **Operations:** real Postgres/media backup and restore evidence, monitoring/logging access, admin permissions/MFA, capacity/timeouts, edge compression/security headers and dependency versions in the final image.
11. **Human QA:** target browsers/devices, screen-reader acceptance review, and any known accessibility needs not represented by current automated checks.

**NOT VERIFIED:** live production DB/CMS contents; authenticated production admin operations; actual Dokku/nginx/media/CDN rules; real TLS/domain ownership; real Telegram delivery; backup restores; production logs/retention; physical mobile keyboards/GPUs; Safari/Firefox/screen-reader behavior; field performance; actual crawler/social rendering; complete dependency exploitability; exhaustive historical secret scanning; business/legal claims.

**Verified locally:** intended route rendering and direct redirects/404s; CMS API ordering/filtering; featured data disconnection; media failure under DEBUG=false; estimator parity/restoration/unknown-type behavior; form payload and isolated persistence/validation; storage clear; analytics non-transmission; selected keyboard/modal/reduced-motion behavior; build/lint/22 backend tests; no pending model migration; measured resource/animation cost.

**Audit stop point:** deliver this map for review. No fixes were implemented. [Source/configuration integrity evidence](audit/completeness-2026-09-23/source-integrity.json) confirms **114 recorded files unchanged** from the start of this audit. Only this report and audit evidence are added.
