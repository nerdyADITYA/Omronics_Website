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
}

export default new CategoryRepository();
