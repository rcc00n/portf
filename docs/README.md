# Documentation map

The approved application is in `app/` and `backend/`. Root CI and `scripts/` contain maintained regression checks. No deployment is authorized by these documents.

- [Current hardening handoff](operations/REPOSITORY_OPERATIONS_HARDENING.md)
- [Dependency decisions](operations/DEPENDENCIES.md)
- [Verified legacy cleanup](operations/LEGACY_CLEANUP.md)
- [Runtime / Dokku contract](../DOKKU.md)
- `hardening/`: completed phase handoffs; newer operations documentation supersedes earlier configuration examples.
- `audits/`: historical completeness and privacy findings. Findings are not assertions about current behavior; privacy/legal owner verification remains necessary.
- `reviews/`: preserved approved design and migration reasoning. Historical URLs and prototype instructions are not current public routes.
- `archive/tools/`: historical capture/QA helpers, outside CI. Inspect targets and side effects before use; use maintained scripts for regression verification.

Screenshots, videos, local audit JSON, SQLite, dependency trees and nested Git backup are intentionally ignored. They are reproducible/local evidence, not application source. Font licenses remain beside production fonts.
