import React, { useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Html, Stage, Sky, useTexture } from "@react-three/drei";
import {
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import { Maximize, Minimize, MapPin, Cloud } from "lucide-react";

import ChunkedModel from "./Chunked";
import { Link, useMatch } from "react-router-dom";

// ─── Data Pin ────────────────────────────────────────────────────────────────
const DataPin = ({ position, label, value, unit }) => {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <Html
        distanceFactor={10}
        position={[7.16, 53.06, -2.32]}
        center
      >
        <div style={{
          background: 'white',
          padding: '5px 10px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0px 2px 10px rgba(0,0,0,0.2)',
          fontFamily: 'sans-serif',
          fontSize: '12px'
        }}>
          <strong>{label}:</strong> {value}{unit}
          <div style={{
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '10px solid white'
          }} />
        </div>
      </Html>
    </group>
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
      <input
        type="range" min={min} max={max} step={step}
        value={skyParams[key]}
        onChange={e => setSkyParams(p => ({ ...p, [key]: parseFloat(e.target.value) }))}
        style={{ width: '100%', accentColor: '#60a5fa', cursor: 'pointer' }}
      />
    </div>
  );

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      right: 12,
      width: 240,
      background: 'rgba(10,12,20,0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '14px 16px',
      fontFamily: 'sans-serif',
      zIndex: 20,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>☁️ Sky Settings</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
        >✕</button>
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

// ─── Animated Sky ─────────────────────────────────────────────────────────────
const AnimatedSky = ({ params }) => {
  const phi = THREE.MathUtils.degToRad(90 - params.elevation);
  const theta = THREE.MathUtils.degToRad(params.azimuth);
  const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);

  return (
    <Sky
      distance={450000}
      sunPosition={sunPosition}
      turbidity={params.turbidity}
      rayleigh={params.rayleigh}
      mieCoefficient={params.mieCoefficient}
      mieDirectionalG={params.mieDirectionalG}
    />
  );
};

// ─── Scene Content ────────────────────────────────────────────────────────────
const SceneContent = React.memo(({ data, skyParams }) => {
  return (
    <>
      <AnimatedSky params={skyParams} />
      <Stage adjustCamera={true} intensity={0.5}>
        <Center top alignToBottom>
          <ChunkedModel url={data.url} />
        </Center>
      </Stage>
    </>
  );
}, (prev, next) =>
  prev.data.url === next.data.url &&
  JSON.stringify(prev.skyParams) === JSON.stringify(next.skyParams)
);

// ─── Renderer ─────────────────────────────────────────────────────────────────
const Renderer = React.memo(({ data }) => {
  const isAnalytics = useMatch("/model/:id/analytics");
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSkyPanel, setShowSkyPanel] = useState(false);

  const [skyParams, setSkyParams] = useState({
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    elevation: 2,
    azimuth: 180,
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
    <div
      className="border-2 border-grey-500"
      style={{ width: "100%", height: "100%", background: "#e2e0e0" }}
    >
      <div ref={containerRef} className="relative w-full h-full">
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <axesHelper />

          <PerspectiveCamera
            makeDefault
            near={0.1}
            far={1000}
            position={[5, 2, 8]}
            fov={50}
          />

          <OrbitControls
            makeDefault
            maxPolarAngle={Math.PI / 2 + 0.0}
          />

          <directionalLight position={[5, 5, 5]} intensity={0} />

          <Suspense fallback={null}>
            <SceneContent data={data} skyParams={skyParams} />
          </Suspense>
        </Canvas>

        {/* Sky Settings Panel */}
        <SkyPanel
          skyParams={skyParams}
          setSkyParams={setSkyParams}
          visible={showSkyPanel}
          onClose={() => setShowSkyPanel(false)}
        />

        {/* Bottom-right toolbar */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10 pointer-events-auto">
          <Link
            to="#"
            className="p-2 bg-white/80 hover:bg-white rounded-md shadow-md transition-all border border-gray-300"
            title="Spawn"
          >
            <MapPin size={20} className="text-gray-700" />
          </Link>

          {/* Sky toggle button */}
          <button
            onClick={() => setShowSkyPanel(v => !v)}
            className="p-2 bg-white/80 hover:bg-white rounded-md shadow-md transition-all border border-gray-300"
            title="Sky Settings"
            style={{ background: showSkyPanel ? 'rgba(96,165,250,0.2)' : undefined }}
          >
            <Cloud size={20} className="text-gray-700" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/80 hover:bg-white rounded-md shadow-md transition-all border border-gray-300"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize size={20} className="text-gray-700" />
            ) : (
              <Maximize size={20} className="text-gray-700" />
            )}
          </button>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: "0px",
          width: "100%",
          textAlign: "center",
          fontFamily: "sans-serif",
          pointerEvents: "none",
        }}
      >
        {!isAnalytics && (
          <h1 className="majestic-title">{data.title}</h1>
        )}
      </div>
    </div>
  );
});

export default Renderer;