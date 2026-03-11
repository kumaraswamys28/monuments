import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function aqiStatus(aqi) {
  if (aqi <= 50)  return { label: "GOOD",         color: "#10b981" };
  if (aqi <= 100) return { label: "MODERATE",     color: "#f59e0b" };
  if (aqi <= 150) return { label: "UNHEALTHY·SG", color: "#f97316" };
  if (aqi <= 200) return { label: "UNHEALTHY",    color: "#ef4444" };
  return                 { label: "HAZARDOUS",    color: "#7c3aed" };
}
function vibrationStatus(v) {
  if (v < 0.3) return { label: "LOW",      color: "#10b981" };
  if (v < 0.7) return { label: "MODERATE", color: "#f59e0b" };
  return               { label: "HIGH",    color: "#ef4444" };
}
function humidityStatus(h) {
  if (h < 30) return { label: "DRY",     color: "#f97316" };
  if (h < 60) return { label: "NOMINAL", color: "#10b981" };
  return              { label: "HUMID",  color: "#3b82f6" };
}
function visitorStatus(v) {
  if (v < 50)  return { label: "QUIET",    color: "#10b981" };
  if (v < 200) return { label: "BUSY",     color: "#8b5cf6" };
  return               { label: "CROWDED", color: "#ef4444" };
}
function rainfallStatus(r) {
  if (r < 0.1) return { label: "TRACE", color: "#94a3b8" };
  if (r < 5)   return { label: "LIGHT", color: "#06b6d4" };
  return               { label: "HEAVY", color: "#1d4ed8" };
}
function fmtTime(ts) {
  if (!ts) return "--";
  try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
  catch { return "--"; }
}

function MetricRow({ label, value, unit, status, barPct }) {
  return (
    <div className="lp-metric-row">
      <div className="lp-metric-top">
        <span className="lp-metric-label">{label}</span>
        <div className="lp-metric-right">
          <span className="lp-metric-status" style={{ color: status.color }}>{status.label}</span>
          <span className="lp-metric-value">{value}<span className="lp-metric-unit">{unit}</span></span>
        </div>
      </div>
      <div className="lp-bar-track">
        <div className="lp-bar-fill" style={{ width: `${barPct}%`, background: status.color }} />
      </div>
    </div>
  );
}

