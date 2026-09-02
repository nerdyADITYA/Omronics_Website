import { query } from '../config/database.js';
import { getBasePartCodeTemplate } from '../utils/partCode.js';

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

    let urls = [];
    if (typeof row.image_url === 'string') {
      const trimmed = row.image_url.trim();
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
    } else if (Array.isArray(row.image_url)) {
      urls = row.image_url;
    }

    row.image_urls = urls.filter(Boolean);
    row.primary_image = row.image_urls[0] || null;
    return row;
  }

  applyModelLevelImageInheritance(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return rows;

    const modelImageMap = new Map();
    rows.forEach((r) => {
      const baseTemplate = getBasePartCodeTemplate(r.part_code);
      const groupKey = `${r.product_id}__${baseTemplate}__${r.motor_type || ''}__${r.frame_size || ''}`.toLowerCase();
      if (Array.isArray(r.image_urls) && r.image_urls.length > 0 && !modelImageMap.has(groupKey)) {
        modelImageMap.set(groupKey, r.image_urls);
      }
    });

    return rows.map((r) => {
      const baseTemplate = getBasePartCodeTemplate(r.part_code);
      const groupKey = `${r.product_id}__${baseTemplate}__${r.motor_type || ''}__${r.frame_size || ''}`.toLowerCase();
      if ((!Array.isArray(r.image_urls) || r.image_urls.length === 0) && modelImageMap.has(groupKey)) {
        const inherited = modelImageMap.get(groupKey);
        return {
          ...r,
          image_urls: inherited,
          image_url: JSON.stringify(inherited),
          primary_image: inherited[0] || null,
        };
      }
      return r;
    });
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
    const formatted = rows.map((r) => this.formatRow(r));
    return this.applyModelLevelImageInheritance(formatted);
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
    const formatted = rows.map((r) => this.formatRow(r));
    return this.applyModelLevelImageInheritance(formatted);
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

    let imageUrlsArr = [];
    if (Array.isArray(data.image_urls)) {
      imageUrlsArr = data.image_urls.filter((u) => typeof u === 'string' && u.trim().length > 0);
    } else if (data.image_url) {
      const trimmed = String(data.image_url).trim();
      if (trimmed.startsWith('[')) {
        try {
          imageUrlsArr = JSON.parse(trimmed);
        } catch (e) {
          imageUrlsArr = [trimmed];
        }
      } else if (trimmed.length > 0) {
        imageUrlsArr = [trimmed];
      }
    }

    const imageUrl = imageUrlsArr.length > 0 ? JSON.stringify(imageUrlsArr) : null;

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
          landing_cost = ?,
          image_url = ?
        WHERE id = ? AND product_id = ?
      `;

      const updateParams = [
        data.frame_size ? String(data.frame_size).trim() : null,
        data.motor_type ? String(data.motor_type).trim() : null,
        data.part_code ? String(data.part_code).trim() : null,
        data.default_length !== undefined && data.default_length !== null ? Number(data.default_length) : 5,
        data.cable_dimension ? String(data.cable_dimension).trim() : null,
        data.cable_cost_per_meter !== undefined && data.cable_cost_per_meter !== null ? Number(data.cable_cost_per_meter) : 0,
        data.connector1_name ? String(data.connector1_name).trim() : null,
        data.connector1_cost !== undefined && data.connector1_cost !== null ? Number(data.connector1_cost) : 0,
        data.connector2_name ? String(data.connector2_name).trim() : null,
        data.connector2_cost !== undefined && data.connector2_cost !== null ? Number(data.connector2_cost) : 0,
        data.labour_cost !== undefined && data.labour_cost !== null ? Number(data.labour_cost) : 0,
        data.battery_name ? String(data.battery_name).trim() : null,
        data.battery_cost !== undefined && data.battery_cost !== null ? Number(data.battery_cost) : 0,
        data.margin_percentage !== undefined && data.margin_percentage !== null ? Number(data.margin_percentage) : 35,
        additionalJson,
        sellingPrice,
        landingCost,
        imageUrl,
        data.id,
        data.product_id,
      ];

      await query(updateSql, updateParams);

      // Automatically sync images across all sibling length variants of the same model template
      if (imageUrl && data.product_id && data.part_code) {
        try {
          const baseTemplate = getBasePartCodeTemplate(data.part_code);
          const siblings = await query(
            'SELECT id, part_code, motor_type, frame_size FROM product_cable_costs WHERE product_id = ? AND id != ?',
            [data.product_id, data.id]
          );
          const targetKey = `${baseTemplate}__${data.motor_type || ''}__${data.frame_size || ''}`.toLowerCase();
          const siblingIds = siblings
            .filter((s) => {
              const sBase = getBasePartCodeTemplate(s.part_code);
              const sKey = `${sBase}__${s.motor_type || ''}__${s.frame_size || ''}`.toLowerCase();
              return sKey === targetKey;
            })
            .map((s) => s.id);

          if (siblingIds.length > 0) {
            const placeholders = siblingIds.map(() => '?').join(',');
            await query(`UPDATE product_cable_costs SET image_url = ? WHERE id IN (${placeholders})`, [imageUrl, ...siblingIds]);
          }
        } catch (syncErr) {
          console.warn('Could not sync images to sibling variants:', syncErr.message);
        }
      }

      return this.findById(data.id);
    } else {
      // If new variant has no images uploaded, inherit from existing sibling variant of the same model
      let effectiveImageUrl = imageUrl;
      if (!effectiveImageUrl && data.product_id && data.part_code) {
        try {
          const baseTemplate = getBasePartCodeTemplate(data.part_code);
          const siblings = await query(
            'SELECT id, part_code, motor_type, frame_size, image_url FROM product_cable_costs WHERE product_id = ? AND image_url IS NOT NULL',
            [data.product_id]
          );
          const targetKey = `${baseTemplate}__${data.motor_type || ''}__${data.frame_size || ''}`.toLowerCase();
          const matchWithImg = siblings.find((s) => {
            const sBase = getBasePartCodeTemplate(s.part_code);
            const sKey = `${sBase}__${s.motor_type || ''}__${s.frame_size || ''}`.toLowerCase();
            return sKey === targetKey && s.image_url;
          });
          if (matchWithImg) {
            effectiveImageUrl = matchWithImg.image_url;
          }
        } catch (inheritErr) {
          console.warn('Could not inherit images for new variant:', inheritErr.message);
        }
      }

      // Insert new variant record for product_id
      const insertSql = `
        INSERT INTO product_cable_costs (
          product_id, frame_size, motor_type, part_code, default_length,
          cable_dimension, cable_cost_per_meter, connector1_name, connector1_cost,
          connector2_name, connector2_cost, labour_cost, battery_name, battery_cost,
          margin_percentage, additional_components, selling_price, landing_cost, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const insertParams = [
        data.product_id,
        data.frame_size ? String(data.frame_size).trim() : null,
        data.motor_type ? String(data.motor_type).trim() : null,
        data.part_code ? String(data.part_code).trim() : null,
        data.default_length !== undefined && data.default_length !== null ? Number(data.default_length) : 5,
        data.cable_dimension ? String(data.cable_dimension).trim() : null,
        data.cable_cost_per_meter !== undefined && data.cable_cost_per_meter !== null ? Number(data.cable_cost_per_meter) : 0,
        data.connector1_name ? String(data.connector1_name).trim() : null,
        data.connector1_cost !== undefined && data.connector1_cost !== null ? Number(data.connector1_cost) : 0,
        data.connector2_name ? String(data.connector2_name).trim() : null,
        data.connector2_cost !== undefined && data.connector2_cost !== null ? Number(data.connector2_cost) : 0,
        data.labour_cost !== undefined && data.labour_cost !== null ? Number(data.labour_cost) : 0,
        data.battery_name ? String(data.battery_name).trim() : null,
        data.battery_cost !== undefined && data.battery_cost !== null ? Number(data.battery_cost) : 0,
        data.margin_percentage !== undefined && data.margin_percentage !== null ? Number(data.margin_percentage) : 35,
        additionalJson,
        sellingPrice,
        landingCost,
        effectiveImageUrl,
      ];

      const res = await query(insertSql, insertParams);
      const insertedId = res.insertId;

      // Sync effectiveImageUrl to any other sibling variants if present
      if (effectiveImageUrl && data.product_id && data.part_code) {
        try {
          const baseTemplate = getBasePartCodeTemplate(data.part_code);
          const siblings = await query(
            'SELECT id, part_code, motor_type, frame_size FROM product_cable_costs WHERE product_id = ? AND id != ?',
            [data.product_id, insertedId]
          );
          const targetKey = `${baseTemplate}__${data.motor_type || ''}__${data.frame_size || ''}`.toLowerCase();
          const siblingIds = siblings
            .filter((s) => {
              const sBase = getBasePartCodeTemplate(s.part_code);
              const sKey = `${sBase}__${s.motor_type || ''}__${s.frame_size || ''}`.toLowerCase();
              return sKey === targetKey;
            })
            .map((s) => s.id);

          if (siblingIds.length > 0) {
            const placeholders = siblingIds.map(() => '?').join(',');
            await query(`UPDATE product_cable_costs SET image_url = ? WHERE id IN (${placeholders})`, [effectiveImageUrl, ...siblingIds]);
          }
        } catch (syncErr) {
          console.warn('Could not sync images to sibling variants:', syncErr.message);
        }
      }

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
