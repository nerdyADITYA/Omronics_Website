import { Router } from 'express';
import testimonialController from '../controllers/testimonial.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validateTestimonial } from '../validators/testimonial.validator.js';

const router = Router();

// Public Routes
router.get('/', testimonialController.getAll);
router.get('/:id', testimonialController.getById);

// Protected Admin Routes
router.post('/', verifyToken, validateTestimonial, testimonialController.create);
router.put('/:id', verifyToken, validateTestimonial, testimonialController.update);
router.delete('/:id', verifyToken, testimonialController.delete);

export default router;
