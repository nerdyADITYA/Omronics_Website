import { Router } from 'express';
import clientController from '../controllers/client.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validateClient } from '../validators/client.validator.js';

const router = Router();

// Public Routes
router.get('/', clientController.getAll);
router.get('/:id', clientController.getById);

// Protected Admin Routes
router.post('/', verifyToken, validateClient, clientController.create);
router.put('/:id', verifyToken, validateClient, clientController.update);
router.delete('/:id', verifyToken, clientController.delete);

export default router;
