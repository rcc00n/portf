> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# RACCN Code public-route audit and proposed architecture

> **23 September update:** The user subsequently approved this architecture. The replacement pages and redirects are now implemented locally. See [SITE_CONTINUATION_REVIEW.md](SITE_CONTINUATION_REVIEW.md) for the current route map, screenshots, and QA. The original audit below is retained as the decision record.

Review date: 22 September 2026. **Proposal only: no public route was merged, redirected, deleted, or rebuilt during this audit.** The approved homepage is the visual foundation. Its geometry and motion are not a new exploration.

## Recommendation

Organize the public website around **Work / Systems / Approach / Start**. Keep useful depth and interactive functionality, but stop giving every short opinion, capability list, or contact step its own marketing page.

- **Work:** selected evidence and real case studies; Renter is the first substantial case. Additional cases need verified project roles, status, and media rights.
- **Systems:** architecture, operational control, production, and decisions in one body of work. Keep the interactive architecture explorer as a deep page. Fold the short customer/admin comparison and production checklist into the hub. Keep the clearly labelled admin simulation as optional demo evidence.
- **Approach:** one editorial explanation of fit, working method, delivery decisions, and engagement. Merge useful material from services/process/about/tech/pricing; do not migrate unsupported statistics or compliance promises.
- **Start:** the approved three-field homepage form becomes the shared first-contact component at `/start`. Project definition is an optional second step, retaining estimation, useful qualification choices, and their summary without blocking contact.

This yields 11 proposed primary URLs initially (including home, legal, and one case), plus one clearly labelled demo. It does not require 21 separate legacy page redesigns. More case pages can be added only when their evidence justifies them.

## What was discovered and inspected

There are **24 explicit current public URLs**: home, 20 distinct legacy experiences, one duplicate demo URL, and two legal pages. Separately there are **4 explicit prototype URLs**, a prototype wildcard fallback, the site-wide 404 fallback, backend/API routes, and asset/media paths. A route name appearing in both `main.jsx` and `App.jsx` does not create two pages: the top-level `/` route serves the approved homepage; the old `App.jsx` home implementation is unreachable presentation code.

All 28 known page URLs and two invalid-path probes were rendered at **1440 × 1000** and **390 × 844**. The audit traversed the complete page before recording full-page screenshots. At those viewports the current routes had no uncaught page errors, failed resource responses, broken loaded images, or document-level horizontal overflow. This is a route inventory and representative interaction review, not a complete accessibility certification or production-data audit.

- [Route and HTTP checks](homepage-review/site-phase-one/routes/route-checks.json)
- [Console checks](homepage-review/site-phase-one/routes/console-checks.json) — 60 route/viewport visits; no console errors, with only the two existing React Router v7 future-flag warnings.
- [Client interaction checks](homepage-review/site-phase-one/routes/interaction-checks.json) — 16 passing desktop/mobile scenarios; no contact was submitted.
- Desktop visual sheets: [1](homepage-review/site-phase-one/routes/contact-desktop-1.jpg), [2](homepage-review/site-phase-one/routes/contact-desktop-2.jpg), [3](homepage-review/site-phase-one/routes/contact-desktop-3.jpg).
- Mobile visual sheets: [1](homepage-review/site-phase-one/routes/contact-mobile-1.jpg), [2](homepage-review/site-phase-one/routes/contact-mobile-2.jpg), [3](homepage-review/site-phase-one/routes/contact-mobile-3.jpg).
- Lower-page mobile composition sheets: [Work/Approach material](homepage-review/site-phase-one/routes/contact-mobile-full-1.jpg), [Systems tools](homepage-review/site-phase-one/routes/contact-mobile-full-2.jpg), [Contact/definition/editorial](homepage-review/site-phase-one/routes/contact-mobile-full-3.jpg).
- Individual `<route>-<desktop|mobile>-full.png` screenshots are retained in the same folder. Homepage captures in this route inventory are baseline captures taken while Phase 1 refinements were underway; use the Phase 1 final captures for approval of homepage changes.

Sources: `app/src/main.jsx`, `app/src/App.jsx`, `app/src/pages/**`, `app/src/prototype/TracePrototype.jsx`, `app/src/utils/seo.js`, `app/public/sitemap.xml`, `app/public/robots.txt`, `backend/config/{urls,views}.py`, and project/lead models and views.

## Full proposed route map

