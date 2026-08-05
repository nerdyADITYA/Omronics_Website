import industryRepository from '../repositories/industry.repository.js';
import { generateSlug } from '../utils/slug.js';
import { AppError } from '../middlewares/error.middleware.js';
import { MESSAGES } from '../constants/messages.js';

export class IndustryService {
  async getAll(params) {
    return industryRepository.findAll(params);
  }

  async getById(id) {
    const industry = await industryRepository.findById(id);
    if (!industry) throw new AppError(MESSAGES.NOT_FOUND, 404);
    return industry;
  }

  async getBySlug(slug) {
    const industry = await industryRepository.findBySlug(slug);
    if (!industry) throw new AppError(MESSAGES.NOT_FOUND, 404);
    return industry;
  }

  async create(data) {
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(data.industry_name);
    const existing = await industryRepository.findBySlug(slug);
    if (existing) throw new AppError(MESSAGES.DUPLICATE_SLUG, 409);

    const payload = {
      industry_name: data.industry_name,
      slug,
      description: data.description || null,
      banner_image: data.banner_image || null,
      thumbnail_image: data.thumbnail_image || null,
      seo_title: data.seo_title || data.industry_name,
      seo_description: data.seo_description || null,
      sort_order: data.sort_order || 0,
      status: data.status || 'ACTIVE',
    };

    return industryRepository.create(payload);
  }

  async update(id, data) {
    await this.getById(id);
    const updatePayload = { ...data };

    if (data.slug || data.industry_name) {
      const newSlug = generateSlug(data.slug || data.industry_name);
      const existing = await industryRepository.findBySlug(newSlug);
      if (existing && String(existing.id) !== String(id)) {
        throw new AppError(MESSAGES.DUPLICATE_SLUG, 409);
      }
      updatePayload.slug = newSlug;
    }

    return industryRepository.update(id, updatePayload);
  }

  async delete(id) {
    await this.getById(id);
    return industryRepository.delete(id, true);
  }
}

export default new IndustryService();
