"use client";

import { useEffect, useRef, useCallback } from "react";

export default function Fullscreen({ children }) {
  const containerRef = useRef(null);

  const enterFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const isFullscreen =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isEditable =
        tag === "input" ||
        tag === "textarea" ||
        document.activeElement?.isContentEditable;

      if (isEditable) return;

      if (e.key === "f" || e.key === "F" || e.code === "Space") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleFullscreen]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden bg-[#ececec]"
      style={{ outline: "none" }}
    >
      {children ?? (
        <div className="flex items-center justify-center w-full h-full text-white text-sm opacity-60 select-none">
          Press <kbd className="mx-1 px-1.5 py-0.5 bg-white/20 rounded text-xs font-mono">F</kbd> or <kbd className="mx-1 px-1.5 py-0.5 bg-white/20 rounded text-xs font-mono">Space</kbd> to fullscreen
        </div>
      )}
    </div>
  );
}