import { Router } from 'express';
import multer from 'multer';
import {
  getServoProducts,
  getAllConfigurations,
  getByProductId,
  saveConfiguration,
  deleteConfiguration,
  syncSellingPrice,
  downloadSampleTemplate,
  exportExcel,
  analyzeImport,
  executeImport,
} from '../controllers/cableCost.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protect all cable cost routes (Admin only)
router.use(verifyToken);

router.get('/servo-products', getServoProducts);
router.get('/', getAllConfigurations);
router.get('/download-template', downloadSampleTemplate);
router.post('/export-excel', exportExcel);
router.get('/product/:productId', getByProductId);
router.post('/', saveConfiguration);
router.delete('/:id', deleteConfiguration);
router.post('/sync-price', syncSellingPrice);

// Excel Import Routes
router.post('/analyze-import', upload.single('file'), analyzeImport);
router.post('/execute-import', executeImport);

export default router;