Categories: **A — KEEP AND REDESIGN**, **B — MERGE CONTENT/FUNCTION**, **C — RETIRE PRESENTATION / REDIRECT**, **D — INTERNAL / DEMO ONLY**. Proposed destinations do not exist yet unless they are an unchanged current URL. “Keep” preserves the experience; some URLs move under the four-section hierarchy.

| Current public URL | Current purpose / evidence | Category | Proposed destination | Reason / condition |
| --- | --- | --- | --- | --- |
| `/` | Approved Control Plane, selected Work, Systems, Approach, first contact | **A** | `/` | Preserve approved foundation; only the specifically requested refinements. |
| `/projects` | CMS-backed project index, seeded fallback, galleries and modal details | **A** | `/work` | Replace generic inventory with selected evidence. Preserve project API and CMS. |
| `/cases/renter-architecture` | Only dedicated current case: marketplace context, diagram, admin flows, decisions, mistakes/fixes | **A** | `/work/renter` | Combine with real customer/admin screenshots; verify implemented vs planned capabilities and authorship. |
| `/engineering` | Engineering-module directory; also advertises unbuilt modules | **A** | `/systems` | Becomes the coherent engineering hub, not a card catalogue. Drop uncommitted “planned” promotion. |
| `/architecture-preview` | Product/scale choices and six selectable architecture blocks | **A** | `/systems/architecture` | Interactive explorer has enough distinct functionality for a deep page. Preserve useful presets and selected-block detail. |
| `/admin-first` | Customer/admin comparison that swaps profiles and module text | **B** | `/systems#control` | Useful differentiator, but currently duplicates homepage, demo, and journal. Embed a focused comparison; link to the demo for operation. |
| `/production-ready` | Expandable production checklist | **B** | `/systems#production` | Keep concise operational evidence within Systems. Confirm which defaults are contractual before carrying claims forward. |
| `/decisions` | Three expandable context/decision/trade-off/change-condition records | **A** | `/systems/decisions` | Strong technical depth; make a compact decision library and connect records to verified cases. |
| `/journal` | Three long opinion articles on admin-first, scaling, and audit logs | **B** | `/systems/decisions` | Consolidate overlapping reasoning. Retain distinct useful arguments; do not imply these are verified incidents from named builds. |
| `/admin-demo` | Stateful, seeded admin/customer simulation; roles, pipeline, transactions, disputes, audit | **D** | `/systems/demo` | Keep publicly accessible optional **demo evidence**, clearly labelled fictional data and preferably `noindex`. It is not the real Django admin or proof of production metrics. |
| `/demo/admin` | Exact duplicate of `/admin-demo` | **C** | `/systems/demo` | One canonical demo URL; direct redirect after destination is ready. |
| `/services` | Nine service tracks, engagement models, delivery promises | **B** | `/approach#scope` | Explain actual work accepted, not a catalogue of every possible agency service. Owner must confirm service scope. |
| `/process` | Five delivery phases, operating rhythm, repeated CTA | **B** | `/approach#working-together` | Integrate problem → decision → implementation → production and concise collaboration detail. |
| `/tech` | Technology pill inventory and broad principles | **B** | `/approach#engineering` | Retain selection principles and a few case-backed tools; technology is supporting evidence. |
| `/about` | Generic studio story, team claims, statistics and compliance badges | **B** | `/approach#practice` | Retain accurate human/practice context only. Team, experience and certifications require evidence. |
| `/not-for-everyone` | Standalone exclusion/qualification page | **B** | `/approach#fit` | Replace negative gatekeeping with a short positive fit section. Keep useful decision ownership / operational access expectations. |
| `/pricing` | API-backed five-tier price inventory plus fallback prices | **B** | `/approach#engagement` | Explain engagement and how scope is established. Keep optional estimator under Start; preserve pricing models/API. Published prices and currency require owner approval. |
| `/start` | Four-selection budget/timeline qualification gate; saves immediately | **A** | `/start` | URL becomes simple first contact using the homepage form. Move useful deeper choices into optional `/start/define`; no prerequisite fit gate. |
| `/contact` | Older required name/email/message + optional company form; redirects on success | **C** | `/start` | Duplicate contact presentation retires once shared first contact and lead routing are verified. Keep backend endpoint, qualification metadata, and failure handling. |
| `/estimate` | Client-only product/complexity/team/integration estimator with live ranges and storage | **A** | `/start/define` | Preserve calculator as optional project definition. Systems can link here contextually. No lead is submitted by using the tool. |
| `/summary` | HTML project one-pager derived from saved choices/query overrides | **B** | `/start/define#summary` | Preserve useful result and sharing input semantics within definition; no separate marketing hero. No PDF export currently exists to preserve. |
| `/pre-call` | Workflow/resources/preparation, optionally displays routing query context | **B** | `/start#next-step` | Optional “what happens next” content after first contact; do not imply a call is mandatory or scheduled. Retain useful routing context where supplied. |
| `/privacy` | Policy, data-flow disclosure, clear-saved-choices action | **A** | `/privacy` | Keep policy and functionality; later apply global shell without altering factual disclosures. Owner confirmation remains required. |
| `/terms` | Website terms and evidence/IP disclosures | **A** | `/terms` | Keep; later apply global shell. Owner confirmation remains required. |

