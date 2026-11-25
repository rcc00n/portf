# Portfolio frontend

The React/Vite interface for the [Raccoon Software portfolio](../README.md).
It includes routed services and projects, contact qualification, scope estimates,
case studies and interactive engineering examples.

## Develop

From this directory, use Node.js 22.12+:

```bash
npm ci
npm run dev -- --host 127.0.0.1
```

Vite serves **http://127.0.0.1:5173**. Its configuration does not define an API proxy.
When using the [local Django backend](../backend/README.md), set the existing API
base at startup:

```bash
VITE_API_BASE=http://127.0.0.1:8000 npm run dev -- --host 127.0.0.1
```

```bash
npm run lint
npm run build
npm run preview -- --host 127.0.0.1
```

`build` writes `dist/`. `preview` serves that bundle; it does not run Django or turn
the contact form into a standalone mail service.

## Content and interaction boundaries

[`src/App.jsx`](src/App.jsx) defines the main routes, service descriptions, project
and pricing seeds, qualification options and enquiry flow. Nonempty responses from
`/api/projects/` and `/api/pricing/` replace their corresponding seed lists. Seed
content remains when those responses are empty or unavailable.

- Put public case-study images in `public/assets/projects/` and reference their
  served paths in the project data. Uploaded Django images use a separate media path.
- Change route titles and descriptions in [`src/utils/seo.js`](src/utils/seo.js).
- Qualification and estimate drafts use browser local storage. Contact submissions
  POST to the backend; the backend validates and persists the enquiry.
- [`src/utils/analytics.js`](src/utils/analytics.js) stores page-view and CTA events
  in a browser queue and logs development events. It is not an installed analytics
  provider.

## Engineering modules

| Source | Purpose |
| --- | --- |
| [`src/pages/engineering`](src/pages/engineering) | Architecture preview, admin-first examples, readiness checklist and estimator |
| [`src/pages/admin/AdminDemo.jsx`](src/pages/admin/AdminDemo.jsx) | Interactive admin demonstration |
| [`src/pages/cases/RenterArchitectureCase.jsx`](src/pages/cases/RenterArchitectureCase.jsx) | Rental-platform architecture case study |
| [`src/components`](src/components) | Shared controls and diagram rendering |

The demonstrations and estimate ranges illustrate design choices and example
workflows. Keep them distinct from the connected backend's persisted project data.

## Build and hosting

`VITE_BASE` sets Vite's asset base; it defaults to `/`. `VITE_API_BASE` is embedded
at build time for browser API requests. The root [Dockerfile](../Dockerfile) builds
this app and copies `dist/` into Django's `frontend_dist/` directory.

Workflow examples in this directory's `.github/workflows/` are nested below the
repository root; they are not active root GitHub Actions workflows. The source
does not, by itself, demonstrate a successful Pages deployment. See the root
[Dokku notes](../DOKKU.md) for the separate hosted configuration.