export default function LeftPanel({ res, data }) {
  const d = res ?? {};

  const tempSt = d.temperature > 40 ? { label: "HIGH", color: "#ef4444" } : d.temperature > 25 ? { label: "WARM", color: "#f97316" } : { label: "NOMINAL", color: "#10b981" };

  const metrics = [
    { label: "Temperature",  value: d.temperature   != null ? d.temperature.toFixed(1)    : "--", unit: "°C",  status: tempSt,                          barPct: Math.min((d.temperature ?? 0) / 50 * 100, 100) },
    { label: "Humidity",     value: d.humidity      != null ? d.humidity.toFixed(1)       : "--", unit: "%",   status: humidityStatus(d.humidity ?? 0),   barPct: Math.min(d.humidity ?? 0, 100) },
    { label: "AQI",          value: d.aqi           != null ? String(d.aqi)               : "--", unit: "",    status: aqiStatus(d.aqi ?? 0),             barPct: Math.min((d.aqi ?? 0) / 300 * 100, 100) },
    { label: "Vibration",    value: d.vibration     != null ? d.vibration.toFixed(3)      : "--", unit: " Hz", status: vibrationStatus(d.vibration ?? 0), barPct: Math.min((d.vibration ?? 0) / 2 * 100, 100) },
    { label: "Visitors",     value: d.visitor_count != null ? String(d.visitor_count)     : "--", unit: "",    status: visitorStatus(d.visitor_count ?? 0),barPct: Math.min((d.visitor_count ?? 0) / 500 * 100, 100) },
    { label: "Rainfall",     value: d.rainfall      != null ? d.rainfall.toFixed(2)       : "--", unit: " mm", status: rainfallStatus(d.rainfall ?? 0),   barPct: Math.min((d.rainfall ?? 0) / 100 * 100, 100) },
  ];

  const alerts = [];
  if (d.aqi         > 150) alerts.push({ msg: `AQI critical: ${d.aqi}`,                     color: "#ef4444" });
  if (d.vibration   > 0.7) alerts.push({ msg: `High vibration: ${d.vibration?.toFixed(3)} Hz`, color: "#f97316" });
  if (d.temperature > 40)  alerts.push({ msg: `High temp: ${d.temperature?.toFixed(1)}°C`,  color: "#f59e0b" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .lp-root {
          font-family: 'DM Sans', sans-serif;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          width: 100%;
          height: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 16px 16px 12px;
          box-sizing: border-box;
        }
        .lp-root::-webkit-scrollbar { width: 3px; }
        .lp-root::-webkit-scrollbar-track { background: transparent; }
        .lp-root::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }

        .lp-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
        }
        .lp-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.3;
        }
        .lp-device {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #3f4540;
          margin-top: 2px;
        }
        .lp-time {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #3f4540;
          margin-top: 1px;
        }
        .lp-live-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1.5px;
          color: #100981;
          border: 1px solid #10b98133;
          background: #f0fdf4;
          border-radius: 20px;
          padding: 3px 10px 3px 7px;
        }
        .lp-live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10b981;
          animation: lp-pulse 1.5s ease-in-out infinite;
        }
        @keyframes lp-pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
        }

        .lp-section {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          letter-spacing: 2px;
          color: #0f1f12;
          text-transform: uppercase;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid #f1f5f9;
        }

        .lp-metrics {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .lp-metric-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .lp-metric-top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .lp-metric-label {
          font-size: 14px;
          font-weight: 600;
          color: #475569;
        }

        .lp-metric-right {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .lp-metric-status {
          // font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .lp-metric-value {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          font-variant-numeric: tabular-nums;
        }

        .lp-metric-unit {
          font-size: 14px;
          font-weight: 400;
          color: #94a3b8;
          margin-left: 1px;
        }

        .lp-bar-track {
          height: 8px;
          background: #f1f5f9;
          border-radius: 99px;
          overflow: hidden;
        }

        .lp-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.7s cubic-bezier(0.34, 1.2, 0.64, 1);
        }

        .lp-alerts {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .lp-alert-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .lp-alert-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .lp-alert-msg {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        .lp-no-alerts {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          color: #10b981;
          letter-spacing: 0.5px;
        }

        .lp-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 12px 0;
        }
      `}</style>


      {/* <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .lp-root {
          font-family: 'DM Sans', sans-serif;
          background: #1f2329;
          border-right: 1px solid #34383f;
          width: 100%;
          height: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 16px 16px 12px;
          box-sizing: border-box;
        }
        .lp-root::-webkit-scrollbar { width: 3px; }
        .lp-root::-webkit-scrollbar-track { background: transparent; }
        .lp-root::-webkit-scrollbar-thumb { background: #34383f; border-radius: 99px; }

        .lp-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
        }
        .lp-title {
          font-size: 16px;
          font-weight: 700;
          color: #d0d1d3;
          line-height: 1.3;
        }
        .lp-device {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #8e9099;
          margin-top: 2px;
        }
        .lp-time {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #8e9099;
          margin-top: 1px;
        }
        .lp-live-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1.5px;
          color: #73bf69;
          border: 1px solid rgba(115,191,105,0.2);
          background: rgba(115,191,105,0.1);
          border-radius: 20px;
          padding: 3px 10px 3px 7px;
        }
        .lp-live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #73bf69;
          animation: lp-pulse 1.5s ease-in-out infinite;
        }
        @keyframes lp-pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
        }

        .lp-section {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          letter-spacing: 2px;
          color: #8e9099;
          text-transform: uppercase;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid #2c3038;
        }

        .lp-metrics {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .lp-metric-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .lp-metric-top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .lp-metric-label {
          font-size: 14px;
          font-weight: 600;
          color: #8e9099;
        }

        .lp-metric-right {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .lp-metric-status {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .lp-metric-value {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          color: #d0d1d3;
          font-variant-numeric: tabular-nums;
        }

        .lp-metric-unit {
          font-size: 14px;
          font-weight: 400;
          color: #5a5f6b;
          margin-left: 1px;
        }

        .lp-bar-track {
          height: 8px;
          background: #2a2e36;
          border-radius: 99px;
          overflow: hidden;
        }

        .lp-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.7s cubic-bezier(0.34, 1.2, 0.64, 1);
        }

        .lp-alerts {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .lp-alert-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: 8px;
          background: rgba(242,73,92,0.1);
          border: 1px solid rgba(242,73,92,0.25);
        }

        .lp-alert-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .lp-alert-msg {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        .lp-no-alerts {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          color: #73bf69;
          letter-spacing: 0.5px;
        }

        .lp-divider {
          height: 1px;
          background: #2c3038;
          margin: 12px 0;
        }
      `}</style> */}

      <div className="lp-root">
        {/* Header */}
        <div className="lp-header">
          <div>
            <div className="lp-title">{data?.title ? data.title.toUpperCase() : "DIGITAL TWIN"}</div>
            <div className="lp-device">{d.device_id ?? "SIM_DEVICE_01"}</div>
            <div className="lp-time">{fmtTime(d.timestamp)}</div>
          </div>
          <div className="lp-live-badge">
            <div className="lp-live-dot" />
            LIVE
          </div>
        </div>

        {/* Metrics */}
        <div className="lp-section">Sensor Readings</div>
        <div className="lp-metrics">
          {metrics.map((m) => (
            <MetricRow key={m.label} {...m} />
          ))}
        </div>

        <div className="lp-divider" />

        {/* Alerts */}
        <div className="lp-section">
          Alerts {alerts.length > 0 && `· ${alerts.length}`}
        </div>
        <div className="lp-alerts">
          {alerts.length === 0 ? (
            <span className="lp-no-alerts">✓ All systems nominal</span>
          ) : (
            alerts.map((a, i) => (
              <div key={i} className="lp-alert-row" style={{ background: `${a.color}10`, borderColor: `${a.color}33` }}>
                <div className="lp-alert-dot" style={{ background: a.color }} />
                <span className="lp-alert-msg" style={{ color: a.color }}>⚠ {a.msg}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}