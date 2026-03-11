import { useState, useEffect } from "react";

function DeviceIDcard({ deviceId = "SIM_DEVICE_01" }) {
  const [uptime, setUptime] = useState(0);
  const [pingMs, setPingMs] = useState(null);
  const [pingHistory, setPingHistory] = useState(Array(12).fill(null));
  const [status, setStatus] = useState("ONLINE");

  // Simulate uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate ping
  useEffect(() => {
    const ping = () => {
      const ms = Math.round(18 + Math.random() * 40);
      setPingMs(ms);
      setPingHistory((h) => [...h.slice(1), ms]);
    };
    ping();
    const interval = setInterval(ping, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  // Parse device ID into parts
  const parts = deviceId.split("_");
  const prefix = parts.slice(0, -1).join("_");
  const suffix = parts[parts.length - 1];

  // Ping bar heights
  const maxPing = Math.max(...pingHistory.filter(Boolean), 1);
  const pingColor = pingMs < 30 ? "#10b981" : pingMs < 60 ? "#f59e0b" : "#ef4444";
  const pingLabel = pingMs < 30 ? "GOOD" : pingMs < 60 ? "FAIR" : "POOR";

  return (
    <>
       <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .dc-root {
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
        .dc-root:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

        .dc-left { display: flex; flex-direction: column; gap: 6px; }

        .dc-status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 20px; padding: 3px 10px 3px 6px;
          margin-bottom: 4px; width: fit-content;
          background: #f0fdf4; border: 1px solid #10b98133;
        }
        .dc-status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10b981;
          animation: dc-pulse 2s ease-in-out infinite;
        }
        @keyframes dc-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .dc-status-text {
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 1.5px; color: #10b981; font-weight: 500;
        }

        .dc-section-label {
          font-family: 'DM Mono', monospace; font-size: 14px;
          letter-spacing: 1px; color: #64748b;
          text-transform: uppercase; font-weight: 500;
        }

        .dc-id-block {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .dc-id-prefix {
          font-family: 'DM Mono', monospace;
          font-size: 11px; color: #94a3b8; font-weight: 400;
          letter-spacing: 1px;
        }
        .dc-id-suffix {
          font-family: 'DM Mono', monospace;
          font-size: 26px; font-weight: 500;
          color: #0f172a; letter-spacing: 1px;
          line-height: 1.1;
        }

        .dc-divider { height: 1px; background: #f1f5f9; margin: 4px 0; }

        .dc-uptime-row {
          display: flex; flex-direction: column; gap: 1px;
        }
        .dc-uptime-label {
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 1px; color: #94a3b8; text-transform: uppercase;
        }
        .dc-uptime-val {
          font-family: 'DM Mono', monospace; font-size: 20px;
          font-weight: 500; color: #334155; letter-spacing: 1px;
          font-variant-numeric: tabular-nums;
        }

        .dc-right {
          display: flex; flex-direction: column;
          align-items: stretch; gap: 8px; height: 100%;
          justify-content: center;
        }

        .dc-ping-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 12px;
        }
        .dc-ping-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 8px;
        }
        .dc-ping-label {
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 1.5px; color: #94a3b8; text-transform: uppercase;
        }
        .dc-ping-val {
          font-family: 'DM Mono', monospace; font-size: 13px;
          font-weight: 500; color: ${pingColor};
          transition: color 0.3s;
        }
        .dc-ping-bars {
          display: flex; align-items: flex-end; gap: 3px; height: 32px;
        }
        .dc-ping-bar {
          flex: 1; border-radius: 2px 2px 0 0;
          transition: height 0.4s ease, background 0.3s;
          min-height: 2px;
        }
        .dc-ping-quality {
          display: flex; justify-content: space-between; margin-top: 5px;
        }
        .dc-ping-quality-label {
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 1px; color: ${pingColor}; font-weight: 500;
        }
        .dc-ping-quality-ms {
          font-family: 'DM Mono', monospace; font-size: 9px;
          color: #94a3b8;
        }

        .dc-meta-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        .dc-meta-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 10px;
        }
        .dc-meta-key {
          font-family: 'DM Mono', monospace; font-size: 8.5px;
          letter-spacing: 1px; color: #94a3b8;
          text-transform: uppercase; margin-bottom: 3px;
        }
        .dc-meta-val {
          font-family: 'DM Mono', monospace; font-size: 11px;
          font-weight: 500; color: #334155;
        }
      `}</style> 



      {/* <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .dc-root {
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
        .dc-root:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.2); }

        .dc-left { display: flex; flex-direction: column; gap: 6px; }

        .dc-status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 20px; padding: 3px 10px 3px 6px;
          margin-bottom: 4px; width: fit-content;
          background: rgba(115,191,105,0.1); border: 1px solid rgba(115,191,105,0.2);
        }
        .dc-status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #73bf69;
          animation: dc-pulse 2s ease-in-out infinite;
        }
        @keyframes dc-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .dc-status-text {
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 1.5px; color: #73bf69; font-weight: 500;
        }

        .dc-section-label {
          font-family: 'DM Mono', monospace; font-size: 14px;
          letter-spacing: 1px; color: #8e9099;
          text-transform: uppercase; font-weight: 500;
        }

        .dc-id-block {
          background: #181b1f;
          border: 1px solid #34383f;
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .dc-id-prefix {
          font-family: 'DM Mono', monospace;
          font-size: 11px; color: #5a5f6b; font-weight: 400;
          letter-spacing: 1px;
        }
        .dc-id-suffix {
          font-family: 'DM Mono', monospace;
          font-size: 26px; font-weight: 500;
          color: #d0d1d3; letter-spacing: 1px;
          line-height: 1.1;
        }

        .dc-divider { height: 1px; background: #2c3038; margin: 4px 0; }

        .dc-uptime-row {
          display: flex; flex-direction: column; gap: 1px;
        }
        .dc-uptime-label {
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 1px; color: #5a5f6b; text-transform: uppercase;
        }
        .dc-uptime-val {
          font-family: 'DM Mono', monospace; font-size: 20px;
          font-weight: 500; color: #d0d1d3; letter-spacing: 1px;
          font-variant-numeric: tabular-nums;
        }

        .dc-right {
          display: flex; flex-direction: column;
          align-items: stretch; gap: 8px; height: 100%;
          justify-content: center;
        }

        .dc-ping-card {
          background: #181b1f;
          border: 1px solid #34383f;
          border-radius: 8px;
          padding: 10px 12px;
        }
        .dc-ping-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 8px;
        }
        .dc-ping-label {
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 1.5px; color: #5a5f6b; text-transform: uppercase;
        }
        .dc-ping-val {
          font-family: 'DM Mono', monospace; font-size: 13px;
          font-weight: 500; color: ${pingColor};
          transition: color 0.3s;
        }
        .dc-ping-bars {
          display: flex; align-items: flex-end; gap: 3px; height: 32px;
        }
        .dc-ping-bar {
          flex: 1; border-radius: 2px 2px 0 0;
          transition: height 0.4s ease, background 0.3s;
          min-height: 2px;
        }
        .dc-ping-quality {
          display: flex; justify-content: space-between; margin-top: 5px;
        }
        .dc-ping-quality-label {
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 1px; color: ${pingColor}; font-weight: 500;
        }
        .dc-ping-quality-ms {
          font-family: 'DM Mono', monospace; font-size: 9px;
          color: #5a5f6b;
        }

        .dc-meta-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        .dc-meta-item {
          background: #181b1f;
          border: 1px solid #34383f;
          border-radius: 8px;
          padding: 8px 10px;
        }
        .dc-meta-key {
          font-family: 'DM Mono', monospace; font-size: 8.5px;
          letter-spacing: 1px; color: #5a5f6b;
          text-transform: uppercase; margin-bottom: 3px;
        }
        .dc-meta-val {
          font-family: 'DM Mono', monospace; font-size: 11px;
          font-weight: 500; color: #d0d1d3;
        }
      `}</style> */}

      <div className="dc-root">
        {/* Left */}
        <div className="dc-left">
          <div className="dc-status-badge">
            <div className="dc-status-dot" />
            <span className="dc-status-text">{status}</span>
          </div>

          <div className="dc-section-label">Device ID</div>

          <div className="dc-id-block">
            <span className="dc-id-prefix">{prefix}_</span>
            <span className="dc-id-suffix">{suffix}</span>
          </div>

          <div className="dc-divider" />

          <div className="dc-uptime-row">
            <span className="dc-uptime-label">Uptime</span>
            <span className="dc-uptime-val">{formatUptime(uptime)}</span>
          </div>
        </div>

        {/* Right */}
        <div className="dc-right">
          {/* Ping latency card */}
          <div className="dc-ping-card">
            <div className="dc-ping-header">
              <span className="dc-ping-label">Latency</span>
              <span className="dc-ping-val">{pingMs !== null ? `${pingMs} ms` : "—"}</span>
            </div>
            <div className="dc-ping-bars">
              {pingHistory.map((v, i) => (
                <div
                  key={i}
                  className="dc-ping-bar"
                  style={{
                    height: v ? `${(v / maxPing) * 100}%` : "4%",
                    background: v
                      ? v < 30 ? "#10b981" : v < 60 ? "#f59e0b" : "#ef4444"
                      : "#e2e8f0",
                    opacity: v ? 0.4 + (i / pingHistory.length) * 0.6 : 1,
                  }}
                />
              ))}
            </div>
            <div className="dc-ping-quality">
              <span className="dc-ping-quality-label">{pingLabel}</span>
              <span className="dc-ping-quality-ms">avg ~{Math.round(pingHistory.filter(Boolean).reduce((a, b) => a + b, 0) / (pingHistory.filter(Boolean).length || 1))} ms</span>
            </div>
          </div>

          {/* Meta grid */}
          <div className="dc-meta-grid">
            <div className="dc-meta-item">
              <div className="dc-meta-key">Type</div>
              <div className="dc-meta-val">Simulated</div>
            </div>
            <div className="dc-meta-item">
              <div className="dc-meta-key">Protocol</div>
              <div className="dc-meta-val">MQTT</div>
            </div>
            <div className="dc-meta-item">
              <div className="dc-meta-key">Version</div>
              <div className="dc-meta-val">v2.4.1</div>
            </div>
            <div className="dc-meta-item">
              <div className="dc-meta-key">Region</div>
              <div className="dc-meta-val">IN-KA</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeviceIDcard;