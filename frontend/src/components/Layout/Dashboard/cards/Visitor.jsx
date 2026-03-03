import React, { useEffect, useState } from "react";

function Visitorcard({ res = 0, capacity = 500 }) {
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

    const start = displayVal;
    const duration = 400;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(Math.round(start + (res - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [res]);

  const trend = res > prevRes ? "↑" : res < prevRes ? "↓" : "—";
  const pct = Math.min((res / capacity) * 100, 100);

  const zone =
    pct < 30  ? { label: "QUIET",   color: "#10b981", bg: "#f0fdf4" } :
    pct < 60  ? { label: "ACTIVE",  color: "#3b82f6", bg: "#eff6ff" } :
    pct < 85  ? { label: "BUSY",    color: "#f59e0b", bg: "#fffbeb" } :
                { label: "CROWDED", color: "#ef4444", bg: "#fef2f2" };

  // 50 icons total — each represents capacity/50 people
  const TOTAL_ICONS = 50;
  const activeIcons = Math.round((res / capacity) * TOTAL_ICONS);

  const PersonIcon = ({ active }) => (
    <svg viewBox="0 0 10 18" width="10" height="18" style={{ display: "block", transition: "opacity 0.3s" }}>
      <circle cx="5" cy="3.5" r="2.8" fill={active ? zone.color : "#e2e8f0"} />
      <path d="M2 8 Q2 7 5 7 Q8 7 8 8 L8 13.5 Q8 14.5 5 14.5 Q2 14.5 2 13.5 Z" fill={active ? zone.color : "#e2e8f0"} opacity={active ? 0.9 : 1} />
      <line x1="3.2" y1="14" x2="2.2" y2="18" stroke={active ? zone.color : "#e2e8f0"} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="6.8" y1="14" x2="7.8" y2="18" stroke={active ? zone.color : "#e2e8f0"} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .vsc-root {
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
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: box-shadow 0.2s ease;
        }
        .vsc-root:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

        .vsc-left { display: flex; flex-direction: column; gap: 4px; }

        .vsc-zone-badge {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 20px; padding: 3px 10px 3px 6px;
          margin-bottom: 8px; width: fit-content;
          background: ${zone.bg}; border: 1px solid ${zone.color}33;
        }
        .vsc-zone-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${zone.color};
          animation: vsc-pulse 2s ease-in-out infinite;
        }
        @keyframes vsc-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .vsc-zone-text {
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 1.5px; color: ${zone.color}; font-weight: 500;
        }
        .vsc-section-label {
          font-family: 'DM Mono', monospace; font-size: 14px;
          letter-spacing: 1px; color: #64748b;
          text-transform: uppercase; font-weight: 500; margin-bottom: 1px;
        }
        .vsc-current-row { display: flex; align-items: flex-end; gap: 4px; line-height: 1; }
        .vsc-current-val {
          font-size: 62px; font-weight: 700; color: #0f172a;
          letter-spacing: -2px; line-height: 1;
          font-variant-numeric: tabular-nums; transition: color 0.4s ease;
        }
        .vsc-current-val.flash { color: ${zone.color}; }
        .vsc-trend { font-size: 18px; padding-bottom: 10px; font-weight: 600; color: ${zone.color}; }
        .vsc-divider { height: 1px; background: #f1f5f9; margin: 10px 0; }
        .vsc-minmax { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .vsc-stat-label {
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 1px; color: #475569;
          text-transform: uppercase; font-weight: 500; margin-bottom: 2px;
        }
        .vsc-stat-val { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
        .vsc-stat-val.min { color: #3b82f6; }
        .vsc-stat-val.max { color: #ef4444; }

        .vsc-right {
          display: flex; flex-direction: column;
          align-items: stretch; gap: 8px;
        }

        .vsc-grid-wrap {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 10px 8px;
        }
        .vsc-grid-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 7px;
        }
        .vsc-grid-title {
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 1px; color: #18191c; text-transform: uppercase;
        }
        .vsc-grid-ratio {
          font-family: 'DM Mono', monospace; font-size: 10px;
          font-weight: 600; color: ${zone.color};
        }
        .vsc-icon-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
        }

        .vsc-capacity-row {
          display: flex; align-items: center; gap: 8px;
        }
        .vsc-capacity-label {
          font-family: 'DM Mono', monospace; font-size: 13px;
          letter-spacing: 0.5px; color: #64748b;
          white-space: nowrap; font-weight: 500; flex-shrink: 0;
        }
        .vsc-capacity-bar-wrap {
          flex: 1; height: 5px; background: #e2e8f0;
          border-radius: 99px; overflow: hidden;
        }
        .vsc-capacity-bar-fill {
          height: 100%; border-radius: 99px;
          background: ${zone.color};
          width: ${pct}%;
          transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1), background 0.4s ease;
        }
        .vsc-pct-label {
          font-family: 'DM Mono', monospace; font-size: 9px;
          font-weight: 600; color: ${zone.color}; flex-shrink: 0;
        }
      `}</style>

      <div className="vsc-root">
        {/* Left */}
        <div className="vsc-left">
          <div className="vsc-zone-badge">
            <div className="vsc-zone-dot" />
            <span className="vsc-zone-text">{zone.label}</span>
          </div>

          <div className="vsc-section-label">Visitors</div>

          <div className="vsc-current-row">
            <span className={`vsc-current-val${flash ? " flash" : ""}`}>{displayVal}</span>
            <span className="vsc-trend">{trend}</span>
          </div>

          <div className="vsc-divider" />

          <div className="vsc-minmax">
            <div>
              <div className="vsc-stat-label">Min</div>
              <div className="vsc-stat-val min">{min}</div>
            </div>
            <div>
              <div className="vsc-stat-label">Max</div>
              <div className="vsc-stat-val max">{max}</div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="vsc-right">
          <div className="vsc-grid-wrap">
            <div className="vsc-grid-header">
              <span className="vsc-grid-title">Each icon = {Math.round(capacity / TOTAL_ICONS)} people</span>
              <span className="vsc-grid-ratio">{activeIcons}/{TOTAL_ICONS} filled</span>
            </div>
            <div className="vsc-icon-grid">
              {Array.from({ length: TOTAL_ICONS }).map((_, i) => (
                <PersonIcon key={i} active={i < activeIcons} />
              ))}
            </div>
          </div>

          <div className="vsc-capacity-row">
            <span className="vsc-capacity-label">{res} / {capacity}</span>
            <div className="vsc-capacity-bar-wrap">
              <div className="vsc-capacity-bar-fill" />
            </div>
            <span className="vsc-pct-label">{Math.round(pct)}%</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Visitorcard;