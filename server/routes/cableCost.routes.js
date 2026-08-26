import { Router } from 'express';
import {
  getServoProducts,
  getAllConfigurations,
  getByProductId,
  saveConfiguration,
  deleteConfiguration,
  syncSellingPrice,
} from '../controllers/cableCost.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all cable cost routes (Admin only)
router.use(verifyToken);

router.get('/servo-products', getServoProducts);
router.get('/', getAllConfigurations);
router.get('/product/:productId', getByProductId);
router.post('/', saveConfiguration);
router.delete('/:id', deleteConfiguration);
router.post('/sync-price', syncSellingPrice);

export default router;
