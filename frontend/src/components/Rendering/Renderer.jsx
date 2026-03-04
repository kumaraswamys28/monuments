import React ,{ useRef,useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Environment,Html, Stage } from "@react-three/drei";
import {
  OrbitControls,
  PerspectiveCamera,
  Stats,useTexture,
} from "@react-three/drei";
import * as THREE from "three";

import { Maximize, Minimize,MapPin } from "lucide-react"; // Optional: for nice icons


import ChunkedModel from "./Chunked";
import { Link, useMatch } from "react-router-dom";
import { AxesHelper } from "three";

const DataPin = ({ position, label, value, unit }) => {
  return (
    <group position={position}>
      {/* The Visual Pin/Pointer */}
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="red" />
      </mesh>

      {/* The HTML Label */}
      <Html
        distanceFactor={10} // Scales the text based on camera distance
        position={[7.16, 53.06, -2.32]} // Offset it slightly above the pin
        center
      >
        <div style={{
          background: 'white',
          padding: '5px 10px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          whiteSpace: 'nowrap',
          pointerEvents: 'none', // Allows orbit controls to work through the label
          boxShadow: '0px 2px 10px rgba(0,0,0,0.2)',
          fontFamily: 'sans-serif',
          fontSize: '12px'
        }}>
          <strong>{label}:</strong> {value}{unit}
          {/* Visual arrow pointing down */}
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


const Renderer = React.memo(({ data }) =>{
    const isAnalytics = useMatch("/model/:id/analytics");

const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for escape key or manual exit to sync state
  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);


    return (
    <div className="border-2 border-grey-500" style={{ width: "100%", height: "100%", background: "#e2e0e0" }} > 
     
    <div ref={containerRef} className="relative w-full h-full">

      <Canvas
        
        dpr={[1, 2]} 
        gl={{
          antialias: false, 
          // powerPreference: "high-performance",
        }}
      >
        <gridHelper/>
        <axesHelper/>
        {/* <fog attach="fog" args={['#e2e0e0', 5, 50 - (res.humidity * 0.3)]} /> */}

      
<PerspectiveCamera makeDefault near={0.1}
    far={1000} position={[5, 2, 8]} fov={50} />

        {/* Controls */}
<OrbitControls 
          makeDefault 
           
// minPolarAngle={Math.PI / 2 - 0.2} 
  maxPolarAngle={Math.PI / 2 + 0.0}         
        />
       
{/* 
    <Suspense fallback={null}>
        
           <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#ffffff" opacity={0.2} transparent />
          </mesh> 
        
        </Suspense> */}
        
        <directionalLight position={[5, 5, 5]} intensity={0} />

       <Suspense fallback={null}>
        {/* <CustomSkybox url="/360.jpg" /> */}
         {/* <Environment 
            files="/360.jpg" // Or use a preset like "sunset", "city", "park"
            background // This makes it a 360 sky
            blur={0} // Set to 0.5 or 1 if you want a blurry background
          /> */}
          <SceneContent data={data} />
        </Suspense>
      </Canvas>
       <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10 pointer-events-auto">
        <Link
          to="#"
          className="p-2 bg-white/80 hover:bg-white rounded-md shadow-md transition-all border border-gray-300"
          title="Spawn"
        >
         
            <MapPin size={20} className="text-gray-700" /> 
         
        </Link>
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
      )}      </div>
      
    </div>
  );
})

const SceneContent = React.memo(({ data }) => {
  return (
    <Stage adjustCamera={true} intensity={0.5}> 
      <Center top alignToBottom>
        <ChunkedModel url={data.url} />
      </Center>
    </Stage>
  );
}, (prev, next) => prev.data.url === next.data.url);




function CustomSkybox({ url }) {
  const texture = useTexture(url);
  // Ensure the texture is mapped correctly for a sphere
  texture.mapping = THREE.EquirectangularReflectionMapping;

  return (
    <mesh>
      {/* Create a large sphere. 'args' is [radius, segments, segments] */}
      <sphereGeometry args={[500, 60, 40]} /> 
      <meshBasicMaterial 
        map={texture} 
        side={THREE.BackSide} // Render the inside of the sphere
      />
    </mesh>
  );
}


export default Renderer;