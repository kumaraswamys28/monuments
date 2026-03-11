function LastUpdateCard({ timestamp }) {
  const formatTimestamp = (ts) => {
    if (!ts) return { date: "—", time: "—", relative: "No data yet" };
    try {
      const d = new Date(ts);
      const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const diffMs = Date.now() - d.getTime();
      const diffS = Math.floor(diffMs / 1000);
      const relative = diffS < 5 ? "Just now" : diffS < 60 ? `${diffS}s ago` : `${Math.floor(diffS / 60)}m ago`;
      return { date, time, relative };
    } catch {
      return { date: "—", time: ts, relative: "" };
    }
  };

  const { date, time, relative } = formatTimestamp(timestamp);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .lu-root {
          font-family: 'DM Sans', sans-serif;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: box-shadow 0.2s ease;
          height: 100%;
        }
        .lu-root:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

        .lu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .lu-label {
          font-family: 'DM Mono', monospace;
          font-size: 15px;
          letter-spacing: 1.5px;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 500;
        }

        .lu-relative {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          letter-spacing: 1px;
          color: #10b981;
          font-weight: 500;
          background: #f0fdf4;
          border: 1px solid #10b98122;
          border-radius: 20px;
          padding: 2px 8px;
        }

        .lu-divider {
          height: 1px;
          background: #f1f5f9;
        }

        .lu-time {
          font-family: 'DM Mono', monospace;
          font-size: 28px;
          font-weight: 500;
          color: #0f172a;
          letter-spacing: 1px;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }

        .lu-date {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: #64748b;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .lu-raw {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: #00000f;
          letter-spacing: 0.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>

{/* <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .lu-root {
          font-family: 'DM Sans', sans-serif;
          background: #1f2329;
          border: 1px solid #34383f;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: box-shadow 0.2s ease;
          height: 100%;
        }
        .lu-root:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.2); }

        .lu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .lu-label {
          font-family: 'DM Mono', monospace;
          font-size: 15px;
          letter-spacing: 1.5px;
          color: #5a5f6b;
          text-transform: uppercase;
          font-weight: 500;
        }

        .lu-relative {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          letter-spacing: 1px;
          color: #73bf69;
          font-weight: 500;
          background: rgba(115,191,105,0.1);
          border: 1px solid rgba(115,191,105,0.2);
          border-radius: 20px;
          padding: 2px 8px;
        }

        .lu-divider {
          height: 1px;
          background: #2c3038;
        }

        .lu-time {
          font-family: 'DM Mono', monospace;
          font-size: 28px;
          font-weight: 500;
          color: #d0d1d3;
          letter-spacing: 1px;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }

        .lu-date {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: #8e9099;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .lu-raw {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: #5a5f6b;
          letter-spacing: 0.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style> */}


      <div className="lu-root">
        <div className="lu-header">
          <span className="lu-label">Last Update</span>
          <span className="lu-relative">{relative}</span>
        </div>

        <div className="lu-divider" />

        <div className="lu-time">{time}</div>
        <div className="lu-date">{date}</div>

        {timestamp && <div className="lu-raw">{timestamp}</div>}
      </div>
    </>
  );
}

export default LastUpdateCard;