/**
 * SAKSHAM RBAC Consolidation Module (Phase 2)
 *
 * NOTE: All authoritative permissions and access-control checks have been consolidated
 * into `backend/src/middleware/rbac.js`.
 * This module is maintained as a clean alias/re-export for backward compatibility.
 */

export * from './middleware/rbac.js';
