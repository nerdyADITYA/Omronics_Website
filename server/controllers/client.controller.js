import clientService from '../services/client.service.js';
import { getPagination } from '../utils/pagination.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

export class ClientController {
  async getAll(req, res, next) {
    try {
      const pagination = getPagination(req.query);
      const status = req.query.status || null;
      const result = await clientService.getAll({ ...pagination, status });
      return sendPaginated(res, result.data, result.pagination, 'Clients retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const client = await clientService.getById(req.params.id);
      return sendSuccess(res, client, 'Client details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const client = await clientService.create(req.body);
      return sendSuccess(res, client, 'Client created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const client = await clientService.update(req.params.id, req.body);
      return sendSuccess(res, client, 'Client updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await clientService.delete(req.params.id);
      return sendSuccess(res, {}, 'Client deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export default new ClientController();
