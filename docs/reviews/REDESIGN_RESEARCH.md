> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# RACCN Code redesign — research, audit, and creative directions

Research date: 2026-09-21
Branch: `redesign/research-and-direction`
Stage: research only; no redesign implementation has begun

## Executive finding

RACCN Code currently has two different products inside it:

1. a generic studio/agency marketing shell; and
2. a much more distinctive body of engineering evidence: an architecture configurator, admin/customer views, a production-readiness checklist, an estimator, decision records, a case-study architecture diagram, and an interactive admin demo.

The second is the real opportunity. The redesign should position RACCN Code as an engineering practice that makes complex operational systems visible and controllable—not as another broad “software, CRM, marketing, SEO, branding, AI” agency.

The recommended direction is **Direction 1: Trace / Control Plane**: an editorial site organized around one procedural spatial system that turns inputs, decisions, and control surfaces into a recognizable RACCN visual language. It should borrow the reference site's continuity and restraint, not its styling.

## Baseline: what is actually in the repository

### Frontend

- React 19, Vite 7, React Router 6, Tailwind CSS 4, Framer Motion, and Lucide.
- Twenty-one meaningful frontend routes plus a catch-all.
- The main marketing application, most content, most route components, and much funnel logic live in a single 3,063-line `App.jsx`.
- Engineering routes and the admin demo are lazy-loaded. The admin demo is another 898-line component.
- The production build succeeds. The main JS bundle is 434.19 KB raw / 134.53 KB gzip; CSS is 50.73 KB raw / 8.96 KB gzip.
- Lint does not pass: two errors and one hook-dependency warning.
- There is no test suite.

### Backend and data

- Django 5 with `projects` and `leads` apps.
- Public read endpoints provide projects and pricing. Django admin is the CMS for project media, links, tags, ordering, publication, and pricing tiers.
- The contact endpoint stores leads and synchronously attempts Telegram notification.
- Production uses Postgres through `DATABASE_URL`; local defaults to SQLite.
- Frontend content falls back to hard-coded seeds when project or pricing APIs fail or return no records.
- Local seed projects and pricing do not match production. Production currently contains the stronger set: PDF Creator, Renter, MeatDirect, Bad Guy Motors, Malva Beauty Center, and Yummy.

### Deployment

- A multi-stage Docker build compiles Vite, copies the result into Django, serves static files with WhiteNoise, and runs Gunicorn.
- The configured remotes are GitHub `origin` and a Dokku production remote.
- Media is intended to be mounted persistently on Dokku.
- Two GitHub Pages workflows are nested under `app/.github`, so GitHub will not discover them from the repository root. Even if moved, their commands assume the package is at the root. They are stale deployment artifacts.
- A complete 21 MB backup Git repository (`app/.git.bak`) is tracked inside the main repository.

### Local baseline verification

- Frontend and backend were run locally together.
- All 21 important routes rendered with HTTP 200.
- Project modal, qualification state, architecture presets, admin/customer toggle, and mobile navigation were exercised.
- Sampled mobile routes had no horizontal page overflow.
- The Django system check passed; migrations and contact submission worked against a temporary database.
- The homepage is roughly 5,959 px tall on a 1440 × 1000 viewport and roughly 9,837 px on a 390 px-wide viewport.

## Current-site audit

### Worth preserving

- **The engineering modules.** Architecture Preview, Admin-First, Production Readiness, Estimator, Renter Architecture, public decision records, and the admin demo prove how RACCN thinks.
- **The admin-first point of view.** “Software as a control system, not only a customer-facing screen” is specific and credible.
- **The production CMS.** Projects, pricing, media, ordering, and published state are already editable without a deployment.
- **The qualification-to-contact flow.** Local persistence, fit feedback, pre-call material, and project summary form a useful lead journey, even though it currently has too many separate routes.
- **Progressive resilience.** Hard-coded fallback content prevents an empty site during API failure.
- **Lazy-loaded advanced routes.** The heaviest demos are not in the initial route bundle.
- **The architecture canvas implementation.** It redraws on state/size changes rather than maintaining an unnecessary render loop.
- **Responsive fundamentals.** The sampled routes reflow cleanly and the engineering diagram becomes a list on small screens.
- **The raccoon mark.** It can become a real RACCN identifier if redrawn, optimized, and paired with the actual name rather than the word “studio.”

