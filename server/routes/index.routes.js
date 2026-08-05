import { Router } from 'express';
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';
import serviceRoutes from './service.routes.js';
import industryRoutes from './industry.routes.js';
import clientRoutes from './client.routes.js';
import testimonialRoutes from './testimonial.routes.js';
import enquiryRoutes from './enquiry.routes.js';
import uploadRoutes from './upload.routes.js';
import settingsRoutes from './settings.routes.js';
import seoController from '../controllers/seo.controller.js';

const router = Router();

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Omronics Industrial Corporate CMS API is operational.',
    timestamp: new Date().toISOString(),
  });
});

// Modular Routes Registration
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/services', serviceRoutes);
router.use('/industries', industryRoutes);
router.use('/clients', clientRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/uploads', uploadRoutes);
router.use('/settings', settingsRoutes);

export default router;
