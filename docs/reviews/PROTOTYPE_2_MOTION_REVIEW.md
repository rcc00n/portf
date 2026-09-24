> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# RACCN Control Plane — motion prototype review

Status: approved identity prototype, polished locally. No full-site restructuring, backend work, deployment, or production integration was performed.

## Local route

- `http://127.0.0.1:5173/prototype/control-plates`

Run from `app/` with `npm run dev` if the local server is not already active.

## Final composition

The approved system remains intentionally sparse: RACCN CODE, one dimensional control object, three system labels, one premise, and one route into Work. The previous study switcher was removed from the approved route, and its header now identifies the visual as `SYSTEM 01 / CONTROL PLANE` rather than as an experiment.

- [1440px hero](prototype-review/approved-control-plane/hero-1440.png)
- [1024px hero](prototype-review/approved-control-plane/hero-1024.png)
- [390px hero](prototype-review/approved-control-plane/hero-390.png)
- [1440px hero-to-Work transition](prototype-review/approved-control-plane/work-transition-1440.png)
- [390px hero-to-Work transition](prototype-review/approved-control-plane/work-transition-390.png)
- [Short motion capture](prototype-review/approved-control-plane/control-plane-motion.webm)

## Motion system

### Ambient

- Rear, middle, and interface planes move through separate very-low-amplitude tension cycles rather than floating as one object.
- One short light signal travels slowly around the blue control surface.
- The loop is visibility-aware, pauses with the tab, stops when the hero leaves the viewport, and is never run on touch/coarse-pointer devices or under reduced motion.
- Ambient updates are scheduled at roughly 15 Hz. The motion is slow enough that a higher render frequency did not produce a meaningful visual gain.

### Structural

- The opening is a short authored assembly: layers settle in order, the RACCN identity establishes as one unit, and supporting information follows. It never blocks input.
- A session marker shortens the entrance after the first visit in the same browser session.
- Native scroll advances one deterministic state value. The rear layers release first, the middle control layer follows, and the interface plane remains as the stable surface.
- As Work enters, the blue system guide crosses the fold, turns horizontally, and becomes the project-section organizing line.
- The first project media resolves from a more severe isometric crop into its final evidence composition. The project is large, not contained in a card.

### Feedback

- Pointer proximity produces a maximum eight-pixel response in the complete object and a smaller local lift in the nearest interface plane.
- The designed state is never displaced enough to lose its composition.
- Hovering or focusing the `Resolve the layers` action strengthens the active signal locally.
- Touch removes pointer simulation; the opening and scroll states carry the interaction character instead.

## Hero-to-Work transition

The transition uses depth as hierarchy. Infrastructure and control layers separate while the interface plane is retained, then the blue guide becomes the Work route. The off-white project field enters beneath that guide, and the real Renter marketplace interface resolves from the same angled geometry. The result does not depend on a fade-out/fade-in handoff and remains legible if JavaScript motion is unavailable.

## Mobile behavior

- The plate is deliberately enlarged and cropped; it is not a scaled-down desktop object.
- RACCN CODE moves to a lower poster-like field with the project premise aligned beside it.
- The continuous ambient controller is disabled on touch devices. The one-time entrance and direct scroll states remain.
- The blue route continues into Work at the mobile crop, and the project image retains an angled evidence treatment.
- Verified at 390 × 844 with touch/coarse-pointer emulation and no horizontal overflow.

## Reduced motion

- The full static composition is preserved.
- Opening animations resolve in one frame.
- Ambient tension and the travelling perimeter signal stop completely.
- Scroll uses a deliberate two-state change: assembled hero before the transition threshold, resolved Work handoff after it. It does not continuously interpolate geometry.
- Smooth scrolling is disabled for this preference.

## Measured performance

Measurements were taken from the local production build in headless Chromium at 1440 × 1000. Headless figures are directional, not a replacement for physical-device profiling.

- Prototype-specific output: **6.79 kB gzip JavaScript** and **5.44 kB gzip CSS**.
- Measured first-view resource bodies: **175,708 bytes**, including the shared runtime, global CSS, local fonts, and prototype code.
- The two Work images total **152,502 bytes** and are not requested in the hero-only first view. They load individually as they intersect.
- No WebGL, Canvas, Three.js, animation library, or graphics dependency is used by Control Plane. Rendering is SVG, CSS transforms, and DOM composition.
- Three desktop steady-state samples over three seconds produced a median **46 scheduled frames**, **329 style-property writes**, **10.1 ms script time**, **2.5 ms layout time**, **83.8 ms style-recalculation time**, and **138.0 ms total main-thread task time**.
- That steady ambient cost is approximately **4.6% of one main thread** in the test environment; script execution itself is approximately **0.34%**. Most measured cost is style/compositing preparation for the SVG transforms.
- The controller produced **zero frames and zero style writes** during steady state on touch/mobile and reduced-motion contexts.
- Once the hero was fully off-screen, the controller produced **zero frames and zero style writes**.
- Production-page JS heap after settling measured approximately **2.26 MB used / 3.41 MB allocated**, with 175 DOM nodes and 149 layout objects.
- One borderline 67 ms startup long task appeared in one of three cold samples; the other two samples had none. No long tasks appeared in the steady measurement window itself.
- Device-pixel ratio is not multiplied into a raster canvas because the signature object is vector SVG. The primary GPU-sensitive operation is one restrained SVG drop shadow.
- The legacy 1.31 MB logo remains in the existing application build output but is not requested by this route.

## Validation

- Production build passes.
- Prototype source passes targeted ESLint.
- Browser checks at 1440 × 1000, 1024 × 900, and 390 × 844 produced no console errors and no horizontal overflow.
- Pointer response, focus styling, touch behavior, deferred media, off-screen pause, reduced-motion state changes, and the hero-to-Work scroll sequence were exercised in-browser.

## Remaining weaknesses before full-site integration

1. The SVG drop shadow and scroll-linked SVG transforms should be profiled on a physical mid-range Android device and an older iPhone. Headless Chromium cannot establish real mobile GPU cost.
2. Safari needs a dedicated visual pass for SVG transform origins, font metrics, and the local `:has()` focus enhancement. The composition does not depend on `:has()`, but the feedback polish does.
3. The Renter screenshots prove the evidence transition, but final case-study art direction still needs image selection and crop decisions when the complete Work narrative is designed.
4. The shared application runtime and global stylesheet remain on the prototype route. Full integration should decide whether to preserve that shell or split the future public experience more aggressively.
5. The existing oversized production logo should be retired before this identity is integrated into the live site.
