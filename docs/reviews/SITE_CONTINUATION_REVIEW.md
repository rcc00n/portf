> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# RACCN Code — approved-site continuation

23 September 2026. Implemented locally on `redesign/research-and-direction`. **No deployment or production push.** This continues the approved homepage and the subsequently approved public architecture; it supersedes the route-review stop point in the 22 September reports.

Local built preview: **http://127.0.0.1:8001/**. Development server: http://127.0.0.1:5173/.

## Homepage refinements

- The estimator is one native link covering the entire card, including padding. Hover, keyboard focus, and press tint the full surface violet, strengthen its rule and label, and shift the arrow. No nested interactive controls or hover shadow. It now opens **`/start/define`**; `/estimate` redirects there.
- Only the interactive center group moved down eight SVG units: measured **8.64px at 1440px** and **3.54px at 390px**. The surrounding plane and route coordinates did not move.
- The original Control Plane geometry, click/reset sequence, route timing, color evolution, and scroll progression remain intact. The original interaction stylesheet matches the pre-change copy except for that optical correction; `useHomeMotion.js` is byte-identical. CONNECT remains absent. The accessible control name and Enter/Space behavior remain.
- One new **1.38-second dimensional event** follows activation. Its projected axes come from the existing center control. Layered architectural routing expands from that origin: cobalt first, muted violet next, cool cyan last, with mineral risers. The field resolves while the approved control settles into its existing active state.
- Three static SVG image sheets on desktop; two simpler sheets on mobile. Transforms and opacity animate the cached linework. No Three.js, rendering dependency, particle system, continuous frame loop, or opaque overlay.
- The event never receives pointer input and sits below navigation. It removes itself after completion, and cancels on scroll, resize, visibility change, reset, or route unmount. Rapid input cannot stack fields. Reduced motion skips spatial expansion and keeps the original direct color/state response.
- The homepage typography, navigation composition, Work, Systems, Approach, Start, and form were not redesigned. Internal destinations now point to the approved routes.

### Final event review

Recordings include activation, return to standby, and another activation:

- [Desktop recording](homepage-review/continuation/control-field-final-1440.webm)
- [Mobile recording](homepage-review/continuation/control-field-final-390.webm)
- [Desktop peak](homepage-review/continuation/control-field-peak-1440.png) · [Mobile peak](homepage-review/continuation/control-field-peak-390.png)
- Timed frames reviewed from the actual videos: [desktop sequence](homepage-review/continuation/video-review-1440.jpg) · [mobile sequence](homepage-review/continuation/video-review-390.jpg)
- [Whole-card violet focus — desktop](homepage-review/continuation/estimator-final-1440.png) · [mobile](homepage-review/continuation/estimator-final-390.png)
- [Reduced-motion active state](homepage-review/continuation/control-reduced-motion.png)

The first live-SVG implementation produced repeated viewport painting. It was replaced before completion. In two isolated final Chromium comparisons, the added field had **16.7ms median / 33.4ms p95 frame intervals, no long tasks, and no remaining event node** after completion. The original activation with the new field hidden measured 16.7ms / 33.3ms. The added effect still costs frames: 69 versus 89 sampled intervals over roughly 1.6 seconds. A separate sample measured 16.7ms median / 50ms p95. These are local headless-browser samples, not a guarantee of physical-device frame rate. [Comparison data](homepage-review/continuation/performance-comparison.json) · [Capture metrics](homepage-review/continuation/event-final-metrics.json).

## Secondary-page implementation

Visual thesis: the approved carbon environment, mineral editorial typography, structural rules, and controlled signal colors extend into pages whose main subject is real evidence or a useful tool.

Content progression: identity/context → evidence or working system → decisions and relevance → one clear next step. Secondary pages do not repeat the homepage Control Plane hero.

Interaction language: evidence resolves through an architectural crop; rules and routes establish structure; architecture nodes visibly reposition and routes redraw; controls respond with blue or violet state. Native inputs, disclosure elements, links, and dialogs provide the interaction foundations. Reduced motion removes animated transitions while preserving all content and state.

| Canonical URL | Implemented experience |
| --- | --- |
| `/` | Approved homepage with the focused refinements above. |
| `/work` | Large Renter proof, two additional existing project references, and CMS-backed archive entries when available. |
| `/work/renter` | Customer and operator imagery, product context, responsibility map, decisions, and contextual Start action. |
| `/systems` | Interactive architecture overview, customer/operator comparison, production disclosures, and deeper engineering links. |
| `/systems/architecture` | Existing product and scale presets, six selectable nodes, changing layout/routes, responsibilities, interfaces, and supporting technical choices. |
| `/systems/decisions` | Three records with context, choice, trade-off, and conditions for revisiting it; useful journal reasoning consolidated here. |
| `/systems/demo` | Clearly fictional customer/admin simulation: roles, pipeline, transactions, disputes, audit, settings, customer views, and keyboard alternatives. `noindex`. |
| `/approach` | Scope, problem-to-production sequence, engineering principles, practice, fit, and engagement. |
| `/start` | Shared three-field native form, optional inclusion of saved definition, clear email next step, and optional estimator. |
| `/start/define` | Preserved estimator calculations, live scope/timeline/budget, architecture summary, optional planning preferences, shareable scope link, and direct contact path. |
| `/privacy` | Existing factual disclosures and clear-saved-choices control in the shared shell; flow references updated. |
| `/terms` | Existing terms and review markers in the shared shell. |

