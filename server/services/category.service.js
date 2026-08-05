import categoryRepository from '../repositories/category.repository.js';
import { generateSlug } from '../utils/slug.js';
import { AppError } from '../middlewares/error.middleware.js';
import { MESSAGES } from '../constants/messages.js';

export class CategoryService {
  async getAll(params) {
    return categoryRepository.findAll(params);
  }

  async getById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new AppError(MESSAGES.NOT_FOUND, 404);
    }
    return category;
  }

  async getBySlug(slug) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw new AppError(MESSAGES.NOT_FOUND, 404);
    }
    return category;
  }

  async create(data) {
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
    const existing = await categoryRepository.findBySlug(slug);
    if (existing) {
      throw new AppError(MESSAGES.DUPLICATE_SLUG, 409);
    }

    const payload = {
      name: data.name,
      slug,
      short_description: data.short_description || null,
      description: data.description || null,
      banner_image: data.banner_image || null,
      thumbnail_image: data.thumbnail_image || null,
      seo_title: data.seo_title || data.name,
      seo_description: data.seo_description || data.short_description || null,
      sort_order: data.sort_order || 0,
      status: data.status || 'ACTIVE',
    };

    return categoryRepository.create(payload);
  }

  async update(id, data) {
    await this.getById(id);

    const updatePayload = { ...data };
    if (data.slug || data.name) {
      const newSlug = generateSlug(data.slug || data.name);
      const existing = await categoryRepository.findBySlug(newSlug);
      if (existing && String(existing.id) !== String(id)) {
        throw new AppError(MESSAGES.DUPLICATE_SLUG, 409);
      }
      updatePayload.slug = newSlug;
    }

    return categoryRepository.update(id, updatePayload);
  }

  async delete(id) {
    await this.getById(id);
    const productCount = await categoryRepository.countProducts(id);
    if (productCount > 0) {
      throw new AppError(
        `Cannot delete category because it contains ${productCount} active products. Move or delete products first.`,
        422
      );
    }
    return categoryRepository.delete(id, true);
  }
}

export default new CategoryService();
