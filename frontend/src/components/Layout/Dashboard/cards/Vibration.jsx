import React, { useEffect, useState, useRef } from "react";

function Vibrationcard({ res = 0.589 }) {
  const [min, setMin] = useState(res);
  const [max, setMax] = useState(res);
  const [prevRes, setPrevRes] = useState(res);
  const [flash, setFlash] = useState(false);
  const [displayVal, setDisplayVal] = useState(res);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    if (res !== prevRes) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
      setPrevRes(res);
    }
    setMin((prev) => (res < prev ? res : prev));
    setMax((prev) => (res > prev ? res : prev));

    const start = displayVal;
    const end = res;
    const duration = 400;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(+(start + (end - start) * eased).toFixed(3));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [res]);

  const trend = res > prevRes ? "↑" : res < prevRes ? "↓" : "—";

  const zone =
    res < 0.1  ? { label: "STABLE",   color: "#10b981", bg: "#f0fdf4" } :
    res < 0.5  ? { label: "LOW",      color: "#3b82f6", bg: "#eff6ff" } :
    res < 1.0  ? { label: "MODERATE", color: "#f59e0b", bg: "#fffbeb" } :
                 { label: "HIGH",     color: "#ef4444", bg: "#fef2f2" };

  // Canvas seismic wave animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    const draw = (ts) => {
      timeRef.current = ts;
      ctx.clearRect(0, 0, W, H);

      const amplitude = Math.min(res * 28, H * 0.42);
      const frequency = 0.04 + res * 0.03;
      const speed = 0.003 + res * 0.004;
      const numLines = 3;

      for (let l = 0; l < numLines; l++) {
        const alpha = l === 0 ? 1 : l === 1 ? 0.35 : 0.15;
        const layerAmp = amplitude * (l === 0 ? 1 : l === 1 ? 0.6 : 0.35);
        const layerFreq = frequency * (1 + l * 0.3);
        const phaseShift = (l * Math.PI) / numLines;

        ctx.beginPath();
        ctx.strokeStyle = zone.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = l === 0 ? 2 : 1;
        ctx.shadowColor = zone.color;
        ctx.shadowBlur = l === 0 ? 8 : 0;

        for (let x = 0; x <= W; x++) {
          // Seismic: center-weighted gaussian envelope
          const norm = (x / W - 0.5) * 2; // -1 to 1
          const envelope = Math.exp(-norm * norm * 1.8);
          const y =
            H / 2 +
            Math.sin(x * layerFreq + ts * speed + phaseShift) *
              layerAmp *
              envelope;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Center vertical tick
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = zone.color;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Baseline
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [res, zone.color]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .vc-root {
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

        .vc-root:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }

        .vc-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .vc-zone-badge {
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

        .vc-zone-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${zone.color};
          animation: vc-pulse 2s ease-in-out infinite;
        }

        @keyframes vc-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .vc-zone-text {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 1.5px;
          color: ${zone.color};
          font-weight: 500;
        }

        .vc-section-label {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          letter-spacing: 1px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 1px;
        }

        .vc-current-row {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          line-height: 1;
        }

        .vc-current-val {
          font-size: 62px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -2px;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          transition: color 0.4s ease;
        }

        .vc-current-val.flash {
          color: ${zone.color};
        }

        .vc-unit {
          font-size: 18px;
          font-weight: 400;
          color: #94a3b8;
          padding-bottom: 10px;
        }

        .vc-trend {
          font-size: 18px;
          padding-bottom: 10px;
          font-weight: 600;
          color: ${zone.color};
        }

        .vc-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 10px 0;
        }

        .vc-minmax {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .vc-stat-label {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          letter-spacing: 1px;
          color: #475569;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .vc-stat-val {
          font-size: 22px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .vc-stat-val.min { color: #3b82f6; }
        .vc-stat-val.max { color: #ef4444; }

        .vc-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .vc-canvas-wrap {
          position: relative;
          width: 100%;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .vc-canvas-wrap canvas {
          display: block;
          width: 100%;
        }

        .vc-scale-label {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          letter-spacing: 1.5px;
          color: #64748b;
          font-weight: 500;
        }
      `}</style>

      <div className="vc-root">
        {/* Left */}
        <div className="vc-left">
          <div className="vc-zone-badge">
            <div className="vc-zone-dot" />
            <span className="vc-zone-text">{zone.label}</span>
          </div>

          <div className="vc-section-label">Vibration</div>

          <div className="vc-current-row">
            <span className={`vc-current-val${flash ? " flash" : ""}`}>{displayVal}</span>
            <span className="vc-unit">Hz</span>
            <span className="vc-trend">{trend}</span>
          </div>

          <div className="vc-divider" />

          <div className="vc-minmax">
            <div>
              <div className="vc-stat-label">Min</div>
              <div className="vc-stat-val min">{min} Hz</div>
            </div>
            <div>
              <div className="vc-stat-label">Max</div>
              <div className="vc-stat-val max">{max} Hz</div>
            </div>
          </div>
        </div>

        {/* Right — Seismic wave canvas */}
        <div className="vc-right">
          <div className="vc-canvas-wrap">
            <canvas ref={canvasRef} width={180} height={110} />
          </div>
          <div className="vc-scale-label">LIVE SEISMIC SIGNAL</div>
        </div>
      </div>
    </>
  );
}

export default Vibrationcard;