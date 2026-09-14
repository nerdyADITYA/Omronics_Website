import { BaseRepository } from './base.repository.js';
import { query } from '../config/database.js';

export class CategoryRepository extends BaseRepository {
  constructor() {
    super('categories', ['name', 'short_description', 'description']);
  }

  /**
   * Count active products referencing category
   */
  async countProducts(categoryId) {
    const rows = await query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND deleted_at IS NULL',
      [categoryId]
    );
    return Number(rows[0]?.count || 0);
  }

  /**
   * Find all categories with product counts and representative sample image
   */
  async findAllWithProductCounts({
    page = 1,
    limit = 10,
    offset = 0,
    search = '',
    sort = 'sort_order',
    order = 'ASC',
    status = null,
  } = {}) {
    const whereClauses = ['c.deleted_at IS NULL'];
    const sqlParams = [];

    if (status && status !== 'ALL') {
      whereClauses.push('c.status = ?');
      sqlParams.push(status);
    }

    if (search && search.trim()) {
      whereClauses.push('(c.name LIKE ? OR c.short_description LIKE ? OR c.slug LIKE ?)');
      const pattern = `%${search.trim()}%`;
      sqlParams.push(pattern, pattern, pattern);
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;
    const safeSort = /^[a-zA-Z0-9_.]+$/.test(sort) ? `c.${sort}` : 'c.sort_order';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const countSql = `SELECT COUNT(*) as total FROM categories c ${whereSql}`;
    const countRes = await query(countSql, sqlParams);
    const total = Number(countRes[0]?.total || 0);

    const sql = `
      SELECT c.*,
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.deleted_at IS NULL) as product_count,
             (SELECT p.thumbnail_image FROM products p WHERE p.category_id = c.id AND p.deleted_at IS NULL AND p.thumbnail_image IS NOT NULL LIMIT 1) as sample_image
      FROM categories c
      ${whereSql}
      ORDER BY ${safeSort} ${safeOrder}, c.name ASC
      LIMIT ? OFFSET ?
    `;

    const rows = await query(sql, [...sqlParams, limit, offset]);
    const formattedData = rows.map((r) => ({
      ...r,
      product_count: Number(r.product_count || 0),
    }));

    return {
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get full categories, products, and subproducts navigation tree for Header Mega-Menu
   */
  async getNavigationTree() {
    const categoriesSql = `
      SELECT id, name, slug, status, sort_order
      FROM categories
      WHERE status = 'ACTIVE' AND deleted_at IS NULL
      ORDER BY sort_order ASC, name ASC
    `;
    const categories = await query(categoriesSql);

    const productsSql = `
      SELECT id, category_id, product_name, slug, model_number, status, sort_order
      FROM products
      WHERE status = 'ACTIVE' AND deleted_at IS NULL
      ORDER BY sort_order ASC, product_name ASC
    `;
    const products = await query(productsSql);

    const subProductsSql = `
      SELECT id, product_id, name, slug, model_code, description, image_url, sort_order, status
      FROM sub_products
      WHERE status = 'ACTIVE' AND deleted_at IS NULL
      ORDER BY sort_order ASC, name ASC
    `;
    let subProducts = [];
    try {
      subProducts = await query(subProductsSql);
    } catch (e) {
      subProducts = [];
    }

    const subProductsByProd = new Map();
    subProducts.forEach((sp) => {
      const pId = String(sp.product_id);
      if (!subProductsByProd.has(pId)) {
        subProductsByProd.set(pId, []);
      }
      subProductsByProd.get(pId).push(sp);
    });

    const productsByCat = new Map();
    products.forEach((p) => {
      const catId = String(p.category_id);
      if (!productsByCat.has(catId)) {
        productsByCat.set(catId, []);
      }
      p.sub_products = subProductsByProd.get(String(p.id)) || [];
      productsByCat.get(catId).push(p);
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      sort_order: cat.sort_order,
      products: productsByCat.get(String(cat.id)) || [],
      subproducts: productsByCat.get(String(cat.id)) || [], // backward compatible alias
    }));
  }
}

export default new CategoryRepository();
