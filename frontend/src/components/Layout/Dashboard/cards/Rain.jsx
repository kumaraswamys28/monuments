import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Rainfallcard({ res = 0 }) {
  const [min, setMin] = useState(res);
  const [max, setMax] = useState(res);
  const [prevRes, setPrevRes] = useState(res);
  const [flash, setFlash] = useState(false);
  const [displayVal, setDisplayVal] = useState(res);
  const [history, setHistory] = useState(() =>
    Array(20).fill(null).map((_, i) => ({ t: i, mm: res }))
  );

  useEffect(() => {
    if (res !== prevRes) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
      setPrevRes(res);
      setHistory((h) => [...h.slice(1), { t: h[h.length - 1].t + 1, mm: res }]);
    }
    setMin((prev) => (res < prev ? res : prev));
    setMax((prev) => (res > prev ? res : prev));

    const startV = displayVal;
    const duration = 600;
    const startTime = performance.now();
    const animate = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayVal(+(startV + (res - startV) * eased).toFixed(2));
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [res]);

  const trend = res > prevRes ? "↑" : res < prevRes ? "↓" : "—";

  const zone =
    res < 10  ? { label: "TRACE",    color: "#94a3b8", bg: "#f8fafc",  desc: "Negligible rainfall"     } :
    res < 30  ? { label: "LIGHT",    color: "#60a5fa", bg: "#eff6ff",  desc: "Light rain conditions"   } :
    res < 60  ? { label: "MODERATE", color: "#3b82f6", bg: "#eff6ff",  desc: "Moderate rainfall"       } :
    res < 100 ? { label: "HEAVY",    color: "#1d4ed8", bg: "#eff6ff",  desc: "Heavy rain — caution"    } :
                { label: "EXTREME",  color: "#1e3a8a", bg: "#eff6ff",  desc: "Extreme rainfall — alert" };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 6, padding: "4px 8px",
          fontFamily: "DM Mono, monospace", fontSize: 10, color: "#0f172a"
        }}>
          {payload[0].value} mm
        </div>
      );
    }
    return null;
  };

  // Rain streaks — purely CSS animated, count + opacity scales with intensity
  const streakCount = Math.min(Math.max(Math.round(res / 4), 4), 28);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .rc-root {
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
        .rc-root:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

        .rc-left { display: flex; flex-direction: column; gap: 4px; }

        .rc-zone-badge {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 20px; padding: 3px 10px 3px 6px;
          margin-bottom: 8px; width: fit-content;
          background: ${zone.bg}; border: 1px solid ${zone.color}33;
        }
        .rc-zone-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${zone.color};
          animation: rc-pulse 2s ease-in-out infinite;
        }
        @keyframes rc-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .rc-zone-text {
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 1.5px; color: ${zone.color}; font-weight: 500;
        }
        .rc-section-label {
          font-family: 'DM Mono', monospace; font-size: 14px;
          letter-spacing: 1px; color: #64748b;
          text-transform: uppercase; font-weight: 500; margin-bottom: 1px;
        }
        .rc-current-row { display: flex; align-items: flex-end; gap: 4px; line-height: 1; }
        .rc-current-val {
          font-size: 62px; font-weight: 700; color: #0f172a;
          letter-spacing: -2px; line-height: 1;
          font-variant-numeric: tabular-nums; transition: color 0.4s ease;
        }
        .rc-current-val.flash { color: ${zone.color}; }
        .rc-unit {
          font-size: 18px; font-weight: 300; color: #94a3b8; padding-bottom: 10px;
        }
        .rc-trend { font-size: 18px; padding-bottom: 10px; font-weight: 600; color: ${zone.color}; }
        .rc-desc { font-size: 12px; color: #000; font-weight: 400; margin-top: 2px; }
        .rc-divider { height: 1px; background: #f1f5f9; margin: 10px 0; }
        .rc-minmax { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .rc-stat-label {
          font-family: 'DM Mono', monospace; font-size: 13px;
          letter-spacing: 1px; color: #475569;
          text-transform: uppercase; font-weight: 500; margin-bottom: 2px;
        }
        .rc-stat-val { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
        .rc-stat-val.min { color: #3b82f6; }
        .rc-stat-val.max { color: #ef4444; }

        .rc-right {
          display: flex; flex-direction: column;
          align-items: stretch; gap: 6px; height: 100%;
        }

        .rc-rain-wrap {
          background: #f0f7ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          height: 80px;
          flex-shrink: 0;
        }

        .rc-rain-streak {
          position: absolute;
          top: -20px;
          width: 1.5px;
          border-radius: 99px;
          background: linear-gradient(to bottom, transparent, ${zone.color}cc);
          animation: rc-fall linear infinite;
        }

        @keyframes rc-fall {
          0%   { transform: translateY(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(110px); opacity: 0; }
        }

        .rc-puddle {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: ${Math.min(res / 4, 22)}px;
          background: linear-gradient(to top, ${zone.color}22, transparent);
          transition: height 0.8s ease;
        }

        .rc-chart-wrap {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          flex: 1;
          min-height: 80px;
          padding: 8px 4px 4px 0;
          position: relative;
        }
        .rc-chart-title {
          position: absolute; top: 6px; left: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 8px; letter-spacing: 1px;
          color: #94a3b8; font-weight: 500; text-transform: uppercase; z-index: 1;
        }
      `}</style>

      {/* <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .rc-root {
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
        .rc-root:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.2); }

        .rc-left { display: flex; flex-direction: column; gap: 4px; }

        .rc-zone-badge {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 20px; padding: 3px 10px 3px 6px;
          margin-bottom: 8px; width: fit-content;
          background: ${zone.bg}; border: 1px solid ${zone.color}33;
        }
        .rc-zone-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${zone.color};
          animation: rc-pulse 2s ease-in-out infinite;
        }
        @keyframes rc-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .rc-zone-text {
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 1.5px; color: ${zone.color}; font-weight: 500;
        }
        .rc-section-label {
          font-family: 'DM Mono', monospace; font-size: 14px;
          letter-spacing: 1px; color: #8e9099;
          text-transform: uppercase; font-weight: 500; margin-bottom: 1px;
        }
        .rc-current-row { display: flex; align-items: flex-end; gap: 4px; line-height: 1; }
        .rc-current-val {
          font-size: 62px; font-weight: 700; color: #d0d1d3;
          letter-spacing: -2px; line-height: 1;
          font-variant-numeric: tabular-nums; transition: color 0.4s ease;
        }
        .rc-current-val.flash { color: ${zone.color}; }
        .rc-unit {
          font-size: 18px; font-weight: 300; color: #5a5f6b; padding-bottom: 10px;
        }
        .rc-trend { font-size: 18px; padding-bottom: 10px; font-weight: 600; color: ${zone.color}; }
        .rc-desc { font-size: 12px; color: #8e9099; font-weight: 400; margin-top: 2px; }
        .rc-divider { height: 1px; background: #2c3038; margin: 10px 0; }
        .rc-minmax { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .rc-stat-label {
          font-family: 'DM Mono', monospace; font-size: 13px;
          letter-spacing: 1px; color: #8e9099;
          text-transform: uppercase; font-weight: 500; margin-bottom: 2px;
        }
        .rc-stat-val { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
        .rc-stat-val.min { color: #5794f2; }
        .rc-stat-val.max { color: #f2495c; }

        .rc-right {
          display: flex; flex-direction: column;
          align-items: stretch; gap: 6px; height: 100%;
        }

        .rc-rain-wrap {
          background: #181b1f;
          border: 1px solid #34383f;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          height: 80px;
          flex-shrink: 0;
        }

        .rc-rain-streak {
          position: absolute;
          top: -20px;
          width: 1.5px;
          border-radius: 99px;
          background: linear-gradient(to bottom, transparent, ${zone.color}cc);
          animation: rc-fall linear infinite;
        }

        @keyframes rc-fall {
          0%   { transform: translateY(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(110px); opacity: 0; }
        }

        .rc-puddle {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: ${Math.min(res / 4, 22)}px;
          background: linear-gradient(to top, ${zone.color}22, transparent);
          transition: height 0.8s ease;
        }

        .rc-chart-wrap {
          background: #181b1f;
          border: 1px solid #34383f;
          border-radius: 8px;
          overflow: hidden;
          flex: 1;
          min-height: 80px;
          padding: 8px 4px 4px 0;
          position: relative;
        }
        .rc-chart-title {
          position: absolute; top: 6px; left: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 8px; letter-spacing: 1px;
          color: #5a5f6b; font-weight: 500; text-transform: uppercase; z-index: 1;
        }
      `}</style> */}

      <div className="rc-root">
        {/* Left */}
        <div className="rc-left">
          <div className="rc-zone-badge">
            <div className="rc-zone-dot" />
            <span className="rc-zone-text">{zone.label}</span>
          </div>
          <div className="rc-section-label">Rainfall</div>
          <div className="rc-current-row">
            <span className={`rc-current-val${flash ? " flash" : ""}`}>{displayVal}</span>
            <span className="rc-unit">mm</span>
            <span className="rc-trend">{trend}</span>
          </div>
          <div className="rc-desc">{zone.desc}</div>
          <div className="rc-divider" />
          <div className="rc-minmax">
            <div>
              <div className="rc-stat-label">Min</div>
              <div className="rc-stat-val min">{min} mm</div>
            </div>
            <div>
              <div className="rc-stat-label">Max</div>
              <div className="rc-stat-val max">{max} mm</div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="rc-right">

          {/* Animated rain streaks */}
          <div className="rc-rain-wrap">
            {Array.from({ length: streakCount }).map((_, i) => {
              const left = (i / streakCount) * 100 + (Math.random() * (100 / streakCount));
              const height = 10 + Math.random() * 14;
              const duration = 0.55 + Math.random() * 0.5;
              const delay = -(Math.random() * duration);
              const opacity = 0.4 + Math.min(res / 150, 0.6);
              return (
                <div
                  key={i}
                  className="rc-rain-streak"
                  style={{
                    left: `${left}%`,
                    height: `${height}px`,
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                    opacity,
                  }}
                />
              );
            })}
            <div className="rc-puddle" />
          </div>

          {/* Recharts Area Chart */}
          <div className="rc-chart-wrap">
            <span className="rc-chart-title">Trend</span>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={history}
                margin={{ top: 18, right: 8, left: -28, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="rcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={zone.color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={zone.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis
                  domain={[0, "auto"]}
                  tick={{ fontSize: 8, fontFamily: "DM Mono, monospace", fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  tickCount={4}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="mm"
                  stroke={zone.color}
                  strokeWidth={2}
                  fill="url(#rcGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: zone.color, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </>
  );
}

export default Rainfallcard;