### What feels generic or visually weak

- The brand is almost absent. The navigation says **studio**, while the hero's sales sentence is many times louder than RACCN Code.
- The first screen is a familiar centered SaaS/agency composition: two badges, large gradient headline, supporting sentence, three buttons, and a dark gradient field. There is no visual anchor with narrative value.
- Almost every section repeats the same max-width container, gradient heading, card grid, rounded corners, pills, and even spacing. Section topics change; the composition does not.
- Projects are presented as equal inventory cards. Their screenshots are small, cropped into carousels, and surrounded by tags and buttons. The actual work is visually subordinate to the component chrome.
- The site uses the system sans font everywhere. There is little typographic character, contrast of voice, or editorial pacing.
- Fuchsia/cyan gradient headings, glass-dark cards, glow, and pill-heavy taxonomy place the site in the same visual family as many generated developer portfolios.
- The fixed “Get estimate” button competes with content and obscures the mobile composition.
- `PERFORMANCE_MODE` disables most Framer Motion behavior, while the background animation keyframes are defined but not applied. The result is neither a considered static composition nor a meaningful motion system.

### What is unnecessarily complex

- Twenty-one routes create more surface area than the current information architecture earns.
- The homepage duplicates services, projects, process, pricing, stack, about, and contact pages.
- `/start`, `/contact`, `/estimate`, `/summary`, and `/pre-call` are related parts of one journey but feel like separate mini-products.
- Engineering material is split across several routes, while the powerful admin demo is not promoted proportionally to its value.
- `App.jsx` mixes content data, UI primitives, modal behavior, API integration, SEO mutation, analytics, routing, lead qualification, and page composition.
- There are two overlapping content sources: production CMS data and substantially different frontend seeds.
- The repository contains unused starter assets/CSS, a 10.6 MB raccoon GIF, duplicate deployment workflows, and a tracked nested Git history.

### Content and information architecture issues

- The current offer spans software, CRM, marketing, SMM, analytics, support, GTM, AI bots, branding, SEO, and ASO. That breadth weakens memorability and is not equally supported by the work shown.
- The strongest evidence points toward operational software, marketplaces, internal systems, admin control, and systems thinking.
- Production project descriptions contain useful operational detail but are too long for cards, inconsistently edited, and sometimes contain typos.
- The production projects and prices differ from local development, which makes visual work against the local fallback unreliable.
- Claims such as `3.1x`, `38%`, `27%`, `120+ releases`, `14+ years`, `15+ specialists`, `99.95%`, SOC2 readiness, HIPAA readiness, and 24/7 support are not substantiated in the repository. They must be verified, sourced, rewritten as qualified statements, or removed before the redesign.
- “Pricing” currently reads like inventory. For custom systems work it should be secondary to evidence, fit, and engagement shape.

### Recommended information architecture

Use four top-level destinations:

1. **Work** — three to five pieces of evidence, each given an appropriate composition and honest level of detail.
2. **Systems** — the best Engineering Lab modules, decision records, and admin-control demonstrations as one coherent body of thinking.
3. **Approach** — capabilities, operating principles, fit, and engagement model without an exhaustive service catalogue.
4. **Start** — one progressive intake containing qualification, estimate context, contact, and pre-call handoff.

The homepage should be four acts rather than a compressed sitemap:

1. signature RACCN statement and visual;
2. one flagship project as proof;
3. the engineering/control-plane idea as depth;
4. a direct, calm invitation to start.

Journal and decision records can live inside Systems. Pricing can be an Approach subsection or a concise engagement-range page. About should be factual and subordinate to the work.

### SEO, accessibility, and analytics

