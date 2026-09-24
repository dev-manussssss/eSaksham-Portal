import { Router } from 'express';
import multer from 'multer';
import {
  getProjects,
  getProjectById,
  recommendProject,
  executeAction,
  uploadDocument,
  recordInspection,
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { documentAnalysisLimiter } from '../middleware/rateLimit.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

router.get('/', authenticate, getProjects);
router.get('/:id', authenticate, getProjectById);
router.post('/recommend', authenticate, requirePermission('RECOMMEND_PROJECT'), recommendProject);
router.post('/:id/action', authenticate, executeAction);
router.post('/:id/documents', authenticate, documentAnalysisLimiter, upload.single('document'), uploadDocument);
router.post('/:id/inspections', authenticate, requirePermission('CONDUCT_INSPECTION'), recordInspection);

export default router;

