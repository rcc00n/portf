import { useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import TraceCanvas from "./TraceCanvas.jsx";
import useControlPlaneMotion from "./useControlPlaneMotion.js";
import "./trace-prototype.css";

const studies = [
  {
    id: "01",
    slug: "braided-signal",
    name: "Braided Signal",
    note: "Canvas 2D · spatial · authored spline states",
  },
  {
    id: "02",
    slug: "control-plates",
    name: "Control Plates",
    note: "SVG · dimensional · layered system planes",
  },
  {
    id: "03",
    slug: "routing-index",
    name: "Routing Index",
    note: "SVG + DOM · editorial · orthogonal routes",
  },
];

const BrandGlyph = ({ dark = false }) => (
  <svg className="tp-brand-glyph" viewBox="0 0 40 32" aria-hidden="true">
    <path d="M3 5 13 9 20 4l7 5 10-4-3 18-14 6L6 23Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="m10 14 7 2-4 5-5-2Zm20 0-7 2 4 5 5-2Z" fill={dark ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" />
    <path d="m17 23 3 2 3-2" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const PrototypeHeader = ({ study, light = false, approved = false }) => {
  const brand = (
    <>
      <BrandGlyph dark={light} />
      <span>RACCN <b>CODE</b></span>
    </>
  );
  const systemLabel = (
    <>
      <span>{approved ? "System 01" : `Study ${study.id}`}</span>
      <span className="tp-header__study-name">{approved ? "Control Plane" : study.name}</span>
    </>
  );

  return (
    <header className={`tp-header ${light ? "tp-header--light" : ""}`}>
      {approved ? (
        <a href="#top" className="tp-header__brand" aria-label="Back to RACCN Code introduction">{brand}</a>
      ) : (
        <Link to="/prototype" className="tp-header__brand" aria-label="RACCN Code prototype index">{brand}</Link>
      )}
      <nav className="tp-header__ia" aria-label="Future information architecture">
        <a href="#work">Work</a>
        <span>Systems</span>
        <span>Approach</span>
        <span>Start</span>
      </nav>
      {approved ? (
        <div className="tp-header__study" aria-label="Control Plane system">{systemLabel}</div>
      ) : (
        <Link to="/prototype" className="tp-header__study">{systemLabel}</Link>
      )}
    </header>
  );
};

const StudyRail = ({ active }) => (
  <aside className="tp-study-rail" aria-label="Trace studies">
    {studies.map((study) => (
      <Link
        key={study.slug}
        to={`/prototype/${study.slug}`}
        aria-current={active === study.slug ? "page" : undefined}
      >
        <span>{study.id}</span>
        <span>{study.name}</span>
      </Link>
    ))}
  </aside>
);

const DeferredImage = ({ src, alt, width, height }) => {
  const imageRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    });
    observer.observe(image);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imageRef}
      src={visible ? src : undefined}
      alt={alt}
      width={width}
      height={height}
      decoding="async"
    />
  );
};

const ProjectEvidence = ({ variant }) => (
  <section id="work" className={`tp-work tp-work--${variant}`}>
    <div className="tp-work__route" aria-hidden="true"><span /></div>
    <div className="tp-work__meta tp-mono">
      <span>Selected system / 01</span>
      <span>Marketplace · operations · trust</span>
    </div>
    <div className="tp-work__heading">
      <p className="tp-eyebrow">Work / Renter</p>
      <h2>One market.<br />Two control surfaces.</h2>
      <p className="tp-work__intro">
        A rental marketplace shaped around customer trust and operator control.
      </p>
    </div>
    <div className="tp-work__media">
      <figure className="tp-work__image tp-work__image--market">
        <DeferredImage src="/prototype/media/renter-market.webp" alt="Renter marketplace customer interface" width="2555" height="1229" />
        <figcaption className="tp-mono">01 / Customer market</figcaption>
      </figure>
      <figure className="tp-work__image tp-work__image--control">
        <DeferredImage src="/prototype/media/renter-control.webp" alt="Renter operator control interface" width="2566" height="1238" />
        <figcaption className="tp-mono">02 / Operator control</figcaption>
      </figure>
    </div>
    <div className="tp-work__foot tp-mono">
      <span>Payments</span><span>Disputes</span><span>Ledger</span><span>Audit</span>
    </div>
  </section>
);

const SignalFallback = () => (
  <svg className="tp-signal-fallback" viewBox="0 0 1000 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <g fill="none" stroke="currentColor">
      <path d="M1030 80C780 40 800 280 580 258S350 120 165 190-30 420-170 370" />
      <path d="M1080 185C800 150 820 355 600 335S390 210 180 315-5 575-180 530" />
      <path d="M1050 320C820 300 760 470 555 450S340 335 140 470-20 690-170 675" />
      <path d="M990 485C760 520 690 600 485 570S250 500 20 655" />
    </g>
  </svg>
);