- Raw production HTML still says `Vite + React` and uses the Vite favicon. Meta tags are added only after JavaScript runs.
- The route title helper ignores its argument, so every route receives the same title: `Custom software & CRM delivery`.
- There is no canonical URL, sitemap, real `robots.txt`, structured data, or manifest. Because of the Django SPA catch-all, requests for `robots.txt`, `sitemap.xml`, and unknown paths return the app shell with HTTP 200.
- Social imagery is a 1.31 MB transparent logo, not a designed share image.
- The analytics utility writes to an in-memory browser queue but has no transport or persistence.
- Contact inputs have placeholders but no associated labels. Modal/menu focus is not trapped or restored. Project cards are interactive `div`s containing other interactive controls. There is no skip link. These need correction during structural work.
- Reduced-motion CSS exists for background layers, but most motion is globally bypassed through `PERFORMANCE_MODE` instead of providing an intentional reduced-motion variant.

### Performance and operational risks

- The 1.31 MB logo dominates the live homepage's initial transfer. It should be replaced with a compact SVG or optimized raster.
- Local project images range up to about 2.33 MB and do not use responsive sources, modern generated sizes, or an image pipeline.
- The unused raccoon GIF is 10.6 MB.
- The main route still ships a large monolithic bundle; route splitting does not address the homepage/component/data concentration.
- The synchronous Telegram call can hold a contact request for up to ten seconds per recipient. There is no queue.
- The CSRF-exempt contact endpoint has no visible rate limiting, bot protection, or server-side email validation beyond model storage.
- `npm audit --omit=dev` reports three high-severity findings in the installed React Router dependency chain with fixes available.
- Frontend lint is already failing, and there are no frontend or backend tests to protect a redesign.

## Reference analysis: why Kander works

The reference is effective because it sustains one visual thesis rather than accumulating components.

### What works

- **A complete visual world.** Pine, cream, and gold; engraved institutional/rural imagery; maps, rosettes, a crest, and documentary photography all belong to the same story.
- **A decisive first screen.** Desktop is a full-viewport binary choice between two audiences. The compositions, imagery, and tonal halves explain the offer before a visitor reads every line.
- **Editorial typography.** A light, large serif carries the message; a compact grotesk handles navigation, labels, and actions. Italic color changes emphasis without effects.
- **Compositional variation with continuity.** Split hero, spacious premise, evidence-led record, asymmetric image field, and paired closing choices are different layouts held together by the same grid, materials, and palette.
- **Evidence is large.** Photography, figures, names, and context are integrated into the page rather than reduced to thumbnail cards.
- **Motion has categories.** The opening has an entrance sequence; scroll transitions reveal the premise and record; figures count up; atmospheric canvas marks shift quietly; the mobile photo field becomes a horizontal swipe.
- **Mobile is re-authored.** The desktop split becomes two sequential full scenes, the evidence grid becomes a swipeable strip, and large type is recalibrated rather than simply scaled down.
- **Technical restraint.** The inspected homepage uses six canvases but only three small site scripts and roughly 21 initial resources. The custom atmosphere is not built from a large app framework.

### What should not carry over

- The opening scroll transition can leave an almost empty viewport between the hero and premise. The choreography is dramatic but occasionally over-extends the pause.
- Texture and low-contrast captions sometimes compete with readability.
- The homepage is long, and the mobile sequence makes visitors traverse an entire first audience path before seeing the second.
- Scroll-triggered content can appear absent in full-page captures or environments that do not generate normal scroll events. Important content should never depend on motion to exist.
- Four font families are loaded. RACCN should reach equivalent character with a tighter type system.
- The reference is intentionally centered on an individual consultant and a heraldic civic metaphor. Neither is right for RACCN Code.

## Three creative directions

## Direction 1 — Trace / Control Plane (recommended)

**Central visual idea**
A single procedural ribbon/topology makes invisible software behavior visible. It begins as a compact RACCN signal, unfolds into routes and control surfaces, frames project evidence, and resolves into a clear path to action. It represents complexity being turned into a system—not decorative “tech particles.”

