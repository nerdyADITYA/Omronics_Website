import { Router } from 'express';
import categoryController from '../controllers/category.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validateCategory } from '../validators/category.validator.js';

const router = Router();

// Public Routes
router.get('/', categoryController.getAll);
router.get('/slug/:slug', categoryController.getBySlug);
router.get('/:id', categoryController.getById);

// Protected Admin Routes
router.post('/', verifyToken, validateCategory, categoryController.create);
router.put('/:id', verifyToken, validateCategory, categoryController.update);
router.delete('/:id', verifyToken, categoryController.delete);

export default router;
