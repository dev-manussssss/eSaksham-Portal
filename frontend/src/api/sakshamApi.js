import {
  cacheProjectsList,
  getCachedProjectsList,
  cacheProjectDetails,
  getCachedProjectDetails,
  cacheVendorsList,
  getCachedVendorsList,
  cacheVendorDetails,
  getCachedVendorDetails,
  cacheTendersList,
  getCachedTendersList,
  cacheInvestigationsList,
  getCachedInvestigationsList,
  cacheDashboardStats,
  getCachedDashboardStats,
  getLastSyncTime,
} from '../offline/cache.js';

export const isOnline = () => (typeof navigator !== 'undefined' ? navigator.onLine : true);

function getAuthHeaders() {
  const headers = {};
  try {
    const token = localStorage.getItem('saksham_auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch (e) {
    // Ignore in non-browser env
  }
  return headers;
}

// ─── PROJECTS ───────────────────────────────────────────────────────────────
export async function fetchProjects(session) {
  if (!isOnline()) {
    const cached = getCachedProjectsList();
    return {
      projects: cached || [],
      isOffline: true,
      lastSynced: getLastSyncTime(),
    };
  }

  try {
    const res = await fetch('/api/projects', {
      headers: getAuthHeaders(session),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.projects)) {
      cacheProjectsList(data.projects);
      return { projects: data.projects, isOffline: false, lastSynced: new Date().toISOString() };
    }
    throw new Error(data.error || 'Failed to fetch projects');
  } catch (err) {
    console.warn('API error fetching projects, falling back to cache:', err.message);
    const cached = getCachedProjectsList();
    return {
      projects: cached || [],
      isOffline: true,
      lastSynced: getLastSyncTime(),
      error: err.message,
    };
  }
}

export async function fetchProjectDetails(projectId, session) {
  if (!isOnline()) {
    const cached = getCachedProjectDetails(projectId);
    return {
      data: cached,
      isOffline: true,
      lastSynced: getLastSyncTime(),
    };
  }

  try {
    const res = await fetch(`/api/projects/${projectId}`, {
      headers: getAuthHeaders(session),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success) {
      cacheProjectDetails(projectId, data);
      return { data, isOffline: false, lastSynced: new Date().toISOString() };
    }
    throw new Error(data.error || 'Failed to fetch project');
  } catch (err) {
    console.warn(`API error fetching project ${projectId}, falling back to cache:`, err.message);
    const cached = getCachedProjectDetails(projectId);
    return {
      data: cached,
      isOffline: true,
      lastSynced: getLastSyncTime(),
      error: err.message,
    };
  }
}

export async function uploadProjectDocument(projectId, file, category, session, onProgress = () => {}) {
  if (!isOnline()) {
    throw new Error('Offline Mode: Document upload and AI analysis require active network connectivity.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentCategory', category);
  formData.append('uploaderRole', session?.role || 'IMPLEMENTING_AGENCY');
  formData.append('uploadedBy', session?.userId || 'OFFICER-AUTH');

  onProgress(15, 'Uploading document to secure gateway...');

  const res = await fetch(`/api/projects/${projectId}/documents`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Upload failed with status ${res.status}`);
  }

  const result = await res.json();
  return result;
}

export async function executeHumanAction(projectId, action, session, notes = '', relatedFlagId = null) {
  if (!isOnline()) {
    throw new Error('Offline Mode: Administrative decisions cannot be finalized while offline.');
  }

  const res = await fetch(`/api/projects/${projectId}/actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(session),
    },
    body: JSON.stringify({
      action,
      actorId: session?.userId || 'USER-AUTH',
      actorRole: session?.role || 'DISTRICT_AUTHORITY',
      notes,
      relatedFlagId,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Action failed with status ${res.status}`);
  }

  return await res.json();
}

export async function recommendProjectApi(projectData, session) {
  if (!isOnline()) {
    throw new Error('Offline Mode: Scheme recommendations require active network connectivity.');
  }

  const res = await fetch('/api/projects/recommend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(session),
    },
    body: JSON.stringify(projectData),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Recommendation failed with status ${res.status}`);
  }

  return await res.json();
}

// ─── VENDORS ────────────────────────────────────────────────────────────────
export async function fetchVendors(session, { includeDeactivated = false } = {}) {
  if (!isOnline()) {
    const cached = getCachedVendorsList();
    return {
      vendors: cached || [],
      isOffline: true,
      lastSynced: getLastSyncTime(),
    };
  }

  try {
    const url = `/api/vendors${includeDeactivated ? '?include_deactivated=true' : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(session),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.vendors)) {
      cacheVendorsList(data.vendors);
      return { vendors: data.vendors, isOffline: false, lastSynced: new Date().toISOString() };
    }
    throw new Error(data.error || 'Failed to fetch vendors');
  } catch (err) {
    console.warn('API error fetching vendors, falling back to cache:', err.message);
    const cached = getCachedVendorsList();
    return {
      vendors: cached || [],
      isOffline: true,
      lastSynced: getLastSyncTime(),
      error: err.message,
    };
  }
}

export async function fetchVendorDetails(vendorId, session) {
  if (!isOnline()) {
    const cached = getCachedVendorDetails(vendorId);
    return {
      data: cached,
      isOffline: true,
      lastSynced: getLastSyncTime(),
    };
  }

  try {
    const res = await fetch(`/api/vendors/${vendorId}`, {
      headers: getAuthHeaders(session),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success) {
      cacheVendorDetails(vendorId, data);
      return { data, isOffline: false, lastSynced: new Date().toISOString() };
    }
    throw new Error(data.error || 'Failed to fetch vendor detail');
  } catch (err) {
    console.warn(`API error fetching vendor ${vendorId}, falling back to cache:`, err.message);
    const cached = getCachedVendorDetails(vendorId);
    return {
      data: cached,
      isOffline: true,
      lastSynced: getLastSyncTime(),
      error: err.message,
    };
  }
}

export const fetchVendorById = fetchVendorDetails;

export async function createVendor(vendorData, session) {

  if (!isOnline()) {
    throw new Error('Offline Mode: Adding new vendors requires active connectivity.');
  }

  const res = await fetch('/api/vendors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(session),
    },
    body: JSON.stringify(vendorData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create vendor (${res.status})`);
  }

  return await res.json();
}

export async function updateVendor(vendorId, vendorData, session) {
  if (!isOnline()) {
    throw new Error('Offline Mode: Updating vendor profiles requires active connectivity.');
  }

  const res = await fetch(`/api/vendors/${vendorId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(session),
    },
    body: JSON.stringify(vendorData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update vendor (${res.status})`);
  }

  return await res.json();
}

export async function deactivateVendor(vendorId, reason, session) {
  if (!isOnline()) {
    throw new Error('Offline Mode: Deactivating a vendor requires active connectivity.');
  }

  const res = await fetch(`/api/vendors/${vendorId}/deactivate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(session),
    },
    body: JSON.stringify({ reason }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to deactivate vendor (${res.status})`);
  }

  return await res.json();
}

