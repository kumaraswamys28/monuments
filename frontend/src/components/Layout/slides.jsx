import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_PIPELINE = [
  {
    type: "ppt",
    title: "Site Overview",
    slides: [
      "https://placehold.co/1920x1080/0f172a/475569?text=Slide+1",
      "https://placehold.co/1920x1080/0f172a/475569?text=Slide+2",
      "https://placehold.co/1920x1080/0f172a/475569?text=Slide+3",
      "https://placehold.co/1920x1080/0f172a/475569?text=Slide+4",
      "https://placehold.co/1920x1080/0f172a/475569?text=Slide+5",
    ],
  },
  {
    type: "video",
    title: "Site Walkthrough",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    type: "image",
    title: "Evidence Photo 1",
    url: "https://placehold.co/1920x1080/0f172a/475569?text=Image+1",
  },
  {
    type: "image",
    title: "Evidence Photo 2",
    url: "https://placehold.co/1920x1080/0f172a/475569?text=Image+2",
  },
];

const IconPrev = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconNext = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconExpand = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);
const IconCollapse = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
  </svg>
);
const IconPPT   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const IconVid   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
const IconImg   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

const TYPE_ICON  = { ppt: <IconPPT />, video: <IconVid />, image: <IconImg /> };
const TYPE_COLOR = { ppt: "#6366f1", video: "#f97316", image: "#10b981" };

function flattenPipeline(pipeline) {
  const frames = [];
  pipeline.forEach((item, itemIdx) => {
    if (item.type === "ppt") {
      item.slides.forEach((slide, sIdx) => {
        frames.push({ type: "ppt", title: item.title, url: slide, slideNum: sIdx + 1, totalSlides: item.slides.length, itemIdx });
      });
    } else {
      frames.push({ type: item.type, title: item.title, url: item.url, itemIdx });
    }
  });
  return frames;
}

