import React, { useImperativeHandle, forwardRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  temperature: { label: "Temperature", color: "#ef4444" },
  humidity:    { label: "Humidity",    color: "#3b82f6" },
};

const ClimateChart = forwardRef((props, ref) => {
  const [history, setHistory] = useState([]);

  useImperativeHandle(ref, () => ({
    update: (newData) => {
      if (!newData) return;
      setHistory((prev) => {
        const timestamp = new Date().toLocaleTimeString([], {
          hour: "2-digit", minute: "2-digit", second: "2-digit",
        });
        return [...prev, {
          time: timestamp,
          temperature: newData.temperature,
          humidity: newData.humidity,
        }].slice(-10);
      });
    },
  }));

  const latest = history[history.length - 1];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .cc-root {
          font-family: 'DM Sans', sans-serif;
          background: #ffffff;
          border: 1px solid blue;
          border-radius: 12px;
          padding: 14px 16px 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          min-height: 0;
          flex: 1;
          overflow: hidden;
        }

        .cc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-shrink: 0;
        }

        .cc-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .cc-subtitle {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: 1px;
          color: #94a3b8;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .cc-live {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 1.5px;
          color: #10b981;
          font-weight: 500;
          text-transform: uppercase;
        }

        .cc-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: cc-blink 1.5s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes cc-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .cc-divider {
          height: 1px;
          background: #f1f5f9;
          flex-shrink: 0;
        }

        .cc-stats {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-shrink: 0;
        }

        .cc-stat-sep {
          width: 1px;
          height: 28px;
          background: #f1f5f9;
          flex-shrink: 0;
        }

        .cc-stat-label {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 1px;
        }

        .cc-stat-val {
          font-size: 18px;
          font-weight: 700;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }

        .cc-chart {
          flex: 1;
          min-height: 0;
        }

        .cc-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          letter-spacing: 1px;
          color: #cbd5e1;
          text-transform: uppercase;
        }

        .cc-legend {
          display: flex;
          gap: 14px;
          flex-shrink: 0;
        }

        .cc-legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: #64748b;
        }

        .cc-legend-dot {
          width: 10px;
          height: 3px;
          border-radius: 2px;
        }
      `}</style>

      {/* <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .cc-root {
          font-family: 'DM Sans', sans-serif;
          background: #1f2329;
          border: 1px solid #34383f;
          border-radius: 12px;
          padding: 14px 16px 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          min-height: 0;
          flex: 1;
          overflow: hidden;
        }

        .cc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-shrink: 0;
        }

        .cc-title {
          font-size: 18px;
          font-weight: 700;
          color: #d0d1d3;
          line-height: 1.2;
        }

        .cc-subtitle {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: 1px;
          color: #5a5f6b;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .cc-live {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 1.5px;
          color: #73bf69;
          font-weight: 500;
          text-transform: uppercase;
        }

        .cc-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #73bf69;
          animation: cc-blink 1.5s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes cc-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .cc-divider {
          height: 1px;
          background: #2c3038;
          flex-shrink: 0;
        }

        .cc-stats {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-shrink: 0;
        }

        .cc-stat-sep {
          width: 1px;
          height: 28px;
          background: #2c3038;
          flex-shrink: 0;
        }

        .cc-stat-label {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 1px;
        }

        .cc-stat-val {
          font-size: 18px;
          font-weight: 700;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }

        .cc-chart {
          flex: 1;
          min-height: 0;
        }

        .cc-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          letter-spacing: 1px;
          color: #5a5f6b;
          text-transform: uppercase;
        }

        .cc-legend {
          display: flex;
          gap: 14px;
          flex-shrink: 0;
        }

        .cc-legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: #8e9099;
        }

        .cc-legend-dot {
          width: 10px;
          height: 3px;
          border-radius: 2px;
        }
      `}</style> */}

      <div className="cc-root">
        {/* Header */}
        <div className="cc-header">
          <div>
            <div className="cc-title">Climate Analysis</div>
            <div className="cc-subtitle">Temp vs Humidity · Real-time</div>
          </div>
          <div className="cc-live">
            <div className="cc-live-dot" />
            Live
          </div>
        </div>

        <div className="cc-divider" />

        {/* Current values */}
        <div className="cc-stats">
          <div>
            <div className="cc-stat-label" style={{ color: "#ef4444" }}>Temp</div>
            <div className="cc-stat-val" style={{ color: "#ef4444" }}>
              {latest?.temperature != null ? `${latest.temperature}°` : "—"}
            </div>
          </div>
          <div className="cc-stat-sep" />
          <div>
            <div className="cc-stat-label" style={{ color: "#3b82f6" }}>Humidity</div>
            <div className="cc-stat-val" style={{ color: "#3b82f6" }}>
              {latest?.humidity != null ? `${latest.humidity}%` : "—"}
            </div>
          </div>
        </div>

        {/* Chart */}
        {history.length < 2 ? (
          <div className="cc-empty">Collecting data...</div>
        ) : (
          <div className="cc-chart">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={history} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="humGradFill2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 8, fontFamily: "DM Mono, monospace", fill: "#94a3b8" }}
                  tickMargin={1}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 8, fontFamily: "DM Mono, monospace", fill: "#94a3b8" }}
                  tickMargin={4}
                  domain={[0, 100]}
                  tickCount={5}
                />
                <ChartTooltip
                  cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                  content={<ChartTooltipContent />}
                />
                <Area
                  dataKey="humidity"
                  type="monotone"
                  fill="url(#humGradFill2)"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                  isAnimationActive={false}
                />
                <Area
                  dataKey="temperature"
                  type="monotone"
                  fill="url(#tempGradFill)"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}

        {/* Legend */}
        <div className="cc-legend">
          <div className="cc-legend-item">
            <div className="cc-legend-dot" style={{ background: "#ef4444" }} />
            Temp °C
          </div>
          <div className="cc-legend-item">
            <div className="cc-legend-dot" style={{ background: "#3b82f6" }} />
            Humidity %
          </div>
        </div>
      </div>
    </>
  );
});

ClimateChart.displayName = "ClimateChart";
export default ClimateChart;