export async function fetchVendorRiskScore(vendorId, session) {
  const res = await fetch(`/api/vendors/${vendorId}/risk-score`, {
    headers: getAuthHeaders(session),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch risk score (${res.status})`);
  }
  return await res.json();
}

export async function recalculateVendorRiskScore(vendorId, session) {
  const res = await fetch(`/api/vendors/${vendorId}/risk-score/recalculate`, {
    method: 'POST',
    headers: getAuthHeaders(session),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to recalculate risk score (${res.status})`);
  }
  return await res.json();
}

// ─── TENDERS ────────────────────────────────────────────────────────────────
export async function fetchTenders(session, { ownOnly = false } = {}) {
  if (!isOnline()) {
    const cached = getCachedTendersList();
    return {
      tenders: cached || [],
      isOffline: true,
      lastSynced: getLastSyncTime(),
    };
  }

  try {
    const url = `/api/tenders${ownOnly ? '?own=true' : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(session),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.tenders)) {
      cacheTendersList(data.tenders);
      return { tenders: data.tenders, isOffline: false, lastSynced: new Date().toISOString() };
    }
    throw new Error(data.error || 'Failed to fetch tenders');
  } catch (err) {
    console.warn('API error fetching tenders, falling back to cache:', err.message);
    const cached = getCachedTendersList();
    return {
      tenders: cached || [],
      isOffline: true,
      lastSynced: getLastSyncTime(),
      error: err.message,
    };
  }
}

export async function fetchTenderDetails(tenderId, session) {
  const res = await fetch(`/api/tenders/${tenderId}`, {
    headers: getAuthHeaders(session),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch tender (${res.status})`);
  }
  return await res.json();
}

export async function createTender(tenderData, session) {
  if (!isOnline()) {
    throw new Error('Offline Mode: Creating tenders requires active connectivity.');
  }

  const res = await fetch('/api/tenders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(session),
    },
    body: JSON.stringify(tenderData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create tender (${res.status})`);
  }

  return await res.json();
}

// ─── INVESTIGATIONS ─────────────────────────────────────────────────────────
export async function fetchInvestigations(session) {
  if (!isOnline()) {
    const cached = getCachedInvestigationsList();
    return {
      investigations: cached || [],
      isOffline: true,
      lastSynced: getLastSyncTime(),
    };
  }

  try {
    const res = await fetch('/api/investigations', {
      headers: getAuthHeaders(session),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.investigations)) {
      cacheInvestigationsList(data.investigations);
      return { investigations: data.investigations, isOffline: false, lastSynced: new Date().toISOString() };
    }
    throw new Error(data.error || 'Failed to fetch investigations');
  } catch (err) {
    console.warn('API error fetching investigations, falling back to cache:', err.message);
    const cached = getCachedInvestigationsList();
    return {
      investigations: cached || [],
      isOffline: true,
      lastSynced: getLastSyncTime(),
      error: err.message,
    };
  }
}

export async function openInvestigation(investigationData, session) {
  if (!isOnline()) {
    throw new Error('Offline Mode: Opening investigations requires active connectivity.');
  }

  const res = await fetch('/api/investigations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(session),
    },
    body: JSON.stringify(investigationData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to open investigation (${res.status})`);
  }

  return await res.json();
}

// ─── DASHBOARD STATS ────────────────────────────────────────────────────────
export async function fetchDashboardStats(session) {
  if (!isOnline()) {
    const cached = getCachedDashboardStats();
    return {
      stats: cached,
      isOffline: true,
      lastSynced: getLastSyncTime(),
    };
  }

  try {
    const res = await fetch('/api/dashboard/stats', {
      headers: getAuthHeaders(session),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && data.stats) {
      cacheDashboardStats(data.stats);
      return { stats: data.stats, isOffline: false, lastSynced: new Date().toISOString() };
    }
    throw new Error(data.error || 'Failed to fetch stats');
  } catch (err) {
    console.warn('API error fetching dashboard stats, falling back to cache:', err.message);
    const cached = getCachedDashboardStats();
    return {
      stats: cached,
      isOffline: true,
      lastSynced: getLastSyncTime(),
      error: err.message,
    };
  }
}
