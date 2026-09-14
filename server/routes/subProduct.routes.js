import { Router } from 'express';
import subProductController from '../controllers/subProduct.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Public / selector endpoints
router.get('/', subProductController.getAllSubProducts);
router.get('/by-product/:productId', subProductController.getByProductId);
router.get('/:id', subProductController.getSubProductById);

// Protected Admin mutations
router.post('/', verifyToken, subProductController.createSubProduct);
router.put('/:id', verifyToken, subProductController.updateSubProduct);
router.delete('/:id', verifyToken, subProductController.deleteSubProduct);

export default router;
