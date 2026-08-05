import testimonialRepository from '../repositories/testimonial.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import { MESSAGES } from '../constants/messages.js';

export class TestimonialService {
  async getAll(params) {
    return testimonialRepository.findAll({ ...params, isSoftDelete: false });
  }

  async getById(id) {
    const testimonial = await testimonialRepository.findById(id, false);
    if (!testimonial) throw new AppError(MESSAGES.NOT_FOUND, 404);
    return testimonial;
  }

  async create(data) {
    const payload = {
      customer_name: data.customer_name,
      company_name: data.company_name || null,
      designation: data.designation || null,
      photo: data.photo || null,
      rating: data.rating || 5,
      review: data.review,
      display_order: data.display_order || 0,
      status: data.status || 'ACTIVE',
    };
    return testimonialRepository.create(payload);
  }

  async update(id, data) {
    await this.getById(id);
    return testimonialRepository.update(id, data);
  }

  async delete(id) {
    await this.getById(id);
    return testimonialRepository.delete(id, false);
  }
}

export default new TestimonialService();
