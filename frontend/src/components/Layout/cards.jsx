import React, { useImperativeHandle, useRef, forwardRef } from "react";

const labelConfig = {
  temperature:   { label: "Temperature",   unit: "°C", max: 50,   color: "#ef4444" },
  humidity:      { label: "Humidity",      unit: "%",  max: 100,  color: "#3b82f6" },
  aqi:           { label: "AQI",           unit: "",   max: 300,  color: "#f97316" },
  vibration:     { label: "Vibration",     unit: " Hz",max: 10,   color: "#8b5cf6" },
  visitor_count: { label: "Visitors",      unit: "",   max: 1000, color: "#10b981" },
  rainfall:      { label: "Rainfall",      unit: " mm",max: 150,  color: "#06b6d4" },
};

const Cards = forwardRef((props, ref) => {
  const valueRefs    = useRef({});
  const barRefs      = useRef({});
  const pctRefs      = useRef({});
  const rowRefs      = useRef({});

  useImperativeHandle(ref, () => ({
    update: (newData) => {
      if (!newData) return;
      Object.entries(newData).forEach(([key, value]) => {
        const config = labelConfig[key];
        if (!config) return;

        if (valueRefs.current[key]) {
          valueRefs.current[key].innerText = `${value}${config.unit}`;
        }

        if (barRefs.current[key]) {
          const pct = Math.min((value / config.max) * 100, 100);
          barRefs.current[key].style.width = `${pct}%`;
          if (pctRefs.current[key]) {
            pctRefs.current[key].innerText = `${Math.round(pct)}%`;
          }
        }

        // flash row
        if (rowRefs.current[key]) {
          rowRefs.current[key].style.background = `${config.color}08`;
          setTimeout(() => {
            if (rowRefs.current[key]) rowRefs.current[key].style.background = "transparent";
          }, 400);
        }
      });
    },
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .cards-root {
          font-family: 'DM Sans', sans-serif;
          background: #ffffff;
          border: 1px solid blue;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }

        .cards-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 10px;
          border-bottom: 1px solid #f1f5f9;
          flex-shrink: 0;
        }

        .cards-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .cards-live {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: 1.5px;
          color: #10b981;
          font-weight: 500;
          text-transform: uppercase;
        }

        .cards-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: cards-blink 1.5s ease-in-out infinite;
        }

        @keyframes cards-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .cards-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }

        .cards-body::-webkit-scrollbar { width: 3px; }
        .cards-body::-webkit-scrollbar-track { background: transparent; }
        .cards-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }

        .cards-row {
          display: grid;
          grid-template-columns: 100px 1fr 72px;
          align-items: center;
          padding: 8px 16px;
          border-bottom: 1px solid #f8fafc;
          transition: background 0.4s ease;
          gap: 10px;
        }

        .cards-row:last-child { border-bottom: none; }

        .cards-row-label {
          font-size: 15px;
          font-weight: 600;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cards-bar-wrap {
          height: 7px;
          background: #f1f5f9;
          border-radius: 99px;
          overflow: hidden;
        }

        .cards-bar-fill {
          height: 100%;
          border-radius: 99px;
          width: 0%;
          transition: width 0.7s cubic-bezier(0.34, 1.2, 0.64, 1);
        }

        .cards-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1px;
        }

        .cards-value {
          // font-family: 'DM Mono', monospace;
          font-size: 13px;
          font-weight: 300;
          color: #000000;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }

        .cards-pct {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #94a3b8;
          font-weight: 400;
        }

        .cards-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-right: 6px;
          display: inline-block;
        }
      `}</style>

      <div className="cards-root">
        <div className="cards-header">
          <span className="cards-title px-1">Live Telemetry</span>
          <div className="cards-live">
            <div className="cards-live-dot" />
            Live
          </div>
        </div>

        <div className="cards-body">
          {Object.entries(labelConfig).map(([key, config]) => (
            <div
              key={key}
              className="cards-row"
              ref={(el) => (rowRefs.current[key] = el)}
            >
              {/* Label with color dot */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <span
                  className="cards-dot"
                  style={{ background: config.color }}
                />
                <span className="cards-row-label">{config.label}</span>
              </div>

              {/* Bar */}
              <div className="cards-bar-wrap">
                <div
                  className="cards-bar-fill"
                  ref={(el) => (barRefs.current[key] = el)}
                  style={{ background: config.color }}
                />
              </div>

              {/* Value + pct */}
              <div className="cards-right">
                <span
                  className="cards-value"
                  ref={(el) => (valueRefs.current[key] = el)}
                >
                  —
                </span>
                {/* <span
                  className="cards-pct"
                  ref={(el) => (pctRefs.current[key] = el)}
                >
                  —
                </span> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
});

Cards.displayName = "Cards";
export default Cards;