import { Router } from 'express';
import enquiryController from '../controllers/enquiry.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validateEnquiry } from '../validators/enquiry.validator.js';

const router = Router();

// Public Routes (Lead capture & Diagnostic test)
router.post('/', validateEnquiry, enquiryController.create);
router.get('/test-email', enquiryController.testEmail);

// Protected Admin Routes
router.get('/', verifyToken, enquiryController.getAll);
router.get('/stats', verifyToken, enquiryController.getStats);
router.get('/:id', verifyToken, enquiryController.getById);
router.patch('/:id/status', verifyToken, enquiryController.updateStatus);
router.delete('/:id', verifyToken, enquiryController.delete);

export default router;