Counts for the 24 public URLs: **10 A / 11 B / 2 C / 1 D**.

### Internal prototype URLs and wildcard behavior

| Current URL / pattern | Category | Proposed treatment |
| --- | --- | --- |
| `/prototype` | **D** | Keep as an internal archive during development; remove from public build/deploy only after owner review. |
| `/prototype/braided-signal` | **D** | Archive; not a public alternative design. |
| `/prototype/control-plates` | **D** | Archive; preserve historic study without replacing current homepage. |
| `/prototype/routing-index` | **D** | Archive; not a public alternative design. |
| `/prototype/*` | **D** | Current unknown prototype path redirects in the client to `/prototype`; recommend a proper prototype 404 in a later routing pass. |
| `*` outside prototype | Utility | Keep real not-found behavior; redesign its shell with the rest of the site. Never send arbitrary unknown URLs home. |

**Do not retire the `/prototype/*` asset prefix or delete its directory wholesale.** The approved homepage currently loads Renter evidence from `/prototype/media/` and live fonts from `/prototype/fonts/`. Exclude or protect only the four prototype HTML routes and their page fallback; preserve these assets or migrate their references in a separately verified change.

`noindex` and `robots.txt` are not access control. The current prototypes are publicly reachable if the URL is known. If “internal” must mean private, exclude them from the production build or add actual access restrictions in a later approved change.

### Other discovered URL shapes

- Homepage anchors: `/#work`, `/#systems`, `/#approach`, `/#start`, and the inline inquiry target. These remain meaningful; no new creative direction is needed.
- Existing privacy deep link: `/privacy#browser-storage`.
- `/pre-call?product=…&complexity=…&maturity=…` and `/pre-call?source=homepage` are query variants of the same route.
- `/summary?product=…&complexity=…&team=…&integrations=…` can override saved estimate choices; preserve valid input meanings during migration.
- Trailing-slash variants such as `/projects/` return the same application with HTTP 200; canonical metadata removes the trailing slash. No server redirect currently normalizes this.
- There are **no current dynamic project/case slug routes**. Project modals do not create shareable case URLs. Proposed `/work/:slug` needs an explicit approved slug map or a small CMS schema extension; do not manufacture case pages from every seed.
- No actual `/observability` or `/migration` routes exist. “Observability Readiness” and “Data Migration Blueprint” are unlinked planned cards, not working tools.

## Proposed final information architecture

```text
/                         Approved homepage
/work                     Selected evidence
  /work/renter            First detailed case, verified product + control evidence
  /work/:approved-slug    Later only where sufficient real evidence exists
/systems                  Architecture / control / production overview
  #control                Embedded customer/admin comparison
  #production             Focused production defaults with supporting evidence
  /systems/architecture   Interactive architecture explorer
  /systems/decisions      Decision records and selected journal reasoning
  /systems/demo           Optional labelled simulation; not indexed by default
/approach                 Scope / decisions / working together / practice / fit / engagement
/start                    Simple first contact, same form as homepage
  #next-step              Optional preparation after contact
  /start/define           Optional scope estimator + deeper choices
    #summary              Result / useful project definition summary
/privacy
/terms
```

Global header: raccoon mark + RACCN CODE, **Work / Systems / Approach / Start**, one current-section indication. Global footer: short positioning, those same four links, Privacy, Terms, copyright, and the confirmed public contact. No floating CTA, duplicate engineering nav, enormous sitemap, or reproduction of the hero Control Plane on secondary pages.

Each retained page should have a distinct job and one contextual action: case proof → depth → Start; Systems credibility → relevant application → Start; Approach understanding → fit → Start. Shared grid/type/rule/signal/form/motion primitives support individual compositions, not an identical card template.

## Preserve these capabilities independently of page presentation

