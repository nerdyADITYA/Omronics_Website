import industryService from '../services/industry.service.js';
import { getPagination } from '../utils/pagination.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

export class IndustryController {
  async getAll(req, res, next) {
    try {
      const pagination = getPagination(req.query);
      const status = req.query.status || null;
      const result = await industryService.getAll({ ...pagination, status });
      return sendPaginated(res, result.data, result.pagination, 'Industries retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const industry = await industryService.getById(req.params.id);
      return sendSuccess(res, industry, 'Industry details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const industry = await industryService.getBySlug(req.params.slug);
      return sendSuccess(res, industry, 'Industry details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const industry = await industryService.create(req.body);
      return sendSuccess(res, industry, 'Industry created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const industry = await industryService.update(req.params.id, req.body);
      return sendSuccess(res, industry, 'Industry updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await industryService.delete(req.params.id);
      return sendSuccess(res, {}, 'Industry deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export default new IndustryController();
