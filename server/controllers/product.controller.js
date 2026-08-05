import productService from '../services/product.service.js';
import { getPagination } from '../utils/pagination.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

export class ProductController {
  async getAll(req, res, next) {
    try {
      const pagination = getPagination(req.query);
      const status = req.query.status || null;
      const categoryId = req.query.category_id || null;
      const featured = req.query.featured || null;

      const result = await productService.getAll({
        ...pagination,
        status,
        categoryId,
        featured,
      });

      return sendPaginated(res, result.data, result.pagination, 'Products retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getById(req.params.id);
      return sendSuccess(res, product, 'Product details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const product = await productService.getBySlug(req.params.slug);
      return sendSuccess(res, product, 'Product details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const product = await productService.create(req.body);
      return sendSuccess(res, product, 'Product created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const product = await productService.update(req.params.id, req.body);
      return sendSuccess(res, product, 'Product updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await productService.delete(req.params.id);
      return sendSuccess(res, {}, 'Product deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export default new ProductController();
