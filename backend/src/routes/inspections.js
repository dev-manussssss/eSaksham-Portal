import { Router } from 'express';
import { getInspections, createInspection } from '../controllers/inspectionController.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = Router();

router.get('/', authenticate, getInspections);
router.post('/', authenticate, requirePermission('CONDUCT_INSPECTION'), createInspection);

export default router;