**First-screen experience**
A full-bleed near-black canvas with **RACCN CODE** as the loudest text. A dimensional, cropped topology occupies most of the frame; one signal moves through it only after the page is ready. The promise is short and anchored to a quiet edge. One primary action opens Work; one secondary action opens Systems.

**Identity and typography**
RACCN Code is spelled out, supported by a simplified mask/signal mark derived from the same geometry. Use one distinctive variable grotesk for display/body and one compact mono for system labels. Palette: carbon, mineral white, and one sharp signal color.

**Composition and depth**
Large cropped fields, thin rules, off-grid annotations, and occasional orthographic depth. Calm editorial space separates the dimensional moments. The topology is not a background; it becomes the organizing edge or path of each section.

**Interactive/generative concept**
Cursor/touch slightly alters the nearest path. Scroll advances a small number of authored states: signal, decomposition, control, evidence, resolution. Each project uses a frozen variation of the system as its own frame.

**Projects/work**
One flagship project receives a cinematic, near-full-width treatment. Later projects alternate between image, architecture, and admin evidence. Outcomes appear only when verifiable. Tags move to supporting captions, not primary UI.

**Motion language**
- Ambient: a very slow material/signal drift that stops when off-screen.
- Structural: authored topology state changes between page acts.
- Feedback: precise line tension, label reveal, and image-edge response on hover/focus.

**Later sections**
The same form becomes an architecture path in Systems, a crop/frame in Work, and a single resolved line in Start. This continuity is the lesson worth taking from Kander.

**Mobile**
Use a precomputed static or low-cost 2D state for the hero, then a vertical trace rail that connects the acts. Replace pointer deformation with tap/focus reveals. No permanent render loop.

**Why it fits**
The existing architecture map, admin control story, and decision records already describe systems as flows and control surfaces. This direction turns that real content into identity.

**Technical implications**
- Prototype the visual in Canvas 2D/SVG first. Use WebGL only if material depth cannot be achieved otherwise.
- If WebGL is justified, isolate and lazy-load it, cap device-pixel ratio, pause when hidden, render only on state/input changes, and ship a static SVG/poster fallback.
- Split the current app into route/content modules before integrating scroll state.
- Moderate-to-high visual engineering effort; moderate content effort.

## Direction 2 — Executable Editorial

**Central visual idea**
RACCN Code behaves like a living specification: assertive typography, decisions in the margins, large project evidence, and an interactive layer that switches between “what it does” and “how it works.” No 3D is required.

**First-screen experience**
An oversized, edge-to-edge **RACCN / CODE** word composition acts as the poster. A short statement occupies one column; a project image or architecture fragment cuts through the type. Scrolling turns the assertion into annotated evidence.

**Identity and typography**
A hard-edged grotesk paired with either a precise text serif or technical mono. Black and warm paper with one vermilion or cobalt accent. The raccoon mark becomes a small editorial stamp, not a mascot.

**Composition and depth**
Asymmetric columns, rules, folios, marginal notes, large image crops, and occasional overlays create depth through typography and scale rather than simulated space.

**Interactive/generative concept**
A mode switch or hover/focus layer reveals system annotations, decisions, and constraints around the same project image. On scroll, key phrases recompose rather than simply fade in.

**Projects/work**
Projects become dossiers. Each has a different evidence structure: product surface, control surface, architecture, then verified result. The page can support different amounts of proof without forcing equal cards.

**Motion language**
- Ambient: almost none.
- Structural: typesetting/reflow, rule wipes, and image masks.
- Feedback: annotations and footnotes connect to the evidence they explain.

**Later sections**
Decision records, journal entries, and production checklists naturally become the editorial middle of the site. Start reads as a concise brief rather than a sales funnel.

**Mobile**
Margins become inline notes, spreads become stacked sequences, and image/text crops are authored per breakpoint. No interaction is hover-only.

**Why it fits**
RACCN already has unusually strong written engineering opinions. This direction gives those opinions visual authority and is the least dependent on unproven media or graphics technology.

