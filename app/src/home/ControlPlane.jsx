import { useRef, useState } from "react";
import "./control-plane-interaction.css";
import ControlField from "./ControlField.jsx";

export const RaccnGlyph = () => (
  <svg className="hp-brand-glyph" viewBox="0 0 32 32" aria-hidden="true" focusable="false" shapeRendering="geometricPrecision">
    <path
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 4 10 7 16 5 22 7 29 4 27 21 16 29 5 21ZM7 13 12 11 16 14 20 11 25 13 23 19 19 21 16 18 13 21 9 19ZM13 23 16 22 19 23 16 26Z"
    />
    <path fill="currentColor" d="M10 14 13 14 12 17 10 16ZM22 14 19 14 20 17 22 16Z" />
  </svg>
);

const routePaths = [
  { id: "input", path: "M280 390 94 380", x: 93, y: 379, delay: 70 },
  { id: "policy", path: "M495 265V140", x: 495, y: 139, delay: 170 },
  { id: "output", path: "M713 380 904 354", x: 904, y: 354, delay: 270 },
  { id: "audit", path: "M499 511 501 610", x: 501, y: 610, delay: 370 },
];

export default function ControlPlane() {
  const coreRef = useRef(null);
  const [{ active, sequence }, setSignal] = useState({ active: false, sequence: 0 });
  const toggle = () => setSignal((current) => ({
    active: !current.active,
    sequence: current.sequence + 1,
  }));
  return (
    <>
    <svg className="hp-control-plane" viewBox="0 0 1000 820" data-control={active ? "active" : "ready"} aria-label="Interactive Control Plane">
      <desc id="hp-control-instructions">Select the blue center to send a signal through the connected system. Select it again to return to standby. Keyboard: Enter or Space.</desc>
      <defs>
        <linearGradient id="hpPlateBone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#faf7ee" />
          <stop offset="1" stopColor="#aaa79d" />
        </linearGradient>
        <clipPath id="hpPlateCut"><path d="M94 380 495 140 904 354 501 610Z" /></clipPath>
      </defs>

      <g className="hp-plane hp-plane--back" aria-hidden="true">
        <g className="hp-plane__entry">
          <path d="M57 243 489 4 946 241 503 508Z" fill="#171914" stroke="#686d63" />
          <path d="M57 243 503 508 503 588 57 323Z" fill="#0d0f0c" stroke="#686d63" />
          <path d="M503 508 946 241 946 321 503 588Z" fill="#252821" stroke="#686d63" />
        </g>
      </g>

      <g className="hp-plane hp-plane--middle" aria-hidden="true">
        <g className="hp-plane__entry">
          <path className="hp-plane__middle-material" d="M79 333 493 91 925 319 501 580Z" fill="#2a2e27" stroke="#9ca294" />
          <path key={`material-${sequence}`} className="hp-plane__material-response" d="M79 333 493 91 925 319 501 580Z" fill="#5264ff" />
          <path d="M79 333 501 580 501 652 79 405Z" fill="#131512" stroke="#9ca294" />
          <path d="M501 580 925 319 925 391 501 652Z" fill="#34382f" stroke="#9ca294" />
          <path className="hp-plane__control-outline" d="m230 365 266-153 260 137-269 163Z" fill="none" />
        </g>
      </g>

      <g className="hp-plane hp-plane--front">
        <g className="hp-plane__entry">
          <path className="hp-plane__shadow" d="M94 412 495 172 904 386 501 642Z" />
          <path className="hp-plane__surface" d="M94 380 495 140 904 354 501 610Z" fill="url(#hpPlateBone)" stroke="#0a0b09" strokeWidth="2" />
          <path className="hp-plane__side hp-plane__side--left" d="M94 380 501 610 501 684 94 454Z" fill="#74736d" stroke="#0a0b09" strokeWidth="2" />
          <path className="hp-plane__side hp-plane__side--right" d="M501 610 904 354 904 430 501 684Z" fill="#96948c" stroke="#0a0b09" strokeWidth="2" />
          <path key={`surface-${sequence}`} className="hp-plane__surface-response" d="M94 380 495 140 904 354 501 610Z" fill="#5264ff" aria-hidden="true" />
          <g className="hp-plane__grid" clipPath="url(#hpPlateCut)" stroke="#171914" fill="none" strokeWidth="2">
            <path d="M-20 440 394 212 809 428 1187 194" />
            <path d="M-20 490 394 262 809 478 1187 244" />
            <path d="M-20 540 394 312 809 528 1187 294" />
            <path d="M-20 590 394 362 809 578 1187 344" />
            <path d="M-20 640 394 412 809 628 1187 394" />
          </g>
          <g className="hp-plane__circuit">
            <g className="hp-core-routes" fill="none" aria-hidden="true">
              {routePaths.map((route) => (
                <g key={route.id} className={`hp-core-route hp-core-route--${route.id}`} style={{ "--hp-signal-delay": `${route.delay}ms` }}>
                  <path className="hp-core-route__base" d={route.path} />
                  <path className="hp-core-route__connected" d={route.path} pathLength="1" />
                  <path key={sequence} className="hp-core-route__signal" d={route.path} pathLength="1" />
                </g>
              ))}
            </g>
            <g
              ref={coreRef}
              className="hp-plane__core-group"
              role="button"
              tabIndex="0"
              aria-label={active ? "Return Control Plane to standby" : "Activate Control Plane"}
              aria-describedby="hp-control-instructions"
              aria-pressed={active}
              onClick={toggle}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  if (!event.repeat) toggle();
                }
              }}
            >
              <title>{active ? "Connected. Select again to return to standby." : "Send a signal through the system."}</title>
              <path className="hp-control-focus" d="M268 390 495 253 725 380 499 523Z" />
              <path className="hp-plane__core-edge" d="M280 390 499 511 713 380 713 391 499 523 280 402Z" />
              <path className="hp-plane__core" d="M280 390 495 265 713 380 499 511Z" />
              <path className="hp-plane__core-signal" d="M280 390 495 265 713 380 499 511Z" pathLength="1000" />
              <path key={`emission-${sequence}`} className="hp-control-emission" d="M280 390 495 265 713 380 499 511Z" />
              <g className="hp-control-mechanism" aria-hidden="true">
                <path className="hp-control-mechanism__track" d="m421 377 79-47 79 42-79 48Z" />
                <path className="hp-control-mechanism__half hp-control-mechanism__half--left" d="m493 348-47 28 47 25" />
                <path className="hp-control-mechanism__half hp-control-mechanism__half--right" d="m507 348 47 25-47 28" />
                <path className="hp-control-mechanism__contact" d="m483 376 17-10 17 9-17 10Z" />
              </g>
              <path className="hp-control-hit-area" d="M280 390 495 265 713 380 499 511Z" />
            </g>
            <g className="hp-plane-locks" aria-hidden="true">
              {routePaths.map((route) => (
                <g key={route.id} className={`hp-control-terminal hp-control-terminal--${route.id}`} style={{ "--hp-signal-delay": `${route.delay}ms` }}>
                  <rect key={sequence} className="hp-control-terminal__response" x={route.x - 15} y={route.y - 15} width="30" height="30" />
                  <rect className={`hp-plane-lock hp-plane-lock--${route.id}`} x={route.x - 9} y={route.y - 9} width="18" height="18" />
                  <path className="hp-control-terminal__contact" d={`M${route.x - 3} ${route.y}h6`} />
                </g>
              ))}
            </g>
          </g>
        </g>
      </g>

    </svg>
    <ControlField source={coreRef} active={active} sequence={sequence} />
    </>
  );
}
