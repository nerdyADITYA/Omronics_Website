import { Router } from 'express';
import industryController from '../controllers/industry.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validateIndustry } from '../validators/industry.validator.js';

const router = Router();

// Public Routes
router.get('/', industryController.getAll);
router.get('/slug/:slug', industryController.getBySlug);
router.get('/:id', industryController.getById);

// Protected Admin Routes
router.post('/', verifyToken, validateIndustry, industryController.create);
router.put('/:id', verifyToken, validateIndustry, industryController.update);
router.delete('/:id', verifyToken, industryController.delete);

export default router;
