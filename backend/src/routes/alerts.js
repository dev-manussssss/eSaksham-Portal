import { Router } from 'express';
import { getAlerts, reviewAlert } from '../controllers/alertController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getAlerts);
router.post('/:id/review', authenticate, reviewAlert);

export default router;
