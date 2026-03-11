import React, { useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Stage, Sky, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { Maximize, Minimize, MapPin, Cloud } from "lucide-react";
import ChunkedModel from "./Chunked";
import { ModelProvider, useBaseScene } from "./ModelStore.jsx";
import { Link, useMatch } from "react-router-dom";

// ─── Loading Overlay ──────────────────────────────────────────────────────────
// Reads progress/source directly from ModelStore context — no useProgress() needed.
const LoadingOverlay = ({ color = '#60a5fa' }) => {
  const { progress, scene, error, source } = useBaseScene();
  const [dismissed, setDismissed] = useState(false);

  // Once scene arrives, give a short grace period then hide
  React.useEffect(() => {
    if (scene) {
      const t = setTimeout(() => setDismissed(true), 600);
      return () => clearTimeout(t);
    } else {
      setDismissed(false);
    }
  }, [scene]);

  if (dismissed) return null;
  if (error) return null; // error state handled by ChunkedModel's Html overlay

  const done = !!scene && progress === 100;
  const isCache = source === 'cache';

  const label = error
    ? 'Error'
    : done
    ? (isCache ? 'From Cache' : 'Loaded')
    : isCache
    ? 'Parsing…'
    : progress < 90
    ? `Downloading… ${progress}%`
    : 'Parsing…';

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 15,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(5, 8, 16, 0.82)',
      backdropFilter: 'blur(6px)',
      borderRadius: 4,
      transition: 'opacity 0.5s ease',
      opacity: done ? 0 : 1,
      pointerEvents: done ? 'none' : 'all',
    }}>
      {/* Percentage */}
      <div style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 24, fontWeight: 700,
        color,
        letterSpacing: '0.04em',
        marginBottom: 14,
        textShadow: `0 0 24px ${color}99`,
      }}>
        {Math.round(progress)}%
      </div>

      {/* Bar track */}
      <div style={{
        width: 160, height: 3,
        background: 'rgba(255,255,255,0.07)',
        borderRadius: 99, overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Fill */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${color}66, ${color})`,
          borderRadius: 99,
          transition: 'width 0.25s ease',
          boxShadow: `0 0 10px ${color}cc`,
        }} />
        {/* Shimmer sweep */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, width: 50,
          background: `linear-gradient(90deg, transparent, ${color}44, transparent)`,
          left: `${progress - 25}%`,
          animation: 'shimmer 1.4s infinite linear',
        }} />
      </div>

      {/* Label */}
      <div style={{
        marginTop: 11,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 9, color: '#475569',
        letterSpacing: '0.18em', textTransform: 'uppercase',
      }}>
        {label}
      </div>

      {/* Cache badge */}
      {isCache && !done && (
        <div style={{
          marginTop: 8,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 8, color: '#22d3ee',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          background: 'rgba(34,211,238,0.1)',
          border: '1px solid rgba(34,211,238,0.2)',
          borderRadius: 4, padding: '2px 8px',
        }}>
          ⚡ IndexedDB
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-60px); }
          100% { transform: translateX(60px); }
        }
      `}</style>
    </div>
  );
};

// ─── Sky Controls Panel ───────────────────────────────────────────────────────
const SkyPanel = ({ skyParams, setSkyParams, visible, onClose }) => {
  if (!visible) return null;
  const slider = (label, key, min, max, step) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
        <span style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ color: '#fff', fontFamily: 'monospace' }}>{skyParams[key].toFixed(3)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={skyParams[key]}
        onChange={e => setSkyParams(p => ({ ...p, [key]: parseFloat(e.target.value) }))}
        style={{ width: '100%', accentColor: '#60a5fa', cursor: 'pointer' }} />
    </div>
  );
  return (
    <div style={{ position: 'absolute', top: 12, right: 12, width: 240, background: 'rgba(10,12,20,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', fontFamily: 'sans-serif', zIndex: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>☁️ Sky Settings</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16 }}>✕</button>
      </div>
      {slider('Turbidity', 'turbidity', 0, 20, 0.1)}
      {slider('Rayleigh', 'rayleigh', 0, 4, 0.01)}
      {slider('Mie Coefficient', 'mieCoefficient', 0, 0.1, 0.001)}
      {slider('Mie Dir. G', 'mieDirectionalG', 0, 1, 0.001)}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '10px 0' }} />
      <div style={{ color: '#60a5fa', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Sun Position</div>
      {slider('Elevation', 'elevation', 0, 90, 0.1)}
      {slider('Azimuth', 'azimuth', -180, 180, 0.1)}
    </div>
  );
};

const AnimatedSky = ({ params }) => {
  const phi = THREE.MathUtils.degToRad(90 - params.elevation);
  const theta = THREE.MathUtils.degToRad(params.azimuth);
  const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
  return <Sky distance={450000} sunPosition={sunPosition} turbidity={params.turbidity} rayleigh={params.rayleigh} mieCoefficient={params.mieCoefficient} mieDirectionalG={params.mieDirectionalG} />;
};

