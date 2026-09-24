> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# Start form refinement

The three ruled field regions are now native encompassing labels. Clicking the number, title, helper text, or padding forwards focus to the correct native input or textarea. Clicking within a control preserves native caret placement. Explicit `aria-labelledby` keeps each accessible name concise; helper/error text remains `aria-describedby`. No wrapper tab stops, roles, or synthetic focus handlers were added.

Each full surface responds with a blue top rule, stronger number/label contrast, and a very slight blue background on hover/focus. Native controls retain visible keyboard focus. Valid nonempty values show a small signal marker; a valid form strengthens the existing submit border. All fields stay visible and the first-contact contract remains Name, Email, Message.

Submitting makes the native fields read-only and disables repeated submission. One indeterminate line travels along the form rule while the actual request is pending. A confirmed response resolves the rule to its mineral endpoint and shows an email-next-step confirmation. Reduced motion uses a static pending rule and immediate confirmation. The pending animation pauses with the homepage when the section or document is hidden.

Server errors, network failures, unconfirmed HTTP 200 responses, and request timeout preserve the entered values. Field errors focus the first invalid control; general errors and confirmed success receive programmatic focus and status announcements. An optional preparation link remains after success.

Validation: **77 browser checks passed**, including 1440px desktop, 1024px and 768px layouts, 390px touch context, native accessible names and tab order, exact text-control caret behavior, six hit areas per field on desktop, helper/number/label/padding taps, empty/partial/valid/loading/error/success, duplicate-request guard, field-server errors, failed network, unconfirmed response, timeout, retry, and reduced motion. No JavaScript page errors were observed. All submission requests were intercepted. **No real inquiries were sent.** Headless touch testing verifies native focus behavior; a physical device keyboard was not used.

Artifacts:

- `desktop-focus.png`: full-region and native-input focus.
- `desktop-hover-completed.png`: field hover with a completed name.
- `desktop-valid.png`: three completed values and submit readiness.
- `desktop-submitting.png`: pending request.
- `desktop-error.png`: retained values and server failure.
- `desktop-success.png`: resolved route and next-step confirmation.
- `mobile-focus-completed.png`, `mobile-success.png`: 390px viewport checks.
- `form-390-focus.png`, `form-768-focus.png`, `form-1024-focus.png`: isolated form captures (the fixed site header is hidden in these captures only).
- `form-states-desktop.webm`: desktop interaction/state test recording.
- `checks.json`: individual assertions.

Source changes are limited to `HomeStartForm.jsx` and `home-form.css`.
