import { Router } from 'express';
import { login, me, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/login', authRateLimiter, login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;
