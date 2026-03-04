import { useState } from "react";

const RISK_DRIVERS = [
  { label: "AQI",         weight: 0.35 },
  { label: "Vibration",   weight: 0.28 },
  { label: "Temperature", weight: 0.20 },
  { label: "Rainfall",    weight: 0.17 },
];

function getRiskLevel(score) {
  if (score == null || isNaN(score)) return { label: "—",        color: "#94a3b8", bg: "#f8fafc" };
  if (score <= 25)  return { label: "LOW",      color: "#10b981", bg: "#f0fdf4" };
  if (score <= 50)  return { label: "MODERATE", color: "#f59e0b", bg: "#fffbeb" };
  if (score <= 75)  return { label: "HIGH",     color: "#f97316", bg: "#fff7ed" };
  return                   { label: "CRITICAL", color: "#ef4444", bg: "#fef2f2" };
}

function computeRisk(res) {
  if (!res || Object.keys(res).length === 0) return null;
  const aqiScore  = Math.min((res.aqi        ?? 0) / 300, 1) * 100;
  const vibScore  = Math.min((res.vibration  ?? 0) / 2,   1) * 100;
  const tempScore = Math.min(Math.max(((res.temperature ?? 20) - 20) / 30, 0), 1) * 100;
  const rainScore = Math.min((res.rainfall   ?? 0) / 100, 1) * 100;
  return Math.round(
    aqiScore  * 0.35 +
    vibScore  * 0.28 +
    tempScore * 0.20 +
    rainScore * 0.17
  );
}

function computeForecast(res, minutesAhead) {
  if (!res || Object.keys(res).length === 0) return null;
  const base = computeRisk(res);
  // Simulate a slight drift
  const drift = minutesAhead * (Math.random() * 1.4 - 0.5);
  return Math.min(Math.max(Math.round(base + drift), 0), 100);
}

