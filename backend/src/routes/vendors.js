import { Router } from 'express';
import {
  getVendors,
  getVendorById,
  updateVendor,
  setBlacklistStatus,
  createVendor,
  toggleSuspendVendor,
} from '../controllers/vendorController.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { validateVendorUpdate } from '../middleware/validate.js';

const router = Router();

router.get('/', authenticate, getVendors);
router.post('/', authenticate, requirePermission('CREATE_VENDOR'), createVendor);
router.get('/:id', authenticate, getVendorById);
router.put('/:id', authenticate, requirePermission('EDIT_VENDOR'), validateVendorUpdate, updateVendor);
router.post('/:id/suspend', authenticate, requirePermission('DEACTIVATE_VENDOR'), toggleSuspendVendor);
router.post('/:id/blacklist', authenticate, requirePermission('DEACTIVATE_VENDOR'), setBlacklistStatus);

export default router;

