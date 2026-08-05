import { Router } from 'express';
import { uploadDocumentMulter, uploadImageMulter } from '../config/multer.js';
import uploadController from '../controllers/upload.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// All upload APIs require Admin token
router.post('/image', verifyToken, uploadImageMulter.single('file'), uploadController.uploadSingleImage);
router.post('/images', verifyToken, uploadImageMulter.array('files', 10), uploadController.uploadMultipleImages);
router.post('/document', verifyToken, uploadDocumentMulter.single('file'), uploadController.uploadSingleDocument);

export default router;
