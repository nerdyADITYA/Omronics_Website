import { BaseRepository } from './base.repository.js';
import { query } from '../config/database.js';

export class ProductRepository extends BaseRepository {
  constructor() {
    super('products', ['product_name', 'model_number', 'short_description', 'description', 'features']);
  }

  /**
   * Find detailed product including category name, gallery images, and downloadable documents
   * @param {number|string} id
   */
  async findDetailById(id) {
    const sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, c.status as category_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    if (rows.length === 0) return null;

    const product = rows[0];
    product.images = await this.getImages(id);
    product.documents = await this.getDocuments(id);
    return product;
  }

  /**
   * Find product by slug with images and documents
   * @param {string} slug
   */
  async findDetailBySlug(slug) {
    const sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, c.status as category_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [slug]);
    if (rows.length === 0) return null;

    const product = rows[0];
    product.images = await this.getImages(product.id);
    product.documents = await this.getDocuments(product.id);
    return product;
  }

  /**
   * Override findAll to support filtering by category and featured status
   */
  async findAll({
    page = 1,
    limit = 10,
    offset = 0,
    search = '',
    sort = 'created_at',
    order = 'DESC',
    status = null,
    categoryId = null,
    featured = null,
    isSoftDelete = true,
  } = {}) {
    const whereClauses = [];
    const params = [];

    if (isSoftDelete) {
      whereClauses.push('p.deleted_at IS NULL');
    }

    if (status) {
      whereClauses.push('p.status = ?');
      params.push(status);
      if (status === 'ACTIVE') {
        whereClauses.push('(c.status = ? OR c.status IS NULL)');
        params.push('ACTIVE');
      }
    }

    if (categoryId) {
      whereClauses.push('p.category_id = ?');
      params.push(categoryId);
    }

    if (featured !== null && featured !== undefined && featured !== '') {
      whereClauses.push('p.featured = ?');
      params.push(featured === 'true' || featured === true ? 1 : 0);
    }

    if (search && this.searchFields.length > 0) {
      const searchOrs = this.searchFields.map((field) => `p.${field} LIKE ?`).join(' OR ');
      whereClauses.push(`(${searchOrs})`);
      const searchPattern = `%${search}%`;
      this.searchFields.forEach(() => params.push(searchPattern));
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const safeSort = /^[a-zA-Z0-9_.]+$/.test(sort) ? `p.${sort}` : 'p.created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, c.status as category_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereSql}
      ORDER BY ${safeSort} ${safeOrder}
      LIMIT ? OFFSET ?
    `;

    const countSql = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereSql}`;

    const rows = await query(sql, [...params, limit, offset]);
    const countRes = await query(countSql, params);
    const total = Number(countRes[0]?.total || 0);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // --- Product Gallery Images ---
  async getImages(productId) {
    return query('SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC', [productId]);
  }

  async syncImages(productId, images = []) {
    await query('DELETE FROM product_images WHERE product_id = ?', [productId]);
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      await query(
        'INSERT INTO product_images (product_id, image_url, alt_text, display_order) VALUES (?, ?, ?, ?)',
        [productId, img.image_url, img.alt_text || '', img.display_order || i]
      );
    }
  }

  // --- Product Documents ---
  async getDocumentById(docId) {
    const rows = await query('SELECT * FROM product_documents WHERE id = ? LIMIT 1', [docId]);
    return rows.length > 0 ? rows[0] : null;
  }

  async getDocuments(productId) {
    return query('SELECT * FROM product_documents WHERE product_id = ? ORDER BY display_order ASC', [productId]);
  }

  async syncDocuments(productId, documents = []) {
    await query('DELETE FROM product_documents WHERE product_id = ?', [productId]);
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const docUrl = typeof doc === 'string' ? doc : doc.document_url;
      if (docUrl) {
        await query(
          'INSERT INTO product_documents (product_id, document_name, document_url, document_type, file_size, display_order) VALUES (?, ?, ?, ?, ?, ?)',
          [
            productId,
            doc.document_name || 'Product Catalog PDF',
            docUrl,
            doc.document_type || 'CATALOGUE',
            doc.file_size || null,
            doc.display_order || i,
          ]
        );
      }
    }
  }
}

export default new ProductRepository();
