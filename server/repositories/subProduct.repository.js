import { BaseRepository } from './base.repository.js';
import { query } from '../config/database.js';
import { getBasePartCodeTemplate } from '../utils/partCode.js';

export class SubProductRepository extends BaseRepository {
  constructor() {
    super('sub_products', ['name', 'model_code', 'description']);
  }

  /**
   * Find sub-products belonging to a specific product
   * @param {number|string} productId
   * @param {string|null} status
   */
  async findByProductId(productId, status = null) {
    const params = [productId];
    let sql = `
      SELECT sp.*, p.product_name, p.slug as product_slug,
             (SELECT COUNT(*) FROM product_cable_costs pcc WHERE pcc.sub_product_id = sp.id) as part_codes_count
      FROM sub_products sp
      JOIN products p ON sp.product_id = p.id
      WHERE sp.product_id = ? AND sp.deleted_at IS NULL AND p.deleted_at IS NULL
    `;

    if (status) {
      sql += ` AND sp.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY sp.sort_order ASC, sp.name ASC`;
    return query(sql, params);
  }

  /**
   * Find sub-product by slug under a product
   */
  async findBySlugAndProductId(slug, productId) {
    const sql = `
      SELECT sp.*, p.product_name, p.slug as product_slug, c.name as category_name, c.slug as category_slug
      FROM sub_products sp
      JOIN products p ON sp.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE sp.slug = ? AND sp.product_id = ? AND sp.deleted_at IS NULL AND p.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [slug, productId]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find single sub-product detail by ID with mapped part codes
   */
  async findDetailById(id) {
    const sql = `
      SELECT sp.*, p.product_name, p.category_id, p.slug as product_slug,
             c.name as category_name, c.slug as category_slug,
             (SELECT COUNT(*) FROM product_cable_costs pcc WHERE pcc.sub_product_id = sp.id) as part_codes_count
      FROM sub_products sp
      JOIN products p ON sp.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE sp.id = ? AND sp.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    if (rows.length === 0) return null;
    const item = rows[0];

    // Fetch mapped part codes, templates, and composite model keys for this sub-product
    const partCodeRows = await query(
      'SELECT part_code, motor_type, frame_size FROM product_cable_costs WHERE sub_product_id = ?',
      [id]
    );
    item.mapped_part_codes = partCodeRows.map((r) => r.part_code).filter(Boolean);
    item.mapped_templates = Array.from(
      new Set(partCodeRows.map((r) => getBasePartCodeTemplate(r.part_code)).filter(Boolean))
    );
    item.mapped_model_keys = Array.from(
      new Set(
        partCodeRows.map((r) => {
          const tmpl = getBasePartCodeTemplate(r.part_code).trim().toLowerCase();
          return `${tmpl}__${(r.motor_type || '').trim()}__${(r.frame_size || '').trim()}`.toLowerCase();
        }).filter(Boolean)
      )
    );

    return item;
  }

  /**
   * Map selected part codes / models to a sub-product
   * @param {number} subProductId
   * @param {string} subProductName
   * @param {number} productId
   * @param {string[]} partCodesList
   */
  async mapPartCodesToSubProduct(subProductId, subProductName, productId, partCodesList) {
    if (!subProductId || !productId) return;
    if (!Array.isArray(partCodesList)) return;

    // 1. Unmap any currently mapped variants for this sub-product
    await query(
      'UPDATE product_cable_costs SET sub_product_id = NULL, sub_product_name = NULL WHERE sub_product_id = ?',
      [subProductId]
    );

    if (partCodesList.length === 0) return;

    // 2. Fetch all variants for the parent product
    const allVariants = await query(
      'SELECT id, part_code, motor_type, frame_size FROM product_cable_costs WHERE product_id = ?',
      [productId]
    );

    // 3. Match targets: partCodesList may contain exact part_codes, base templates, or composite model keys
    const targetIds = [];
    const normalizedSelected = new Set(
      partCodesList.map((pc) => String(pc).trim().toLowerCase()).filter(Boolean)
    );

    // Check if user provided composite model keys (keys containing '__')
    const hasCompositeKeys = Array.from(normalizedSelected).some((k) => k.includes('__'));

    // Extract subproduct series keywords (e.g. "B2 - SERIES" -> 'b2', "A2 - SERIES" -> 'a2')
    const spClean = (subProductName || '').toLowerCase();
    const spSeriesMatch = spClean.match(/\b(a2|b2|b3|e3|a3|m2|asda)\b/i);
    const targetSeries = spSeriesMatch ? spSeriesMatch[1].toLowerCase() : null;

    for (const v of allVariants) {
      const rawPartCode = (v.part_code || '').trim().toLowerCase();
      const baseTemplate = getBasePartCodeTemplate(v.part_code).trim().toLowerCase();
      const motorClean = (v.motor_type || '').trim().toLowerCase();
      const frameClean = (v.frame_size || '').trim().toLowerCase();
      const modelKey = `${baseTemplate}__${motorClean}__${frameClean}`;
      const vId = String(v.id);

      // Check if variant's frame_size explicitly belongs to another series
      let frameConflicts = false;
      if (targetSeries && frameClean) {
        const frameSeriesMatch = frameClean.match(/\b(a2|b2|b3|e3|a3|m2|asda)\b/i);
        if (frameSeriesMatch && frameSeriesMatch[1].toLowerCase() !== targetSeries) {
          frameConflicts = true;
        }
      }

      if (frameConflicts) {
        // Prevent generic baseTemplate from accidentally matching across conflicting series
        if (normalizedSelected.has(modelKey) || normalizedSelected.has(vId)) {
          targetIds.push(v.id);
        }
        continue;
      }

      if (
        normalizedSelected.has(vId) ||
        normalizedSelected.has(modelKey) ||
        (!hasCompositeKeys && (normalizedSelected.has(rawPartCode) || normalizedSelected.has(baseTemplate)))
      ) {
        targetIds.push(v.id);
      }
    }

    if (targetIds.length > 0) {
      const placeholders = targetIds.map(() => '?').join(',');
      await query(
        `UPDATE product_cable_costs SET sub_product_id = ?, sub_product_name = ? WHERE id IN (${placeholders})`,
        [subProductId, subProductName, ...targetIds]
      );
    }
  }

  /**
   * Paginated list of sub-products with filter by category, product, and search
   */
  async findAllWithParents({
    page = 1,
    limit = 10,
    offset = 0,
    search = '',
    productId = null,
    categoryId = null,
    status = null,
  } = {}) {
    const whereClauses = ['sp.deleted_at IS NULL', 'p.deleted_at IS NULL'];
    const params = [];

    if (productId && productId !== 'ALL') {
      whereClauses.push('sp.product_id = ?');
      params.push(productId);
    }

    if (categoryId && categoryId !== 'ALL') {
      whereClauses.push('p.category_id = ?');
      params.push(categoryId);
    }

    if (status && status !== 'ALL') {
      whereClauses.push('sp.status = ?');
      params.push(status);
    }

    if (search && search.trim()) {
      whereClauses.push('(sp.name LIKE ? OR sp.model_code LIKE ? OR sp.description LIKE ? OR p.product_name LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

    // Count total matching
    const countSql = `
      SELECT COUNT(*) as total
      FROM sub_products sp
      JOIN products p ON sp.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereSql}
    `;
    const countRows = await query(countSql, params);
    const total = Number(countRows[0]?.total || 0);

    // Fetch paginated data
    const dataSql = `
      SELECT sp.*, p.product_name, p.category_id, p.slug as product_slug,
             c.name as category_name, c.slug as category_slug,
             (SELECT COUNT(*) FROM product_cable_costs pcc WHERE pcc.sub_product_id = sp.id) as part_codes_count
      FROM sub_products sp
      JOIN products p ON sp.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereSql}
      ORDER BY sp.sort_order ASC, sp.updated_at DESC, sp.name ASC
      LIMIT ? OFFSET ?
    `;
    const data = await query(dataSql, [...params, limit, offset]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

export default new SubProductRepository();