| Capability | Current implementation | Preservation requirement |
| --- | --- | --- |
| Project CMS and media | `Project`, `ProjectLink`, `ProjectImage`; publication/order controls; `/api/projects/`; media uploads | Preserve models/admin/API. Local audit DB returned `[]`, so legacy routes used fallback seed projects. Inspect real owner data before choosing cases or changing schemas. |
| Pricing data | `PricingTier`, `PricingPoint`, five ordered slots; `/api/pricing/` | Preserve even if flat public tier page disappears. Local API returned `[]`; fallback prices are not proof of approved pricing. |
| Lead capture | POST `/api/contacts/`; required name/email/message, optional company; validation/limits; `ContactRequest` status, source, qualification, IP/user agent | Keep endpoint and operational workflow. Simplifying contact should not discard intentionally supplied optional scope context. |
| Notifications | Configured Telegram recipients + notification delivery status/error retained with lead | Preserve. This audit sent no form, email, Telegram, or external message. |
| Qualification | `qualificationGate` localStorage: project type, complexity, budget, timeline + timestamp | Preserve useful choices as optional definition inputs, not a prerequisite. Migrate stored schema deliberately. Existing page writes default answers on first mount. |
| Estimation | `buildEstimate()` with product/complexity/team/integration choices; `estimateSnapshot` localStorage | Keep live ranges, architecture blocks, and honest “indicative” framing. Calculator is independent of Django pricing tiers. |
| Summary | Query override → saved estimate → mapped qualification → defaults | Preserve useful summary and validated query values. There is no download/export/PDF/email-summary implementation today. |
| Contact routing | Older contact form derives product/complexity/maturity; attaches saved qualification; source includes routing; success goes to pre-call | Preserve intentional context during unification, but make preparation optional and success explicit. No automatic outbound reply email is implemented; email is the promised human response channel. |
| Admin demo | In-memory fictional users, permission toggles, pipeline drag/drop, transaction modal, dispute selection; refund/reject disabled | Keep as simulation; changing it does not mutate CMS or production data. Current pipeline drag/drop needs a keyboard/touch alternative in the redesign. |
| Legal storage control | Clears named qualification/estimate and entrance-session keys | Update alongside any storage migration so it still describes and clears real persisted choices. |
| Admin/CMS | Django `/admin/` and descendants with login | Internal operational interface; no public marketing redesign and no removal. |
| Health/assets | `/health/`, `/media/*`, `/static/*`, `/assets/*`, fonts/home/prototype/social assets | Infrastructure; maintain correct statuses, MIME types, cache rules, and paths. |

The local empty API data means this audit verifies fallback rendering and interfaces, not the completeness of a production portfolio or pricing inventory.

## Current route behavior and recommended redirects

Current local production-style server at `http://127.0.0.1:8001` returns HTTP **200** for all 28 known pages. Unknown `/definitely-not-a-page` returns the SPA not-found screen with **HTTP 404**, `X-Robots-Tag: noindex`, and no-store. Missing asset `/assets/not-there.js` also returns **404**. Vite development fallback returns HTTP 200 for application routes, including invalid paths; do not use Vite's status as evidence of production 404 behavior.

Unknown `/prototype/not-a-page` returns HTTP 404 from Django, then the prototype client redirects to `/prototype`. That special fallback should be corrected during the future shell/routing phase. Both current admin demo aliases self-canonicalize and are indexable; consolidate to one canonical demo in that phase. The current sitemap lists 13 URLs, not the full discovered inventory.

After destination content is implemented and approved, use direct server **301** redirects for old GET page URLs, with a matching client redirect fallback for in-app navigation. Do not create redirect chains. Preserve known useful queries and section fragments; do not blindly carry unrelated tracking or sensitive data into new URLs. Unknown routes must continue returning 404.

| Old URL(s) | Recommended eventual destination |
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
| `/summary` | `/start/define#summary` with valid estimate inputs retained |
| `/pre-call` | `/start#next-step` with useful routing context retained |

No redirect is proposed for `/`, `/start`, `/privacy`, or `/terms`. Do not redirect API/admin/media URLs or the live `/prototype/media/` and `/prototype/fonts/` asset prefixes. Update Django route allowlist, React routes, metadata/canonicals, sitemap, robots policy, internal links, and relevant tests in one future routing change. New case slugs must validate against real published cases so `/work/not-a-case` remains 404.

## Visual and interaction findings for the next phase

The legacy routes share a substantially different system: centred generic heroes, green/blue ambient gradients, translucent rounded cards, pill inventories, dense eight-item navigation, and a floating white Start button. On mobile the floating action covers content near the viewport bottom. The legal pages already use restrained carbon/mineral typography but have a separate minimal shell. Future shell work can fix these inconsistencies without touching the approved homepage composition.

