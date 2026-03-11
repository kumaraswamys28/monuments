import {
  CameraControls,
  Dodecahedron,
  Environment,
  Grid,
  MeshDistortMaterial,
  RenderTexture,
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useAtom } from "jotai";
import { useControls } from "leva";
import { useEffect, useRef } from "react";
import { slideAtom } from "./Overlay";
import { Scene } from "./Scene";

/**
 * SLIDE ORDER  (index → what renders)
 *  0  model   – Hampi 3D
 *  1  info    – Project Overview
 *  2  model   – Model3 3D
 *  3  info    – Objectives & Rationale
 *  4  model   – Semi 3D
 *  5  info    – Gantt Chart
 *  6  images  – Gallery I
 *  7  images  – Gallery II
 *  8  video   – Demo 1
 *  9  video   – Demo 2
 */
export const scenes = [
  { type: "model", path: "models/HAMPI.glb",       mainColor: "#f5e6c8", name: "Hampi — Karnataka's Crown Jewel",  description: "UNESCO World Heritage Site · Vijayanagara Empire" },
  { type: "info",  variant: "project",                                    name: "Project Overview",                  description: "Title · Team · Cost · Partners" },
  { type: "model", path: "models/model.glb", mainColor: "#c0ffe1", name: "Digital Twin Platform",             description: "Physics-validated USD / Omniverse models" },
  { type: "info",  variant: "objectives",                                  name: "Objectives & Rationale",            description: "Six objectives · Four rationale pillars" },
  { type: "model", path: "models/temple3.glb",   mainColor: "#ffdec0", name: "IoT Edge Network",                  description: "500 sensor nodes · 20 gateways" },
  { type: "info",  variant: "gantt",                                       name: "Gantt Chart",                       description: "36-month activity timeline · 12 quarters" },
  { type: "images", name: "Heritage Documentation",       description: "On-site photography & survey imagery",          images: ["/images/slide_img1a.jpg", "/images/slide_img1b.jpg"] },
  { type: "images", name: "Digital Twin Visualisations",  description: "Reconstructed geometry & material models",       images: ["/images/slide_img2a.jpg", "/images/slide_img2b.jpg"] },
  { type: "video",  name: "Demo — IoT Sensor Deployment", description: "Live anomaly detection walkthrough",             videoSrc: "/videos/demo1.mp4" },
  { type: "video",  name: "Demo — XR Walkthrough",        description: "Immersive heritage exploration",                 videoSrc: "/videos/demo2.mp4" },
];

// Derived list of only the model-type slides (in order)
export const modelScenes = scenes.filter((s) => s.type === "model");

// Given a global slide index, return which model index (0/1/2) the camera should sit on.
// Rule: show the most-recently-passed model slide.
// e.g. slide 0 → model 0, slide 1 (info) → model 0 still, slide 2 → model 1, slide 3 → model 1, etc.
function globalToModelIndex(globalIdx) {
  let modelCount = -1;
  for (let i = 0; i <= globalIdx; i++) {
    if (scenes[i].type === "model") modelCount++;
  }
  return Math.max(0, Math.min(modelCount, modelScenes.length - 1));
}

// ─── Camera handler ───────────────────────────────────────────────────────────
const CameraHandler = ({ slideDistance }) => {
  const viewport = useThree((state) => state.viewport);
  const cameraControls = useRef();
  const [slide] = useAtom(slideAtom);
  const lastModelIndex = useRef(0);

  const { dollyDistance } = useControls({
    dollyDistance: { value: 8, min: 0, max: 50 },
  });

  const modelIndex = globalToModelIndex(slide);

  const moveToModel = async (target, prev) => {
    // Step 1: pull back
    await cameraControls.current.setLookAt(
      prev * (viewport.width + slideDistance), 3, dollyDistance,
      prev * (viewport.width + slideDistance), 0, 0,
      true
    );
    // Step 2: sweep toward next
    await cameraControls.current.setLookAt(
      (target + 1) * (viewport.width + slideDistance), 1, dollyDistance,
      target * (viewport.width + slideDistance), 0, 0,
      true
    );
    // Step 3: settle
    await cameraControls.current.setLookAt(
      target * (viewport.width + slideDistance), 0, 5,
      target * (viewport.width + slideDistance), 0, 0,
      true
    );
  };

  // Reset on viewport resize
  useEffect(() => {
    const t = setTimeout(() => {
      cameraControls.current?.setLookAt(
        lastModelIndex.current * (viewport.width + slideDistance), 0, 5,
        lastModelIndex.current * (viewport.width + slideDistance), 0, 0
      );
    }, 200);
    return () => clearTimeout(t);
  }, [viewport]);

  // Animate when model index changes
  useEffect(() => {
    if (lastModelIndex.current === modelIndex) return;
    moveToModel(modelIndex, lastModelIndex.current);
    lastModelIndex.current = modelIndex;
  }, [modelIndex]);

  return (
    <CameraControls
      ref={cameraControls}
      touches={{ one: 0, two: 0, three: 0 }}
      mouseButtons={{ left: 0, middle: 0, right: 0 }}
    />
  );
};

// ─── Experience ───────────────────────────────────────────────────────────────
export const Experience = () => {
  const viewport = useThree((state) => state.viewport);
  const { slideDistance } = useControls({
    slideDistance: { value: 1, min: 0, max: 10 },
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <Environment preset="city" />
      <CameraHandler slideDistance={slideDistance} />

      {/* Floating accent shapes — one per model scene */}
      <group>
        <mesh position={[0 * (viewport.width + slideDistance), viewport.height / 2 + 1.5, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={modelScenes[0].mainColor} speed={3} />
        </mesh>
        <mesh position={[1 * (viewport.width + slideDistance), viewport.height / 2 + 1.5, 0]}>
          <boxGeometry />
          <MeshDistortMaterial color={modelScenes[1].mainColor} speed={3} />
        </mesh>
        <Dodecahedron position={[2 * (viewport.width + slideDistance), viewport.height / 2 + 1.5, 0]}>
          <MeshDistortMaterial color={modelScenes[2].mainColor} speed={3} />
        </Dodecahedron>
      </group>

      <Grid
        position-y={-viewport.height / 2}
        sectionSize={1} sectionColor="purple" sectionThickness={1}
        cellSize={0.5} cellColor="#6f6f6f" cellThickness={0.6}
        infiniteGrid fadeDistance={50} fadeStrength={5}
      />

      {/* Model planes — laid out at indices 0, 1, 2 in Three.js space */}
      {modelScenes.map((scene, index) => (
        <mesh key={index} position={[index * (viewport.width + slideDistance), 0, 0]}>
          <planeGeometry args={[viewport.width, viewport.height]} />
          <meshBasicMaterial toneMapped={false}>
            <RenderTexture attach="map">
              <Scene {...scene} />
            </RenderTexture>
          </meshBasicMaterial>
        </mesh>
      ))}
    </>
  );
};