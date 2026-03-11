import React, { useEffect, useState, useRef } from "react";

function Humiditycard({ res = 0 }) {
  const [min, setMin] = useState(res);
  const [max, setMax] = useState(res);
  const [prevRes, setPrevRes] = useState(res);
  const [flash, setFlash] = useState(false);
  const [displayVal, setDisplayVal] = useState(res);

  useEffect(() => {
    if (res !== prevRes) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
      setPrevRes(res);
    }
    setMin((prev) => (res < prev ? res : prev));
    setMax((prev) => (res > prev ? res : prev));

    // Animate display value
    const start = displayVal;
    const end = res;
    const duration = 400;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(+(start + (end - start) * eased).toFixed(2));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [res]);

  const trend = res > prevRes ? "↑" : res < prevRes ? "↓" : "—";

  const zone =
    res <= 30 ? { label: "DRY", color: "#f59e0b", bg: "#fffbeb" } :
    res <= 60 ? { label: "OPTIMAL", color: "#10b981", bg: "#f0fdf4" } :
    res <= 80 ? { label: "HUMID", color: "#3b82f6", bg: "#eff6ff" } :
               { label: "WET", color: "#8b5cf6", bg: "#f5f3ff" };

  // Wave fill percentage (0–100 mapped to res 0–100)
  const fillPct = Math.min(Math.max(res, 0), 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .hc-root {
          font-family: 'DM Sans', sans-serif;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          align-items: center;
          min-height: 200px;
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: box-shadow 0.2s ease;
        }

        .hc-root:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }

        .hc-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .hc-zone-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 20px;
          padding: 3px 10px 3px 6px;
          margin-bottom: 8px;
          width: fit-content;
          background: ${zone.bg};
          border: 1px solid ${zone.color}33;
        }

        .hc-zone-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${zone.color};
          animation: hc-pulse 2s ease-in-out infinite;
        }

        @keyframes hc-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .hc-zone-text {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 1.5px;
          color: ${zone.color};
          font-weight: 500;
        }

        .hc-section-label {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          letter-spacing: 1px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 1px;
        }

        .hc-current-row {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          line-height: 1;
        }

        .hc-current-val {
          font-size: 62px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -2px;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          transition: color 0.4s ease;
        }

        .hc-current-val.flash {
          color: ${zone.color};
        }

        .hc-unit {
          font-size: 20px;
          font-weight: 300;
          color: #94a3b8;
          padding-bottom: 8px;
        }

        .hc-trend {
          font-size: 18px;
          padding-bottom: 8px;
          font-weight: 600;
          color: ${zone.color};
        }

        .hc-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 10px 0;
        }

        .hc-minmax {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .hc-stat-label {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          letter-spacing: 1px;
          color: #475569;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .hc-stat-val {
          font-size: 22px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .hc-stat-val.min { color: #3b82f6; }
        .hc-stat-val.max { color: #ef4444; }

        .hc-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .hc-droplet-wrap {
          position: relative;
          width: 90px;
          height: 110px;
        }

        .hc-droplet-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
          filter: drop-shadow(0 4px 12px ${zone.color}44);
        }

        .hc-fill-rect {
          transition: y 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .hc-pct-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          font-weight: 500;
          color: #000000;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
          padding-top: 12px;
        }

        .hc-scale-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 1.5px;
          color: #64748b;
          font-weight: 500;
        }

        @keyframes hc-wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

{/* <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .hc-root {
          font-family: 'DM Sans', sans-serif;
          background: #1f2329;
          border: 1px solid #34383f;
          border-radius: 12px;
          padding: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          align-items: center;
          min-height: 200px;
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: box-shadow 0.2s ease;
        }

        .hc-root:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }

        .hc-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .hc-zone-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 20px;
          padding: 3px 10px 3px 6px;
          margin-bottom: 8px;
          width: fit-content;
          background: ${zone.bg};
          border: 1px solid ${zone.color}33;
        }

        .hc-zone-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${zone.color};
          animation: hc-pulse 2s ease-in-out infinite;
        }

        @keyframes hc-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .hc-zone-text {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 1.5px;
          color: ${zone.color};
          font-weight: 500;
        }

        .hc-section-label {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          letter-spacing: 1px;
          color: #8e9099;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 1px;
        }

        .hc-current-row {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          line-height: 1;
        }

        .hc-current-val {
          font-size: 62px;
          font-weight: 700;
          color: #d0d1d3;
          letter-spacing: -2px;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          transition: color 0.4s ease;
        }

        .hc-current-val.flash {
          color: ${zone.color};
        }

        .hc-unit {
          font-size: 20px;
          font-weight: 300;
          color: #5a5f6b;
          padding-bottom: 8px;
        }

        .hc-trend {
          font-size: 18px;
          padding-bottom: 8px;
          font-weight: 600;
          color: ${zone.color};
        }

        .hc-divider {
          height: 1px;
          background: #2c3038;
          margin: 10px 0;
        }

        .hc-minmax {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .hc-stat-label {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          letter-spacing: 1px;
          color: #8e9099;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .hc-stat-val {
          font-size: 22px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .hc-stat-val.min { color: #5794f2; }
        .hc-stat-val.max { color: #f2495c; }

        .hc-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .hc-droplet-wrap {
          position: relative;
          width: 90px;
          height: 110px;
        }

        .hc-droplet-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
          filter: drop-shadow(0 4px 12px ${zone.color}44);
        }

        .hc-fill-rect {
          transition: y 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .hc-pct-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          font-weight: 500;
          color: #d0d1d3;
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          padding-top: 12px;
        }

        .hc-scale-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 1.5px;
          color: #8e9099;
          font-weight: 500;
        }

        @keyframes hc-wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style> */}


      <div className="hc-root">
        {/* Left */}
        <div className="hc-left">
          <div className="hc-zone-badge">
            <div className="hc-zone-dot" />
            <span className="hc-zone-text">{zone.label}</span>
          </div>

          <div className="hc-section-label">Humidity</div>

          <div className="hc-current-row">
            <span className={`hc-current-val${flash ? " flash" : ""}`}>{displayVal}</span>
            <span className="hc-unit">%</span>
            <span className="hc-trend">{trend}</span>
          </div>

          <div className="hc-divider" />

          <div className="hc-minmax">
            <div>
              <div className="hc-stat-label">Min</div>
              <div className="hc-stat-val min">{min}%</div>
            </div>
            <div>
              <div className="hc-stat-label">Max</div>
              <div className="hc-stat-val max">{max}%</div>
            </div>
          </div>
        </div>

        {/* Right — Droplet fill */}
        <div className="hc-right">
          <div className="hc-droplet-wrap">
            <svg
              className="hc-droplet-svg"
              viewBox="0 0 90 110"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <clipPath id="hc-droplet-clip">
                  {/* Droplet shape: pointed top, round bottom */}
                  <path d="M45 5 C45 5, 10 50, 10 72 A35 35 0 0 0 80 72 C80 50, 45 5, 45 5 Z" />
                </clipPath>

                {/* Animated wave pattern */}
                <pattern id="hc-wave-pattern" x="0" y="0" width="180" height="20" patternUnits="userSpaceOnUse">
                  <animateTransform
                    attributeName="patternTransform"
                    type="translate"
                    from="0 0"
                    to="-90 0"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                  <path
                    d="M0 10 Q22.5 0 45 10 Q67.5 20 90 10 Q112.5 0 135 10 Q157.5 20 180 10 L180 20 L0 20 Z"
                    fill={zone.color}
                    opacity="0.3"
                  />
                  <path
                    d="M0 13 Q22.5 3 45 13 Q67.5 23 90 13 Q112.5 3 135 13 Q157.5 23 180 13 L180 20 L0 20 Z"
                    fill={zone.color}
                    opacity="0.15"
                  />
                </pattern>
              </defs>

              {/* Droplet outline (background) */}
              <path
                d="M45 5 C45 5, 10 50, 10 72 A35 35 0 0 0 80 72 C80 50, 45 5, 45 5 Z"
                fill={zone.bg}
                stroke={zone.color}
                strokeWidth="1.5"
                strokeOpacity="0.3"
              />

              {/* Fill rect clipped to droplet shape */}
              <g clipPath="url(#hc-droplet-clip)">
                {/* Solid fill */}
                <rect
                  className="hc-fill-rect"
                  x="0"
                  y={110 - (fillPct / 100) * 110}
                  width="90"
                  height={(fillPct / 100) * 110}
                  fill={zone.color}
                  opacity="0.15"
                />
                {/* Wave overlay */}
                <rect
                  x="0"
                  y={110 - (fillPct / 100) * 110 - 10}
                  width="90"
                  height={(fillPct / 100) * 110 + 10}
                  fill="url(#hc-wave-pattern)"
                />
                {/* Top color block */}
                <rect
                  x="0"
                  y={110 - (fillPct / 100) * 110 + 8}
                  width="90"
                  height={(fillPct / 100) * 110}
                  fill={zone.color}
                  opacity="0.12"
                />
              </g>

              {/* Shine highlight */}
              <ellipse cx="32" cy="45" rx="6" ry="10" fill="white" opacity="0.25" transform="rotate(-20 32 45)" />
            </svg>

            {/* Centered % label inside droplet */}
            <div className="hc-pct-label" style={{ color: fillPct > 45 ? "#000" : zone.color, textShadow: fillPct > 45 ? "0 1px 3px rgba(0,0,0,0.25)" : "none" }}>
              {Math.round(fillPct)}%
            </div>
          </div>

          <div className="hc-scale-label">0 · · · · 100%</div>
        </div>
      </div>
    </>
  );
}

export default Humiditycard;