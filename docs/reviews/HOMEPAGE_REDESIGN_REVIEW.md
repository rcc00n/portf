> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# RACCN Code homepage — visual review

## Review URLs

- Development: `http://127.0.0.1:5173/`
- Production build preview: `http://127.0.0.1:4173/`
- Branch: `redesign/research-and-direction`

Nothing was deployed or pushed.

## Captures

### Desktop

- [Full homepage](homepage-review/final/desktop/homepage-full-1440.png)
- [Hero](homepage-review/final/desktop/hero-1440.png)
- [Hero to Work](homepage-review/final/desktop/hero-work-1440.png)
- [Work](homepage-review/final/desktop/work-1440.png)
- [Systems](homepage-review/final/desktop/systems-1440.png)
- [Approach](homepage-review/final/desktop/approach-1440.png)
- [Start](homepage-review/final/desktop/start-1440.png)

### Mobile

- [Full homepage](homepage-review/final/mobile/homepage-full-390.png)
- [Hero](homepage-review/final/mobile/hero-390.png)
- [Hero to Work](homepage-review/final/mobile/hero-work-390.png)
- [Work](homepage-review/final/mobile/work-390.png)
- [Work evidence](homepage-review/final/mobile/work-evidence-390.png)
- [Systems](homepage-review/final/mobile/systems-390.png)
- [Approach](homepage-review/final/mobile/approach-390.png)
- [Start](homepage-review/final/mobile/start-390.png)

### Motion

- [Complete homepage flow recording](homepage-review/final/raccn-homepage-flow.webm)

## Hero choreography

The first viewport begins as one assembled object: RACCN CODE, the stacked control planes, active route, and solid route index share the same geometry. The opening sequence assembles the three planes, establishes the wordmark, then enables the live route.

Native scroll advances four authored states:

1. **Assembled** — a composed brand object with one active input route.
2. **Exposed** — the rear and middle planes separate to reveal hierarchy.
3. **Route** — the core widens, the aperture tightens, and the active signal changes from input to policy/output.
4. **Handoff** — the object reframes and crops into a vertical blue route that crosses the surface change into Work.

Pointer movement activates the nearest conceptual route quadrant—input, policy, output, or audit—instead of moving the entire object. The route index is on an opaque carbon field, so navigation, annotations, and geometry no longer compete for the same contrast layer.

## One Control Plane through the page

- **Hero / assembly:** a dimensional stack makes complexity visible.
- **Work / evidence:** the exit route becomes the frame for Renter, whose customer and operator interfaces overlap as two surfaces of one system.
- **Systems / causality:** the plane becomes a selectable operating map. Architecture, admin-first control, and production readiness are modes rather than six unrelated links.
- **Approach / simplification:** the map is reduced to one route and four concrete engineering decisions.
- **Start / resolution:** the route terminates at one project-start path, with the estimator as a quieter alternative.

## Motion behavior

- **Ambient:** a low-rate signal and sub-pixel layer tension run only on fine-pointer desktop while the hero is visible. The update loop is approximately 15 Hz and stops off-screen or when the tab is hidden.
- **Structural:** native scroll updates the authored hero, section-route, and system-draw states in one animation-frame batch. There are no pinned blank ranges and no scroll hijacking.
- **Feedback:** route quadrants respond locally to pointer/focus; Systems tabs and nodes reroute the diagram and update the selected readout.

Touch removes the ambient loop and turns the systems map into a vertical, tappable signal path. Mobile keeps the same authored states with simpler crops rather than reproducing the desktop stage at lower resolution.

Reduced motion retains the complete static composition. It removes entrance/ambient animation and changes structural states at deliberate thresholds instead of continuously interpolating them.

## Performance observations

Measured against the local production build in headless Chromium, without CPU or network throttling:

- Initial transfer: **185.2 KB**, including HTML, route JS/CSS, three local font files, favicon, and the projects request.
- Transfer after all four deferred project images load: **427.9 KB**.
- Homepage route chunk: **8.00 KB gzip JS** and **7.20 KB gzip CSS**.
- Shared application runtime: **67.72 KB gzip JS** and **8.97 KB gzip CSS**.
- Project images: **247.3 KB total** across four WebP files; none load in the first viewport.
- FCP/LCP in the local run: **508 ms desktop**, **420 ms mobile**.
- CLS: **0** on desktop, touch mobile, and reduced-motion runs.
- JS heap after a complete scroll: approximately **2.5 MB desktop** and **2.3 MB mobile**.
- Desktop ambient work: about **15 style batches/second** while the hero is visible, **0** after it leaves view.
- Touch and reduced motion: **0 ambient style batches**.
- A 3× DPR touch run produced no long task during the complete scroll.
- The homepage uses SVG/CSS/DOM only: **no canvas, WebGL, Three.js, or graphics dependency** and no DPR-sized framebuffer.
- The legacy 1.31 MB logo remains emitted by the legacy application bundle but is not requested by the redesigned homepage.

The unthrottled desktop run recorded one 57 ms initial task and one 50 ms task during an aggressive scripted scroll; touch and reduced-motion runs recorded none. Physical-device profiling remains a production-integration check.

## Existing functionality preserved

- CMS project fetch from `/api/projects/`, with curated visual fallbacks when the API is unavailable.
- Contact creation through `/api/contacts/`, including server-side validation and the existing lead/Telegram path.
- Successful contact handoff to `/pre-call?source=homepage`.
- Existing analytics page-view and CTA events.
- Existing project index and all deeper engineering routes: Architecture Preview, Admin-First, Production Readiness, Admin Demo, Estimator, Decision Records, and the Renter architecture case.
- All legacy routes remain lazy-loaded through the existing `App.jsx` router.
- Django models, endpoints, admin, CMS, and migrations are unchanged.

The Django system check passed. The project and contact endpoints were also exercised against a migrated temporary SQLite database: project list `200`, invalid contact `400`, and valid contact `200` with a persisted lead.

## Old homepage structures no longer used at `/`

- The monolithic legacy `App.jsx` homepage path.
- Centered SaaS hero, gradient headings, badge/pill clusters, and technology-logo cloud.
- Uniform project-card grid, carousel/modal treatment, service catalogue, pricing act, and oversized About act.
- Glass-card visual treatment and generic icon-card sections.
- Floating fixed sales CTA.
- Legacy header/footer and oversized raster logo.
- Framer Motion on the homepage.

The redesigned root is split into homepage acts, the Control Plane, shared motion logic, Systems instrument, start form, and data adapter. Legacy routes still use `App.jsx` until their own integration phase.

## Remaining weaknesses before production integration

1. Test the motion and font rendering on physical iOS Safari, low-end Android, and macOS Safari; current visual review covers Chromium at 1440 px, 1024 px, 390 px, reduced motion, touch, and 3× DPR.
2. Review the two secondary Work selections against live CMS content. Their titles, blurbs, and links merge from production data, but their homepage crops are intentionally curated local media.
3. Run the contact success path once against a staging copy of the real production database and notification configuration. The endpoint contract is verified locally; production credentials were intentionally not used.
4. Add final social-share art and page-specific canonical metadata during production integration. The static title, description, theme color, and RACCN favicon are in place.
5. Deeper public routes retain the old visual system by design. They work, but their transition from the new homepage should be art-directed in the next approved phase.
