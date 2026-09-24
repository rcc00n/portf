> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# RACCN Code — homepage refinements and public-route review

22 September 2026. Phase 1 implemented; Phase 2 audited and proposed. **Stopped at the requested route-review checkpoint. No deployment, route merge/deletion, redirect, database migration, or backend removal.**

Local built preview: http://127.0.0.1:8001/ · Form: http://127.0.0.1:8001/#project-inquiry · Vite development: http://127.0.0.1:5173/

## Approved foundation preserved

The homepage structure, Control Plane SVG geometry, choreography, motion timing, route delays, scroll thresholds, toggle/reset behavior, and `useHomeMotion.js` are preserved. This is a refinement of the approved composition, not a new design. All other public pages remain available in their current form for route review.

The visible CONNECT / CONNECTED label is removed with no replacement text CTA. The integrated geometric control keeps its cursor, focus affordance, accessible name/instructions, pressed state, click/touch, Enter/Space activation, and same-control return to standby.

## Color behavior

A small signal palette augments existing movement:

| State | Color | Role |
| --- | --- | --- |
| Identity/input | `#5264ff` | Existing RACCN blue |
| Contact/activation | `#344bea` | Cobalt initiates the signal |
| Processing/policy | `#7461bd` | Muted violet marks processing |
| Receipt/output | `#518fa2` | Cool cyan confirms receipt |
| Resolution/audit | Cobalt + `#e7e8dd` | Settled active geometry with mineral contacts |

Activation interpolates cobalt → violet → cyan → cobalt. Emission, routes, terminals and layer responses receive the related colors inside their existing animation windows. The center/edge color clock reuses the existing 850ms layer confirmation with its 220ms delay. Existing scroll states receive corresponding colors without changing scroll progression. Reduced motion resolves directly to clear static states.

[Color recording](homepage-review/site-phase-one/color/control-plane-color-desktop.webm) · [Cobalt](homepage-review/site-phase-one/color/01-contact-cobalt.png) · [Violet](homepage-review/site-phase-one/color/02-processing-violet.png) · [Cyan](homepage-review/site-phase-one/color/03-receipt-cyan.png) · [Resolved](homepage-review/site-phase-one/color/04-resolved-cobalt.png) · [Preservation evidence](homepage-review/site-phase-one/color/preservation-check.json)

The color recording and sampled frames were visually reviewed. [Detailed behavior and checks](homepage-review/site-phase-one/color/CONTROL_PLANE_COLOR_REVIEW.md).

## Evidence and conversion emphasis

- The hero positioning uses plainer language about what RACCN builds.
- Renter's marketplace identity has stronger copy hierarchy. Its existing case link now says “Explore the Renter case,” with a stronger blue rule and more confident target/typography. Evidence captions are slightly more legible; large imagery and existing project motion remain in place.
- Systems gives more contrast to the core differentiator: the controls, architecture, and operations behind the surface. Selected system insight headings and existing evidence links receive slightly stronger hierarchy.
- Start has clearer invitation copy, stronger cue contrast, and one concise form promise: send project context; RACCN replies by email about the next step. No new CTA inventory, statistics, badges, or claims were added.

Final views: [Work desktop](homepage-review/site-phase-one/final/work-1440.png) · [Systems desktop](homepage-review/site-phase-one/final/systems-1440.png) · [Start desktop](homepage-review/site-phase-one/final/start-1440.png) · [Start mobile](homepage-review/site-phase-one/final/start-390.png).

## Three native input surfaces

All three entire Name / Email / Project regions are native encompassing labels. Number, label, helper text, and padding focus the corresponding native control. Clicking actual text retains native caret placement. Tab follows native controls without wrapper tab stops.

Hover/focus activates the structural blue rule and subtle background, with stronger label/number contrast. Valid nonempty fields gain a small completed marker; a valid form strengthens the existing submit border. All three fields stay visible and required. No additional required fields were introduced.

The pending request uses an indeterminate signal along a rule, disables duplicate submission, and keeps inputs read-only. Confirmed success resolves the route to an endpoint and says RACCN will review the context and reply by email. Error, timeout, and unconfirmed responses keep entered values. Field errors focus the relevant control; general error/success explanations receive focus and status announcements. Reduced motion uses static progress/confirmation.

[Desktop focus/completed](homepage-review/site-phase-one/final/form-focus-completed-1440.png) · [Mobile focus/completed](homepage-review/site-phase-one/final/form-focus-completed-390.png) · [Hover](homepage-review/site-phase-one/form/desktop-hover-completed.png) · [Submitting](homepage-review/site-phase-one/form/desktop-submitting.png) · [Error](homepage-review/site-phase-one/final/form-error.png) · [Success](homepage-review/site-phase-one/final/form-success.png) · [Form recording](homepage-review/site-phase-one/form/form-states-desktop.webm)

Isolated form screenshots hide fixed header/skip-link chrome only during capture so it does not overlay a taller-than-viewport element image. Application styles remain unchanged. Touch testing used a mobile browser context; a physical device virtual keyboard was not tested.

This refined form is on the homepage. The old `/start` qualification and `/contact` presentation deliberately remain until the route proposal is reviewed; the proposal makes this three-field form the shared canonical `/start` experience.

## Validation

- `npm --prefix app run lint` — passed.
- `npm --prefix app run build` — passed.
- [77 focused form checks](homepage-review/site-phase-one/form/checks.json) — desktop/tablet/touch, six hit regions per field, native names/caret/Tab behavior, all submission states, timeout, retry, and reduced motion.
- [72 final production-build integration checks](homepage-review/site-phase-one/final/integration-checks.json) — 1440, 1280, 820, 390 and 360px, full Start card and field interaction, Control Plane Enter/Space/reset, reduced motion, error retention and success, real HTTP 404. No page/console errors or document horizontal overflow.
- All submission requests were intercepted. **No real inquiry or external message was sent.**
- Route inventory rendered all 28 known page URLs and two invalid probes on desktop/mobile. No console errors; development showed only existing React Router future warnings. Local CMS APIs are empty, so legacy project/pricing review used existing fallback content rather than verified production inventory.

## Route proposal and owner review

The complete [public-route audit and proposed map](SITE_ROUTE_AUDIT.md) lists every discovered page, utility/API/asset pattern, recommended redirect, retained backend capability, visual/interaction issue, and owner decision.

24 public URLs: **10 KEEP / 11 MERGE / 2 RETIRE-REDIRECT / 1 DEMO**. Four prototype pages are separately INTERNAL. Proposed hierarchy: Work → real case evidence; Systems → architecture/control/production/decisions plus optional labelled demo; Approach → scope/method/fit/engagement; Start → simple first contact plus optional `/start/define`; Privacy and Terms.

Use direct 301 redirects only after replacement pages exist and are approved. Preserve useful estimator/query/storage context and proper 404s. Keep the live `/prototype/media/` and `/prototype/fonts/` assets even if prototype page routes are later archived.

Owner review is needed on the route map, real service/practice scope, project roles/status/media rights, price/currency assumptions, engineering and legacy marketing claims, demo/prototype publication, and outstanding legal/contact facts. Unsupported legacy metrics and compliance promises should not be carried into the redesigned pages without evidence.
