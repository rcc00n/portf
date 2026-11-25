# RACCN Code frontend

React/Vite interface for [raccncode.com](https://raccncode.com): Work, Systems,
Approach and Start. The Control Plane is a custom SVG/CSS interaction; secondary
pages share its typography, rules and signal palette.

## Develop and check

Use Node 22.13+ from this directory:

```sh
npm ci
npm run dev -- --host 127.0.0.1
npm run lint
npm test
npm run build
```

Vite runs on 5173 and proxies `/api` and `/media` to local Django on 8001. Follow
[root setup](../README.md). Full isolated checks: `python scripts/check_release.py`
from the repository root after installing its Python/browser dependencies.

## Source map and boundaries

- `src/main.jsx`: explicit routes, lazy pages and destination scroll positioning.
- `src/home/`: approved homepage, Control Plane and idempotent inquiry submission.
- `src/site/`: evidence, architecture, demo, Start and optional definition.
- `src/projects/`: CMS publication, ordering, identity, media and degraded states.
- `src/site/definition.js`: selected intent versus illustrative assumptions.
- `tests/`: unit and Chromium regressions, reduced motion and native inputs.

The CMS is authoritative. Empty/failed catalogs never republish seed content. Only
Renter has an approved case route. Registered uploaded media is separate from Vite
assets. Route metadata is shared in `../backend/config/route_metadata.json`.

Estimator ranges are illustrative; unknown project intent stays unknown. Inquiries
show success only after confirmed Django acceptance. Analytics is an inert local
queue. Prototype studies are outside production routes. The root Docker/Dokku
model serves the built app; there is no GitHub Pages deployment.
