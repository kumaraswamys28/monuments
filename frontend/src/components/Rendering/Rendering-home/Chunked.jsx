import React, { useEffect, useState, useRef, useMemo } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { cacheModel, getCachedModel } from '../../../lib/DB';
import { Html } from '@react-three/drei';

/**
 * ChunkedModel - loads a GLTF/GLB and applies render-mode overrides.
 *
 * Props:
 *   url           - model URL (required)
 *   forceWireframe - apply cyan wireframe material
 *   layerMode      - apply orange layered/gcode material with clipping plane support
 *   dispersionMode - apply semi-transparent glass/dispersion material
 *   clippingPlane  - THREE.Plane to clip geometry (used in layerMode)
 *   invisible      - render nothing (used when parent handles clone)
 */
export default function ChunkedModel({
  url,
  forceWireframe = false,
  layerMode = false,
  dispersionMode = false,
  clippingPlane = null,
  invisible = false,
}) {
  const [scene, setScene] = useState(null);
  const [progress, setProgress] = useState(0);
  const group = useRef();

  // ── GPU cleanup ──────────────────────────────────────────────────────────────
  const disposeScene = (object) => {
    if (!object) return;
    object.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((mat) => {
            for (const key in mat) {
              if (mat[key]?.isTexture) mat[key].dispose();
            }
            mat.dispose();
          });
        }
      }
    });
  };

  // ── Load model ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    const signal = controller.signal;

    const parseModel = (buffer) => {
      const loader = new GLTFLoader();
      loader.parse(buffer, '', (gltf) => {
        if (!signal.aborted) setScene(gltf.scene);
        else disposeScene(gltf.scene);
      });
    };

    const loadLargeModel = async () => {
      setScene((prev) => { if (prev) disposeScene(prev); return null; });
      setProgress(0);
      const response = await fetch(url, { signal });
      if (!response.body) return;
      const reader = response.body.getReader();
      const contentLength = Number(response.headers.get('Content-Length')) || 0;
      let receivedLength = 0;
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        if (contentLength) setProgress(Math.round((receivedLength / contentLength) * 100));
      }
      const buffer = new Uint8Array(receivedLength);
      let offset = 0;
      for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
      if (!signal.aborted) { await cacheModel(url, buffer.buffer); parseModel(buffer.buffer); }
    };

    (async () => {
      try {
        const cached = await getCachedModel(url);
        if (cached && !signal.aborted) { parseModel(cached); return; }
        await loadLargeModel();
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Model load failed:', err);
      }
    })();

    return () => {
      controller.abort();
      setScene((prev) => { if (prev) disposeScene(prev); return null; });
    };
  }, [url]);

  // ── Build override materials ─────────────────────────────────────────────────
  const processedScene = useMemo(() => {
    if (!scene) return null;
    if (!forceWireframe && !layerMode && !dispersionMode) return scene;

    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (!child.isMesh) return;

      if (forceWireframe) {
        child.material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0.05, 0.85, 1.0),
          wireframe: true,
          transparent: true,
          opacity: 0.8,
        });
      } else if (layerMode) {
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(1.0, 0.35, 0.05),
          emissive: new THREE.Color(0.8, 0.2, 0.0),
          emissiveIntensity: 0.4,
          metalness: 0.2,
          roughness: 0.5,
          transparent: true,
          opacity: 0.92,
          side: THREE.DoubleSide,
          clippingPlanes: clippingPlane ? [clippingPlane] : [],
          clipShadows: true,
        });
        child.material = mat;
      } else if (dispersionMode) {
        const mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0.6, 0.2, 1.0),
          emissive: new THREE.Color(0.4, 0.0, 0.8),
          emissiveIntensity: 0.35,
          metalness: 0.0,
          roughness: 0.05,
          transmission: 0.6,
          thickness: 1.5,
          ior: 1.8,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        mat.isDispersionMat = true; // flag for animation
        child.material = mat;
      }
    });

    return clone;
  }, [scene, forceWireframe, layerMode, dispersionMode, clippingPlane]);

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (!scene) {
    return (
      <>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial wireframe color="#888" />
        </mesh>
        <Html center>
          <div style={{ width: '180px', fontFamily: 'sans-serif', textAlign: 'center' }}>
            <div style={{
              background: 'rgba(5,10,20,0.9)', borderRadius: '10px',
              padding: '12px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.05em' }}>
                Loading... {progress}%
              </div>
              <div style={{ background: '#1e293b', borderRadius: '999px', height: '5px', overflow: 'hidden' }}>
                <div style={{
                  width: `${progress}%`, height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                  borderRadius: '999px', transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          </div>
        </Html>
      </>
    );
  }

  if (invisible) return null;

  return (
    <group ref={group}>
      <primitive object={processedScene} />
    </group>
  );
}