export default function MediaViewer({ pipeline = DEFAULT_PIPELINE }) {
  const frames   = flattenPipeline(pipeline);
  const [idx, setIdx]         = useState(0);
  const [isFS, setIsFS]       = useState(false);
  const [fadeKey, setFadeKey] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [uiVisible, setUiVisible]   = useState(true);
  const uiTimerRef  = useRef(null);
  const videoRef    = useRef(null);
  const mediaRef    = useRef(null); // the inner media element for fullscreen

  const frame   = frames[idx];
  const isFirst = idx === 0;
  const isLast  = idx === frames.length - 1;
  const pct     = ((idx + 1) / frames.length) * 100;

  const goTo = useCallback((nextIdx) => {
    if (nextIdx < 0 || nextIdx >= frames.length) return;
    setIdx(nextIdx);
    setFadeKey(k => k + 1);
    setVideoEnded(false);
  }, [frames.length]);

  const goNext = useCallback(() => goTo(idx + 1), [idx, goTo]);
  const goPrev = useCallback(() => goTo(idx - 1), [idx, goTo]);

  // Fullscreen on the media element itself
  const toggleFS = useCallback(() => {
    if (!document.fullscreenElement) {
      mediaRef.current?.requestFullscreen?.();
      setIsFS(true);
    } else {
      document.exitFullscreen?.();
      setIsFS(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFS(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Keyboard
  useEffect(() => {
    const handler = (e) => {
      if (["ArrowRight", "ArrowDown"].includes(e.key)) { e.preventDefault(); goNext(); }
      if (["ArrowLeft",  "ArrowUp"].includes(e.key))   { e.preventDefault(); goPrev(); }
      if (e.key === "f" || e.key === "F")               toggleFS();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, toggleFS]);

  // Auto-hide UI overlay after inactivity
  const resetUiTimer = useCallback(() => {
    setUiVisible(true);
    clearTimeout(uiTimerRef.current);
    uiTimerRef.current = setTimeout(() => setUiVisible(false), 3000);
  }, []);

  useEffect(() => {
    resetUiTimer();
    return () => clearTimeout(uiTimerRef.current);
  }, [idx]);

  const pipelineItems = pipeline.map((item, i) => ({
    ...item, itemIdx: i, active: frame.itemIdx === i,
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600;700&display=swap');

        .mv-shell {
          font-family: 'DM Sans', sans-serif;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        /* ── thin top bar ── */
        .mv-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
          gap: 10px;
        }

        .mv-pipeline {
          display: flex; gap: 4px; overflow-x: auto; flex: 1;
          scrollbar-width: none;
        }
        .mv-pipeline::-webkit-scrollbar { display: none; }

        .mv-pill {
          display: flex; align-items: center; gap: 5px;
          padding: 3px 9px; border-radius: 20px;
          border: 1px solid #e2e8f0; background: transparent;
          color: #94a3b8;
          font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500;
          letter-spacing: 0.5px; white-space: nowrap; cursor: pointer;
          transition: all 0.15s ease;
        }
        .mv-pill.active {
          background: #f1f5f9; color: #334155; border-color: #cbd5e1;
        }
        .mv-pill-dot { width: 5px; height: 5px; border-radius: 50%; }

        .mv-fs-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 9px; border-radius: 7px;
          border: 1px solid #e2e8f0; background: transparent;
          color: #94a3b8;
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 1px; cursor: pointer; text-transform: uppercase;
          transition: all 0.15s ease; flex-shrink: 0;
        }
        .mv-fs-btn:hover { background: #f1f5f9; color: #475569; }

        /* ── media stage — this fills remaining space ── */
        .mv-stage {
          flex: 1;
          min-height: 0;
          position: relative;
          background: #0f172a;
          overflow: hidden;
          cursor: none;
        }
        .mv-stage:hover { cursor: default; }

        /* Media fills stage edge to edge, 16:9 letterboxed */
        .mv-media-wrap {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
        }

        .mv-media-wrap img {
          width: 100%; height: 100%;
          object-fit: contain;
          display: block;
        }
        .mv-media-wrap video {
          width: 100%; height: 100%;
          object-fit: contain;
          display: block;
          outline: none;
        }

        /* fullscreen override — media element itself goes fullscreen */
        .mv-media-wrap:fullscreen,
        .mv-media-wrap:-webkit-full-screen {
          background: #0f172a;
        }
        .mv-media-wrap:fullscreen img,
        .mv-media-wrap:-webkit-full-screen img {
          width: 100vw; height: 100vh; object-fit: contain;
        }
        .mv-media-wrap:fullscreen video,
        .mv-media-wrap:-webkit-full-screen video {
          width: 100vw; height: 100vh; object-fit: contain;
        }

        .mv-fade {
          animation: mv-in 0.25s ease;
        }
        @keyframes mv-in {
          from { opacity: 0; transform: scale(0.985); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* Overlay UI: arrows + badge — fade with inactivity */
        .mv-overlay {
          position: absolute; inset: 0; pointer-events: none;
          transition: opacity 0.4s ease;
        }
        .mv-overlay.hidden { opacity: 0; }
        .mv-overlay.visible { opacity: 1; }

        .mv-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.7);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; pointer-events: all;
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
        }
        .mv-arrow:hover { background: rgba(255,255,255,0.16); color: #fff; }
        .mv-arrow:disabled { opacity: 0.15; pointer-events: none; }
        .mv-arrow.left  { left: 14px; }
        .mv-arrow.right { right: 14px; }

        /* slide badge top right */
        .mv-badge {
          position: absolute; top: 12px; right: 12px;
          font-family: 'DM Mono', monospace; font-size: 9px;
          color: rgba(255,255,255,0.5);
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px; padding: 3px 8px;
          backdrop-filter: blur(8px);
          pointer-events: none;
        }

        /* video ended hint */
        .mv-video-hint {
          position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
          font-family: 'DM Mono', monospace; font-size: 10px;
          color: #10b981;
          background: rgba(0,0,0,0.5);
          border: 1px solid #10b98133;
          border-radius: 20px; padding: 5px 14px;
          pointer-events: none;
          backdrop-filter: blur(8px);
        }

        /* ── thin bottom bar ── */
        .mv-bottombar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 7px 14px;
          background: #f8fafc; border-top: 1px solid #e2e8f0;
          flex-shrink: 0; gap: 12px;
        }

        .mv-title {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600; color: #475569;
          min-width: 0;
        }
        .mv-title-text {
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .mv-title-icon { color: #94a3b8; flex-shrink: 0; }

        .mv-progress-row {
          flex: 1; display: flex; align-items: center; gap: 8px; max-width: 280px;
        }
        .mv-progress-track {
          flex: 1; height: 3px; background: #e2e8f0; border-radius: 99px; overflow: hidden;
        }
        .mv-progress-fill {
          height: 100%; border-radius: 99px;
          transition: width 0.5s cubic-bezier(0.34,1.2,0.64,1), background 0.4s ease;
        }
        .mv-progress-label {
          font-family: 'DM Mono', monospace; font-size: 9px; color: #94a3b8; white-space: nowrap;
        }

        .mv-kbd-row {
          display: flex; gap: 5px; align-items: center;
        }
        .mv-kbd {
          font-family: 'DM Mono', monospace; font-size: 8px; color: #94a3b8;
          background: #f1f5f9; border: 1px solid #e2e8f0;
          border-radius: 4px; padding: 2px 5px;
        }
        .mv-kbd-sep {
          font-family: 'DM Mono', monospace; font-size: 8px; color: #cbd5e1;
        }
      `}</style>

      <div className="mv-shell">

        {/* ── Top pipeline bar ── */}
        <div className="mv-topbar">
          <div className="mv-pipeline">
            {pipelineItems.map((item, i) => (
              <div
                key={i}
                className={`mv-pill${item.active ? " active" : ""}`}
                onClick={() => {
                  const first = frames.findIndex(f => f.itemIdx === i);
                  if (first >= 0) goTo(first);
                }}
              >
                <div className="mv-pill-dot" style={{ background: item.active ? TYPE_COLOR[item.type] : "#e2e8f0" }} />
                {TYPE_ICON[item.type]}
                {item.title}
              </div>
            ))}
          </div>
          <button className="mv-fs-btn" onClick={toggleFS} title="F to toggle">
            {isFS ? <IconCollapse /> : <IconExpand />}
            {isFS ? "Exit" : "Full"}
          </button>
        </div>

        {/* ── Media stage ── */}
        <div
          className="mv-stage"
          onMouseMove={resetUiTimer}
          onClick={resetUiTimer}
        >
          {/* The media wrap is what goes fullscreen */}
          <div className="mv-media-wrap" ref={mediaRef}>
            {(frame.type === "ppt" || frame.type === "image") && (
              <img key={fadeKey} className="mv-fade" src={frame.url} alt={frame.title} />
            )}
            {frame.type === "video" && (
              <video
                key={fadeKey}
                className="mv-fade"
                ref={videoRef}
                src={frame.url}
                controls
                autoPlay
                onEnded={() => setVideoEnded(true)}
              />
            )}
          </div>

          {/* Overlay UI */}
          <div className={`mv-overlay ${uiVisible ? "visible" : "hidden"}`}>
            <button className="mv-arrow left"  onClick={goPrev} disabled={isFirst}><IconPrev /></button>
            <button className="mv-arrow right" onClick={goNext} disabled={isLast}><IconNext /></button>

            {frame.type === "ppt" && (
              <div className="mv-badge">{frame.slideNum} / {frame.totalSlides}</div>
            )}
          </div>

          {videoEnded && (
            <div className="mv-video-hint">Video ended · press → to continue</div>
          )}
        </div>

        {/* ── Bottom bar ── */}
        <div className="mv-bottombar">
          <div className="mv-title">
            <span className="mv-title-icon">{TYPE_ICON[frame.type]}</span>
            <span className="mv-title-text">{frame.title}</span>
          </div>

          <div className="mv-progress-row">
            <div className="mv-progress-track">
              <div
                className="mv-progress-fill"
                style={{ width: `${pct}%`, background: TYPE_COLOR[frame.type] }}
              />
            </div>
            <span className="mv-progress-label">{idx + 1} / {frames.length}</span>
          </div>

          <div className="mv-kbd-row">
            <span className="mv-kbd">← →</span>
            <span className="mv-kbd-sep">·</span>
            <span className="mv-kbd">F</span>
          </div>
        </div>

      </div>
    </>
  );
}