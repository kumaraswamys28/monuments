import React, { useEffect, useState, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function ChunkedModel({ url }) {
  const [scene, setScene] = useState(null);
  const [progress, setProgress] = useState(0);
  const group = useRef();

  useEffect(() => {
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
                if (mat[key] && mat[key].isTexture) {
                  mat[key].dispose();
                }
              }
              mat.dispose();
            });
          }
        }
      });
    };

    async function loadLargeModel() {
      try {
        // Reset current model state and clean up previous memory
        setScene((prev) => {
          if (prev) disposeScene(prev);
          return null;
        });
        setProgress(0);

        const response = await fetch(url, { signal });
        if (!response.body) return;

        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length') || 0;

        let receivedLength = 0;
        let chunks = [];

        // Streaming the download
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          receivedLength += value.length;
          
          if (contentLength) {
            setProgress(Math.round((receivedLength / contentLength) * 100));
          }
        }

        // Reconstruct binary data
        let allChunks = new Uint8Array(receivedLength);
        let position = 0;
        for (let chunk of chunks) {
          allChunks.set(chunk, position);
          position += chunk.length;
        }

        // Clear references to chunks early to help Garbage Collection
        chunks = [];

        const loader = new GLTFLoader();
        loader.parse(allChunks.buffer, '', (gltf) => {
          if (!signal.aborted) {
            // Set the new scene
            setScene(gltf.scene);
          } else {
            // If the user switched models while we were parsing, dump this one immediately
            disposeScene(gltf.scene);
          }
          
          // Manually nullify the buffer once parsing is done
          allChunks = null;
        });

      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Model load cancelled for:', url);
        } else {
          console.error("Critical model load error:", err);
        }
      }
    }

    if (url) {
      loadLargeModel();
    }

    // Cleanup: When the component updates (new URL) or unmounts
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
        <meshStandardMaterial color="#888" wireframe />
      </mesh>
    );
  }

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}