import categoryRepository from '../repositories/category.repository.js';
import productRepository from '../repositories/product.repository.js';
import { generateSlug } from '../utils/slug.js';
import { AppError } from '../middlewares/error.middleware.js';
import { MESSAGES } from '../constants/messages.js';

export class ProductService {
  async getAll(params) {
    return productRepository.findAll(params);
  }

  async getById(id) {
    const product = await productRepository.findDetailById(id);
    if (!product) {
      throw new AppError(MESSAGES.NOT_FOUND, 404);
    }
    return product;
  }

  async getBySlug(slug) {
    const product = await productRepository.findDetailBySlug(slug);
    if (!product) {
      throw new AppError(MESSAGES.NOT_FOUND, 404);
    }
    return product;
  }

  async create(data) {
    const category = await categoryRepository.findById(data.category_id);
    if (!category) {
      throw new AppError('Specified category does not exist.', 400);
    }

    const slug = data.slug ? generateSlug(data.slug) : generateSlug(data.product_name);
    const existing = await productRepository.findBySlug(slug);
    if (existing) {
      throw new AppError(MESSAGES.DUPLICATE_SLUG, 409);
    }

    const payload = {
      category_id: data.category_id,
      product_name: data.product_name,
      slug,
      model_number: data.model_number || null,
      short_description: data.short_description || null,
      description: data.description || null,
      features: data.features || null,
      specifications: data.specifications || null,
      applications: data.applications || null,
      thumbnail_image: data.thumbnail_image || null,
      datasheet_available: data.datasheet_available ? 1 : 0,
      featured: data.featured ? 1 : 0,
      status: data.status || 'ACTIVE',
      sort_order: data.sort_order || 0,
      seo_title: data.seo_title || data.product_name,
      seo_description: data.seo_description || data.short_description || null,
    };

    const product = await productRepository.create(payload);

    if (data.images && Array.isArray(data.images)) {
      await productRepository.syncImages(product.id, data.images);
    }

    if (data.documents && Array.isArray(data.documents)) {
      await productRepository.syncDocuments(product.id, data.documents);
    }

    return this.getById(product.id);
  }

  async update(id, data) {
    await this.getById(id);

    if (data.category_id) {
      const category = await categoryRepository.findById(data.category_id);
      if (!category) {
        throw new AppError('Specified category does not exist.', 400);
      }
    }

    const updatePayload = { ...data };
    delete updatePayload.id;
    delete updatePayload.images;
    delete updatePayload.documents;
    delete updatePayload.category_name;
    delete updatePayload.category_slug;
    delete updatePayload.created_at;
    delete updatePayload.updated_at;
    delete updatePayload.deleted_at;

    if (data.slug || data.product_name) {
      const newSlug = generateSlug(data.slug || data.product_name);
      const existing = await productRepository.findBySlug(newSlug);
      if (existing && String(existing.id) !== String(id)) {
        throw new AppError(MESSAGES.DUPLICATE_SLUG, 409);
      }
      updatePayload.slug = newSlug;
    }

    await productRepository.update(id, updatePayload);

    if (data.images && Array.isArray(data.images)) {
      await productRepository.syncImages(id, data.images);
    }

    if (data.documents && Array.isArray(data.documents)) {
      await productRepository.syncDocuments(id, data.documents);
    }

    return this.getById(id);
  }

  async delete(id) {
    await this.getById(id);
    return productRepository.delete(id, true);
  }
}

export default new ProductService();
