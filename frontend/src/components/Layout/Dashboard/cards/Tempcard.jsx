import React, { useEffect, useState } from "react";
import GaugeComponent from "react-gauge-component";

function Tempcard({ res = 34.26 }) {
  const [min, setMin] = useState(res);
  const [max, setMax] = useState(res);
  const [prevRes, setPrevRes] = useState(res);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (res !== prevRes) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
      setPrevRes(res);
    }
    setMin((prev) => (res < prev ? res : prev));
    setMax((prev) => (res > prev ? res : prev));
  }, [res]);

  const trend = res > prevRes ? "↑" : res < prevRes ? "↓" : "—";

  const zone =
    res <= 20 ? { label: "COLD", color: "#3b82f6", bg: "#eff6ff" } :
    res <= 40 ? { label: "NOMINAL", color: "#10b981", bg: "#f0fdf4" } :
    res <= 60 ? { label: "WARM", color: "#f59e0b", bg: "#fffbeb" } :
               { label: "HOT", color: "#ef4444", bg: "#fef2f2" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .tc-root {
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

        .tc-root:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }

        .tc-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tc-zone-badge {
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

        .tc-zone-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${zone.color};
          animation: tc-pulse 2s ease-in-out infinite;
        }

        @keyframes tc-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .tc-zone-text {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 1.5px;
          color: ${zone.color};
          font-weight: 500;
        }

        .tc-section-label {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          letter-spacing: 1px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 1px;
        }

        .tc-current-row {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          line-height: 1;
        }

        .tc-current-val {
          font-size: 62px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -2px;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          transition: color 0.4s ease;
        }

        .tc-current-val.flash {
          color: ${zone.color};
        }

        .tc-unit {
          font-size: 20px;
          font-weight: 300;
          color: #94a3b8;
          padding-bottom: 8px;
        }

        .tc-trend {
          font-size: 18px;
          padding-bottom: 8px;
          font-weight: 600;
          color: ${zone.color};
        }

        .tc-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 10px 0;
        }

        .tc-minmax {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .tc-stat-label {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          letter-spacing: 1px;
          color: #475569;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .tc-stat-val {
          font-size: 22px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .tc-stat-val.min { color: #3b82f6; }
        .tc-stat-val.max { color: #ef4444; }

        .tc-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }

        .tc-gauge-subtitle {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          letter-spacing: 1.5px;
          color: #64748b;
          font-weight: 500;
          margin-top: -4px;
        }
      `}</style>

      <div className="tc-root">
        {/* Left */}
        <div className="tc-left">
          <div className="tc-zone-badge">
            <div className="tc-zone-dot" />
            <span className="tc-zone-text">{zone.label}</span>
          </div>

          <div className="tc-section-label">Temperature</div>

          <div className="tc-current-row">
            <span className={`tc-current-val${flash ? " flash" : ""}`}>{res}</span>
            <span className="tc-unit">°</span>
            <span className="tc-trend">{trend}</span>
          </div>

          <div className="tc-divider" />

          <div className="tc-minmax">
            <div>
              <div className="tc-stat-label">Min</div>
              <div className="tc-stat-val min">{min}°</div>
            </div>
            <div>
              <div className="tc-stat-label">Max</div>
              <div className="tc-stat-val max">{max}°</div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="tc-right">
          <GaugeComponent
            value={res}
            type="semicircle"
            minValue={0}
            maxValue={80}
            arc={{
              width: 0.16,
              padding: 0.02,
              cornerRadius: 2,
              subArcs: [
                { limit: 20, color: "#93c5fd" },
                { limit: 40, color: "#6ee7b7" },
                { limit: 60, color: "#fcd34d" },
                { color: "#fca5a5" },
              ],
            }}
            pointer={{
              type: "needle",
              color: "#475569",
              length: 0.7,
              width: 6,
              animationDuration: 200,
              animationDelay: 0,
            }}
            labels={{
              valueLabel: { hide: true },
              tickLabels: {
                hideMinMax: true,
                ticks: [],
                defaultTickLineConfig: { hide: true },
                defaultTickValueConfig: { hide: true },
              },
            }}
            style={{ width: "100%", maxWidth: "180px" }}
          />
          <div className="tc-gauge-subtitle">0 · · · · · · · 80</div>
        </div>
      </div>
    </>
  );
}

export default Tempcard;