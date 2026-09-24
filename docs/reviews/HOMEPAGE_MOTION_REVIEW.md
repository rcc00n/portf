> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# RACCN homepage: composition and motion pass

The approved Control Plane direction, homepage order, existing project evidence, and inquiry form remain in place. Local preview: http://127.0.0.1:8001/. Branch: `redesign/research-and-direction`. Nothing was deployed.

## Changes

| Area | Result |
| --- | --- |
| Beyond the interface | Three connected planes replace the six-node dashboard, readout, summary, and extra link inventory. One selected insight and one relevant deep link remain visible. |
| Systems interaction | Architecture, Admin-first, and Production rearrange the same geometry over 560ms. Routes remain attached throughout interrupted transitions. Nodes change the selected evidence and signal response. |
| Control Plane | Integrated geometric control, blue emission, four propagating routes, sequential terminal confirmation, and a blue material response. The connected state preserves the geometry; the same control returns to standby. |
| Work | Architectural crops resolve into complete project evidence. Edge rules and system-layer rules respond to scroll. The staggered screenshots now leave both captions readable. |
| Approach | The headline occupies the left field. A lightly inset decision sequence connects problem → system decision → implementation → production, with measured marker-to-marker signal progression. |
| Start | The entire large composition is one native link to the existing inquiry form. Background, incoming rule, and arrow respond together. Navigation focuses the inquiry region; the next Tab reaches Name. |

## Shared motion vocabulary

- **Ambient:** one scheduled, finite signal in the active visible section. Hero edge activity, Work evidence rules, the current decision marker, and the Start direction cue share the same restrained blue vocabulary. Ambient feedback yields to hover/focus.
- **Structural:** earlier hero separation and routing, project crop resolution, graph-triggered Surface → Control → Operation assembly, the decision route, and the final incoming Start rule.
- **Feedback:** integrated hero mechanism, morphing Systems topology, selected planes, project link response, and whole-card Start response.

The hero begins separating within the first small scroll movement. Systems observes the actual graph, so its progressive assembly is not consumed while only the section heading is visible. Primary content remains readable throughout; there is no repeated page-wide fade-up treatment.

## Visual review

The complete homepage was recorded at desktop and touch-mobile sizes, plus a separate slow desktop pass. Timed frames and complete-journey sheets were visually inspected. Review found and corrected:

1. Systems entrance firing before its geometry reached the viewport.
2. Marketplace captions being covered by the operator image as the crops resolved.
3. Start ambient arrow motion overriding hover/focus feedback.

The resulting sequence keeps the strongest color event in the hero, evidence dominant in Work, clear cause/effect in Systems, a lighter decision route in Approach, and one action at Start.

Recordings:

- [Desktop journey](homepage-review/motion-pass/homepage-desktop.webm)
- [Mobile journey](homepage-review/motion-pass/homepage-mobile.webm)
- [Slow desktop scroll](homepage-review/motion-pass/homepage-slow-desktop.webm)
- [Activation detail](homepage-review/motion-pass/activation-sequence.webm)

The automated capture environment can insert holds into recorded playback. Interaction durations were also checked in the live browser; recording wall time is not a performance measurement.

## Verification

- Production build and full ESLint pass.
- Layout inspected at 1440, 1280, 820, 390, and 360px; no horizontal overflow.
- Nine-point Start card hit coverage passes at every tested width. No nested interactive elements. Visible keyboard focus; native link Enter activation; touch and corner clicks navigate to the inquiry.
- Hero click/touch, Enter/Space, focus, repeated reset/reactivation, and rapid toggles pass.
- Systems tab arrows/Home/End, native button activation, node selection, intermediate geometry, and interrupted transitions pass.
- Reduced motion retains complete evidence and immediate active states; no hero or Systems travel animations.
- Scroll updates use coalesced event-driven frames. Systems uses a finite transition only, settling immediately when offscreen or hidden. Observers, listeners, timers, and pending frames clean up on unmount.
- All three performance profiles have zero requested/executed idle animation frames and zero root style mutations. Touch and reduced-motion profiles have zero ambient mutations. Desktop idle windows contain one finite ambient event.
- No page or HTTP errors in the final production measurements.

[Browser checks](homepage-review/motion-pass/journey-checks.json) · [Performance report](homepage-review/motion-pass/PERFORMANCE.md) · [Raw measurements](homepage-review/motion-pass/performance.json)

The local, unthrottled performance sample measured 465,647 encoded bytes initially and 712,959 after the full scroll. Desktop LCP was 488ms and emulated touch-mobile LCP 1,828ms. These are indicative lab samples, not field performance. Real hidden-tab behavior could not be established in headless Chromium; hidden-state handling was checked separately and documented in the performance report.
