import subProductRepository from '../repositories/subProduct.repository.js';
import { generateSlug } from '../utils/slug.js';
import { AppError } from '../middlewares/error.middleware.js';

function cleanImageUrl(val) {
  if (!val) return null;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        return parsed.url || parsed.document_url || val;
      } catch (e) {
        return val;
      }
    }
    return val;
  }
  if (typeof val === 'object') {
    return val.url || val.document_url || null;
  }
  return null;
}

export class SubProductService {
  async getSubProductsByProductId(productId, status = null) {
    if (!productId) {
      throw new AppError('Product ID is required.', 400);
    }
    const rows = await subProductRepository.findByProductId(productId, status);
    return rows.map((r) => {
      if (r.image_url) r.image_url = cleanImageUrl(r.image_url);
      return r;
    });
  }

  async getAllSubProducts(params = {}) {
    const result = await subProductRepository.findAllWithParents(params);
    result.data = result.data.map((r) => {
      if (r.image_url) r.image_url = cleanImageUrl(r.image_url);
      return r;
    });
    return result;
  }

  async getSubProductById(id) {
    const rawId = typeof id === 'object' && id !== null ? (id.id || id.insertId || id) : id;
    const item = await subProductRepository.findDetailById(rawId);
    if (!item) {
      throw new AppError('Sub-product not found.', 404);
    }
    if (item.image_url) item.image_url = cleanImageUrl(item.image_url);
    return item;
  }

  async createSubProduct(data) {
    if (!data.name || !data.name.trim()) {
      throw new AppError('Sub-product name is required.', 400);
    }
    const productId = Number(data.product_id);
    if (!productId || isNaN(productId)) {
      throw new AppError('Parent Product ID is required.', 400);
    }

    const name = data.name.trim();
    const slug = data.slug && data.slug.trim() ? generateSlug(data.slug.trim()) : generateSlug(name);

    const payload = {
      product_id: productId,
      name,
      slug,
      model_code: data.model_code ? data.model_code.trim() : null,
      description: data.description ? data.description.trim() : null,
      image_url: cleanImageUrl(data.image_url),
      sort_order: Number(data.sort_order) || 0,
      status: data.status || 'ACTIVE',
    };

    const created = await subProductRepository.create(payload);
    const newId = typeof created === 'object' && created !== null ? (created.id || created.insertId) : created;

    // If part_codes are provided during creation, map them to this sub-product
    if (data.part_codes && Array.isArray(data.part_codes)) {
      await subProductRepository.mapPartCodesToSubProduct(newId, payload.name, productId, data.part_codes);
    }

    return this.getSubProductById(newId);
  }

  async updateSubProduct(id, data) {
    const rawId = typeof id === 'object' && id !== null ? (id.id || id) : id;
    const existing = await subProductRepository.findById(rawId);
    if (!existing) {
      throw new AppError('Sub-product not found.', 404);
    }

    const payload = {};
    if (data.product_id !== undefined) {
      const pid = Number(data.product_id);
      if (pid && !isNaN(pid)) payload.product_id = pid;
    }
    if (data.name !== undefined) {
      payload.name = data.name.trim();
      if (!data.slug || !data.slug.trim()) {
        payload.slug = generateSlug(payload.name);
      }
    }
    if (data.slug !== undefined && data.slug.trim()) {
      payload.slug = generateSlug(data.slug.trim());
    }
    if (data.model_code !== undefined) payload.model_code = data.model_code ? data.model_code.trim() : null;
    if (data.description !== undefined) payload.description = data.description ? data.description.trim() : null;
    if (data.image_url !== undefined) payload.image_url = cleanImageUrl(data.image_url);
    if (data.sort_order !== undefined) payload.sort_order = Number(data.sort_order) || 0;
    if (data.status !== undefined) payload.status = data.status;

    await subProductRepository.update(rawId, payload);

    const currentName = payload.name || existing.name;
    const currentProductId = payload.product_id || existing.product_id;

    // If part_codes array is provided, sync mappings
    if (data.part_codes !== undefined && Array.isArray(data.part_codes)) {
      await subProductRepository.mapPartCodesToSubProduct(rawId, currentName, currentProductId, data.part_codes);
    }

    return this.getSubProductById(rawId);
  }

  async deleteSubProduct(id) {
    const rawId = typeof id === 'object' && id !== null ? (id.id || id) : id;
    const existing = await subProductRepository.findById(rawId);
    if (!existing) {
      throw new AppError('Sub-product not found.', 404);
    }
    // Unmap all cable costs currently mapped to this sub-product
    await subProductRepository.mapPartCodesToSubProduct(rawId, null, existing.product_id, []);
    await subProductRepository.delete(rawId, true);
    return { success: true, message: 'Sub-product deleted successfully.' };
  }
}

export default new SubProductService();
