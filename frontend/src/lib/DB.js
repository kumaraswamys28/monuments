
const DB_NAME = 'model-cache';
const STORE_NAME = 'models';
const DB_VERSION = 1;

export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function cacheModel(url, buffer) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(buffer, url);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}



export async function getCachedModel(url) {
  const db = await openDB();

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(url);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}


