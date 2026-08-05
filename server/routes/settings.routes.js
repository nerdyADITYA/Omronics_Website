import { Router } from 'express';
import settingsController from '../controllers/settings.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Public Route
router.get('/', settingsController.getSettings);

// Protected Admin Route
router.put('/', verifyToken, settingsController.updateSettings);

export default router;
