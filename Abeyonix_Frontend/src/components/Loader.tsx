/**
 * Abeyonix — API / Operation Loader
 *
 * Usage:
 *   1. Overlay (full section dim):     <Loader variant="overlay" message="Fetching orders..." />
 *   2. Orbital spinner (inline/center):<Loader variant="orbital" />
 *   3. Rotor dots (inline small):      <Loader variant="dots" />
 *   4. Sweep arc (compact):            <Loader variant="arc" />
 *   5. Progress bar (bottom of card):  <Loader variant="bar" message="Uploading..." />
 *   6. Button spinner (inside button): <ButtonLoader />
 *
 *   Hook:  const { loading, withLoader } = useLoader()
 *          await withLoader(() => api.fetchProducts())
 */

import { useState, useCallback } from "react";

/* ─── Shared brand colors ─────────────────────────────────── */
const GOLD = "#c48c48";
const NAVY = "#1e4fa8";

/* ─── Keyframe style block (injected once) ───────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');

  @keyframes abxOrbSpin   { to { transform: rotate(360deg); } }
  @keyframes abxOrbPulse  { 0%,100%{ transform:scale(1); opacity:1; } 50%{ transform:scale(1.45); opacity:0.55; } }
  @keyframes abxDotBounce { 0%,100%{ transform:translateY(0) scale(1); opacity:0.35; } 50%{ transform:translateY(-7px) scale(1.2); opacity:1; } }
  @keyframes abxArcSpin   { to { transform: rotate(360deg); } }
  @keyframes abxBarMove   { 0%{ margin-left:0%;width:25%; } 50%{ margin-left:35%;width:38%; } 100%{ margin-left:75%;width:25%; } }
  @keyframes abxBtnSpin   { to { transform: rotate(360deg); } }
  @keyframes abxTextBlink { 0%,100%{ opacity:0.45; } 50%{ opacity:1; } }
  @keyframes abxFadeIn    { from{ opacity:0; } to{ opacity:1; } }

  .abx-loader-overlay-bg {
    position:absolute; inset:0;
    background:rgba(0,8,20,0.72);
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    gap:14px; z-index:50;
    border-radius:inherit;
    animation:abxFadeIn 0.2s ease;
    backdrop-filter:blur(1px);
  }

  .abx-orb-ring-outer {
    position:absolute; width:52px; height:52px; border-radius:50%;
    border:2.5px solid transparent;
    border-top-color:${GOLD}; border-right-color:rgba(196,140,72,0.35);
    animation:abxOrbSpin 1s linear infinite;
  }
  .abx-orb-ring-inner {
    position:absolute; width:34px; height:34px; border-radius:50%;
    border:2px solid transparent;
    border-bottom-color:${NAVY}; border-left-color:rgba(30,79,168,0.4);
    animation:abxOrbSpin 0.65s linear infinite reverse;
  }
  .abx-orb-core {
    width:10px; height:10px; border-radius:50%;
    background:${GOLD};
    animation:abxOrbPulse 1s ease-in-out infinite;
  }

  .abx-dot { width:8px; height:8px; border-radius:50%; }
  .abx-dot:nth-child(odd)  { background:${GOLD}; }
  .abx-dot:nth-child(even) { background:${NAVY}; }
  .abx-dot:nth-child(1){ animation:abxDotBounce 0.9s ease-in-out infinite 0s; }
  .abx-dot:nth-child(2){ animation:abxDotBounce 0.9s ease-in-out infinite 0.15s; }
  .abx-dot:nth-child(3){ animation:abxDotBounce 0.9s ease-in-out infinite 0.3s; }
  .abx-dot:nth-child(4){ animation:abxDotBounce 0.9s ease-in-out infinite 0.45s; }

  .abx-arc {
    border-radius:50%;
    border:2.5px solid rgba(196,140,72,0.15);
    border-top-color:${GOLD}; border-right-color:${NAVY};
    animation:abxArcSpin 0.85s cubic-bezier(0.4,0,0.2,1) infinite;
  }

  .abx-bar-track {
    background:rgba(255,255,255,0.07); border-radius:3px; overflow:hidden;
  }
  .abx-bar-fill {
    height:100%;
    background:linear-gradient(90deg,${NAVY},${GOLD},${NAVY});
    background-size:200% 100%;
    border-radius:3px;
    animation:abxBarMove 1.4s ease-in-out infinite;
  }

  .abx-btn-spin {
    border-radius:50%;
    border:2px solid rgba(196,140,72,0.3);
    border-top-color:${GOLD};
    animation:abxBtnSpin 0.7s linear infinite;
    flex-shrink:0;
  }

  .abx-loader-text {
    font-family:'Orbitron',monospace;
    font-size:10px; letter-spacing:3px;
    color:rgba(196,140,72,0.85);
    animation:abxTextBlink 1.4s ease-in-out infinite;
  }
`;

/* ─── Style injector (runs once per page) ────────────────── */
let styleInjected = false;
function injectStyles() {
  if (styleInjected || typeof document === "undefined") return;
  const tag = document.createElement("style");
  tag.textContent = STYLES;
  document.head.appendChild(tag);
  styleInjected = true;
}

