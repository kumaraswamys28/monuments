/**
 * Chunked.jsx  (updated)
 *
 * Reads the base scene from ModelStore context, clones it,
 * applies per-viewport material overrides, and renders.
 *
 * Props:
 *   forceWireframe  – cyan animated wireframe
 *   layerMode       – orange clipped layer-scan (GCode style)
 *   dispersionMode  – glass/dispersion purple material
 *   clippingPlane   – THREE.Plane (required for layerMode to animate)
 *
 * No props = normal material passthrough (original textures preserved).
 */

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useBaseScene } from './ModelStore.jsx';

// ── Material factories ────────────────────────────────────────────────────────
const makeWireframeMat = () => new THREE.MeshBasicMaterial({
  color: new THREE.Color(0.05, 0.85, 1.0),
  wireframe: true,
  transparent: true,
  opacity: 0.8,
});

const makeLayerMat = (clippingPlane) => new THREE.MeshStandardMaterial({
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

const makeDispersionMat = () => {
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
  mat.isDispersionMat = true;
  return mat;
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function ChunkedModel({
  forceWireframe = false,
  layerMode = false,
  dispersionMode = false,
  clippingPlane = null,
}) {
  const { scene, progress, error } = useBaseScene();
  const group = useRef();

  // Clone base scene once and apply material overrides per viewport
  const processedScene = useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone(true);

    if (forceWireframe || layerMode || dispersionMode) {
      clone.traverse((child) => {
        if (!child.isMesh) return;
        if (forceWireframe)       child.material = makeWireframeMat();
        else if (layerMode)       child.material = makeLayerMat(clippingPlane);
        else if (dispersionMode)  child.material = makeDispersionMat();
      });
    }

    return clone;
  }, [scene, forceWireframe, layerMode, dispersionMode, clippingPlane]);

  // ── Error state ───────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Html center>
        <div style={{
          background: 'rgba(20,5,5,0.9)', color: '#f87171',
          borderRadius: 10, padding: '12px 16px',
          fontFamily: 'monospace', fontSize: 12,
          border: '1px solid rgba(248,113,113,0.3)',
        }}>⚠ {error}</div>
      </Html>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (!processedScene) {
    return (
      <>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial wireframe color="#334155" />
        </mesh>
        <Html center>
          <div style={{ width: 180, fontFamily: 'sans-serif', textAlign: 'center' }}>
            <div style={{
              background: 'rgba(5,10,20,0.92)', borderRadius: 10,
              padding: '12px 16px', boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, letterSpacing: '0.06em' }}>
                {progress < 90 ? `Fetching… ${progress}%` : 'Parsing model…'}
              </div>
              <div style={{ background: '#0f172a', borderRadius: 999, height: 5, overflow: 'hidden' }}>
                <div style={{
                  width: `${progress}%`, height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                  borderRadius: 999, transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          </div>
        </Html>
      </>
    );
  }

  return (
    <group ref={group}>
      <primitive object={processedScene} />
    </group>
  );
}