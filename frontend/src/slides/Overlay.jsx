import { atom, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { scenes } from "./Experience";

export const slideAtom = atom(0);

// ─── Gantt data ───────────────────────────────────────────────────────────────
const ganttData = [
  { activity: "Project Kickoff & Setup",            q: [1,0,0,0,0,0,0,0,0,0,0,0] },
  { activity: "IoT Sensor Deployment (500 nodes)",  q: [1,1,1,0,0,0,0,0,0,0,0,0] },
  { activity: "Digital Twin Modelling (10 sites)",  q: [0,1,1,1,1,0,0,0,0,0,0,0] },
  { activity: "AI/ML Model Development",            q: [0,0,1,1,1,1,0,0,0,0,0,0] },
  { activity: "XR/VR Title Development (5 titles)", q: [0,0,0,1,1,1,1,0,0,0,0,0] },
  { activity: "Generative Restoration (1000+)",     q: [0,0,0,0,1,1,1,1,0,0,0,0] },
  { activity: "Heritage-AI Toolkit (OCR/ASR/TTS)",  q: [0,0,0,0,0,1,1,1,1,0,0,0] },
  { activity: "Citizen Engagement & Solar XR Van",  q: [0,0,0,0,0,0,1,1,1,1,0,0] },
  { activity: "ASI Staff Training (250 personnel)", q: [0,0,0,0,0,0,0,1,1,1,1,0] },
  { activity: "Documentation & Final Reporting",    q: [0,0,0,0,0,0,0,0,0,1,1,1] },
];
const quarters = ["Q1","Q2","Q3","Q4","Q5","Q6","Q7","Q8","Q9","Q10","Q11","Q12"];
const ganttColors = ["#f59e0b","#34d399","#60a5fa","#f472b6","#a78bfa","#4ade80","#38bdf8","#fb923c","#e879f9","#f87171"];

// ─── Info slides ──────────────────────────────────────────────────────────────

function ProjectOverlay() {
  return (
    <div className="w-full h-full flex flex-col justify-center px-10 py-8 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,#1a0a00,#2d1200,#3b1a00)", fontFamily: "Georgia, serif" }}>
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle,#d4a056 1px,transparent 0)", backgroundSize: "28px 28px" }} />

      <div className="relative z-10 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-600/50" />
          <span className="text-amber-400 text-[10px] tracking-[0.4em] uppercase">Centre of Excellence · RVCE</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-600/50" />
        </div>

        <h1 className="text-white text-xl font-bold text-center leading-relaxed mb-6"
          style={{ textShadow: "0 2px 30px rgba(212,160,86,0.2)" }}>
          AI and IoT Driven XR Digital-Twin Technologies<br />
          <span className="text-amber-300">in Smart-Heritage Conservation</span><br />
          and Generative Restoration of Karnataka's Monuments
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-amber-950/30 border border-amber-800/25 rounded-xl p-4">
            <p className="text-amber-400 text-[10px] tracking-[0.25em] uppercase font-bold mb-2">Principal Investigator</p>
            <p className="text-white font-semibold text-sm mb-3">Dr Renuka Prasad B</p>
            <p className="text-amber-400 text-[10px] tracking-[0.25em] uppercase font-bold mb-2">Co-Investigators</p>
            <p className="text-white/60 text-xs leading-relaxed">
              Dr Andhe Dharani · Dr Chandrashekar B H · Dr Deepika K<br />
              Dr Raja Vidya · Dr Hemalatha Y · Dr Abhay Deshpande
            </p>
          </div>
          <div className="bg-amber-950/30 border border-amber-800/25 rounded-xl p-4">
            <p className="text-amber-400 text-[10px] tracking-[0.25em] uppercase font-bold mb-2">Total Project Cost</p>
            <p className="text-white font-bold text-2xl">₹11.14 Crores</p>
            <p className="text-white/35 text-xs mb-4">INR 1,11,400,000 · Duration: 36 Months</p>
            <div className="flex gap-6">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <p className="text-amber-300/60 text-xs">Non-Recurring</p>
                </div>
                <p className="text-white font-semibold text-base pl-3.5">₹6.70 Cr</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-amber-600" />
                  <p className="text-amber-300/60 text-xs">Recurring</p>
                </div>
                <p className="text-white font-semibold text-base pl-3.5">₹4.44 Cr</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-800/20 rounded-xl p-4">
          <p className="text-amber-400 text-[10px] tracking-[0.25em] uppercase font-bold mb-3">Industry & Institutional Partners</p>
          <div className="flex flex-wrap gap-2">
            {["Pro Digital Labs Pvt. Ltd.", "Servelots Infotech Pvt. Ltd.", "Miurac Private Limited",
              "National Process Automation Pvt Ltd", "Shilpa Kala Shala, Devanahalli", "ASI (Bengaluru)"].map(p => (
              <span key={p} className="text-xs bg-amber-900/40 text-amber-200/80 border border-amber-800/30 px-2.5 py-1 rounded-full">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ObjectivesOverlay() {
  const objectives = [
    { id: "O1", color: "#60a5fa", title: "Digital Twins",           detail: "10 monuments · USD/Omniverse · ≤5 cm error · 2% modal deviation" },
    { id: "O2", color: "#34d399", title: "IoT Edge Monitoring",     detail: "500 nodes · 20 gateways · 95% F1-score anomaly detection" },
    { id: "O3", color: "#f472b6", title: "Immersive XR",            detail: "5 bilingual titles · Quest 3 + WebXR · 90 fps · haptic layers" },
    { id: "O4", color: "#a78bfa", title: "Generative Restoration",  detail: "1,000 carvings via diffusion NeRF · SSIM ≥ 0.85" },
    { id: "O5", color: "#38bdf8", title: "Heritage-AI Toolkit",     detail: "Open-source OCR/ASR/TTS/chatbot · Kannada CER ≤5% · BLEU ≥0.6" },
    { id: "O6", color: "#fb923c", title: "Societal Reach",          detail: "10,000 citizens · solar XR van · 250 ASI/tourism staff upskilled" },
  ];
  const rationale = [
    "Uniquely timed — AI, IoT, XR & digital-twin technologies converge with urgent conservation needs.",
    "Karnataka's monuments face accelerating structural degradation; current inspection is episodic and reactive.",
    "Platform enables continuous monitoring, real-time simulation, and data-driven intervention.",
    "Backed by RVCE infrastructure, industry partnerships & ASI collaboration — execution-ready, nationally aligned.",
  ];
  return (
    <div className="w-full h-full flex flex-col px-8 py-6"
      style={{ background: "linear-gradient(160deg,#060d1f,#0a1a35,#060d1f)", fontFamily: "system-ui,sans-serif" }}>
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="w-1 h-7 rounded-full bg-gradient-to-b from-cyan-400 to-indigo-500" />
        <h2 className="text-white font-bold text-lg">Objectives & Rationale</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-cyan-800/40 to-transparent" />
      </div>
      <div className="grid grid-cols-3 gap-2.5 mb-4 shrink-0">
        {objectives.map(o => (
          <div key={o.id} className="rounded-xl p-3 border"
            style={{ background: `${o.color}0d`, borderColor: `${o.color}28` }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-black px-1.5 py-0.5 rounded"
                style={{ background: `${o.color}22`, color: o.color }}>{o.id}</span>
              <span className="text-white text-xs font-semibold">{o.title}</span>
            </div>
            <p className="text-white/45 text-[11px] leading-relaxed">{o.detail}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-indigo-800/30 p-4 flex-1"
        style={{ background: "rgba(99,102,241,0.05)" }}>
        <p className="text-indigo-400 text-[10px] tracking-[0.3em] uppercase font-bold mb-3">Rationale</p>
        <div className="grid grid-cols-2 gap-3">
          {rationale.map((r, i) => (
            <div key={i} className="flex gap-2.5">
              <span className="text-indigo-500 font-black text-xs shrink-0 mt-0.5">R{i+1}</span>
              <p className="text-white/55 text-xs leading-relaxed">{r}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GanttOverlay() {
  return (
    <div className="w-full h-full flex flex-col px-6 py-5"
      style={{ background: "#080812", fontFamily: "'Courier New',monospace" }}>
      <div className="flex items-center gap-3 mb-3 shrink-0">
        <div className="w-1 h-6 rounded" style={{ background: "linear-gradient(to bottom,#818cf8,#06b6d4)" }} />
        <h2 className="text-white font-bold text-sm tracking-wider">GANTT CHART — 36 MONTHS · 12 QUARTERS</h2>
      </div>
      <div className="flex mb-2 shrink-0">
        <div className="w-52 shrink-0" />
        {quarters.map(q => (
          <div key={q} className="flex-1 text-center text-white/30 text-[10px] font-bold">{q}</div>
        ))}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        {ganttData.map((row, i) => (
          <div key={i} className="flex items-center">
            <div className="w-52 shrink-0 text-white/55 text-[11px] pr-3 truncate">{row.activity}</div>
            {row.q.map((active, qi) => (
              <div key={qi} className="flex-1 px-px">
                <div className="h-5 rounded-sm"
                  style={active
                    ? { background: ganttColors[i], boxShadow: `0 0 8px ${ganttColors[i]}60`, opacity: 0.9 }
                    : { background: "rgba(255,255,255,0.04)" }} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 shrink-0">
        {ganttData.map((row, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: ganttColors[i] }} />
            <span className="text-white/30 text-[10px]">{row.activity.split(" (")[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImagesOverlay({ images, name }) {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: "#0e0e0e" }}>
      <div className="px-8 pt-5 pb-3 shrink-0">
        <h2 className="text-white/70 font-bold text-lg">{name}</h2>
        <div className="h-px bg-gradient-to-r from-white/15 to-transparent mt-1.5" />
      </div>
      <div className="flex-1 grid grid-cols-2 gap-4 px-8 pb-8 min-h-0">
        {images.map((src, i) => (
          <div key={i} className="relative rounded-xl overflow-hidden bg-white/5 border border-white/8 flex items-center justify-center">
            <img src={src} alt="" className="w-full h-full object-cover"
              onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
            <div className="absolute inset-0 hidden items-center justify-center flex-col gap-2 bg-white/3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-white/15 text-xs">{src}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoOverlay({ videoSrc, name, isActive }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (isActive) ref.current.play().catch(() => {});
    else { ref.current.pause(); ref.current.currentTime = 0; }
  }, [isActive]);
  return (
    <div className="w-full h-full flex flex-col" style={{ background: "#000" }}>
      <div className="px-8 pt-5 pb-3 shrink-0">
        <h2 className="text-white/70 font-bold text-lg">{name}</h2>
        <div className="h-px bg-gradient-to-r from-white/15 to-transparent mt-1.5" />
      </div>
      <div className="flex-1 px-8 pb-8 min-h-0 flex items-center justify-center">
        <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
          <video ref={ref} src={videoSrc} className="w-full h-full object-contain" controls playsInline />
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white/8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-white/12 text-xs">{videoSrc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Overlay ──────────────────────────────────────────────────────────────────
export const Overlay = () => {
  const [slide, setSlide] = useAtom(slideAtom);
  const [displaySlide, setDisplaySlide] = useState(slide);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 1000); }, []);

    // Keyboard arrow navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        setSlide(p => p < scenes.length - 1 ? p + 1 : 0);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        setSlide(p => p > 0 ? p - 1 : scenes.length - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [setSlide]);



  useEffect(() => {
    setVisible(false);
    setTimeout(() => { setDisplaySlide(slide); setVisible(true); }, 600);
  }, [slide]);

  const current = scenes[displaySlide];
  const isModel = current.type === "model";

  const renderContent = () => {
    if (current.type === "info") {
      if (current.variant === "project")    return <ProjectOverlay />;
      if (current.variant === "objectives") return <ObjectivesOverlay />;
      if (current.variant === "gantt")      return <GanttOverlay />;
    }
    if (current.type === "images") return <ImagesOverlay images={current.images} name={current.name} />;
    if (current.type === "video")  return <VideoOverlay videoSrc={current.videoSrc} name={current.name} isActive={slide === displaySlide} />;
    return null;
  };

  return (
    <>
      {/* Non-model slides: full-cover rich content */}
      {!isModel && (
        <div className={`absolute inset-0 z-10 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
          {renderContent()}
        </div>
      )}

      {/* Model slides: bottom title bar */}
      {isModel && (
        <div className={`absolute bottom-0 left-0 right-0 z-10 pointer-events-none
          bg-gradient-to-t from-white/90 pt-16 pb-8 px-4
          flex flex-col items-center text-center
          transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
          <h1 className="text-4xl font-extrabold text-black">{current.name}</h1>
          <p className="text-black/50 italic text-sm mt-1">{current.description}</p>
        </div>
      )}

      {/* Slide counter top-center */}
      <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none
        transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
        <p className={`text-[10px] tracking-[0.3em] uppercase font-medium ${isModel ? "text-black/40" : "text-white/25"}`}>
          {slide + 1} / {scenes.length}
        </p>
      </div>

      {/* Nav arrows */}
      <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-between px-3">
        <button
          className="pointer-events-auto w-9 h-9 rounded-full bg-black/20 hover:bg-black/50
            backdrop-blur-sm border border-white/15 flex items-center justify-center transition-all"
          onClick={() => setSlide(p => p > 0 ? p - 1 : scenes.length - 1)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          className="pointer-events-auto w-9 h-9 rounded-full bg-black/20 hover:bg-black/50
            backdrop-blur-sm border border-white/15 flex items-center justify-center transition-all"
          onClick={() => setSlide(p => p < scenes.length - 1 ? p + 1 : 0)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className={`absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 flex gap-1.5
        transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
        {scenes.map((s, i) => (
          <button key={i} onClick={() => setSlide(i)} title={s.name}
            className={`rounded-full transition-all pointer-events-auto ${
              i === slide
                ? "w-4 h-1.5 bg-white"
                : s.type === "model"
                  ? "w-1.5 h-1.5 bg-white/35"
                  : "w-1.5 h-1.5 bg-amber-400/45"
            }`}
          />
        ))}
      </div>
    </>
  );
};