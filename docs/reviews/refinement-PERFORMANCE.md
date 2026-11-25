> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# Homepage performance measurement

Measured 2026-09-23T03:28:20.048855+00:00 against `http://127.0.0.1:8001/` using production assets.

One fresh Chromium context per profile, HTTP cache disabled through Playwright request routing. Localhost, no CPU or network throttling. Touch/mobile is emulated on the same local Chromium host, not measured on physical mobile hardware. These are single lab samples; they are not field Core Web Vitals and do not establish an improvement against earlier measurements.

| Profile | FCP | LCP | CLS after scroll | Initial encoded body | Full-scroll encoded body | Long tasks after scroll |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| desktop (1440×1000, DPR 1) | 476 ms | 476 ms | 0.000010 | 441.6 KiB | 683.1 KiB | 0 / 0 ms |
| mobile_touch (390×844, DPR 3) | 420 ms | 1804 ms | 0.000000 | 441.6 KiB | 683.1 KiB | 0 / 0 ms |
| desktop_reduced_motion (1440×1000, DPR 1) | 520 ms | 520 ms | 0.000010 | 441.6 KiB | 683.1 KiB | 0 / 0 ms |

Six-second idle observations (CPU figures are CDP renderer main-thread time, excluding GPU/compositor work):

| Profile | Visible task / script CPU | Offscreen task / script CPU | Root style/class mutations: visible → offscreen |
| --- | ---: | ---: | --- |
| desktop | 44.9 / 0.5 ms | 0.3 / 0.0 ms | {'style': 0, 'class': 2} → {'style': 0, 'class': 0} |
| mobile_touch | 0.4 / 0.0 ms | 0.3 / 0.0 ms | {'style': 0, 'class': 0} → {'style': 0, 'class': 0} |
| desktop_reduced_motion | 0.4 / 0.0 ms | 0.3 / 0.0 ms | {'style': 0, 'class': 0} → {'style': 0, 'class': 0} |

Resource Timing measures initial and full-scroll transfer sizes; CDP is attached after navigation to preserve touch emulation across Django’s COOP origin change. The separate CDP byte count therefore covers only subsequent requests. Initial LCP is sampled before synthetic scrolling; later raw LCP entries are retained for inspection but are not reported as the initial-load metric. Full-scroll image requests, transfer bytes (including HTTP overhead), encoded and decoded body bytes, heap measurements, paint entries, layout shifts, long tasks, production asset names, errors, and raw CPU metrics are retained in `performance.json`. FCP/LCP are browser performance entries; CLS uses the maximum session window, excludes recent-input shifts, and includes the full scroll. Images are intentionally deferred until their section nears the viewport.

The visible desktop interval can contain a short scheduled ambient signal. Offscreen and reduced/touch results should be evaluated separately; root mutations are a useful check for continuous JavaScript-driven updates, not a measure of compositor animation cost.

The tab-hidden check uses a real second tab brought to the front. If headless Chromium continues reporting `visible`, the JSON marks this check unverified; no synthetic visibility result is claimed. Source inspection confirms the visibilitychange listener clears ambient timers and the document-hidden class pauses Control Plane animations; that is not runtime verification.

Reproduce from the repository root with the production Django server running:

```bash
python3 homepage-review/refinement/measure-performance.py http://127.0.0.1:8001/
```

Browser version: 140.0.7339.16. Python Playwright and its Chromium browser must be installed. The script writes `performance.json` and this report alongside itself.