All secondary pages use the raccoon mark, RACCN CODE, Work / Systems / Approach / Start navigation, current-section indication, shared footer, and route-aware metadata. Unknown page and case URLs render the designed not-found page with **HTTP 404** from Django. The sitemap contains the 11 indexable canonical pages; the demo is excluded.

Representative final screenshots:

- [Work desktop](homepage-review/continuation/site/work-1440-full.png) · [Renter mobile](homepage-review/continuation/site/work-renter-390-full.png)
- [Systems desktop](homepage-review/continuation/site/systems-1440-full.png) · [Architecture mobile](homepage-review/continuation/site/systems-architecture-390-full.png)
- [Demo desktop](homepage-review/continuation/site/systems-demo-1440-full.png)
- [Approach desktop](homepage-review/continuation/site/approach-1440-full.png) · [mobile](homepage-review/continuation/site/approach-390-full.png)
- [Start desktop](homepage-review/continuation/site/start-1440-full.png) · [Definition mobile](homepage-review/continuation/site/start-define-390-full.png)

## Redirects implemented

Django supplies direct **301** redirects; React mirrors them for navigation inside the running application. All replacement destinations exist. Relevant validated estimator/routing query values survive. Unrelated or invalid values are discarded. Summary and preparation anchors remain useful.

| Old URL | Destination |
| --- | --- |
| `/projects` | `/work` |
| `/cases/renter-architecture` | `/work/renter` |
| `/engineering` | `/systems` |
| `/architecture-preview` | `/systems/architecture` |
| `/admin-first` | `/systems#control` |
| `/production-ready` | `/systems#production` |
| `/decisions` | `/systems/decisions` |
| `/journal` | `/systems/decisions` |
| `/admin-demo` | `/systems/demo` |
| `/demo/admin` | `/systems/demo` |
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

The four existing prototype pages remain archived and `noindex`: `/prototype`, `/prototype/braided-signal`, `/prototype/control-plates`, `/prototype/routing-index`. Invalid prototype paths now produce 404s. These pages are not private merely because they are unlinked/noindex. Live `/prototype/media/` and `/prototype/fonts/` assets remain available.

The complete original inventory and KEEP / MERGE / RETIRE / INTERNAL rationale remain in [SITE_ROUTE_AUDIT.md](SITE_ROUTE_AUDIT.md). This document records the implementation of the subsequently approved architecture.

## Functionality preserved

- Django project data/API, pricing/data models and API, lead handling, admin/CMS, media, and health endpoint remain. No database migration or backend capability removal.
- Selected Work can still consume published CMS data; additional records retain imagery and outbound links. No fabricated case studies or outcome metrics were created.
- The estimator retains its calculation model, existing storage keys, valid query overrides, summary information, and optional qualification values. A SaaS option now maps to SaaS rather than falling back to CRM. Initial defaults are visibly an example and are not written to storage until a user changes a choice.
- Definition is optional. The first contact remains Name, Email, and Project. Saved planning context is included only through the visible inclusion control. URL sharing includes the four scope choices, not name/email/message or planning preferences.
- Form pending/error/success behavior remains, with entered values retained on failure. Tests intercept submissions; no real inquiry or notification was sent.
- Demo operations remain local fictional state. Keyboard stage selection supplements drag-and-drop; transaction dialog supports Escape and returns focus. Unavailable financial actions remain disabled.

## Verification

- `npm --prefix app run lint` — passed.
- `npm --prefix app run build` — passed.
- Django `config.tests` and `leads.tests` — **22 passed**, isolated in-memory SQLite and external notification disabled. Only the existing missing staticfiles-directory warning.
- [Control Plane / estimator checks](homepage-review/continuation/event-qa.json) — **41 passed** at 1440, 1280, 768, and 390px; approved motion preservation, finite field, repeated input, keyboard, pointer transparency, cleanup, scrolling, whole-card focus, reduced motion, no page errors.
- [Route/browser checks](homepage-review/continuation/site/route-qa.json) — **115 checks**, canonical pages at 1440, 1280, 768, 390, and 360px. No page/console errors or document overflow. This earlier run identified one 360px Approach heading clip; it was corrected.
- [Final visual checks](homepage-review/continuation/site/final-visual-checks.json) — **23 final page/viewport checks**, including the corrected 360px heading; no text clipping. Final screenshots replaced earlier capture artifacts.
- [Journey checks](homepage-review/continuation/site/journey-qa.json) — **77 passed**, desktop/mobile: storage/query migration, optional qualification, form error/success, architecture interaction, demo behavior, privacy clearing, and whole-card navigation. Four intercepted submissions, zero real inquiries.
- [HTTP checks](homepage-review/continuation/site/http-qa.json) — **47 passed**: canonical/archive routes, 20 redirects, invalid-route 404s, preserved API/assets, and query handling.
- [Final continuity/reduced-motion checks](homepage-review/continuation/site/finish-checks.json) cover canonical estimator navigation and return to the approved homepage, plus six secondary pages with reduced motion.
- Changed JSX components were additionally checked for unbound JSX identifiers.

Browser tests used Chromium, including touch emulation. Physical iOS/Android keyboards and other browser engines were not tested. Local CMS APIs have no published records, so existing approved project assets/fallback evidence were used for visual review.

## Remaining owner publication decisions

The route architecture is implemented as authorized. Before a future production release, the outstanding content decisions from the earlier audit still apply: confirm legal operator/contact facts and policy details, project roles/status/media rights, and estimator currency/commercial assumptions. Decide whether prototype page routes should be excluded or protected in production. No release was attempted.