const BraidedSignal = () => {
  const study = studies[0];
  return (
    <main className="prototype-root prototype-signal">
      <PrototypeHeader study={study} />
      <StudyRail active={study.slug} />
      <section className="tp-signal-hero">
        <div className="tp-signal-visual" aria-hidden="true">
          <SignalFallback />
          <TraceCanvas />
          <span className="tp-signal-label tp-signal-label--input tp-mono">INPUT / 07</span>
          <span className="tp-signal-label tp-signal-label--decision tp-mono">DECISION PATH</span>
          <span className="tp-signal-label tp-signal-label--control tp-mono">CONTROL / ACTIVE</span>
        </div>
        <div className="tp-signal-title">
          <p className="tp-eyebrow">Independent digital systems practice</p>
          <h1><span>RACCN</span><span>CODE</span></h1>
        </div>
        <p className="tp-signal-copy">Complexity, routed into form.</p>
        <a className="tp-enter tp-mono" href="#work"><span>Enter the system</span><b>↘</b></a>
        <div className="tp-signal-index tp-mono" aria-hidden="true">
          <span>TRC–01</span><span>53.5461° N</span><span>STATE / LEGIBLE</span>
        </div>
      </section>
      <ProjectEvidence variant="signal" />
    </main>
  );
};

const ControlPlatesGraphic = () => (
  <svg className="tp-plates-graphic" viewBox="0 0 1000 820" aria-hidden="true">
    <defs>
      <linearGradient id="plateBone" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#faf7ef" />
        <stop offset="1" stopColor="#bdb8aa" />
      </linearGradient>
      <clipPath id="plateCut"><path d="M94 380 495 140 904 354 501 610Z" /></clipPath>
    </defs>
    <g className="tp-plate tp-plate--back">
      <g className="tp-plate__surface">
        <path d="M57 243 489 4 946 241 503 508Z" fill="#171914" stroke="#777d70" />
        <path d="M57 243 503 508 503 588 57 323Z" fill="#0d0f0c" stroke="#777d70" />
        <path d="M503 508 946 241 946 321 503 588Z" fill="#252821" stroke="#777d70" />
      </g>
    </g>
    <g className="tp-plate tp-plate--middle">
      <g className="tp-plate__surface">
        <path d="M79 333 493 91 925 319 501 580Z" fill="#2a2e27" stroke="#a9afa1" />
        <path d="M79 333 501 580 501 652 79 405Z" fill="#131512" stroke="#a9afa1" />
        <path d="M501 580 925 319 925 391 501 652Z" fill="#34382f" stroke="#a9afa1" />
        <path d="m230 365 266-153 260 137-269 163Z" fill="none" stroke="#5162ff" strokeWidth="4" />
      </g>
    </g>
    <g className="tp-plate tp-plate--front">
      <g className="tp-plate__surface">
        <path d="M94 380 495 140 904 354 501 610Z" fill="url(#plateBone)" stroke="#0a0b09" strokeWidth="2" />
        <path d="M94 380 501 610 501 684 94 454Z" fill="#77766f" stroke="#0a0b09" strokeWidth="2" />
        <path d="M501 610 904 354 904 430 501 684Z" fill="#9d9b92" stroke="#0a0b09" strokeWidth="2" />
        <g clipPath="url(#plateCut)" stroke="#171914" fill="none" strokeWidth="2">
          <path d="M-20 440 394 212 809 428 1187 194" />
          <path d="M-20 490 394 262 809 478 1187 244" />
          <path d="M-20 540 394 312 809 528 1187 294" />
          <path d="M-20 590 394 362 809 578 1187 344" />
          <path d="M-20 640 394 412 809 628 1187 394" />
        </g>
        <path className="tp-plate-core" d="M280 390 495 265 713 380 499 511Z" fill="#5162ff" />
        <path className="tp-plate-signal" d="M280 390 495 265 713 380 499 511Z" pathLength="1000" />
        <path className="tp-plate-aperture" d="m421 385 76-44 78 41-77 47Z" fill="#f6f2e9" />
      </g>
    </g>
    <g className="tp-plate-guides" fill="none" stroke="#5162ff" strokeWidth="2">
      <path d="M495 140V42" /><path d="M904 354h75" /><path d="M94 380H25" />
    </g>
  </svg>
);

