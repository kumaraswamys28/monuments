// BackendStatus.jsx
import { useEffect, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_SERVER_URL; // ← change this

const STATUS = {
  checking: { label: "Checking...", color: "#64748b", pulse: false },
  online:   { label: "API Online",  color: "#22c55e", pulse: false },
  starting: { label: "Cold Starting", color: "#f59e0b", pulse: true },
  offline:  { label: "Offline",     color: "#ef4444", pulse: false },
};

export default function BackendStatus() {
  const [status, setStatus] = useState("checking");
  const [latency, setLatency] = useState(null);
  const [open, setOpen] = useState(false);

  const check = async () => {
    setStatus("checking");
    setLatency(null);
    const t0 = Date.now();
    try {
      const res = await fetch(`${BACKEND_URL}/`, {
        signal: AbortSignal.timeout(15000), // 15s for cold starts
      });
      const ms = Date.now() - t0;
      setLatency(ms);
      if (res.ok) {
        setStatus(ms > 4000 ? "starting" : "online");
      } else {
        setStatus("offline");
      }
    } catch {
      setLatency(null);
      setStatus("offline");
    }
  };

  // Poll every 30s
  useEffect(() => {
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const s = STATUS[status];

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* The pill button */}
      <button
        onClick={() => { setOpen(o => !o); }}
        style={{
  display: "flex",
  alignItems: "center",
  gap: "7px",
  background: `${s.color}22`,          // ← dynamic, subtle tint
  border: `1px solid ${s.color}44`,    // ← matching border
  borderRadius: "999px",
  padding: "5px 12px 5px 8px",
  cursor: "pointer",
  color: "#e2e8f0",
  fontSize: "12px",
  fontFamily: "monospace",
  letterSpacing: "0.03em",
  whiteSpace: "nowrap",
  backdropFilter: "blur(8px)",
  transition: "background 0.2s, border 0.2s",
}}
onMouseEnter={e => e.currentTarget.style.background = `${s.color}44`}
onMouseLeave={e => e.currentTarget.style.background = `${s.color}22`}
        title="Backend API Status"
      >
        {/* Dot with optional pulse */}
        <span style={{ position:'relative', width: 10, height: 10, flexShrink: 0 }}>
          {s.pulse && (
            <span style={{
              position: "absolute", inset: -3,
              borderRadius: "50%",
              background: s.color,
              opacity: 0.3,
              animation: "ping 1.2s cubic-bezier(0,0,0.2,1) infinite",
            }} />
          )}
          <span style={{
            display: "block", width: 10, height: 10,
            borderRadius: "50%",
            background: s.color,
            boxShadow: `0 0 6px ${s.color}88`,
          }} />

        </span>
       
        {latency && <span style={{ color: "#94a3b8", marginLeft: 2 }}>({latency}ms)</span>}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          background: "#0f172a",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          padding: "14px 16px",
          minWidth: "220px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          zIndex: 999,
          fontFamily: "monospace",
          fontSize: "12px",
          color: "#94a3b8",
        }}>
          <div style={{ color: "#e2e8f0", fontWeight: 600, marginBottom: 10, fontSize: 13 }}>
            API Status
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>Endpoint</span>
            <span style={{ color: "#e2e8f0", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
              {BACKEND_URL.replace("https://", "")}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>Status</span>
            <span style={{ color: s.color }}>{s.label}</span>
          </div>
          {latency && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span>Latency</span>
              <span style={{ color: latency > 3000 ? "#f59e0b" : "#22c55e" }}>{latency}ms</span>
            </div>
          )}
          <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10 }}>
            <button
              onClick={check}
              style={{
                width: "100%", padding: "6px", borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e2e8f0", cursor: "pointer", fontSize: 12,
                fontFamily: "monospace",
              }}
            >
              ↻ Recheck
            </button>
          </div>
        </div>
      )}

      {/* Ping keyframe — inject once */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}