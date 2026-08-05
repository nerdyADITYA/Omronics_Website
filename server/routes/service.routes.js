import { Router } from 'express';
import serviceController from '../controllers/service.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validateService } from '../validators/service.validator.js';

const router = Router();

// Public Routes
router.get('/', serviceController.getAll);
router.get('/slug/:slug', serviceController.getBySlug);
router.get('/:id', serviceController.getById);

// Protected Admin Routes
router.post('/', verifyToken, validateService, serviceController.create);
router.put('/:id', verifyToken, validateService, serviceController.update);
router.delete('/:id', verifyToken, serviceController.delete);

export default router;
