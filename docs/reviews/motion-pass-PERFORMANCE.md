> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# Homepage performance measurement

Measured 2026-09-23T04:04:09.355546+00:00 against `http://127.0.0.1:8001/` using production assets.

One fresh Chromium context per profile, HTTP cache disabled through Playwright request routing. Localhost, no CPU or network throttling. Touch/mobile is emulated on the same local Chromium host, not measured on physical mobile hardware. These are single lab samples; they are not field Core Web Vitals and do not establish an improvement against earlier measurements. Other local review/browser activity was not isolated, so timing and CPU samples are indicative.

| Profile | FCP | LCP | CLS after scroll | Initial encoded body | Full-scroll encoded body | Long tasks after scroll |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| desktop (1440×1000, DPR 1) | 488 ms | 488 ms | 0.000010 | 454.7 KiB | 696.2 KiB | 0 / 0 ms |
| mobile_touch (390×844, DPR 3) | 448 ms | 1828 ms | 0.000000 | 454.7 KiB | 696.2 KiB | 0 / 0 ms |
| desktop_reduced_motion (1440×1000, DPR 1) | 540 ms | 540 ms | 0.000010 | 454.7 KiB | 696.2 KiB | 1 / 70 ms |

Six-second idle observations (CPU figures are CDP renderer main-thread time, excluding GPU/compositor work):

| Profile | Hero task / script CPU | Start task / script CPU | Root style/class mutations: Hero → Start | RAF requests/executions: Hero → Start |
| --- | ---: | ---: | --- | --- |
| desktop | 43.8 / 0.6 ms | 8.9 / 0.5 ms | {'style': 0, 'class': 2} → {'style': 0, 'class': 2} | {'requested': 0, 'executed': 0} → {'requested': 0, 'executed': 0} |
| mobile_touch | 0.8 / 0.0 ms | 0.6 / 0.0 ms | {'style': 0, 'class': 0} → {'style': 0, 'class': 0} | {'requested': 0, 'executed': 0} → {'requested': 0, 'executed': 0} |
| desktop_reduced_motion | 0.7 / 0.0 ms | 0.4 / 0.0 ms | {'style': 0, 'class': 0} → {'style': 0, 'class': 0} | {'requested': 0, 'executed': 0} → {'requested': 0, 'executed': 0} |

Resource Timing measures initial and full-scroll transfer sizes; CDP is attached after navigation to preserve touch emulation across Django’s COOP origin change. The separate CDP byte count therefore covers only subsequent requests. Initial LCP is sampled before synthetic scrolling; later raw LCP entries are retained for inspection but are not reported as the initial-load metric. Full-scroll image requests, transfer bytes (including HTTP overhead), encoded and decoded body bytes, heap measurements, paint entries, layout shifts, long tasks, production asset names, errors, and raw CPU metrics are retained in `performance.json`. FCP/LCP are browser performance entries; CLS uses the maximum session window, excludes recent-input shifts, and includes the full scroll. Images are intentionally deferred until their section nears the viewport.

Each visible desktop section schedules a finite ambient event with a single timer. The first idle window observes Hero; the second observes Start with Hero offscreen. Up to one finite ambient event can occur in either six-second window, so a class toggle at Start does not imply offscreen Hero work or a continuous animation loop. Touch and reduced-motion profiles disable ambient events. RAF calls and executed callbacks are instrumented before navigation and reported as differences during each idle window. Root style/class mutations and RAF counts detect continuous JavaScript-driven updates; they do not measure compositor animation cost.

The tab-hidden check uses a real second tab brought to the front. If headless Chromium continues reporting `visible`, the JSON marks this check unverified; no synthetic visibility result is claimed. Source inspection confirms the visibilitychange listener clears ambient timers and pending scroll RAF, and the document-hidden class pauses descendant animations; that is not runtime verification.

Reproduce from the repository root with the production Django server running:

```bash
python3 homepage-review/motion-pass/measure-performance.py http://127.0.0.1:8001/
```

Browser version: 140.0.7339.16. Python Playwright and its Chromium browser must be installed. The script writes `performance.json` and this report alongside itself.
