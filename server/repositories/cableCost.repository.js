import { query } from '../config/database.js';

export class CableCostRepository {
  formatRow(row) {
    if (!row) return null;
    if (typeof row.additional_components === 'string') {
      try {
        row.additional_components = JSON.parse(row.additional_components);
      } catch (err) {
        row.additional_components = [];
      }
    }
    if (!Array.isArray(row.additional_components)) {
      row.additional_components = [];
    }
    return row;
  }

  async findAll() {
    const sql = `
      SELECT pcc.*, p.product_name, p.model_number, p.slug as product_slug, p.price as current_product_price, c.name as category_name
      FROM product_cable_costs pcc
      JOIN products p ON pcc.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.product_name ASC, pcc.updated_at DESC
    `;
    const rows = await query(sql);
    return rows.map((r) => this.formatRow(r));
  }

  async findByProductId(productId) {
    const sql = `
      SELECT pcc.*, p.product_name, p.model_number, p.slug as product_slug, p.price as current_product_price
      FROM product_cable_costs pcc
      JOIN products p ON pcc.product_id = p.id
      WHERE pcc.product_id = ? AND p.deleted_at IS NULL
      ORDER BY pcc.updated_at DESC
    `;
    const rows = await query(sql, [productId]);
    return rows.map((r) => this.formatRow(r));
  }

  async findById(id) {
    const sql = `
      SELECT pcc.*, p.product_name, p.model_number, p.slug as product_slug, p.price as current_product_price
      FROM product_cable_costs pcc
      JOIN products p ON pcc.product_id = p.id
      WHERE pcc.id = ? AND p.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return this.formatRow(rows[0] || null);
  }

  async upsert(data) {
    const additionalJson = Array.isArray(data.additional_components)
      ? JSON.stringify(data.additional_components)
      : typeof data.additional_components === 'string'
      ? data.additional_components
      : null;

    const sellingPrice = data.selling_price !== undefined && data.selling_price !== null ? Number(data.selling_price) : 0;
    const landingCost = data.landing_cost !== undefined && data.landing_cost !== null ? Number(data.landing_cost) : 0;

    if (data.id) {
      // Update existing variant record by primary key id
      const updateSql = `
        UPDATE product_cable_costs SET
          frame_size = ?,
          motor_type = ?,
          part_code = ?,
          default_length = ?,
          cable_dimension = ?,
          cable_cost_per_meter = ?,
          connector1_name = ?,
          connector1_cost = ?,
          connector2_name = ?,
          connector2_cost = ?,
          labour_cost = ?,
          battery_name = ?,
          battery_cost = ?,
          margin_percentage = ?,
          additional_components = ?,
          selling_price = ?,
          landing_cost = ?
        WHERE id = ? AND product_id = ?
      `;

      const updateParams = [
        data.frame_size || null,
        data.motor_type || null,
        data.part_code || null,
        data.default_length !== undefined && data.default_length !== null ? Number(data.default_length) : 5,
        data.cable_dimension || null,
        data.cable_cost_per_meter !== undefined && data.cable_cost_per_meter !== null ? Number(data.cable_cost_per_meter) : 0,
        data.connector1_name || null,
        data.connector1_cost !== undefined && data.connector1_cost !== null ? Number(data.connector1_cost) : 0,
        data.connector2_name || null,
        data.connector2_cost !== undefined && data.connector2_cost !== null ? Number(data.connector2_cost) : 0,
        data.labour_cost !== undefined && data.labour_cost !== null ? Number(data.labour_cost) : 0,
        data.battery_name || null,
        data.battery_cost !== undefined && data.battery_cost !== null ? Number(data.battery_cost) : 0,
        data.margin_percentage !== undefined && data.margin_percentage !== null ? Number(data.margin_percentage) : 35,
        additionalJson,
        sellingPrice,
        landingCost,
        data.id,
        data.product_id,
      ];

      await query(updateSql, updateParams);
      return this.findById(data.id);
    } else {
      // Insert new variant record for product_id
      const insertSql = `
        INSERT INTO product_cable_costs (
          product_id, frame_size, motor_type, part_code, default_length,
          cable_dimension, cable_cost_per_meter, connector1_name, connector1_cost,
          connector2_name, connector2_cost, labour_cost, battery_name, battery_cost,
          margin_percentage, additional_components, selling_price, landing_cost
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const insertParams = [
        data.product_id,
        data.frame_size || null,
        data.motor_type || null,
        data.part_code || null,
        data.default_length !== undefined && data.default_length !== null ? Number(data.default_length) : 5,
        data.cable_dimension || null,
        data.cable_cost_per_meter !== undefined && data.cable_cost_per_meter !== null ? Number(data.cable_cost_per_meter) : 0,
        data.connector1_name || null,
        data.connector1_cost !== undefined && data.connector1_cost !== null ? Number(data.connector1_cost) : 0,
        data.connector2_name || null,
        data.connector2_cost !== undefined && data.connector2_cost !== null ? Number(data.connector2_cost) : 0,
        data.labour_cost !== undefined && data.labour_cost !== null ? Number(data.labour_cost) : 0,
        data.battery_name || null,
        data.battery_cost !== undefined && data.battery_cost !== null ? Number(data.battery_cost) : 0,
        data.margin_percentage !== undefined && data.margin_percentage !== null ? Number(data.margin_percentage) : 35,
        additionalJson,
        sellingPrice,
        landingCost,
      ];

      const res = await query(insertSql, insertParams);
      const insertedId = res.insertId;
      return this.findById(insertedId);
    }
  }

  async delete(id) {
    const sql = `DELETE FROM product_cable_costs WHERE id = ?`;
    await query(sql, [id]);
    return { success: true, deleted_id: id };
  }

  async syncProductPrice(productId, calculatedSellingPrice) {
    const sql = `UPDATE products SET price = ? WHERE id = ?`;
    await query(sql, [Math.round(calculatedSellingPrice), productId]);
    return { success: true, updated_price: Math.round(calculatedSellingPrice) };
  }
}

export const cableCostRepository = new CableCostRepository();
