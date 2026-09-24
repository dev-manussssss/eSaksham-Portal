import { Router } from 'express';
import {
  getTenders,
  getTenderById,
  createTender,
  submitBid,
  updateTenderStatus,
  awardTender,
} from '../controllers/tenderController.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = Router();

router.get('/', authenticate, getTenders);
router.get('/:id', authenticate, getTenderById);
router.post('/', authenticate, requirePermission('CREATE_TENDER'), createTender);
router.patch('/:id/status', authenticate, requirePermission('CREATE_TENDER'), updateTenderStatus);
router.post('/:id/award', authenticate, requirePermission('EVALUATE_BID'), awardTender);
router.post('/:id/bids', authenticate, requirePermission('SUBMIT_BID'), submitBid);

export default router;

