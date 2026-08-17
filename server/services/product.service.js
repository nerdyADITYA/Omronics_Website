import productRepository from '../repositories/product.repository.js';
import categoryRepository from '../repositories/category.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import { generateSlug } from '../utils/slug.js';
import { MESSAGES } from '../constants/messages.js';

export class ProductService {
  async getAll(options = {}) {
    return productRepository.findAll(options);
  }

  async getById(id) {
    const product = await productRepository.findDetailById(id);
    if (!product) {
      throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, 404);
    }
    return product;
  }

  async getBySlug(slug) {
    const product = await productRepository.findDetailBySlug(slug);
    if (!product) {
      throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, 404);
    }
    return product;
  }

  async create(data) {
    const category = await categoryRepository.findById(data.category_id);
    if (!category) {
      throw new AppError('Specified category does not exist.', 400);
    }

    const slug = generateSlug(data.slug || data.product_name);
    const existing = await productRepository.findBySlug(slug);
    if (existing) {
      throw new AppError(MESSAGES.DUPLICATE_SLUG, 409);
    }

    let docsToSync = [];
    const hasPdfCatalog = data.pdf_catalog !== undefined && Boolean(
      typeof data.pdf_catalog === 'object'
        ? (data.pdf_catalog?.url || data.pdf_catalog?.document_url)
        : data.pdf_catalog
    );

    if (hasPdfCatalog) {
      const docObj = typeof data.pdf_catalog === 'object' ? data.pdf_catalog : { url: data.pdf_catalog };
      docsToSync = [
        {
          document_name: docObj.filename || `${data.product_name} Catalog PDF`,
          document_url: docObj.url || docObj.document_url || data.pdf_catalog,
          document_type: 'CATALOGUE',
          file_size: docObj.fileSize || docObj.file_size || null,
        },
      ];
    } else if (Array.isArray(data.documents) && data.documents.length > 0) {
      docsToSync = data.documents;
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
      video_url: data.video_url || null,
      datasheet_available: docsToSync.length > 0 ? 1 : 0,
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

    if (docsToSync.length > 0) {
      await productRepository.syncDocuments(product.id, docsToSync);
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
    delete updatePayload.pdf_catalog;
    delete updatePayload.pdf_catalog_url;
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

    let docsToSync = null;

    if (data.pdf_catalog !== undefined) {
      const hasPdfCatalog = Boolean(
        typeof data.pdf_catalog === 'object'
          ? (data.pdf_catalog?.url || data.pdf_catalog?.document_url)
          : data.pdf_catalog
      );

      if (hasPdfCatalog) {
        const docObj = typeof data.pdf_catalog === 'object' ? data.pdf_catalog : { url: data.pdf_catalog };
        docsToSync = [
          {
            document_name: docObj.filename || `${data.product_name || 'Product'} Catalog PDF`,
            document_url: docObj.url || docObj.document_url || data.pdf_catalog,
            document_type: 'CATALOGUE',
            file_size: docObj.fileSize || docObj.file_size || null,
          },
        ];
      } else {
        // Explicitly cleared
        docsToSync = [];
      }
    } else if (Array.isArray(data.documents)) {
      docsToSync = data.documents;
    }

    if (docsToSync !== null) {
      updatePayload.datasheet_available = docsToSync.length > 0 ? 1 : 0;
    }

    await productRepository.update(id, updatePayload);

    if (data.images && Array.isArray(data.images)) {
      await productRepository.syncImages(id, data.images);
    }

    if (docsToSync !== null) {
      await productRepository.syncDocuments(id, docsToSync);
    }

    return this.getById(id);
  }

  async delete(id) {
    await this.getById(id);
    await productRepository.delete(id);
    return true;
  }

  async getDocument(docId) {
    const doc = await productRepository.getDocumentById(docId);
    if (!doc) {
      throw new AppError('Document not found', 404);
    }
    return doc;
  }
}

export default new ProductService();
