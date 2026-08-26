import { Router } from 'express';
import {
  getServoProducts,
  getAllConfigurations,
  getByProductId,
  saveConfiguration,
  syncSellingPrice,
} from '../controllers/cableCost.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all cable cost routes (Admin only)
router.use(authenticate);

router.get('/servo-products', getServoProducts);
router.get('/', getAllConfigurations);
router.get('/product/:productId', getByProductId);
router.post('/', saveConfiguration);
router.post('/sync-price', syncSellingPrice);

export default router;
