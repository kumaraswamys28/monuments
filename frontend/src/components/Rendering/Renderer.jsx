import React ,{ Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stage } from "@react-three/drei";
import {
  OrbitControls,
  PerspectiveCamera,
  Stats,
} from "@react-three/drei";


import ChunkedModel from "./Chunked";
export default function Renderer({data ,res}) {

    return (
    <div style={{ width: "100%", height: "100%", background: "#e2e0e0" }}>
  

      <Canvas
        shadows
        dpr={[1, 2]} 
        gl={{
          antialias: false, 
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
  </Suspense>
        <fog attach="fog" args={['#e2e0e0', 5, 50 - (res.humidity * 0.3)]} />

      
<PerspectiveCamera makeDefault near={0.1}
    far={1000} position={[5, 2, 8]} fov={50} />

        {/* Controls */}
<OrbitControls 
          makeDefault 
          enableDamping 
          maxPolarAngle={Math.PI / 2.1} 
          minZoom={20}
          maxZoom={200}
        />
       

    <Suspense fallback={null}>
        
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#ffffff" opacity={0.2} transparent />
          </mesh>

         
        </Suspense>
        
        <directionalLight position={[5, 5, 5]} intensity={1} />

       <Suspense fallback={null}>
         
          <SceneContent data={data} />
        </Suspense>
      </Canvas>


      <div
        style={{
          position: "absolute",
          top: "10px",
          width: "100%",
          textAlign: "center",
          fontFamily: "sans-serif",
          pointerEvents: "none",
        }}
      >
        <h1 className="majestic-title">{data.title}</h1>{" "}
      </div>
    </div>
  );
}

const SceneContent = React.memo(({ data }) => {
  return (
    <Stage adjustCamera={true} environment="city"> 
      <ChunkedModel url={data.url} />
    </Stage>
  );
});

