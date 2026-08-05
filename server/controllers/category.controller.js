import categoryService from '../services/category.service.js';
import { getPagination } from '../utils/pagination.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

export class CategoryController {
  async getAll(req, res, next) {
    try {
      const pagination = getPagination(req.query);
      const status = req.query.status || null;
      const result = await categoryService.getAll({ ...pagination, status });
      return sendPaginated(res, result.data, result.pagination, 'Categories retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const category = await categoryService.getById(req.params.id);
      return sendSuccess(res, category, 'Category details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const category = await categoryService.getBySlug(req.params.slug);
      return sendSuccess(res, category, 'Category details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const category = await categoryService.create(req.body);
      return sendSuccess(res, category, 'Category created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const category = await categoryService.update(req.params.id, req.body);
      return sendSuccess(res, category, 'Category updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await categoryService.delete(req.params.id);
      return sendSuccess(res, {}, 'Category deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export default new CategoryController();