const ControlPlates = () => {
  const study = studies[1];
  const rootRef = useRef(null);
  useControlPlaneMotion(rootRef);
  return (
    <main ref={rootRef} className="prototype-root prototype-plates prototype-plates--approved">
      <PrototypeHeader study={study} approved />
      <section id="top" className="tp-plates-hero">
        <div className="tp-plates-type" aria-label="RACCN Code">
          <p className="tp-eyebrow">Trace / Control Plane</p>
          <h1><span>RACCN</span><span>CODE</span></h1>
          <p>Digital systems—layered, legible, controlled.</p>
        </div>
        <div className="tp-plates-stage">
          <ControlPlatesGraphic />
        </div>
        <div className="tp-plates-notes tp-mono" aria-hidden="true">
          <span>03 / INTERFACE</span>
          <span>02 / CONTROL</span>
          <span>01 / INFRASTRUCTURE</span>
        </div>
        <div className="tp-plates-handoff" aria-hidden="true"><span /></div>
        <a className="tp-enter tp-enter--plates tp-mono" href="#work"><span>Resolve the layers</span><b>↓</b></a>
      </section>
      <ProjectEvidence variant="plates" />
    </main>
  );
};

const RoutingGraphic = () => (
  <svg className="tp-routing-graphic" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
    <g className="tp-routing-grid" fill="none">
      <path d="M0 134H1440M0 326H1440M0 710H1440M260 0V900M768 0V900M1182 0V900" />
    </g>
    <g className="tp-route-lines" fill="none">
      <path className="tp-route tp-route--a" d="M0 326H238Q260 326 260 348V608Q260 636 288 636H742Q768 636 768 610V460Q768 432 796 432H1182V710H1440" />
      <path className="tp-route tp-route--b" d="M0 710H540Q566 710 566 684V352Q566 326 592 326H1182" />
      <path className="tp-route tp-route--c" d="M768 0V106Q768 134 796 134H1134Q1182 134 1182 182V432" />
    </g>
    <g className="tp-route-nodes">
      <rect x="252" y="318" width="16" height="16" /><rect x="558" y="702" width="16" height="16" />
      <rect x="760" y="424" width="16" height="16" /><rect x="1174" y="424" width="16" height="16" />
      <rect x="1174" y="702" width="16" height="16" />
    </g>
  </svg>
);

const RoutingIndex = () => {
  const study = studies[2];
  return (
    <main className="prototype-root prototype-routing">
      <PrototypeHeader study={study} light />
      <StudyRail active={study.slug} />
      <section className="tp-routing-hero">
        <RoutingGraphic />
        <div className="tp-routing-kicker tp-mono">SYSTEM MAP / INDEX 001</div>
        <h1><span>RACCN</span><span>CODE</span></h1>
        <p className="tp-routing-copy">Complex systems, drawn into focus.</p>
        <div className="tp-routing-annotations tp-mono" aria-hidden="true">
          <span className="tp-routing-note tp-routing-note--a">A / SIGNAL</span>
          <span className="tp-routing-note tp-routing-note--b">B / DECISION</span>
          <span className="tp-routing-note tp-routing-note--c">C / CONTROL</span>
        </div>
        <a className="tp-enter tp-enter--routing tp-mono" href="#work"><span>Follow route 01</span><b>→</b></a>
      </section>
      <ProjectEvidence variant="routing" />
    </main>
  );
};

const PrototypeIndex = () => (
  <main className="prototype-root tp-index">
    <header className="tp-index__header">
      <div className="tp-header__brand"><BrandGlyph /><span>RACCN <b>CODE</b></span></div>
      <span className="tp-mono">TRACE / CONTROL PLANE</span>
    </header>
    <section className="tp-index__intro">
      <p className="tp-eyebrow">Visual identity prototype / local study</p>
      <h1>Three ways to make<br />the system visible.</h1>
      <p>Same premise. Different material, geometry, and relationship to type.</p>
    </section>
    <div className="tp-index__list">
      {studies.map((study) => (
        <Link key={study.slug} to={`/prototype/${study.slug}`}>
          <span className="tp-index__number tp-mono">{study.id}</span>
          <span className="tp-index__name">{study.name}</span>
          <span className="tp-index__note tp-mono">{study.note}</span>
          <span className="tp-index__arrow">↗</span>
        </Link>
      ))}
    </div>
  </main>
);

const PrototypeRouteReset = () => {
  const location = useLocation();
  useEffect(() => {
    document.documentElement.classList.add("trace-prototype-active");
    window.scrollTo(0, 0);
    return () => document.documentElement.classList.remove("trace-prototype-active");
  }, [location.pathname]);
  return null;
};

export default function TracePrototype() {
  return (
    <>
      <PrototypeRouteReset />
      <Routes>
        <Route index element={<PrototypeIndex />} />
        <Route path="braided-signal" element={<BraidedSignal />} />
        <Route path="control-plates" element={<ControlPlates />} />
        <Route path="routing-index" element={<RoutingIndex />} />
        <Route path="*" element={<main className="prototype-root tp-index"><h1>Study not found.</h1><Link to="/prototype">Return to the study archive</Link></main>} />
      </Routes>
    </>
  );
}
