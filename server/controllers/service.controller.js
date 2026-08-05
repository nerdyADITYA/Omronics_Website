import serviceService from '../services/service.service.js';
import { getPagination } from '../utils/pagination.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

export class ServiceController {
  async getAll(req, res, next) {
    try {
      const pagination = getPagination(req.query);
      const status = req.query.status || null;
      const result = await serviceService.getAll({ ...pagination, status });
      return sendPaginated(res, result.data, result.pagination, 'Services retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const service = await serviceService.getById(req.params.id);
      return sendSuccess(res, service, 'Service details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const service = await serviceService.getBySlug(req.params.slug);
      return sendSuccess(res, service, 'Service details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const service = await serviceService.create(req.body);
      return sendSuccess(res, service, 'Service created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const service = await serviceService.update(req.params.id, req.body);
      return sendSuccess(res, service, 'Service updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await serviceService.delete(req.params.id);
      return sendSuccess(res, {}, 'Service deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export default new ServiceController();