**Technical implications**
- Mostly DOM/CSS/SVG; existing Framer Motion is sufficient.
- Requires font selection/subsetting, a strong content schema, and careful art direction of screenshots.
- Lowest runtime and GPU risk; highest dependence on editing and typography quality.
- Moderate implementation effort; high content-design effort.

## Direction 3 — Systems Exhibit

**Central visual idea**
The website is a guided exhibit of one working system. Visitors choose a problem state, then watch the same system expose its customer experience, admin controls, architecture, failure modes, and delivery decisions.

**First-screen experience**
RACCN Code leads above one large interactive stage—one diagram, one control rail, one active narrative. A visitor can choose “marketplace,” “operations,” or “commerce” and see the stage reconfigure.

**Identity and typography**
Industrial grotesk plus restrained mono. Bone, graphite, and a single cobalt/green state color. The mark is a compact system glyph generated from the currently selected state.

**Composition and depth**
The main stage is spacious and diagrammatic, with evidence panels entering only when relevant. It should resemble a museum exhibit or technical cutaway, not a dashboard.

**Interactive/generative concept**
Reuse and elevate the existing Architecture Preview and Admin-First logic into the site's central narrative. A state change propagates across interface, data, control, and proof.

**Projects/work**
Projects become named system states rather than cards. Selecting one changes the central exhibit; deeper case pages preserve unique media and decisions.

**Motion language**
- Ambient: nearly none.
- Structural: diagram re-routing, state propagation, and controlled layer transitions.
- Feedback: immediate selection states and traceable cause/effect.

**Later sections**
The hero stage gradually becomes the Systems Lab, then hands off to case-specific evidence and the intake tool. The site feels like one coherent instrument.

**Mobile**
Turn the stage into a step-by-step vertical narrative. Replace drag/drop and wide diagrams with explicit state steps and progressive disclosure.

**Why it fits**
It makes the existing interactive modules central and demonstrates engineering through use rather than claims.

**Technical implications**
- Build a shared, data-driven case/system model and a small state machine.
- Recompose Architecture Preview, Admin-First, Estimator, and Admin Demo rather than duplicating them.
- SVG/Canvas is sufficient; no 3D dependency is necessary.
- Strong accessibility and interaction testing is required because meaning changes dynamically.
- Moderate-to-high restructuring effort. The primary design risk is accidentally looking like a dashboard.

## Recommendation

Proceed with **Trace / Control Plane**, using the editorial discipline of Direction 2.

### Visual thesis

A precise carbon-and-mineral editorial environment where one dimensional signal turns operational complexity into visible, controlled systems.

### Content plan

1. **Hero:** RACCN Code, a short operational-software promise, and the signature topology.
2. **Proof:** one flagship project with large real media and honest evidence.
3. **Depth:** Systems Lab—architecture, admin control, readiness, and decisions integrated into one story.
4. **Final action:** a calm progressive brief that carries context into contact.

### Interaction thesis

1. One authored entrance assembles the RACCN signal and wordmark.
2. Scroll moves the signal through three or four meaningful states tied to page acts.
3. Hover/focus/tap exposes causal annotations around project and systems evidence.

This recommendation is stronger than a purely graphic concept because the visual metaphor already exists in the product's best material. It is also safer than making the whole site an interactive tool: the editorial layer keeps the work readable when animation is stopped or advanced rendering is unavailable.

## Preconditions for implementation

Before visual implementation begins:

1. Confirm the positioning: operational software and controllable systems versus the current broad agency offer.
2. Choose the three to five projects allowed to lead and export representative production content/media for local development.
3. Verify or remove every quantitative, staffing, uptime, certification, compliance, and support claim.
4. Approve the top-level information architecture and whether public pricing remains prominent.
5. Decide whether Direction 1 should be prototyped first in Canvas 2D/SVG or whether a small WebGL material study is justified.
6. Establish performance budgets and static/reduced-motion fallbacks before accepting a graphics implementation.

No redesign code, dependencies, or production configuration were changed during this stage.