/* ══════════════════════════════════════════════════════════
   Orbital Spinner
   Usage: <OrbitalSpinner size={52} />
   ══════════════════════════════════════════════════════════ */
export function OrbitalSpinner({ size = 52 }: { size?: number }) {
  injectStyles();
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="abx-orb-ring-outer" style={{ width: size, height: size }} />
      <div className="abx-orb-ring-inner" style={{ width: size * 0.65, height: size * 0.65 }} />
      <div className="abx-orb-core" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Rotor Dots
   Usage: <RotorDots />
   ══════════════════════════════════════════════════════════ */
export function RotorDots() {
  injectStyles();
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="abx-dot" />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Sweep Arc
   Usage: <SweepArc size={40} />
   ══════════════════════════════════════════════════════════ */
export function SweepArc({ size = 40 }: { size?: number }) {
  injectStyles();
  return (
    <div className="abx-arc" style={{ width: size, height: size }} />
  );
}

/* ══════════════════════════════════════════════════════════
   Progress Bar
   Usage: <ProgressBar message="Uploading..." width={200} />
   ══════════════════════════════════════════════════════════ */
export function ProgressBar({ message = "LOADING...", width = 200 }: { message?: string; width?: number }) {
  injectStyles();
  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 6 }}>
      <div className="abx-bar-track" style={{ height: 3 }}>
        <div className="abx-bar-fill" />
      </div>
      <span className="abx-loader-text">{message.toUpperCase()}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Button Spinner  (inline, use inside a <button>)
   Usage: <button disabled><ButtonLoader /> Saving...</button>
   ══════════════════════════════════════════════════════════ */
export function ButtonLoader({ size = 14 }: { size?: number }) {
  injectStyles();
  return (
    <div className="abx-btn-spin" style={{ width: size, height: size }} />
  );
}

/* ══════════════════════════════════════════════════════════
   Overlay Loader  (position:absolute over a relative parent)
   Usage:
     <div style={{ position: "relative" }}>
       <YourContent />
       {isLoading && <OverlayLoader message="Fetching..." />}
     </div>
   ══════════════════════════════════════════════════════════ */
export function OverlayLoader({ message = "LOADING..." }: { message?: string }) {
  injectStyles();
  return (
    <div className="abx-loader-overlay-bg">
      <OrbitalSpinner size={52} />
      <span className="abx-loader-text">{message.toUpperCase()}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Main <Loader /> component — single import convenience
   ══════════════════════════════════════════════════════════ */
type LoaderVariant = "overlay" | "orbital" | "dots" | "arc" | "bar";

interface LoaderProps {
  variant?: LoaderVariant;
  message?: string;
  size?: number;
}

export function Loader({ variant = "orbital", message = "LOADING...", size }: LoaderProps) {
  switch (variant) {
    case "overlay":  return <OverlayLoader message={message} />;
    case "dots":     return <RotorDots />;
    case "arc":      return <SweepArc size={size ?? 40} />;
    case "bar":      return <ProgressBar message={message} width={size ?? 200} />;
    case "orbital":
    default:         return <OrbitalSpinner size={size ?? 52} />;
  }
}

/* ══════════════════════════════════════════════════════════
   useLoader hook — wraps any async call with loading state
   ══════════════════════════════════════════════════════════

   const { loading, message, withLoader } = useLoader();

   // Trigger:
   const data = await withLoader(
     () => api.fetchProducts(),
     "Fetching products..."
   );

   // Render:
   <div style={{ position: "relative" }}>
     <YourContent data={data} />
     {loading && <OverlayLoader message={message} />}
   </div>
*/
export function useLoader() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("LOADING...");

  const withLoader = useCallback(
    async <T,>(fn: () => Promise<T>, msg = "LOADING..."): Promise<T> => {
      setMessage(msg.toUpperCase());
      setLoading(true);
      try {
        return await fn();
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, message, withLoader };
}

export default Loader;