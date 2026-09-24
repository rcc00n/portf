> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# RACCN Trace / Control Plane — visual prototype review

> Historical exploration record. Control Plates (Study 02) was approved and has since been developed into the polished motion prototype documented in `PROTOTYPE_2_MOTION_REVIEW.md`.

Status: local prototype only. No production routes, backend, CMS, or full-site information architecture were redesigned.

## Review routes

- `/prototype` — study index
- `/prototype/braided-signal` — Study 01
- `/prototype/control-plates` — Study 02
- `/prototype/routing-index` — Study 03

Run from `app/` with `npm run dev`, then open the routes on the local Vite URL.

## Study 01 — Braided Signal

![Braided Signal desktop](prototype-review/screenshots/braided-signal-1440.png)

**Visual thesis.** An authored field of paths crosses, separates, and resolves around one active decision route. RACCN CODE is anchored at the lower edge as the control point rather than floated over a decorative background.

**Motion and interaction.** A single restrained signal traverses the active path. Pointer proximity applies a small local deflection without turning the field into a toy. On scroll, the topology progressively flattens and exits as the route that introduces Work.

**Technology.** Canvas 2D for the authored spline system; DOM typography and annotations; an SVG static fallback. No graphics dependency and no WebGL.

**Mobile.** The system becomes a deliberate vertical crop. The trace density remains visible, pointer response and continuous rendering are disabled, and the wordmark/copy reorganize around the lower trace field.

## Study 02 — Control Plates

![Control Plates desktop](prototype-review/screenshots/control-plates-1440.png)

**Visual thesis.** A system is expressed as a stack of infrastructure, control, and interface planes. The central blue aperture is the controlled surface: one strong geometric object with a technical cutaway character.

**Motion and interaction.** The planes settle once into alignment. After the entrance resolves, the composition is static; only the local navigation feedback remains. The guide line becomes the Work-section route.

**Technology.** Authored inline SVG geometry plus CSS/DOM type. No continuous JavaScript and no graphics dependency.

**Mobile.** The object is enlarged and cropped as a cover image rather than miniaturized. Labels yield to the form, while the wordmark and short premise occupy the lower field.

## Study 03 — Routing Index

![Routing Index desktop](prototype-review/screenshots/routing-index-1440.png)

**Visual thesis.** RACCN becomes an editorial system map. Orthogonal routes, precise junctions, oversized type, and generous negative space treat technical structure as publication design instead of interface chrome.

**Motion and interaction.** Routes draw once in a controlled structural reveal and their nodes resolve locally. There is no ambient animation. The active red route carries directly into the dark Work field.

**Technology.** Inline SVG routing geometry, DOM typography, and CSS. No continuous JavaScript and no graphics dependency.

**Mobile.** The map is re-authored as a tall crop with the wordmark attached to a major intersection. Secondary annotations are removed; the route and evidence transition remain intact.

## Comparison

| Criterion | Braided Signal | Control Plates | Routing Index |
| --- | --- | --- | --- |
| Distinctiveness | Strongest; uncommon authored trace field | Strong, but isometric layers are a more familiar visual form | Strong editorial signature |
| RACCN brand potential | Strongest balance of complexity, routing, and control | Clear control metaphor, slightly narrower in meaning | Highly ownable if typography and grid stay disciplined |
| Visual quality | Deepest and most atmospheric | Most object-like and dimensional | Most restrained and typographically integrated |
| Immediate clarity | Expressive first, legible through annotations | Most literal systems metaphor | Clearest hierarchy |
| Technical feasibility | Low risk, small custom renderer | Lowest risk | Lowest risk |
| Runtime cost | One capped, visibility-aware canvas loop | Static after entry | Static after entry |
| Mobile adaptation | Strong crop; static by design | Strong crop; some depth is intentionally reduced | Strongest native mobile translation |
| Site-wide extension | Excellent: paths can change state and organize content | Good: layers can frame systems/case studies | Excellent: routes can become the site grammar |

## Recommendation

Proceed with **Braided Signal** as the signature RACCN system, disciplined by the spacing, typographic economy, and route logic of **Routing Index**.

Braided Signal has the greatest chance of becoming recognizable without collapsing RACCN into one software category. Its paths can represent marketplaces, SaaS, AI systems, commerce, internal tools, and control-heavy engineering work equally well. Routing Index should provide the calmer editorial rules around it: fewer labels, precise alignment, controlled red/orange use, and long quiet intervals. Control Plates is valuable as a possible secondary illustration language for Systems, but it is not as flexible as the primary identity.

## Measured performance observations

Measurements were taken from the local production build in Chromium at 1440 × 1000.

- Prototype-specific output: **5.44 kB gzip JavaScript** and **4.79 kB gzip CSS**.
- Measured first-view resource bodies: **173,710 bytes** per study, including the shared React/router runtime, global CSS, prototype code, and both local font families.
- Existing application code is now a separate lazy chunk and is not requested by a prototype route.
- Project media totals **152,502 bytes** and is deferred until the relevant Work image intersects the viewport. Neither image is requested in the hero-only first view.
- No WebGL, Three.js, React Three Fiber, animation library, or other graphics dependency was added.
- Braided Signal caps device pixel ratio at **1.5**, targets an intentionally low-frequency ambient loop (about **20 redraws/second** on a 60 Hz display), pauses outside the viewport or when the document is hidden, and stops continuous rendering for coarse pointers or reduced motion.
- Control Plates and Routing Index have no continuous render loop. Their CSS/SVG structural reveals finish once.
- Five cold Braided Signal runs produced no long task in three runs and a single borderline 52–55 ms startup task in two. This is acceptable for a prototype, but the primary study should remain under observation on physical mid-range mobile hardware before production adoption.
- The legacy 1.31 MB logo remains in the existing build output but is not requested by any prototype route. The prototype uses a lightweight inline brand glyph instead.

## Reduced motion and fallback

- `prefers-reduced-motion: reduce` collapses all structural CSS motion to a one-frame resolve.
- Braided Signal draws a static composed state and performs no continuous canvas loop under reduced motion or on coarse-pointer devices.
- A complete SVG trace composition sits behind the canvas as a no-canvas/static fallback.
- The composition, typography, hierarchy, and Work transition remain understandable with all motion stopped.

## Extending the chosen system

- **Work:** an active route selects evidence, then flattens into the project’s caption, image edge, timeline, or architecture diagram. Different projects may use different crops and densities without becoming a uniform card grid.
- **Systems:** the trace can separate into named layers and decision states. Control Plates can appear selectively where a cutaway is more useful than a route map.
- **Approach:** routes can expose checkpoints, constraints, and trade-offs as an editorial sequence, with one state change per meaningful step rather than scroll-triggered decoration.
- **Start:** the field can resolve to one clean terminal/control point. Interaction should become simpler here: a focused invitation and contact path, not a generic conversion panel.

## Additional captures

- [Desktop comparison](prototype-review/screenshots/desktop-comparison.png)
- [Tablet comparison](prototype-review/screenshots/tablet-comparison.png)
- [Mobile comparison](prototype-review/screenshots/mobile-comparison.png)
- [Hero-to-Work comparison](prototype-review/screenshots/transition-comparison.png)
- [Mobile hero-to-Work comparison](prototype-review/screenshots/mobile-transition-comparison.png)
