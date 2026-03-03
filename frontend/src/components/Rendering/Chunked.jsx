import React, { useEffect, useState, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { cacheModel, getCachedModel } from '../../lib/DB';


export default function ChunkedModel({ url }) {
  const [scene, setScene] = useState(null);
  const [progress, setProgress] = useState(0);
  const group = useRef();

  useEffect(() => {
      if (!url) return;


    const controller = new AbortController();
    const signal = controller.signal;

    // --- GPU MEMORY CLEANUP FUNCTION ---
    const disposeScene = (object) => {
      if (!object) return;
      
      object.traverse((child) => {
        if (child.isMesh) {
          // 1. Dispose Geometries
          if (child.geometry) child.geometry.dispose();

          // 2. Dispose Materials and Textures
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            
            materials.forEach((mat) => {
              // Iterate over all properties of the material to find textures
              for (const key in mat) {
                if (mat[key]?.isTexture) {
                  mat[key].dispose();
                }
              }
              mat.dispose();
            });
          }
        }
      });
    };


    const parseModel = (buffer) => {
      const loader = new GLTFLoader();
            loader.parse(buffer, '', (gltf) => {
        if (!signal.aborted) {
          setScene(gltf.scene);
        } else {
          disposeScene(gltf.scene);
        }
      });
    };


   
      const loadLargeModel = async () => {
      setScene((prev) => {
        if (prev) disposeScene(prev);
        return null;
      });
      setProgress(0);

      const response = await fetch(url, { signal });
      if (!response.body) return;

      const reader = response.body.getReader();
      const contentLength =
        Number(response.headers.get('Content-Length')) || 0;

      let receivedLength = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (contentLength) {
          setProgress(
            Math.round((receivedLength / contentLength) * 100)
          );
        }
      }

      const buffer = new Uint8Array(receivedLength);
      let offset = 0;

      for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.length;
      }

      if (!signal.aborted) {
        await cacheModel(url, buffer.buffer);
        parseModel(buffer.buffer);
      }
    };


    /* ---------- Main Flow ---------- */
     (async () => {
      try {
        const cached = await getCachedModel(url);

        if (cached && !signal.aborted) {
          console.log('Loaded model from IndexedDB');
          parseModel(cached);
          return;
        }

        console.log('Fetching model from network');
        await loadLargeModel();
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Model load aborted');
        } else {
          console.error('Model load failed:', err);
        }
      }
    })();

    /* ---------- Cleanup ---------- */
    return () => {
      controller.abort();
      setScene((prev) => {
        if (prev) disposeScene(prev);
        return null;
      });
    };
  }, [url]);

  if (!scene) {
    // Show a wireframe box while loading to keep the user informed
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial wireframe color="#888" />
      </mesh>
    );
  }

  return (

    <group ref={group}>
      <primitive object={scene} />
    </group>


  // <group ref={group}>
  //   <primitive 
  //     object={scene} 
  //     onClick={(e) => {
  //       // Stop the click from "bleeding through" to objects behind it
  //       e.stopPropagation(); 
        
  //       const { x, y, z } = e.point;
  //       console.log(`Clicked Position: [${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}]`);
        
  //       // Optional: Copy to clipboard automatically
  //       navigator.clipboard.writeText(`[${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}]`);
  //       alert(`Coordinates copied: ${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}`);
  //     }}
  //   />
  // </group>
);
}