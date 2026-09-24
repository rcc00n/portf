> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# Control Plane color refinement

Visual thesis: preserve the approved carbon-and-mineral architectural object while a small family of mineral signal colors makes its existing activation legible.

Content plan: the existing hero and page remain in place; remove the literal center cue and let the geometric contact be the interaction affordance.

Interaction thesis: cobalt initiates contact, muted violet marks processing, cool cyan confirms receipt, and the object resolves to cobalt with mineral contact marks. Interpolate color inside the existing activation windows without changing any path, transform, duration, delay, scroll progression, event, or toggle behavior.

Palette: identity blue `#5264ff`, active cobalt `#344bea`, processing violet `#7461bd`, receipt cyan `#518fa2`, mineral `#e7e8dd`.


Implemented:

- The visible `CONNECT` / `CONNECTED ↺` SVG text node is removed. No substitute CTA label was added.
- Existing semantic button role, accessible names, instructions, focus ring, cursor, click/touch, Enter/Space, toggle and reset remain unchanged.
- Activation now interpolates cobalt → violet → cyan → cobalt. Emission, routes, terminal confirmations and layer response inherit the same small palette. The center and its dimensional edge use the existing layer confirmation clock: 850ms duration, 220ms delay. Only color properties were added.
- Existing scroll states also map to color: input is identity blue; policy is processing violet; output is receipt cyan; audit resolves to cobalt and mineral route detail. The existing 180ms field/stroke and 360ms layer transitions remain. No scroll hook, threshold, transform or timing changed.
- Initial and active static hero views remain electric/cobalt blue. Reduced motion goes directly to the clear active/static state with zero running SVG animations.

Verification:

- Source comparison confirms the only JSX change is removal of the visible cue. Therefore all path coordinates, route delays (70/170/270/370ms), React toggle, keyboard handling and accessibility attributes are identical.
- Every original animation declaration and every original movement/timing declaration is retained. Original transform, opacity and dash-offset keyframes are identical; new keyframes contain color only. `useHomeMotion.js` was not edited.
- Desktop Enter activates; Space resets; click repeats and resets. Mobile touch activates and resets. Browser console has no errors.
- Exact activation frame samples: 100ms cobalt `rgb(52,75,234)`, 458ms violet `rgb(116,97,189)`, 764ms cyan `rgb(81,143,162)`, 1300ms resolved cobalt.
- Actual scrolling at hero progress .110/.290/.470 selects policy/output/audit and produces the exact expected center and node colors, using the existing thresholds.
- Reviewed desktop, mobile, keyboard focus, reduced-motion static states and frames from the 12.76-second recording. Color is visibly authored while movement stays unchanged.

Primary artifacts:

- `control-plane-color-desktop.webm`: real-time repeat activation, reset and existing scroll states.
- `01-contact-cobalt.png`, `02-processing-violet.png`, `03-receipt-cyan.png`, `04-resolved-cobalt.png`: reproducible frames paused at the named activation times.
- `after-idle.png`, `after-active.png`, `mobile-idle.png`, `mobile-active.png`, `keyboard-focus.png`, `reduced-motion-active.png`.
- `scroll-input.png`, `scroll-policy.png`, `scroll-output.png`, `scroll-audit.png`.
- `preservation-check.json`, `interaction-results.json`, `color-frame-samples.json`, `scroll-state-results.json`.