The strongest retained material is the Renter product/control evidence, architecture explorer, operational control comparison, and decision structure. The current Renter case itself contains no project screenshot and no contextual final contact action. The project index places unsupported statistics before evidence; its modal details repeat short overview copy rather than providing a full case study. The Systems hub advertises implementation details (“client-only logic”) and unbuilt plans to prospective clients. Those should not become primary selling content.

Representative desktop and mobile interactions passed: architecture product/scale changes; admin/customer comparison; production disclosure; project modal open/Escape close; estimate persistence → summary; qualification mismatch with an available “Continue anyway” contact path; pre-call routing display; and demo customer/admin modes, permission toggles, transaction details, and disabled refund actions.

Important follow-up issues, outside this approved homepage phase:

- Existing radio groups use buttons with radio roles but do not implement a complete arrow-key/roving-focus pattern. Preserve native/accessible semantics when rebuilding tools.
- The Renter case diagram uses a wide horizontal canvas on mobile. Its initial visible crop shows only the input column; the future composition needs a clear pan affordance or a responsive reading order.
- The project modal does not move or trap keyboard focus; the browser check found focus remained on the triggering DIV. Rebuild case navigation/modal handling deliberately.
- Demo pipeline interaction is HTML drag/drop only; it needs accessible move controls and touch handling if retained.
- Estimator choices are written to storage but are **not restored on its initial mount**; revisiting it overwrites the previous snapshot with defaults. Preserve functionality while fixing this in its own phase.
- The old qualification → estimate mapping maps SaaS to CRM because there is no SaaS estimate preset. Do not describe that result as a tailored SaaS architecture without revisiting the model.
- `/summary` still renders a default timeline/architecture when there are no saved inputs, alongside its no-input message. Distinguish examples from a visitor's actual result.
- Old `/contact` sends users to “pre-call” after submission even though first contact promises an email discussion. Canonical Start should resolve submission first and offer preparation second.

## Owner decisions needed before rebuilding/merging major routes

1. **Approve this route map**, including `/start/define` as optional deeper definition and embedding the short production/admin comparison in Systems. Routes are untouched until that review.
2. **Confirm real service scope and practice model.** Legacy content sells software, CRM, SMM/performance marketing, SEO/ASO, launch/GTM, branding, AI, 24/7 support, and a senior team. Specify what RACCN actually takes on, who delivers it, and whether any engagement commitments are standard.
3. **Confirm project evidence.** For Renter and any later case: current status (live, shipped, prototype, personal study), RACCN's exact role, what was actually implemented, what may be named, and permission to show screenshots/logos/customer material. The legacy Bad Guy fallback still says “Motorcycle Parts Catalog”; the approved homepage correctly presents different fabrication/service evidence. Do not carry that outdated story into Work.
4. **Approve commercial assumptions.** Currency, applicable market, price ranges, rate basis, team assumptions, and delivery windows are unspecified or inconsistent. Estimator ranges are hard-coded; pricing tiers are a different data source. Keep them indicative until reconciled; do not silently present `$` as CAD or USD.
5. **Substantiate or omit legacy claims.** Current pages assert 120+ launches/releases, 38% uplift, 3.1× revenue acceleration, 27% shorter cycles, 15+ specialists, 14+ years, 99.95% uptime, and six industries. They also show SOC2-ready, GDPR/ISO27001, HIPAA-ready, and 24/7 on-call badges; the admin demo still promises an estimate in 24 hours. Repository text is not corroborating evidence. The redesign should omit these unless the owner provides support and accurate scope.
6. **Approve engineering assertions.** Renter's scaling fixes, KYC/payment details, search replicas, event audit, and operational outcomes are narrative assertions in code. Production copy says every listed control is “included by default.” Confirm what is real, conditional, illustrative, or contractual.
7. **Confirm demo/archive publication.** Recommended: keep the fictional admin demo as optional public proof, clearly labelled and not indexed by default; keep visual prototypes out of public navigation, then decide whether to exclude them from production entirely.
8. **Confirm contact/legal facts already outstanding.** Preferred public email/phone, legal operator and privacy contact, actual processors/retention, and rights to published materials. The legal pages explicitly mark pending owner inputs; consult `PRIVACY_AUDIT.md` rather than inventing facts.

No deployment, content deletion, database migration, public redirect, or backend removal was performed by this audit.
