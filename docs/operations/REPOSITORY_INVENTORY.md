# Consolidation inventory

Baseline: `e1945b6ffb76ad788d9fbcf7e3452c3da0e12163`. Branch: `hardening/repository-operations`.

| Classification | Disposition |
| --- | --- |
| A application / B maintained tests and CI / C operations | Existing tracked application retained; new runtime changes are separate commits. |
| D meaningful audits/reviews | All 15 previously untracked Markdown records preserved under docs/audits and docs/reviews; 3 existing hardening handoffs relocated. |
| E historical design / QA source | Historical QA scripts archived under docs/archive/tools; source studies retained pending reachability review. |
| F generated evidence | audit/, homepage-review/, prototype-review/ screenshots, recordings and machine output ignored; maintained regressions replace generated evidence. |
| G local machine | SQLite, caches, dependencies, dist and nested app/.git.bak remain local/ignored. The backup is not the live repository. |
| H sensitive/environment | No real secret identified by text-pattern and nested-object scans; examples/test literals only. No local database or environment secrets staged. This is not a guarantee against all possible historic secrets. |
| I obsolete | Nested Git backup removed from tracking; no live application source removed during consolidation. |

Initial inventory: 746 untracked files (15 Markdown, 13 Python, 52 JSON, 8 text, 658 image/video files). Tracked nested backup: 106 files / 21,299,147 bytes. Baseline tracked total: 268 files. Binary screenshots/recordings were excluded rather than copied into documentation. Production data was not inspected or committed.
