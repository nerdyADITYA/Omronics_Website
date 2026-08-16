import { Router } from 'express';
import productController from '../controllers/product.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validateProduct } from '../validators/product.validator.js';

const router = Router();

// Public Routes
router.get('/', productController.getAll);
router.get('/documents/:docId/download', productController.downloadDocument);
router.get('/slug/:slug', productController.getBySlug);
router.get('/:id', productController.getById);

// Protected Admin Routes
router.post('/', verifyToken, validateProduct, productController.create);
router.put('/:id', verifyToken, validateProduct, productController.update);
router.delete('/:id', verifyToken, productController.delete);

export default router;
