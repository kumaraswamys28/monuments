import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SEGMENTS = [
  { label: "Good",      max: 50,  color: "#10b981" },
  { label: "Moderate",  max: 100, color: "#f59e0b" },
  { label: "Unhealthy", max: 150, color: "#f97316" },
  { label: "Very Bad",  max: 200, color: "#ef4444" },
  { label: "Hazardous", max: 300, color: "#7c3aed" },
];
const AQI_MAX = 300;

function AQIcard({ res = 0 }) {
  const [min, setMin] = useState(res);
  const [max, setMax] = useState(res);
  const [prevRes, setPrevRes] = useState(res);
  const [flash, setFlash] = useState(false);
  const [displayVal, setDisplayVal] = useState(res);
  const [markerPct, setMarkerPct] = useState((res / AQI_MAX) * 100);
  const [history, setHistory] = useState(() =>
    Array(20).fill(null).map((_, i) => ({ t: i, aqi: res }))
  );

  useEffect(() => {
    if (res !== prevRes) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
      setPrevRes(res);
      setHistory((h) => {
        const next = [...h.slice(1), { t: h[h.length - 1].t + 1, aqi: res }];
        return next;
      });
    }
    setMin((prev) => (res < prev ? res : prev));
    setMax((prev) => (res > prev ? res : prev));

    const startV = displayVal;
    const startM = markerPct;
    const endM = (res / AQI_MAX) * 100;
    const duration = 600;
    const startTime = performance.now();
    const animate = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayVal(Math.round(startV + (res - startV) * eased));
      setMarkerPct(startM + (endM - startM) * eased);
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [res]);

  const trend = res > prevRes ? "↑" : res < prevRes ? "↓" : "—";

  const zone =
    res <= 50  ? { label: "GOOD",           color: "#10b981", bg: "#f0fdf4", desc: "Air quality is satisfactory"  } :
    res <= 100 ? { label: "MODERATE",       color: "#f59e0b", bg: "#fffbeb", desc: "Acceptable air quality"       } :
    res <= 150 ? { label: "UNHEALTHY",      color: "#f97316", bg: "#fff7ed", desc: "Sensitive groups at risk"     } :
    res <= 200 ? { label: "VERY UNHEALTHY", color: "#ef4444", bg: "#fef2f2", desc: "Everyone may be affected"     } :
                 { label: "HAZARDOUS",      color: "#7c3aed", bg: "#f5f3ff", desc: "Health emergency"             };

  const clampedPct = Math.min(Math.max(markerPct, 0), 100);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 6, padding: "4px 8px",
          fontFamily: "DM Mono, monospace", fontSize: 10, color: "#0f172a"
        }}>
          {payload[0].value}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .ac-root {
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
        .ac-root:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .ac-left { display: flex; flex-direction: column; gap: 4px; }
        .ac-zone-badge {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 20px; padding: 3px 10px 3px 6px;
          margin-bottom: 8px; width: fit-content;
          background: ${zone.bg}; border: 1px solid ${zone.color}33;
        }
        .ac-zone-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${zone.color};
          animation: ac-pulse 2s ease-in-out infinite;
        }
        @keyframes ac-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .ac-zone-text {
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 1.5px; color: ${zone.color}; font-weight: 500;
        }
        .ac-section-label {
          font-family: 'DM Mono', monospace; font-size: 14px;
          letter-spacing: 1px; color: #64748b;
          text-transform: uppercase; font-weight: 500; margin-bottom: 1px;
        }
        .ac-current-row { display: flex; align-items: flex-end; gap: 4px; line-height: 1; }
        .ac-current-val {
          font-size: 62px; font-weight: 700; color: #0f172a;
          letter-spacing: -2px; line-height: 1;
          font-variant-numeric: tabular-nums; transition: color 0.4s ease;
        }
        .ac-current-val.flash { color: ${zone.color}; }
        .ac-trend { font-size: 18px; padding-bottom: 10px; font-weight: 600; color: ${zone.color}; }
        .ac-desc { font-size: 14px; color: #94a3b8; font-weight: 400; margin-top: 2px; }
        .ac-divider { height: 1px; background: #f1f5f9; margin: 10px 0; }
        .ac-minmax { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ac-stat-label {
          font-family: 'DM Mono', monospace; font-size: 13px;
          letter-spacing: 1px; color: #475569;
          text-transform: uppercase; font-weight: 500; margin-bottom: 2px;
        }
        .ac-stat-val { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
        .ac-stat-val.min { color: #3b82f6; }
        .ac-stat-val.max { color: #ef4444; }

        .ac-right {
          display: flex; flex-direction: column;
          align-items: stretch; gap: 6px; height: 100%;
        }

        .ac-chart-wrap {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          flex: 1;
          min-height: 90px;
          padding: 8px 4px 4px 0;
          position: relative;
        }
        .ac-chart-title {
          position: absolute;
          top: 6px; left: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 8px; letter-spacing: 1px;
          color: #94a3b8; font-weight: 500;
          text-transform: uppercase;
          z-index: 1;
        }

        .ac-bar-section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 10px 8px;
        }
        .ac-tick-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .ac-tick-val { font-family: 'DM Mono', monospace; font-size: 8px; color: #94a3b8; font-weight: 400; }
        .ac-bar-track {
          position: relative; height: 10px; border-radius: 99px; overflow: visible;
          background: linear-gradient(to right,
            #10b981 0%, #10b981 16.6%,
            #f59e0b 16.6%, #f59e0b 33.3%,
            #f97316 33.3%, #f97316 50%,
            #ef4444 50%, #ef4444 66.6%,
            #7c3aed 66.6%, #7c3aed 100%
          );
          margin-bottom: 6px;
        }
        .ac-bar-marker {
          position: absolute; top: 50%;
          transform: translate(-50%, -50%);
          width: 16px; height: 16px; border-radius: 50%;
          background: #fff;
          border: 2.5px solid ${zone.color};
          box-shadow: 0 1px 6px rgba(0,0,0,0.18);
          transition: left 0.6s cubic-bezier(0.34,1.2,0.64,1), border-color 0.4s ease;
          z-index: 2;
        }
        .ac-bar-marker::after {
          content: ''; position: absolute; inset: 3px;
          border-radius: 50%; background: ${zone.color};
          transition: background 0.4s ease;
        }
        .ac-bar-labels { display: flex; justify-content: space-between; }
        .ac-bar-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px; letter-spacing: 0.3px; font-weight: 500; line-height: 1;
        }
      `}</style>


      {/* <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .ac-root {
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
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: box-shadow 0.2s ease;
        }
        .ac-root:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
        .ac-left { display: flex; flex-direction: column; gap: 4px; }
        .ac-zone-badge {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 20px; padding: 3px 10px 3px 6px;
          margin-bottom: 8px; width: fit-content;
          background: ${zone.bg}; border: 1px solid ${zone.color}33;
        }
        .ac-zone-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${zone.color};
          animation: ac-pulse 2s ease-in-out infinite;
        }
        @keyframes ac-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .ac-zone-text {
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 1.5px; color: ${zone.color}; font-weight: 500;
        }
        .ac-section-label {
          font-family: 'DM Mono', monospace; font-size: 14px;
          letter-spacing: 1px; color: #8e9099;
          text-transform: uppercase; font-weight: 500; margin-bottom: 1px;
        }
        .ac-current-row { display: flex; align-items: flex-end; gap: 4px; line-height: 1; }
        .ac-current-val {
          font-size: 62px; font-weight: 700; color: #d0d1d3;
          letter-spacing: -2px; line-height: 1;
          font-variant-numeric: tabular-nums; transition: color 0.4s ease;
        }
        .ac-current-val.flash { color: ${zone.color}; }
        .ac-trend { font-size: 18px; padding-bottom: 10px; font-weight: 600; color: ${zone.color}; }
        .ac-desc { font-size: 14px; color: #5a5f6b; font-weight: 400; margin-top: 2px; }
        .ac-divider { height: 1px; background: #2c3038; margin: 10px 0; }
        .ac-minmax { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ac-stat-label {
          font-family: 'DM Mono', monospace; font-size: 13px;
          letter-spacing: 1px; color: #8e9099;
          text-transform: uppercase; font-weight: 500; margin-bottom: 2px;
        }
        .ac-stat-val { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
        .ac-stat-val.min { color: #5794f2; }
        .ac-stat-val.max { color: #f2495c; }

        .ac-right {
          display: flex; flex-direction: column;
          align-items: stretch; gap: 6px; height: 100%;
        }

        .ac-chart-wrap {
          background: #181b1f;
          border: 1px solid #34383f;
          border-radius: 8px;
          overflow: hidden;
          flex: 1;
          min-height: 90px;
          padding: 8px 4px 4px 0;
          position: relative;
        }
        .ac-chart-title {
          position: absolute;
          top: 6px; left: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 8px; letter-spacing: 1px;
          color: #5a5f6b; font-weight: 500;
          text-transform: uppercase;
          z-index: 1;
        }

        .ac-bar-section {
          background: #181b1f;
          border: 1px solid #34383f;
          border-radius: 8px;
          padding: 10px 10px 8px;
        }
        .ac-tick-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .ac-tick-val { font-family: 'DM Mono', monospace; font-size: 8px; color: #5a5f6b; font-weight: 400; }
        .ac-bar-track {
          position: relative; height: 10px; border-radius: 99px; overflow: visible;
          background: linear-gradient(to right,
            #73bf69 0%, #73bf69 16.6%,
            #fade2a 16.6%, #fade2a 33.3%,
            #ff780a 33.3%, #ff780a 50%,
            #f2495c 50%, #f2495c 66.6%,
            #b877d9 66.6%, #b877d9 100%
          );
          margin-bottom: 6px;
        }
        .ac-bar-marker {
          position: absolute; top: 50%;
          transform: translate(-50%, -50%);
          width: 16px; height: 16px; border-radius: 50%;
          background: #1f2329;
          border: 2.5px solid ${zone.color};
          box-shadow: 0 1px 6px rgba(0,0,0,0.4);
          transition: left 0.6s cubic-bezier(0.34,1.2,0.64,1), border-color 0.4s ease;
          z-index: 2;
        }
        .ac-bar-marker::after {
          content: ''; position: absolute; inset: 3px;
          border-radius: 50%; background: ${zone.color};
          transition: background 0.4s ease;
        }
        .ac-bar-labels { display: flex; justify-content: space-between; }
        .ac-bar-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px; letter-spacing: 0.3px; font-weight: 500; line-height: 1;
        }
      `}</style> */}

      <div className="ac-root">
        {/* Left */}
        <div className="ac-left">
          <div className="ac-zone-badge">
            <div className="ac-zone-dot" />
            <span className="ac-zone-text">{zone.label}</span>
          </div>
          <div className="ac-section-label">AQI Status</div>
          <div className="ac-current-row">
            <span className={`ac-current-val${flash ? " flash" : ""}`}>{displayVal}</span>
            <span className="ac-trend">{trend}</span>
          </div>
          <div className="ac-desc">{zone.desc}</div>
          <div className="ac-divider" />
          <div className="ac-minmax">
            <div>
              <div className="ac-stat-label">Min</div>
              <div className="ac-stat-val min">{min}</div>
            </div>
            <div>
              <div className="ac-stat-label">Max</div>
              <div className="ac-stat-val max">{max}</div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="ac-right">

          {/* Recharts Area Chart */}
          <div className="ac-chart-wrap">
            <span className="ac-chart-title">Trend</span>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={history}
                margin={{ top: 18, right: 8, left: -28, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={zone.color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={zone.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis
                  domain={[0, AQI_MAX]}
                  tick={{ fontSize: 8, fontFamily: "DM Mono, monospace", fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  tickCount={4}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke={zone.color}
                  strokeWidth={2}
                  fill="url(#aqiGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: zone.color, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Gradient bar meter */}
          <div className="ac-bar-section">
            <div className="ac-tick-row">
              {[0, 100, 200, 300].map((v) => (
                <span key={v} className="ac-tick-val">{v}</span>
              ))}
            </div>
            <div className="ac-bar-track">
              <div className="ac-bar-marker" style={{ left: `${clampedPct}%` }} />
            </div>
            <div className="ac-bar-labels">
              {SEGMENTS.map((s, i) => (
                <span
                  key={s.label}
                  className="ac-bar-label"
                  style={{ color: res <= s.max && res > (SEGMENTS[i - 1]?.max ?? 0) ? s.color : "#cbd5e1" }}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default AQIcard;