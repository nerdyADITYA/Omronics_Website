import subProductService from '../services/subProduct.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getAllSubProducts(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const productId = req.query.productId || null;
    const categoryId = req.query.categoryId || null;
    const status = req.query.status || null;

    const result = await subProductService.getAllSubProducts({
      page,
      limit,
      offset,
      search,
      productId,
      categoryId,
      status,
    });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Sub-products retrieved successfully.',
    });
  } catch (err) {
    return sendError(res, err.message || 'Failed to fetch sub-products.', err.statusCode || 500);
  }
}

export async function getByProductId(req, res) {
  try {
    const { productId } = req.params;
    const status = req.query.status || null;
    const items = await subProductService.getSubProductsByProductId(productId, status);
    return sendSuccess(res, items, 'Sub-products for product retrieved successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to fetch sub-products.', err.statusCode || 500);
  }
}

export async function getSubProductById(req, res) {
  try {
    const { id } = req.params;
    const item = await subProductService.getSubProductById(id);
    return sendSuccess(res, item, 'Sub-product retrieved successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to fetch sub-product.', err.statusCode || 500);
  }
}

export async function createSubProduct(req, res) {
  try {
    const created = await subProductService.createSubProduct(req.body);
    return sendSuccess(res, created, 'Sub-product created successfully.', 201);
  } catch (err) {
    return sendError(res, err.message || 'Failed to create sub-product.', err.statusCode || 400);
  }
}

export async function updateSubProduct(req, res) {
  try {
    const { id } = req.params;
    const updated = await subProductService.updateSubProduct(id, req.body);
    return sendSuccess(res, updated, 'Sub-product updated successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to update sub-product.', err.statusCode || 400);
  }
}

export async function deleteSubProduct(req, res) {
  try {
    const { id } = req.params;
    const result = await subProductService.deleteSubProduct(id);
    return sendSuccess(res, result, 'Sub-product deleted successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to delete sub-product.', err.statusCode || 400);
  }
}

export default {
  getAllSubProducts,
  getByProductId,
  getSubProductById,
  createSubProduct,
  updateSubProduct,
  deleteSubProduct,
};
