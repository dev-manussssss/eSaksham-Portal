/**
 * SAKSHAM Native IndexedDB Storage Engine
 *
 * Implements client-side persistence using the standard browser IndexedDB API.
 * ZERO external dependencies (no npm packages required).
 *
 * Stores:
 *  - entities: generic key-value store for list summaries and dashboard stats
 *  - project_details: detailed project caches by project_id
 *  - vendor_details: detailed vendor & risk assessment records by vendor_id
 *  - pinned_pdfs: binary document blobs explicitly pinned by administrative officers
 */

const DB_NAME = 'saksham_offline_v1';
const DB_VERSION = 1;

const STORES = {
  ENTITIES: 'entities',
  PROJECT_DETAILS: 'project_details',
  VENDOR_DETAILS: 'vendor_details',
  PINNED_PDFS: 'pinned_pdfs',
};

let dbPromise = null;

function getDb() {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORES.ENTITIES)) {
          db.createObjectStore(STORES.ENTITIES);
        }
        if (!db.objectStoreNames.contains(STORES.PROJECT_DETAILS)) {
          db.createObjectStore(STORES.PROJECT_DETAILS);
        }
        if (!db.objectStoreNames.contains(STORES.VENDOR_DETAILS)) {
          db.createObjectStore(STORES.VENDOR_DETAILS);
        }
        if (!db.objectStoreNames.contains(STORES.PINNED_PDFS)) {
          db.createObjectStore(STORES.PINNED_PDFS, { keyPath: 'docId' });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        console.warn('[SAKSHAM-IDB] IndexedDB open error:', req.error);
        resolve(null);
      };
    });
  }

  return dbPromise;
}

export async function getIdb(storeName, key) {
  try {
    const db = await getDb();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('[SAKSHAM-IDB] getIdb failed:', err);
    return null;
  }
}

export async function setIdb(storeName, key, value) {
  try {
    const db = await getDb();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(value, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.warn('[SAKSHAM-IDB] setIdb failed:', req.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('[SAKSHAM-IDB] setIdb exception:', err);
    return false;
  }
}

export async function delIdb(storeName, key) {
  try {
    const db = await getDb();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
}

// ─── PINNED PDF STORAGE (OFFICER PIN-ONLY) ──────────────────────────────────
// Max 5MB per document (5242880 bytes). NEVER auto-cached.
const MAX_OFFLINE_PDF_BYTES = 5242880;

export async function pinPdfOffline(docId, blob, meta = {}) {
  try {
    if (!blob || blob.size > MAX_OFFLINE_PDF_BYTES) {
      return { success: false, reason: 'Document exceeds 5MB offline cache limit' };
    }

    const db = await getDb();
    if (!db) return { success: false, reason: 'IndexedDB unavailable' };

    const record = {
      docId,
      blob,
      size: blob.size,
      fileName: meta.fileName || 'document.pdf',
      pinnedAt: new Date().toISOString(),
      pinnedBy: meta.actorRole || 'OFFICER',
    };

    return new Promise((resolve) => {
      const tx = db.transaction(STORES.PINNED_PDFS, 'readwrite');
      const store = tx.objectStore(STORES.PINNED_PDFS);
      const req = store.put(record);
      req.onsuccess = () => resolve({ success: true, record });
      req.onerror = () => resolve({ success: false, reason: req.error?.message });
    });
  } catch (err) {
    return { success: false, reason: err.message };
  }
}

export async function getPinnedPdf(docId) {
  try {
    const db = await getDb();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(STORES.PINNED_PDFS, 'readonly');
      const store = tx.objectStore(STORES.PINNED_PDFS);
      const req = store.get(docId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}

export { STORES };
