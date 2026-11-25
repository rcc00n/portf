# Dependency triage

## Release refresh — 2026-11-25

The September audit below is historical. A fresh release check found six vulnerable
npm package entries (three high, three moderate), all in development/build tools;
the runtime-only npm audit was clear. The updates were selected individually, with
no `npm audit fix` and no runtime-library or application changes:

| Package | Previous pin/resolution | Release pin/resolution |
| --- | --- | --- |
| Vite | 7.3.6 | 7.3.8 |
| ESLint | 10.11.0 | 10.15.0 |
| source-map-js (transitive) | 1.2.1 | 1.2.4 |
| Zod (transitive) | 4.6.5 | 4.6.7 |
| Pillow | 12.3.0 | 13.0.0 |

The ESLint update also refreshes its affected minimatch/config-array graph. All direct
versions remain exact and `package-lock.json` records the complete frontend graph.
All eleven backend requirements remain exactly pinned.

Pillow 13 requires Python 3.11 or newer. **Use Python 3.12 for local development,
CI, and release checks**, matching the existing Dockerfile and CI. A historical
Python 3.10 virtual environment cannot install the release requirements and must
be recreated with 3.12; its running preview does not validate the release image.
No database or application-schema migration is introduced by these updates.

The Pillow update addresses published image-decoding advisories, including the
[GIF `Image.open()` CPU denial of service](https://github.com/advisories/GHSA-74r2-7ff9-mjj2).
This application calls Pillow for staff-upload validation and registered image
delivery. Staff-only uploading reduces exposure but does not justify retaining a
vulnerable decoder. Advisory aliases in the PyPI response are not separate findings.
Vite development-server/editor issues do not affect the built production server,
but are fixed for developer safety. Parser/source-map denial of service findings
are fixed in the build/lint dependency graph.

Verification on 2026-11-25:

- Full npm audit: zero findings; runtime-only audit: zero findings.
- Official PyPI metadata: zero listed advisories for each of the eleven final pins.
- Frontend lint, all four Node test files and production build pass on Node 22.19.0.
- Python 3.12 isolated container: `pip check`, 89 Django tests, and migration drift
  check pass with Pillow 13.0.0. Tests used temporary SQLite and disabled networking;
  notification calls were mocked. The current preview database was not modified.

Registry snapshots are time-specific and are not a formal security assessment.
Recheck at release time. Generated audit output and the temporary test image/build
instructions remain local rather than becoming application source.

## Historical triage — 2026-09-24

No audit-fix command was used. Registry versions and upstream support policies were checked, exact direct versions selected, then the named vulnerable transitive packages refreshed within their allowed ranges. npm package-lock.json pins the complete graph; backend/requirements.txt pins all 11 resolved runtime packages. Test-only pip-audit is not a production dependency.

## Frontend

| Package | Previous manifest | Exact version |
| --- | --- | --- |
| react | ^19.1.1 | 19.3.0 |
| react-dom | ^19.1.1 | 19.3.0 |
| react-router-dom | ^6.26.2 | 7.18.4 |
| @eslint/js | ^9.33.0 | 10.0.1 |
| @tailwindcss/postcss | ^4.1.13 | 4.3.3 |
| @types/react | ^19.1.10 | 19.3.0 |
| @types/react-dom | ^19.1.7 | 19.3.0 |
| @vitejs/plugin-react | ^5.0.0 | 5.2.0 |
| autoprefixer | ^10.4.21 | 10.6.1 |
| eslint | ^9.33.0 | 10.11.0 |
| eslint-plugin-react-hooks | ^5.2.0 | 7.1.1 |
| eslint-plugin-react-refresh | ^0.4.20 | 0.5.7 |
| globals | ^16.3.0 | 16.5.0 |
| postcss | ^8.5.6 | 8.5.28 |
| tailwindcss | ^4.1.13 | 4.3.3 |
| vite | ^7.1.2 | 7.3.6 |

Removed framer-motion and lucide-react only after independent bundler/source reachability checks. Supported Router 7 uses the existing declarative API without route or page changes. ESLint 10 keeps the existing two hook rules; the root mounting entry is explicitly excluded from the refresh-export rule because it is not an export boundary. Vite stays on supported 7.3; no Vite 8 build-system migration.

## Backend

asgiref==3.12.1
dj-database-url==3.1.2
Django==5.2.17
django-cors-headers==4.9.0
gunicorn==26.2.0
pillow==12.3.0
psycopg==3.3.6
psycopg-binary==3.3.6
sqlparse==0.6.0
typing_extensions==4.16.0
whitenoise==6.12.0

Django remains on 5.2 LTS rather than a new framework major. Gunicorn/Pillow were upgraded and exercised by real isolated HTTP/media tests. The lock was resolved under Python 3.10; the image/CI target is Python 3.12. Base OS/image tags remain a separately reviewed release artifact, not a claim of bit-identical builds.

## Advisory disposition

Initial npm audit: 18 vulnerable package entries (1 critical, 13 high, 3 moderate, 1 low). Runtime Router redirect handling warranted upgrading even though routes are fixed and the app does not use SSR hydration. Dev/build issues included Vite filesystem boundaries, Rollup writes, PostCSS/Babel source maps, tar extraction, and glob/parser denial of service. Production serves built files rather than a Vite dev server, but vulnerable build tools were still updated. Old transitive @humanfs/node, flatted, picomatch and rollup were explicitly refreshed after initial direct upgrades.

Final npm audit: zero known advisories. Final pip-audit of all 11 pinned backend runtime packages: zero known advisories. No advisory was intentionally accepted/suppressed. These registry snapshots are not a penetration test or a guarantee against future advisories. Raw generated reports remain in /tmp, not Git. Re-run npm audit and pip-audit -r backend/requirements.txt when preparing a release.

Upstream support references:

- [React Router security policy](https://github.com/remix-run/react-router/blob/main/SECURITY.md)
- [Vite supported versions](https://vite.dev/releases)
- [ESLint supported versions](https://eslint.org/version-support/)
- [Django supported releases](https://www.djangoproject.com/download/)
- [Gunicorn releases](https://gunicorn.org/news/)
