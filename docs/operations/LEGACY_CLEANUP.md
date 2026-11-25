# Verified legacy cleanup

Two independent checks: recursive imports from main.jsx and esbuild metafile inputs, followed by source-reference review.

Removed:

- `app/src/App.css`
- `app/src/App.jsx`
- `app/src/assets/raccoon-logo.png`
- `app/src/assets/raccoon.gif`
- `app/src/assets/react.svg`
- `app/src/components/DataCard.jsx`
- `app/src/components/DiagramCanvas.jsx`
- `app/src/components/ToggleGroup.jsx`
- `app/src/pages/admin/AdminDemo.jsx`
- `app/src/pages/engineering/AdminFirst.jsx`
- `app/src/pages/engineering/ArchitecturePreview.jsx`
- `app/src/pages/engineering/EngineeringLanding.jsx`
- `app/src/pages/engineering/EngineeringLayout.jsx`
- `app/src/pages/engineering/Estimate.jsx`
- `app/src/pages/engineering/ProductionReady.jsx`
- `app/src/pages/engineering/adminFirstData.js`

Archived outside build:

- `app/src/pages/cases/RenterArchitectureCase.jsx`
- `app/src/prototype/TraceCanvas.jsx`
- `app/src/prototype/TracePrototype.jsx`
- `app/src/prototype/trace-prototype.css`
- `app/src/prototype/useControlPlaneMotion.js`

All live architectureData, estimateData, productionReadyData and demoData modules remain. Public project PNGs are **PENDING PRODUCTION DATA VERIFICATION**; none deleted. The source-only GIF/raster identity was imported exclusively by dead App.jsx, outside persistent ProjectImage storage. Font licenses remain.

Removed the unreferenced public vite.svg starter, parsed out only named .infinite-bg selectors/bg-* keyframes, and removed framer-motion/lucide-react after confirming zero remaining live imports.
