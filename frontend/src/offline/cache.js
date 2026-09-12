/**
 * SAKSHAM Cache Layer
 *
 * Integrates native IndexedDB persistence for offline-first resilience.
 * Maintains backward-compatible synchronous functions alongside async IDB APIs.
 */

import { getIdb, setIdb, STORES, pinPdfOffline, getPinnedPdf } from './idb.js';

const CACHE_KEY_PROJECTS = 'saksham_cache_projects';
const CACHE_KEY_VENDORS = 'saksham_cache_vendors';
const CACHE_KEY_TENDERS = 'saksham_cache_tenders';
const CACHE_KEY_INVESTIGATIONS = 'saksham_cache_investigations';
const CACHE_KEY_STATS = 'saksham_cache_stats';
const CACHE_KEY_LAST_SYNC = 'saksham_cache_last_sync';

export function saveLastSyncTime(timestamp = new Date().toISOString()) {
  try {
    localStorage.setItem(CACHE_KEY_LAST_SYNC, timestamp);
    setIdb(STORES.ENTITIES, 'last_sync_time', timestamp);
  } catch (e) {
    // Graceful fallback
  }
}

export function getLastSyncTime() {
  try {
    return localStorage.getItem(CACHE_KEY_LAST_SYNC) || null;
  } catch (e) {
    return null;
  }
}

// ─── PROJECTS ───────────────────────────────────────────────────────────────
export function cacheProjectsList(projects) {
  try {
    localStorage.setItem(CACHE_KEY_PROJECTS, JSON.stringify(projects));
    setIdb(STORES.ENTITIES, 'projects_list', projects);
    saveLastSyncTime();
  } catch (e) {
    // Continue
  }
}

export function getCachedProjectsList() {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PROJECTS);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function getCachedProjectsListAsync() {
  const fromIdb = await getIdb(STORES.ENTITIES, 'projects_list');
  if (fromIdb) return fromIdb;
  return getCachedProjectsList();
}

export function cacheProjectDetails(projectId, data) {
  try {
    localStorage.setItem(`saksham_cache_project_${projectId}`, JSON.stringify(data));
    setIdb(STORES.PROJECT_DETAILS, projectId, data);
    saveLastSyncTime();
  } catch (e) {
    // Continue
  }
}

export function getCachedProjectDetails(projectId) {
  try {
    const raw = localStorage.getItem(`saksham_cache_project_${projectId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// ─── VENDORS ────────────────────────────────────────────────────────────────
export function cacheVendorsList(vendors) {
  try {
    localStorage.setItem(CACHE_KEY_VENDORS, JSON.stringify(vendors));
    setIdb(STORES.ENTITIES, 'vendors_list', vendors);
    saveLastSyncTime();
  } catch (e) {
    // Continue
  }
}

export function getCachedVendorsList() {
  try {
    const raw = localStorage.getItem(CACHE_KEY_VENDORS);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function getCachedVendorsListAsync() {
  const fromIdb = await getIdb(STORES.ENTITIES, 'vendors_list');
  if (fromIdb) return fromIdb;
  return getCachedVendorsList();
}

export function cacheVendorDetails(vendorId, data) {
  try {
    localStorage.setItem(`saksham_cache_vendor_${vendorId}`, JSON.stringify(data));
    setIdb(STORES.VENDOR_DETAILS, vendorId, data);
    saveLastSyncTime();
  } catch (e) {
    // Continue
  }
}

export function getCachedVendorDetails(vendorId) {
  try {
    const raw = localStorage.getItem(`saksham_cache_vendor_${vendorId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// ─── TENDERS ────────────────────────────────────────────────────────────────
export function cacheTendersList(tenders) {
  try {
    localStorage.setItem(CACHE_KEY_TENDERS, JSON.stringify(tenders));
    setIdb(STORES.ENTITIES, 'tenders_list', tenders);
    saveLastSyncTime();
  } catch (e) {
    // Continue
  }
}

export function getCachedTendersList() {
  try {
    const raw = localStorage.getItem(CACHE_KEY_TENDERS);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// ─── INVESTIGATIONS ─────────────────────────────────────────────────────────
export function cacheInvestigationsList(investigations) {
  try {
    localStorage.setItem(CACHE_KEY_INVESTIGATIONS, JSON.stringify(investigations));
    setIdb(STORES.ENTITIES, 'investigations_list', investigations);
    saveLastSyncTime();
  } catch (e) {
    // Continue
  }
}

export function getCachedInvestigationsList() {
  try {
    const raw = localStorage.getItem(CACHE_KEY_INVESTIGATIONS);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// ─── DASHBOARD STATS ────────────────────────────────────────────────────────
export function cacheDashboardStats(stats) {
  try {
    localStorage.setItem(CACHE_KEY_STATS, JSON.stringify(stats));
    setIdb(STORES.ENTITIES, 'dashboard_stats', stats);
    saveLastSyncTime();
  } catch (e) {
    // Continue
  }
}

export function getCachedDashboardStats() {
  try {
    const raw = localStorage.getItem(CACHE_KEY_STATS);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Re-export PDF pinning functions
export { pinPdfOffline, getPinnedPdf };
