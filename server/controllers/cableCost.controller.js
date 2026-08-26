import { cableCostService } from '../services/cableCost.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getServoProducts(req, res) {
  try {
    const products = await cableCostService.getServoCableProducts();
    return sendSuccess(res, products, 'Servo Cable products retrieved successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to fetch Servo Cable products.', err.statusCode || 500);
  }
}

export async function getAllConfigurations(req, res) {
  try {
    const configs = await cableCostService.getAllConfigurations();
    return sendSuccess(res, configs, 'Cable cost configurations retrieved successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to fetch cable cost configurations.', err.statusCode || 500);
  }
}

export async function getByProductId(req, res) {
  try {
    const { productId } = req.params;
    const config = await cableCostService.getByProductId(productId);
    return sendSuccess(res, config, 'Cable cost configuration retrieved successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to fetch cable cost configuration.', err.statusCode || 500);
  }
}

export async function saveConfiguration(req, res) {
  try {
    const config = await cableCostService.saveConfiguration(req.body);
    return sendSuccess(res, config, 'Cable cost configuration saved successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to save cable cost configuration.', err.statusCode || 500);
  }
}

export async function syncSellingPrice(req, res) {
  try {
    const { productId, sellingPrice } = req.body;
    const result = await cableCostService.syncSellingPrice(productId, sellingPrice);
    return sendSuccess(res, result, 'Selling price synced to product successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to sync selling price to product.', err.statusCode || 500);
  }
}