// ─── EFFECT 1: Normal View ────────────────────────────────────────────────────
const NormalScene = ({ skyParams }) => (
  <>
    <AnimatedSky params={skyParams} />
    <Stage adjustCamera={true} intensity={0.5}>
      <Center top alignToBottom>
        <ChunkedModel />
      </Center>
    </Stage>
  </>
);

// ─── EFFECT 2: Wireframe View ─────────────────────────────────────────────────
const WireframeSceneInner = () => {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child.isMesh && child.material?.wireframe) {
          const t = state.clock.getElapsedTime();
          child.material.opacity = 0.6 + Math.sin(t * 2) * 0.2;
        }
      });
    }
  });
  return (
    <group ref={groupRef}>
      <ChunkedModel forceWireframe />
    </group>
  );
};

const WireframeScene = () => (
  <>
    <color attach="background" args={['#050a14']} />
    <fog attach="fog" args={['#050a14', 20, 80]} />
    <ambientLight intensity={0.2} />
    <pointLight position={[5, 10, 5]} intensity={2} color="#00d4ff" />
    <pointLight position={[-5, -5, -5]} intensity={1} color="#0044ff" />
    <Stage adjustCamera={true} intensity={0.3}>
      <Center top alignToBottom>
        <WireframeSceneInner />
      </Center>
    </Stage>
  </>
);

// ─── EFFECT 3: GCode Layer-by-Layer Style ────────────────────────────────────
const GCodeModelInner = ({ groupRef }) => {
  const clippingPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 5), []);
  return (
    <group ref={groupRef}>
      <ChunkedModel clippingPlane={clippingPlane} layerMode />
    </group>
  );
};

const GCodeScene = () => {
  const groupRef = useRef();
  const [cutHeight, setCutHeight] = useState(0);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const newH = (Math.sin(t * 0.3) * 0.5 + 0.5);
    setCutHeight(newH);
    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(mat => {
            if (mat.clippingPlanes?.length) {
              mat.clippingPlanes[0].constant = newH * 15;
            }
          });
        }
      });
    }
  });

  return (
    <>
      <color attach="background" args={['#0a0a12']} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ff6600" />
      <pointLight position={[0, 5, 0]} intensity={2} color="#ff4400" />
      <pointLight position={[-5, 0, 5]} intensity={1} color="#ffaa00" />
      <Stage adjustCamera={true} intensity={0.2}>
        <Center top alignToBottom>
          <GCodeModelInner groupRef={groupRef} />
        </Center>
      </Stage>
      <mesh position={[0, cutHeight * 15 - 2, 0]}>
        <planeGeometry args={[50, 0.03]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

// ─── EFFECT 4: Dispersion / Glass / X-Ray ────────────────────────────────────
const DispersionModelInner = () => {
  const groupRef = useRef();
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material?.isDispersionMat) {
        child.material.opacity = 0.25 + Math.sin(t * 1.5) * 0.1;
        child.material.emissiveIntensity = 0.3 + Math.sin(t * 2.5 + 1) * 0.2;
      }
    });
  });
  return (
    <group ref={groupRef}>
      <ChunkedModel dispersionMode />
    </group>
  );
};

const DispersionScene = () => (
  <>
    <color attach="background" args={['#0d0015']} />
    <ambientLight intensity={0.3} color="#8833ff" />
    <pointLight position={[3, 5, 3]} intensity={3} color="#aa44ff" />
    <pointLight position={[-3, -3, -3]} intensity={2} color="#ff44aa" />
    <pointLight position={[0, 0, 5]} intensity={1.5} color="#4444ff" />
    <Stage adjustCamera={true} intensity={0.5}>
      <Center top alignToBottom>
        <DispersionModelInner />
      </Center>
    </Stage>
  </>
);

// ─── Panel Label ─────────────────────────────────────────────────────────────
const PanelLabel = ({ label, color = '#60a5fa' }) => (
  <div style={{
    position: 'absolute', top: 8, left: 8, zIndex: 10,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    border: `1px solid ${color}44`,
    borderRadius: 6, padding: '3px 10px',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: 10, color, letterSpacing: '0.1em',
    textTransform: 'uppercase', pointerEvents: 'none',
    boxShadow: `0 0 8px ${color}33`
  }}>
    {label}
  </div>
);

