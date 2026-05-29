import { useEffect, useState } from "react";

const STATUS_MESSAGES = [
  "INITIALIZING...",
  "CALIBRATING...",
  "LAUNCHING...",
  "CONNECTING...",
  "READY...",
];

interface LoaderScreenProps {
  /** Minimum ms the loader stays visible even if the page loads faster. Default: 2800 */
  minDuration?: number;
  onComplete?: () => void;
}

export default function LoaderScreen({
  minDuration = 2800,
  onComplete,
}: LoaderScreenProps) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  /* Cycle status messages */
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  /* Hide after minDuration */
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 700); // matches the CSS transition duration
    }, minDuration);
    return () => clearTimeout(timer);
  }, [minDuration, onComplete]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        overflow: "hidden",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.7s ease",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

        .abx-bg-pulse {
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(14,45,102,0.35) 0%, transparent 70%);
          animation: abxBgPulse 2.4s ease-in-out infinite;
        }

        @keyframes abxBgPulse {
          0%, 100% { transform: scale(0.85); opacity: 0.4; }
          50%       { transform: scale(1.15); opacity: 0.85; }
        }

        .abx-orbit-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(196,140,72,0.15);
          animation: abxOrbitExpand 2.4s ease-out infinite;
        }
        .abx-orbit-ring.r1 { width: 200px; height: 200px; animation-delay: 0s; }
        .abx-orbit-ring.r2 { width: 270px; height: 270px; animation-delay: 0.6s; }
        .abx-orbit-ring.r3 { width: 340px; height: 340px; animation-delay: 1.2s; }

        @keyframes abxOrbitExpand {
          0%   { opacity: 0.7; transform: scale(0.7); }
          80%  { opacity: 0;   transform: scale(1.05); }
          100% { opacity: 0;   transform: scale(1.1); }
        }

        .abx-dot-orbit {
          position: absolute;
          border-radius: 50%;
          animation: abxDotSpin 4s linear infinite;
        }
        .abx-dot-orbit.ob-a { width: 250px; height: 250px; }
        .abx-dot-orbit.ob-b {
          width: 290px; height: 290px;
          animation-duration: 6s;
          animation-direction: reverse;
        }

        @keyframes abxDotSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .abx-dot {
          position: absolute;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 50%;
        }
        .abx-dot.gold { width: 9px;  height: 9px;  background: #c48c48; box-shadow: 0 0 8px rgba(196,140,72,0.9); }
        .abx-dot.blue { width: 6px;  height: 6px;  background: #1e4fa8; box-shadow: 0 0 7px rgba(30,79,168,1); }

        .abx-drone-scene {
          position: relative;
          z-index: 2;
          animation: abxDroneFly 3s ease-in-out infinite;
        }

        @keyframes abxDroneFly {
          0%,100% { transform: translateY(0px)   rotate(0deg); }
          25%      { transform: translateY(-12px)  rotate(-1.5deg); }
          50%      { transform: translateY(-20px)  rotate(0deg); }
          75%      { transform: translateY(-9px)   rotate(1.5deg); }
        }

        .abx-rotor-l {
          transform-origin: 38px 62px;
          animation: abxRotorSpin 0.2s linear infinite;
        }
        .abx-rotor-r {
          transform-origin: 162px 62px;
          animation: abxRotorSpin 0.2s linear infinite reverse;
        }

        @keyframes abxRotorSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .abx-brand-name {
          font-family: 'Orbitron', monospace;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 7px;
          color: #fff;
          text-transform: uppercase;
        }
        .abx-brand-name span { color: #c48c48; }

        .abx-tagline {
          font-family: 'Orbitron', monospace;
          font-size: 9.5px;
          letter-spacing: 4px;
          color: rgba(196,140,72,0.65);
          text-transform: uppercase;
        }

        .abx-progress-wrap {
          width: 190px;
          height: 2px;
          background: rgba(255,255,255,0.07);
          border-radius: 2px;
          margin-top: 6px;
          overflow: hidden;
        }

        .abx-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #1e4fa8, #c48c48);
          border-radius: 2px;
          animation: abxLoadBar 3s ease-in-out infinite;
        }

        @keyframes abxLoadBar {
          0%   { width: 0%;   opacity: 1; }
          70%  { width: 100%; opacity: 1; }
          90%  { width: 100%; opacity: 0.3; }
          100% { width: 0%;   opacity: 0; }
        }

        .abx-status {
          font-family: 'Orbitron', monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.28);
        }

        .abx-scan-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(30,79,168,0.4), rgba(196,140,72,0.3), transparent);
          animation: abxScanLine 5s linear infinite;
          top: 0;
        }

        @keyframes abxScanLine {
          0%   { top: -1%;  opacity: 0; }
          5%   { opacity: 0.8; }
          95%  { opacity: 0.4; }
          100% { top: 101%; opacity: 0; }
        }
      `}</style>

      {/* Scan line */}
      <div className="abx-scan-line" />

      {/* Background glow */}
      <div className="abx-bg-pulse" />

      {/* Expanding rings */}
      <div className="abx-orbit-ring r1" />
      <div className="abx-orbit-ring r2" />
      <div className="abx-orbit-ring r3" />

      {/* Orbiting dots */}
      <div className="abx-dot-orbit ob-a">
        <div className="abx-dot gold" />
      </div>
      <div className="abx-dot-orbit ob-b">
        <div className="abx-dot blue" />
      </div>

      {/* Drone SVG */}
      <div className="abx-drone-scene">
        <svg
          width="210"
          height="210"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="abx-glow-gold" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="abx-glow-blue" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Horizontal arm */}
          <line x1="38" y1="72" x2="162" y2="72" stroke="#c48c48" strokeWidth="3" strokeLinecap="round" filter="url(#abx-glow-gold)" />

          {/* Motor nodes */}
          <circle cx="38"  cy="72" r="6" fill="#c48c48" filter="url(#abx-glow-gold)" />
          <circle cx="162" cy="72" r="6" fill="#c48c48" filter="url(#abx-glow-gold)" />

          {/* Center hub */}
          <circle cx="100" cy="72" r="9" fill="#1e3a6e" stroke="#c48c48" strokeWidth="1.5" />
          <text x="100" y="76.5" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#c48c48" fontFamily="Georgia,serif">IO</text>

          {/* Left rotor */}
          <g className="abx-rotor-l">
            <ellipse cx="38" cy="62" rx="28" ry="7" fill="none" stroke="#c48c48" strokeWidth="2" opacity="0.85" filter="url(#abx-glow-gold)" />
            <line x1="10" y1="62" x2="66" y2="62" stroke="#c48c48" strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="55" x2="52" y2="69" stroke="#c48c48" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </g>

          {/* Right rotor */}
          <g className="abx-rotor-r">
            <ellipse cx="162" cy="62" rx="28" ry="7" fill="none" stroke="#c48c48" strokeWidth="2" opacity="0.85" filter="url(#abx-glow-gold)" />
            <line x1="134" y1="62" x2="190" y2="62" stroke="#c48c48" strokeWidth="2" strokeLinecap="round" />
            <line x1="148" y1="55" x2="176" y2="69" stroke="#c48c48" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </g>

          {/* A — left leg */}
          <polygon points="100,75 68,148 82,148 100,96" fill="#1e3a6e" filter="url(#abx-glow-blue)" />
          {/* A — right leg */}
          <polygon points="100,75 132,148 118,148 100,96" fill="#1e3a6e" filter="url(#abx-glow-blue)" />
          {/* A — crossbar */}
          <rect x="78" y="115" width="44" height="11" rx="2" fill="#1e3a6e" filter="url(#abx-glow-blue)" />
          {/* A — apex accent */}
          <polygon points="100,74 92,91 108,91" fill="#c48c48" opacity="0.65" />

          {/* Landing gear */}
          <path d="M75,148 Q68,160 60,165"  stroke="#c48c48" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#abx-glow-gold)" />
          <path d="M125,148 Q132,160 140,165" stroke="#c48c48" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#abx-glow-gold)" />
        </svg>
      </div>

      {/* Brand + progress */}
      <div style={{ marginTop: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, zIndex: 3 }}>
        <div className="abx-brand-name">
          <span>A</span>beyonix
        </div>
        <div className="abx-tagline">Aerial Intelligence Systems</div>
        <div className="abx-progress-wrap">
          <div className="abx-progress-fill" />
        </div>
        <div className="abx-status">{STATUS_MESSAGES[statusIndex]}</div>
      </div>
    </div>
  );
}