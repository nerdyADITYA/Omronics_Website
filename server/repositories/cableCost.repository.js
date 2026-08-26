import { query } from '../config/database.js';

export class CableCostRepository {
  async findAll() {
    const sql = `
      SELECT pcc.*, p.product_name, p.model_number, p.slug as product_slug, p.price as current_product_price, c.name as category_name
      FROM product_cable_costs pcc
      JOIN products p ON pcc.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL
      ORDER BY pcc.updated_at DESC
    `;
    return query(sql);
  }

  async findByProductId(productId) {
    const sql = `
      SELECT pcc.*, p.product_name, p.model_number, p.slug as product_slug, p.price as current_product_price
      FROM product_cable_costs pcc
      JOIN products p ON pcc.product_id = p.id
      WHERE pcc.product_id = ? AND p.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [productId]);
    return rows[0] || null;
  }

  async upsert(data) {
    const sql = `
      INSERT INTO product_cable_costs (
        product_id, frame_size, motor_type, part_code, default_length,
        cable_dimension, cable_cost_per_meter, connector1_name, connector1_cost,
        connector2_name, connector2_cost, labour_cost, battery_name, battery_cost, margin_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        frame_size = VALUES(frame_size),
        motor_type = VALUES(motor_type),
        part_code = VALUES(part_code),
        default_length = VALUES(default_length),
        cable_dimension = VALUES(cable_dimension),
        cable_cost_per_meter = VALUES(cable_cost_per_meter),
        connector1_name = VALUES(connector1_name),
        connector1_cost = VALUES(connector1_cost),
        connector2_name = VALUES(connector2_name),
        connector2_cost = VALUES(connector2_cost),
        labour_cost = VALUES(labour_cost),
        battery_name = VALUES(battery_name),
        battery_cost = VALUES(battery_cost),
        margin_percentage = VALUES(margin_percentage)
    `;

    const params = [
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
    ];

    await query(sql, params);
    return this.findByProductId(data.product_id);
  }

  async syncProductPrice(productId, calculatedSellingPrice) {
    const sql = `UPDATE products SET price = ? WHERE id = ?`;
    await query(sql, [Math.round(calculatedSellingPrice), productId]);
    return { success: true, updated_price: Math.round(calculatedSellingPrice) };
  }
}

export const cableCostRepository = new CableCostRepository();
