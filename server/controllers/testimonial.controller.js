import testimonialService from '../services/testimonial.service.js';
import { getPagination } from '../utils/pagination.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

export class TestimonialController {
  async getAll(req, res, next) {
    try {
      const pagination = getPagination(req.query);
      const status = req.query.status || null;
      const result = await testimonialService.getAll({ ...pagination, status });
      return sendPaginated(res, result.data, result.pagination, 'Testimonials retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const testimonial = await testimonialService.getById(req.params.id);
      return sendSuccess(res, testimonial, 'Testimonial details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const testimonial = await testimonialService.create(req.body);
      return sendSuccess(res, testimonial, 'Testimonial created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const testimonial = await testimonialService.update(req.params.id, req.body);
      return sendSuccess(res, testimonial, 'Testimonial updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await testimonialService.delete(req.params.id);
      return sendSuccess(res, {}, 'Testimonial deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export default new TestimonialController();