// ─── Single Viewport ──────────────────────────────────────────────────────────
// LoadingOverlay lives OUTSIDE the Canvas (correct) and reads from ModelStore
// context (which is above ModelProvider → accessible here without R3F hooks).
const Viewport = ({ skyParams, setSkyParams, mode, label, color, autoRotate = false, children }) => {
  const [showSkyPanel, setShowSkyPanel] = useState(false);
  const borderColors = {
    normal: '#334155',
    wireframe: '#0891b2',
    gcode: '#ea580c',
    dispersion: '#7c3aed',
  };
  const bc = borderColors[mode] || '#334155';

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      border: `1px solid ${bc}55`,
      overflow: 'hidden', borderRadius: 4,
    }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, localClippingEnabled: true }}>
        <PerspectiveCamera makeDefault near={0.1} far={1000} position={[5, 2, 8]} fov={50} />
        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2 + 0.05}
          autoRotate={autoRotate}
          autoRotateSpeed={1.5}
        />
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>

      {/*
        LoadingOverlay is OUTSIDE the Canvas — no R3F context required.
        It calls useBaseScene() which reads from ModelProvider (React context),
        giving it the real fetch+parse progress with zero reliance on useProgress().
      */}
      <LoadingOverlay color={color} />

      <PanelLabel label={label} color={color} />

      {mode === 'normal' && (
        <>
          <SkyPanel skyParams={skyParams} setSkyParams={setSkyParams} visible={showSkyPanel} onClose={() => setShowSkyPanel(false)} />
          <button
            onClick={() => setShowSkyPanel(v => !v)}
            style={{
              position: 'absolute', bottom: 8, right: 8, zIndex: 10,
              background: showSkyPanel ? 'rgba(96,165,250,0.25)' : 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6,
              padding: '5px 7px', cursor: 'pointer', backdropFilter: 'blur(8px)',
            }}
            title="Sky Settings"
          >
            <Cloud size={14} color="#94a3b8" />
          </button>
        </>
      )}
    </div>
  );
};

// ─── Quad Renderer ────────────────────────────────────────────────────────────
const Renderer = React.memo(({ data }) => {
  const isAnalytics = useMatch("/model/:id/analytics");
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [skyParams, setSkyParams] = useState({
    turbidity: 10, rayleigh: 3, mieCoefficient: 0.005,
    mieDirectionalG: 0.7, elevation: 2, azimuth: 180,
  });

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <ModelProvider url={data.url}>
      <div
        className="border-2 border-grey-500"
        style={{
          width: "100%", height: "100%",
          background: "#080c14",
          display: 'flex', flexDirection: 'column',
          position: 'relative',
        }}
      >
        {!isAnalytics && (
          <div style={{
            flexShrink: 0,
            width: "100%",
            textAlign: "center",
            pointerEvents: "none",
            zIndex: 5,
            background: 'transparent',
          }}>
            <h1 className="majestic-title">{data.title}</h1>
          </div>
        )}

        <div
          ref={containerRef}
          style={{ flex: 1, position: 'relative', minHeight: 0 }}
        >
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr',
            width: '100%', height: '100%', gap: 2, padding: 2,
            boxSizing: 'border-box', background: '#020408',
          }}>
            <Viewport mode="normal" label="◆ Perspective" color="#60a5fa"
              skyParams={skyParams} setSkyParams={setSkyParams} autoRotate>
              <NormalScene skyParams={skyParams} />
            </Viewport>

            <Viewport mode="wireframe" label="◈ Wireframe" color="#22d3ee">
              <WireframeScene />
            </Viewport>

            <Viewport mode="gcode" label="⬡ Layer Scan" color="#fb923c">
              <GCodeScene />
            </Viewport>

            <Viewport mode="dispersion" label="◎ Dispersion" color="#c084fc">
              <DispersionScene />
            </Viewport>
          </div>

          {/* Crosshair divider */}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #1e293b 20%, #334155 50%, #1e293b 80%, transparent)', pointerEvents: 'none', zIndex: 4, transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg, transparent, #1e293b 20%, #334155 50%, #1e293b 80%, transparent)', pointerEvents: 'none', zIndex: 4, transform: 'translateX(-50%)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 5, width: 10, height: 10, borderRadius: '50%', background: '#334155', border: '2px solid #475569', transform: 'translate(-50%, -50%)', pointerEvents: 'none', boxShadow: '0 0 12px rgba(148,163,184,0.4)' }} />

          {/* Toolbar */}
          <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 6, zIndex: 10 }}>
            <Link to="#" style={{ padding: '7px', background: 'rgba(0,0,0,0.7)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center' }} title="Spawn">
              <MapPin size={16} color="#94a3b8" />
            </Link>
            <button onClick={toggleFullscreen} style={{ padding: '7px', background: 'rgba(0,0,0,0.7)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Toggle Fullscreen">
              {isFullscreen ? <Minimize size={16} color="#94a3b8" /> : <Maximize size={16} color="#94a3b8" />}
            </button>
          </div>
        </div>
      </div>
    </ModelProvider>
  );
});

export default Renderer;