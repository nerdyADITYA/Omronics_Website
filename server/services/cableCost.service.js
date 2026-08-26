import { cableCostRepository } from '../repositories/cableCost.repository.js';
import { query } from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';

export class CableCostService {
  /**
   * Fetch all Servo Cable products (for selector)
   */
  async getServoCableProducts() {
    const sql = `
      SELECT p.id, p.product_name, p.model_number, p.price as current_price, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL AND (LOWER(c.name) LIKE '%servo%' OR LOWER(c.name) LIKE '%cable%')
      ORDER BY p.product_name ASC
    `;
    const rows = await query(sql);
    if (rows.length === 0) {
      // Fallback: fetch all active products if no specific Servo Cables category exists yet
      const fallbackSql = `SELECT id, product_name, model_number, price as current_price FROM products WHERE deleted_at IS NULL ORDER BY product_name ASC`;
      return query(fallbackSql);
    }
    return rows;
  }

  async getAllConfigurations() {
    return cableCostRepository.findAll();
  }

  async getByProductId(productId) {
    return cableCostRepository.findByProductId(productId);
  }

  async saveConfiguration(data) {
    if (!data.product_id) {
      throw new AppError('Product ID is required.', 400);
    }
    return cableCostRepository.upsert(data);
  }

  async deleteConfiguration(id) {
    if (!id) {
      throw new AppError('Configuration ID is required for deletion.', 400);
    }
    return cableCostRepository.delete(id);
  }

  async syncSellingPrice(productId, sellingPrice) {
    if (!productId) {
      throw new AppError('Product ID is required.', 400);
    }
    if (sellingPrice === undefined || sellingPrice === null || isNaN(sellingPrice)) {
      throw new AppError('Valid selling price is required.', 400);
    }
    return cableCostRepository.syncProductPrice(productId, Number(sellingPrice));
  }
}

export const cableCostService = new CableCostService();
