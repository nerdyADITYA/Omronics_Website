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
   * Get full categories and subproducts navigation tree for Header Mega-Menu
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

    const productsByCat = new Map();
    products.forEach((p) => {
      const catId = String(p.category_id);
      if (!productsByCat.has(catId)) {
        productsByCat.set(catId, []);
      }
      productsByCat.get(catId).push(p);
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      sort_order: cat.sort_order,
      subproducts: productsByCat.get(String(cat.id)) || [],
    }));
  }
}

export default new CategoryRepository();
