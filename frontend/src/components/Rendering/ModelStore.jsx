/**
 * ModelStore.jsx
 *
 * Loads a GLB/GLTF once (from IndexedDB cache or network),
 * parses it once with GLTFLoader, then exposes the base THREE.Scene
 * via React context so any viewport can clone it cheaply.
 *
 * Context shape:
 *   scene    – THREE.Scene | null
 *   progress – 0–100 (real fetch + parse progress)
 *   error    – string | null
 *   source   – 'network' | 'cache' | null
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { cacheModel, getCachedModel } from '../../lib/DB';

// ── Context ───────────────────────────────────────────────────────────────────
const ModelContext = createContext({ scene: null, progress: 0, error: null, source: null });

export const useBaseScene = () => useContext(ModelContext);

// ── GPU dispose helper ────────────────────────────────────────────────────────
function disposeScene(object) {
  if (!object) return;
  object.traverse((child) => {
    if (!child.isMesh) return;
    child.geometry?.dispose();
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach((mat) => {
      if (!mat) return;
      for (const key in mat) {
        if (mat[key]?.isTexture) mat[key].dispose();
      }
      mat.dispose();
    });
  });
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ModelProvider({ url, children }) {
  const [scene, setScene]       = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError]       = useState(null);
  const [source, setSource]     = useState(null); // 'network' | 'cache'
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();
    const { signal } = controller;

    // Clean up previous scene when url changes
    if (sceneRef.current) {
      disposeScene(sceneRef.current);
      sceneRef.current = null;
      setScene(null);
    }
    setProgress(0);
    setError(null);
    setSource(null);

    const parseBuffer = (buffer) => {
      // Progress 90→100 covers the parse phase
      const loader = new GLTFLoader();
      loader.parse(buffer, '', (gltf) => {
        if (signal.aborted) { disposeScene(gltf.scene); return; }
        sceneRef.current = gltf.scene;
        setScene(gltf.scene);
        setProgress(100);
      }, (err) => {
        if (!signal.aborted) setError(err?.message ?? 'Parse error');
      });
    };

    const fetchAndCache = async () => {
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const contentLength = Number(response.headers.get('Content-Length')) || 0;

      let received = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        // Network download covers 0–90%; parse covers 90–100%
        if (contentLength) {
          setProgress(Math.round((received / contentLength) * 90));
        } else {
          // No Content-Length: creep forward so bar isn't frozen
          setProgress((prev) => Math.min(80, prev + 1));
        }
      }

      const buffer = new Uint8Array(received);
      let offset = 0;
      for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }

      if (signal.aborted) return;

      // Cache asynchronously — don't block parse
      cacheModel(url, buffer.buffer).catch((e) =>
        console.warn('[ModelStore] Cache write failed:', e)
      );

      setProgress(90); // download done, parsing starts
      parseBuffer(buffer.buffer);
    };

    (async () => {
      try {
        const cached = await getCachedModel(url);
        if (cached && !signal.aborted) {
          console.log('[ModelStore] Loaded from IndexedDB cache ✓');
          setSource('cache');
          setProgress(90); // skip network phase; jump straight to parse
          parseBuffer(cached);
        } else {
          if (signal.aborted) return;
          console.log('[ModelStore] Fetching from network…');
          setSource('network');
          await fetchAndCache();
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('[ModelStore] Load failed:', err);
        setError(err.message);
      }
    })();

    return () => {
      controller.abort();
      setTimeout(() => {
        if (sceneRef.current) {
          disposeScene(sceneRef.current);
          sceneRef.current = null;
        }
      }, 100);
    };
  }, [url]);

  return (
    <ModelContext.Provider value={{ scene, progress, error, source }}>
      {children}
    </ModelContext.Provider>
  );
}