import { BaseRepository } from './base.repository.js';
import { query } from '../config/database.js';
import { getBasePartCodeTemplate } from '../utils/partCode.js';

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
    product.part_code_variants = await this.getPartCodeVariants(product.id);
    return product;
  }

  /**
   * Find product by slug with images, documents, and part code variants
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
    product.part_code_variants = await this.getPartCodeVariants(product.id);
    return product;
  }

  /**
   * Fetch Part Code Variant configurations for a product with calculated prices
   * @param {number|string} productId
   */
  async getPartCodeVariants(productId) {
    const sql = `
      SELECT *
      FROM product_cable_costs
      WHERE product_id = ?
      ORDER BY id ASC
    `;
    const rows = await query(sql, [productId]);
    const formatted = rows.map((r) => {
      let extra = [];
      if (typeof r.additional_components === 'string') {
        try {
          extra = JSON.parse(r.additional_components);
        } catch (err) {
          extra = [];
        }
      } else if (Array.isArray(r.additional_components)) {
        extra = r.additional_components;
      }

      let urls = [];
      if (typeof r.image_url === 'string') {
        const trimmed = r.image_url.trim();
        if (trimmed.startsWith('[')) {
          try {
            urls = JSON.parse(trimmed);
            if (!Array.isArray(urls)) urls = [trimmed];
          } catch (e) {
            urls = [trimmed];
          }
        } else if (trimmed.length > 0) {
          urls = [trimmed];
        }
      } else if (Array.isArray(r.image_url)) {
        urls = r.image_url;
      }

      const len = Number(r.default_length) || 0;
      const cCost = Number(r.cable_cost_per_meter) || 0;
      const c1 = Number(r.connector1_cost) || 0;
      const c2 = Number(r.connector2_cost) || 0;
      const labour = Number(r.labour_cost) || 0;
      const battery = Number(r.battery_cost) || 0;
      const extraCost = extra.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

      const landingCost = len * cCost + c1 + c2 + labour + battery + extraCost;
      const margin = Number(r.margin_percentage) || 0;
      const profit = (margin / 100) * landingCost;
      const sellingPrice = Math.round(landingCost + profit);

      return {
        ...r,
        additional_components: extra,
        image_urls: urls.filter(Boolean),
        landing_cost: Math.round(landingCost),
        calculated_price: sellingPrice,
      };
    });

    // Model-level image inheritance: if a variant has no images, inherit from sibling of the same model template
    const modelImageMap = new Map();
    formatted.forEach((v) => {
      const baseTemplate = getBasePartCodeTemplate(v.part_code);
      const groupKey = `${baseTemplate}__${v.motor_type || ''}__${v.frame_size || ''}`.toLowerCase();
      if (Array.isArray(v.image_urls) && v.image_urls.length > 0 && !modelImageMap.has(groupKey)) {
        modelImageMap.set(groupKey, v.image_urls);
      }
    });

    return formatted.map((v) => {
      const baseTemplate = getBasePartCodeTemplate(v.part_code);
      const groupKey = `${baseTemplate}__${v.motor_type || ''}__${v.frame_size || ''}`.toLowerCase();
      if ((!Array.isArray(v.image_urls) || v.image_urls.length === 0) && modelImageMap.has(groupKey)) {
        const inherited = modelImageMap.get(groupKey);
        return {
          ...v,
          image_urls: inherited,
          image_url: JSON.stringify(inherited),
        };
      }
      return v;
    });
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

    if (search) {
      const searchPattern = `%${search}%`;
      const searchOrClauses = [];

      if (this.searchFields.length > 0) {
        this.searchFields.forEach((field) => {
          searchOrClauses.push(`p.${field} LIKE ?`);
          params.push(searchPattern);
        });
      }

      // Also search across variant configurations in product_cable_costs (part_code, motor_type, frame_size, cable_dimension)
      searchOrClauses.push(`EXISTS (
        SELECT 1 FROM product_cable_costs pcc 
        WHERE pcc.product_id = p.id 
          AND (
            pcc.part_code LIKE ? 
            OR pcc.motor_type LIKE ? 
            OR pcc.frame_size LIKE ? 
            OR pcc.cable_dimension LIKE ?
          )
      )`);
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);

      whereClauses.push(`(${searchOrClauses.join(' OR ')})`);
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
