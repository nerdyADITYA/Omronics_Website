import subProductRepository from '../repositories/subProduct.repository.js';
import { generateSlug } from '../utils/slug.js';
import { AppError } from '../middlewares/error.middleware.js';

function parseImageUrls(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val
      .map((v) => {
        if (typeof v === 'string') return v.trim();
        if (typeof v === 'object' && v !== null) return v.image_url || v.url || v.document_url || '';
        return '';
      })
      .filter(Boolean);
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((v) => {
              if (typeof v === 'string') return v.trim();
              if (typeof v === 'object' && v !== null) return v.image_url || v.url || v.document_url || '';
              return '';
            })
            .filter(Boolean);
        }
      } catch (e) {}
    }
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        const url = parsed.url || parsed.document_url || parsed.image_url;
        return url ? [String(url).trim()] : [];
      } catch (e) {}
    }
    return trimmed ? [trimmed] : [];
  }
  if (typeof val === 'object' && val !== null) {
    const url = val.url || val.document_url || val.image_url;
    return url ? [String(url).trim()] : [];
  }
  return [];
}

function serializeImages(data) {
  const incoming = data.images !== undefined ? data.images : (data.image_urls !== undefined ? data.image_urls : data.image_url);
  const list = parseImageUrls(incoming);
  if (list.length === 0) return null;
  if (list.length === 1) return list[0];
  return JSON.stringify(list);
}

function formatSubProductRow(r) {
  if (!r) return null;
  const urls = parseImageUrls(r.image_url);
  r.image_urls = urls;
  r.images = urls;
  r.image_url = urls.length > 0 ? urls[0] : null;
  return r;
}

export class SubProductService {
  async getSubProductsByProductId(productId, status = null) {
    if (!productId) {
      throw new AppError('Product ID is required.', 400);
    }
    const rows = await subProductRepository.findByProductId(productId, status);
    return rows.map(formatSubProductRow);
  }

  async getAllSubProducts(params = {}) {
    const result = await subProductRepository.findAllWithParents(params);
    result.data = result.data.map(formatSubProductRow);
    return result;
  }

  async getSubProductById(id) {
    const rawId = typeof id === 'object' && id !== null ? (id.id || id.insertId || id) : id;
    const item = await subProductRepository.findDetailById(rawId);
    if (!item) {
      throw new AppError('Sub-product not found.', 404);
    }
    return formatSubProductRow(item);
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
      image_url: serializeImages(data),
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
    if (data.image_url !== undefined || data.images !== undefined || data.image_urls !== undefined) {
      payload.image_url = serializeImages(data);
    }
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