export default function RightPanel({ res = {} }) {
  const [activeTab, setActiveTab] = useState("Before");
  const riskScore = computeRisk(res);
  const riskLevel = getRiskLevel(riskScore);
  const f5  = computeForecast(res, 5);
  const f10 = computeForecast(res, 10);
  const f5Level  = getRiskLevel(f5);
  const f10Level = getRiskLevel(f10);

  const driverScores = {
    AQI:         Math.round(Math.min((res.aqi        ?? 0) / 300, 1) * 100),
    Vibration:   Math.round(Math.min((res.vibration  ?? 0) / 2,   1) * 100),
    Temperature: Math.round(Math.min(Math.max(((res.temperature ?? 20) - 20) / 30, 0), 1) * 100),
    Rainfall:    Math.round(Math.min((res.rainfall   ?? 0) / 100, 1) * 100),
  };

  const tabs = ["Before", "After", "Evidence"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .rp-root {
          font-family: 'DM Sans', sans-serif;
          background: #ffffff;
          border-left: 1px solid #e2e8f0;
          width: 100%;
          height: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 16px 14px 16px;
          box-sizing: border-box;
        }
        .rp-root::-webkit-scrollbar { width: 3px; }
        .rp-root::-webkit-scrollbar-track { background: transparent; }
        .rp-root::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }

        /* Section wrapper */
        .rp-section {
          padding: 14px 0 12px;
          border-bottom: 1px solid #f1f5f9;
        }
        .rp-section:first-child { padding-top: 0; }
        .rp-section:last-child { border-bottom: none; }

        .rp-section-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 10px;
        }

        .rp-tag {
        //   font-family: 'DM Mono', monospace;
          font-size: 15px;
          letter-spacing: 2px;
          color: #182616;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        /* Risk Index */
        .rp-risk-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .rp-risk-score {
          font-family: 'DM Mono', monospace;
          font-size: 42px;
          font-weight: 500;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        .rp-risk-badge {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1.5px;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .rp-risk-bar-track {
          height: 6px;
          background: #f1f5f9;
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .rp-risk-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.8s cubic-bezier(0.34,1.2,0.64,1);
        }

        /* Drivers */
        .rp-drivers {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .rp-driver-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rp-driver-label {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #182616;
          width: 78px;
          flex-shrink: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .rp-driver-bar-wrap {
          flex: 1;
          height: 9px;
          background: #f1f5f9;
          border-radius: 99px;
          overflow: hidden;
        }
        .rp-driver-bar {
          height: 100%;
          border-radius: 99px;
          background: #94a3b8;
          transition: width 0.7s ease;
        }
        .rp-driver-val {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #182616;
          width: 22px;
          text-align: right;
          flex-shrink: 0;
        }

        /* Forecast rows */
        .rp-forecast-rows {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rp-forecast-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 10px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
        }
        .rp-forecast-time {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: #475569;
          font-weight: 500;
        }
        .rp-forecast-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rp-forecast-score {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }
        .rp-forecast-badge {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 1px;
          padding: 2px 7px;
          border-radius: 20px;
        }
        .rp-forecast-note {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.4;
          margin-top: 8px;
        }

        /* Restoration tabs */
        .rp-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 10px;
        }
        .rp-tab {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          font-weight: 500;
          padding: 5px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.15s ease;
          letter-spacing: 0.3px;
        }
        .rp-tab.active {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }
        .rp-tab:hover:not(.active) {
          background: #f8fafc;
          color: #475569;
        }
        .rp-image-box {
          background: #f8fafc;
          border: 1px dashed #e2e8f0;
          border-radius: 8px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }
        .rp-image-placeholder {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #cbd5e1;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .rp-restoration-note {
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.5;
        }
      `}</style>

      <div className="rp-root">

        {/* ── Risk Index ── */}
        <div className="rp-section">
          <div className="rp-tag">Risk Index (0–100)</div>
          <div className="rp-risk-row">
            <span className="rp-risk-score" style={{ color: riskLevel.color }}>
              {riskScore ?? "--"}
            </span>
            {riskScore != null && (
              <span
                className="rp-risk-badge"
                style={{ color: riskLevel.color, background: riskLevel.bg }}
              >
                {riskLevel.label}
              </span>
            )}
          </div>

          {riskScore != null && (
            <div className="rp-risk-bar-track">
              <div
                className="rp-risk-bar-fill"
                style={{ width: `${riskScore}%`, background: riskLevel.color }}
              />
            </div>
          )}
<hr className="mb-[10px]"/>
          <div className="rp-tag mt-2 mb-2" style={{ marginBottom: 6 }}>Explainable drivers</div>
          <div className="rp-drivers">
            {RISK_DRIVERS.map((d) => {
              const score = driverScores[d.label];
              const weighted = Math.round(score * d.weight);
              return (
                <div key={d.label} className="rp-driver-row">
                  <span className="rp-driver-label">{d.label}</span>
                  <div className="rp-driver-bar-wrap">
                    <div
                      className="rp-driver-bar"
                      style={{ width: `${score}%`, background: riskScore != null ? riskLevel.color : "#e2e8f0", opacity: 0.6 + d.weight * 0.8 }}
                    />
                  </div>
                  <span className="rp-driver-val">{riskScore != null ? weighted : "—"}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Forecast ── */}
        <div className="rp-section">
          <div className="rp-section-title">Forecast (10 minutes)</div>
          <div className="rp-forecast-rows">
            <div className="rp-forecast-row">
              <span className="rp-forecast-time">+5 min</span>
              <div className="rp-forecast-right">
                {f5 != null ? (
                  <>
                    <span className="rp-forecast-score" style={{ color: f5Level.color }}>{f5}</span>
                    <span className="rp-forecast-badge" style={{ color: f5Level.color, background: f5Level.bg }}>{f5Level.label}</span>
                  </>
                ) : <span className="rp-forecast-score" style={{ color: "#cbd5e1" }}>--</span>}
              </div>
            </div>
            <div className="rp-forecast-row">
              <span className="rp-forecast-time">+10 min</span>
              <div className="rp-forecast-right">
                {f10 != null ? (
                  <>
                    <span className="rp-forecast-score" style={{ color: f10Level.color }}>{f10}</span>
                    <span className="rp-forecast-badge" style={{ color: f10Level.color, background: f10Level.bg }}>{f10Level.label}</span>
                  </>
                ) : <span className="rp-forecast-score" style={{ color: "#cbd5e1" }}>--</span>}
              </div>
            </div>
          </div>
          <p className="rp-forecast-note">
            Predictive twin behaviour — forecasts risk trend, not just current state.
          </p>
        </div>

        {/* ── Restoration ── */}
        <div className="rp-section">
          <div className="rp-section-title">Restoration Preview</div>
          <div className="rp-tabs">
            {tabs.map((t) => (
              <button
                key={t}
                className={`rp-tab${activeTab === t ? " active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="rp-image-box">
            <span className="rp-image-placeholder">
              {activeTab === "Before"   && "Before image"}
              {activeTab === "After"    && "After simulation"}
              {activeTab === "Evidence" && "Evidence upload"}
            </span>
          </div>
          <p className="rp-restoration-note">
            <ul><li>Restoration notes</li>
            <li>Restoration notes</li></ul>
          </p>
        </div>

      </div>
    </>
  );
}