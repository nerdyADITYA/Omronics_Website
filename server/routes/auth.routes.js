import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validateChangePassword, validateLogin } from '../validators/auth.validator.js';

const router = Router();

// Public auth routes
router.post('/login', authLimiter, validateLogin, authController.login);

// Protected auth routes
router.get('/profile', verifyToken, authController.getProfile);
router.put('/change-password', verifyToken, validateChangePassword, authController.changePassword);
router.get('/verify', verifyToken, authController.verifyToken);

export default router;
