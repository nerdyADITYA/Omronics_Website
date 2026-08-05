import serviceRepository from '../repositories/service.repository.js';
import { generateSlug } from '../utils/slug.js';
import { AppError } from '../middlewares/error.middleware.js';
import { MESSAGES } from '../constants/messages.js';

export class ServiceService {
  async getAll(params) {
    return serviceRepository.findAll(params);
  }

  async getById(id) {
    const service = await serviceRepository.findById(id);
    if (!service) throw new AppError(MESSAGES.NOT_FOUND, 404);
    return service;
  }

  async getBySlug(slug) {
    const service = await serviceRepository.findBySlug(slug);
    if (!service) throw new AppError(MESSAGES.NOT_FOUND, 404);
    return service;
  }

  async create(data) {
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(data.service_name);
    const existing = await serviceRepository.findBySlug(slug);
    if (existing) throw new AppError(MESSAGES.DUPLICATE_SLUG, 409);

    const payload = {
      service_name: data.service_name,
      slug,
      short_description: data.short_description || null,
      description: data.description || null,
      banner_image: data.banner_image || null,
      thumbnail_image: data.thumbnail_image || null,
      seo_title: data.seo_title || data.service_name,
      seo_description: data.seo_description || data.short_description || null,
      sort_order: data.sort_order || 0,
      status: data.status || 'ACTIVE',
    };

    return serviceRepository.create(payload);
  }

  async update(id, data) {
    await this.getById(id);
    const updatePayload = { ...data };

    if (data.slug || data.service_name) {
      const newSlug = generateSlug(data.slug || data.service_name);
      const existing = await serviceRepository.findBySlug(newSlug);
      if (existing && String(existing.id) !== String(id)) {
        throw new AppError(MESSAGES.DUPLICATE_SLUG, 409);
      }
      updatePayload.slug = newSlug;
    }

    return serviceRepository.update(id, updatePayload);
  }

  async delete(id) {
    await this.getById(id);
    return serviceRepository.delete(id, true);
  }
}

export default new ServiceService();
