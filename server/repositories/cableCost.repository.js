import { query } from '../config/database.js';
import { getBasePartCodeTemplate, getModelGroupKey } from '../utils/partCode.js';

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

    const specificMap = new Map(); // product_id + baseTemplate + motor_type
    const generalMap = new Map();  // product_id + baseTemplate fallback

    rows.forEach((r) => {
      const baseTemplate = getBasePartCodeTemplate(r.part_code);
      const specificKey = `${r.product_id}__${getModelGroupKey(r.part_code, r.motor_type)}`;
      const generalKey = `${r.product_id}__${baseTemplate.toLowerCase()}`;

      if (Array.isArray(r.image_urls) && r.image_urls.length > 0) {
        if (!specificMap.has(specificKey)) specificMap.set(specificKey, r.image_urls);
        if (!generalMap.has(generalKey)) generalMap.set(generalKey, r.image_urls);
      }
    });

    return rows.map((r) => {
      const baseTemplate = getBasePartCodeTemplate(r.part_code);
      const specificKey = `${r.product_id}__${getModelGroupKey(r.part_code, r.motor_type)}`;
      const generalKey = `${r.product_id}__${baseTemplate.toLowerCase()}`;

      if (!Array.isArray(r.image_urls) || r.image_urls.length === 0) {
        const inherited = specificMap.get(specificKey) || generalMap.get(generalKey);
        if (inherited) {
          return {
            ...r,
            image_urls: inherited,
            image_url: JSON.stringify(inherited),
            primary_image: inherited[0] || null,
          };
        }
      }
      return r;
    });
  }

  /**
   * Paginated & lightweight Cable Cost overview list query
   */
  async findAll({
    page = 1,
    limit = 10,
    offset = 0,
    productName = 'ALL',
    partCode = 'ALL',
    subProductId = 'ALL',
  } = {}) {
    const whereClauses = ['p.deleted_at IS NULL'];
    const params = [];

    if (productName && productName !== 'ALL') {
      whereClauses.push('p.product_name = ?');
      params.push(productName);
    }

    if (partCode && partCode !== 'ALL') {
      whereClauses.push('pcc.part_code = ?');
      params.push(partCode);
    }

    if (subProductId && subProductId !== 'ALL') {
      whereClauses.push('pcc.sub_product_id = ?');
      params.push(subProductId);
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

    const sql = `
      SELECT pcc.id, pcc.product_id, pcc.sub_product_id, pcc.sub_product_name,
             pcc.part_code, pcc.motor_type, pcc.frame_size,
             pcc.cable_dimension, pcc.landing_cost, pcc.selling_price, pcc.updated_at,
             p.product_name, p.model_number, p.slug as product_slug,
             sp.name as sub_product_title, sp.model_code as sub_product_model_code
      FROM product_cable_costs pcc
      JOIN products p ON pcc.product_id = p.id
      LEFT JOIN sub_products sp ON pcc.sub_product_id = sp.id AND sp.deleted_at IS NULL
      ${whereSql}
      ORDER BY p.product_name ASC, pcc.updated_at DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total
      FROM product_cable_costs pcc
      JOIN products p ON pcc.product_id = p.id
      LEFT JOIN sub_products sp ON pcc.sub_product_id = sp.id AND sp.deleted_at IS NULL
      ${whereSql}
    `;

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

  /**
   * Lightweight filter options query for dropdowns
   */
  async getFilterOptions(productName = 'ALL') {
    const productsSql = `
      SELECT DISTINCT p.id as product_id, p.product_name
      FROM product_cable_costs pcc
      JOIN products p ON pcc.product_id = p.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.product_name ASC
    `;
    const productRows = await query(productsSql);

    let partCodesSql = `
      SELECT DISTINCT pcc.part_code
      FROM product_cable_costs pcc
      JOIN products p ON pcc.product_id = p.id
      WHERE p.deleted_at IS NULL
    `;
    const partParams = [];
    if (productName && productName !== 'ALL') {
      partCodesSql += ' AND p.product_name = ?';
      partParams.push(productName);
    }
    partCodesSql += ' ORDER BY pcc.part_code ASC';

    const partRows = await query(partCodesSql, partParams);

    // Fetch sub-products for product if filtered
    let subProducts = [];
    if (productName && productName !== 'ALL') {
      const spSql = `
        SELECT sp.id, sp.name, sp.model_code
        FROM sub_products sp
        JOIN products p ON sp.product_id = p.id
        WHERE p.product_name = ? AND sp.deleted_at IS NULL AND sp.status = 'ACTIVE'
        ORDER BY sp.sort_order ASC, sp.name ASC
      `;
      subProducts = await query(spSql, [productName]);
    }

    const totalCountSql = `
      SELECT COUNT(*) as total
      FROM product_cable_costs pcc
      JOIN products p ON pcc.product_id = p.id
      WHERE p.deleted_at IS NULL
    `;
    const totalRes = await query(totalCountSql);

    return {
      productNames: productRows.map((r) => r.product_name).filter(Boolean),
      partCodes: partRows.map((r) => r.part_code).filter(Boolean),
      subProducts: subProducts || [],
      totalCount: Number(totalRes[0]?.total || 0),
    };
  }

  /**
   * Full data query specifically for Excel Export
   */
  async getAllForExport({ productName = 'ALL', partCode = 'ALL' } = {}) {
    const whereClauses = ['p.deleted_at IS NULL'];
    const params = [];

    if (productName && productName !== 'ALL') {
      whereClauses.push('p.product_name = ?');
      params.push(productName);
    }

    if (partCode && partCode !== 'ALL') {
      whereClauses.push('pcc.part_code = ?');
      params.push(partCode);
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;
    const sql = `
      SELECT pcc.*, p.product_name, p.model_number, p.slug as product_slug, p.price as current_product_price, c.name as category_name,
             sp.name as sub_product_title, sp.model_code as sub_product_model_code
      FROM product_cable_costs pcc
      JOIN products p ON pcc.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_products sp ON pcc.sub_product_id = sp.id AND sp.deleted_at IS NULL
      ${whereSql}
      ORDER BY p.product_name ASC, pcc.updated_at DESC
    `;
    const rows = await query(sql, params);
    const formatted = rows.map((r) => this.formatRow(r));
    return this.applyModelLevelImageInheritance(formatted);
  }

  async findByProductId(productId) {
    const sql = `
      SELECT pcc.*, p.product_name, p.model_number, p.slug as product_slug, p.price as current_product_price,
             sp.name as sub_product_title, sp.model_code as sub_product_model_code
      FROM product_cable_costs pcc
      JOIN products p ON pcc.product_id = p.id
      LEFT JOIN sub_products sp ON pcc.sub_product_id = sp.id AND sp.deleted_at IS NULL
      WHERE pcc.product_id = ? AND p.deleted_at IS NULL
      ORDER BY pcc.updated_at DESC
    `;
    const rows = await query(sql, [productId]);
    const formatted = rows.map((r) => this.formatRow(r));
    return this.applyModelLevelImageInheritance(formatted);
  }

  async findById(id) {
    const sql = `
      SELECT pcc.*, p.product_name, p.model_number, p.slug as product_slug, p.price as current_product_price,
             sp.name as sub_product_title, sp.model_code as sub_product_model_code
      FROM product_cable_costs pcc
      JOIN products p ON pcc.product_id = p.id
      LEFT JOIN sub_products sp ON pcc.sub_product_id = sp.id AND sp.deleted_at IS NULL
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
    const subProductId = data.sub_product_id ? Number(data.sub_product_id) : null;
    const subProductName = data.sub_product_name ? String(data.sub_product_name).trim() : null;

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
          sub_product_id = ?,
          sub_product_name = ?,
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
        subProductId,
        subProductName,
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

      // Automatically sync images and sub-product mapping across all sibling length variants of the same model template
      if (data.product_id && data.part_code) {
        try {
          const baseTemplate = getBasePartCodeTemplate(data.part_code);
          const siblings = await query(
            'SELECT id, part_code, motor_type, frame_size FROM product_cable_costs WHERE product_id = ? AND id != ?',
            [data.product_id, data.id]
          );
          const targetKey = getModelGroupKey(data.part_code, data.motor_type);
          const siblingIds = siblings
            .filter((s) => {
              return getModelGroupKey(s.part_code, s.motor_type) === targetKey;
            })
            .map((s) => s.id);

          if (siblingIds.length > 0) {
            const placeholders = siblingIds.map(() => '?').join(',');
            const setClauses = [];
            const setParams = [];

            if (imageUrl) {
              setClauses.push('image_url = ?');
              setParams.push(imageUrl);
            }
            if (subProductId !== undefined) {
              setClauses.push('sub_product_id = ?');
              setParams.push(subProductId);
              setClauses.push('sub_product_name = ?');
              setParams.push(subProductName);
            }

            if (setClauses.length > 0) {
              await query(
                `UPDATE product_cable_costs SET ${setClauses.join(', ')} WHERE id IN (${placeholders})`,
                [...setParams, ...siblingIds]
              );
            }
          }
        } catch (syncErr) {
          console.warn('Could not sync images and sub-product to sibling variants:', syncErr.message);
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
          const targetKey = baseTemplate.toLowerCase();
          const matchWithImg = siblings.find((s) => {
            const sBase = getBasePartCodeTemplate(s.part_code);
            return sBase.toLowerCase() === targetKey && s.image_url;
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
          product_id, sub_product_id, sub_product_name, frame_size, motor_type, part_code, default_length,
          cable_dimension, cable_cost_per_meter, connector1_name, connector1_cost,
          connector2_name, connector2_cost, labour_cost, battery_name, battery_cost,
          margin_percentage, additional_components, selling_price, landing_cost, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const insertParams = [
        data.product_id,
        subProductId,
        subProductName,
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

      // Sync effectiveImageUrl and sub-product mapping to any other sibling variants if present
      if (data.product_id && data.part_code) {
        try {
          const baseTemplate = getBasePartCodeTemplate(data.part_code);
          const siblings = await query(
            'SELECT id, part_code, motor_type, frame_size FROM product_cable_costs WHERE product_id = ? AND id != ?',
            [data.product_id, insertedId]
          );
          const targetKey = getModelGroupKey(data.part_code, data.motor_type);
          const siblingIds = siblings
            .filter((s) => {
              return getModelGroupKey(s.part_code, s.motor_type) === targetKey;
            })
            .map((s) => s.id);

          if (siblingIds.length > 0) {
            const placeholders = siblingIds.map(() => '?').join(',');
            const setClauses = [];
            const setParams = [];

            if (effectiveImageUrl) {
              setClauses.push('image_url = ?');
              setParams.push(effectiveImageUrl);
            }
            if (subProductId !== undefined) {
              setClauses.push('sub_product_id = ?');
              setParams.push(subProductId);
              setClauses.push('sub_product_name = ?');
              setParams.push(subProductName);
            }

            if (setClauses.length > 0) {
              await query(
                `UPDATE product_cable_costs SET ${setClauses.join(', ')} WHERE id IN (${placeholders})`,
                [...setParams, ...siblingIds]
              );
            }
          }
        } catch (syncErr) {
          console.warn('Could not sync images and sub-product to sibling variants:', syncErr.message);
        }
      }

      return this.findById(insertedId);
    }
  }

  /**
   * High-performance multi-row bulk insert for Excel imports
   * Batches records into single multi-row SQL queries (50 rows per query)
   */
  async bulkInsert(records = [], chunkSize = 50) {
    if (!Array.isArray(records) || records.length === 0) return { insertedCount: 0 };

    let totalInserted = 0;

    // Collect product IDs to pre-fetch existing image siblings once
    const productIds = [...new Set(records.map((r) => r.product_id).filter(Boolean))];
    const siblingImageMap = new Map();

    if (productIds.length > 0) {
      try {
        const placeholders = productIds.map(() => '?').join(',');
        const existingImages = await query(
          `SELECT product_id, part_code, motor_type, image_url 
           FROM product_cable_costs 
           WHERE product_id IN (${placeholders}) AND image_url IS NOT NULL`,
          productIds
        );
        existingImages.forEach((imgRow) => {
          const key = `${imgRow.product_id}__${getModelGroupKey(imgRow.part_code, imgRow.motor_type)}`;
          if (!siblingImageMap.has(key)) {
            siblingImageMap.set(key, imgRow.image_url);
          }
        });
      } catch (err) {
        console.warn('Could not pre-fetch sibling images for bulk insert:', err.message);
      }
    }

    // Process records in chunks of 50
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);

      const valuePlaceholders = [];
      const queryParams = [];

      for (const data of chunk) {
        const additionalJson = Array.isArray(data.additional_components)
          ? JSON.stringify(data.additional_components)
          : typeof data.additional_components === 'string'
          ? data.additional_components
          : null;

        const sellingPrice = data.selling_price !== undefined && data.selling_price !== null ? Number(data.selling_price) : 0;
        const landingCost = data.landing_cost !== undefined && data.landing_cost !== null ? Number(data.landing_cost) : 0;
        const subProductId = data.sub_product_id ? Number(data.sub_product_id) : null;
        const subProductName = data.sub_product_name ? String(data.sub_product_name).trim() : null;

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

        let effectiveImageUrl = imageUrlsArr.length > 0 ? JSON.stringify(imageUrlsArr) : null;
        if (!effectiveImageUrl && data.product_id && data.part_code) {
          const key = `${data.product_id}__${getModelGroupKey(data.part_code, data.motor_type)}`;
          if (siblingImageMap.has(key)) {
            effectiveImageUrl = siblingImageMap.get(key);
          }
        }

        valuePlaceholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        queryParams.push(
          data.product_id,
          subProductId,
          subProductName,
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
          effectiveImageUrl
        );
      }

      const sql = `
        INSERT INTO product_cable_costs (
          product_id, sub_product_id, sub_product_name, frame_size, motor_type, part_code, default_length,
          cable_dimension, cable_cost_per_meter, connector1_name, connector1_cost,
          connector2_name, connector2_cost, labour_cost, battery_name, battery_cost,
          margin_percentage, additional_components, selling_price, landing_cost, image_url
        ) VALUES ${valuePlaceholders.join(',\n')}
      `;

      const res = await query(sql, queryParams);
      totalInserted += Number(res.affectedRows || chunk.length);
    }

    // Trigger fast post-sync for sibling images / sub-products
    await this.syncBatchImagesAndSubproducts(productIds);

    return { insertedCount: totalInserted };
  }

  /**
   * Concurrent batch update with pool concurrency control
   */
  async bulkUpdate(records = [], poolConcurrency = 10) {
    if (!Array.isArray(records) || records.length === 0) return { updatedCount: 0 };

    let totalUpdated = 0;
    const productIds = [...new Set(records.map((r) => r.product_id).filter(Boolean))];

    for (let i = 0; i < records.length; i += poolConcurrency) {
      const slice = records.slice(i, i + poolConcurrency);
      await Promise.all(
        slice.map(async (data) => {
          const additionalJson = Array.isArray(data.additional_components)
            ? JSON.stringify(data.additional_components)
            : typeof data.additional_components === 'string'
            ? data.additional_components
            : null;

          const sellingPrice = data.selling_price !== undefined && data.selling_price !== null ? Number(data.selling_price) : 0;
          const landingCost = data.landing_cost !== undefined && data.landing_cost !== null ? Number(data.landing_cost) : 0;
          const subProductId = data.sub_product_id ? Number(data.sub_product_id) : null;
          const subProductName = data.sub_product_name ? String(data.sub_product_name).trim() : null;

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

          const updateSql = `
            UPDATE product_cable_costs SET
              sub_product_id = ?,
              sub_product_name = ?,
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
            subProductId,
            subProductName,
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

          const res = await query(updateSql, updateParams);
          totalUpdated += Number(res.affectedRows || 1);
        })
      );
    }

    // Trigger fast post-sync for sibling images / sub-products
    await this.syncBatchImagesAndSubproducts(productIds);

    return { updatedCount: totalUpdated };
  }

  /**
   * Fast batch consolidation of sibling images and subproducts across product IDs
   */
  async syncBatchImagesAndSubproducts(productIds = []) {
    if (!Array.isArray(productIds) || productIds.length === 0) return;
    try {
      for (const prodId of productIds) {
        const rows = await query(
          `SELECT part_code, motor_type, image_url, sub_product_id, sub_product_name 
           FROM product_cable_costs 
           WHERE product_id = ? AND (image_url IS NOT NULL OR sub_product_id IS NOT NULL)`,
          [prodId]
        );
        const map = new Map();
        rows.forEach((r) => {
          const key = getModelGroupKey(r.part_code, r.motor_type);
          if (!map.has(key)) {
            map.set(key, {
              image_url: r.image_url,
              sub_product_id: r.sub_product_id,
              sub_product_name: r.sub_product_name,
            });
          }
        });

        for (const [key, val] of map.entries()) {
          const basePart = key.split('__')[0];
          if (val.image_url) {
            await query(
              `UPDATE product_cable_costs 
               SET image_url = ? 
               WHERE product_id = ? AND image_url IS NULL AND LOWER(part_code) LIKE ?`,
              [val.image_url, prodId, `${basePart}%`]
            );
          }
          if (val.sub_product_id) {
            await query(
              `UPDATE product_cable_costs 
               SET sub_product_id = ?, sub_product_name = ? 
               WHERE product_id = ? AND sub_product_id IS NULL AND LOWER(part_code) LIKE ?`,
              [val.sub_product_id, val.sub_product_name, prodId, `${basePart}%`]
            );
          }
        }
      }
    } catch (e) {
      console.warn('Post-import batch sync warning:', e.message);
    }
  }

  async delete(id) {
    const sql = `DELETE FROM product_cable_costs WHERE id = ?`;
    await query(sql, [id]);
    return { success: true, deleted_id: id };
  }

  async bulkDelete({ productName, partCode, ids = [] }) {
    if (Array.isArray(ids) && ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      const res = await query(`DELETE FROM product_cable_costs WHERE id IN (${placeholders})`, ids);
      return { success: true, deletedCount: Number(res.affectedRows || 0) };
    }

    if (!productName || productName === 'ALL') {
      throw new Error('Product Name is required for bulk deletion when no row IDs are selected.');
    }

    const prodRows = await query(
      `SELECT id FROM products 
       WHERE (
         LOWER(TRIM(product_name)) = LOWER(TRIM(?))
         OR LOWER(REPLACE(product_name, '  ', ' ')) = LOWER(REPLACE(?, '  ', ' '))
       )
       AND deleted_at IS NULL`,
      [productName, productName]
    );
    if (prodRows.length === 0) {
      throw new Error(`Product "${productName}" not found.`);
    }
    const productId = prodRows[0].id;

    let deleteSql = 'DELETE FROM product_cable_costs WHERE product_id = ?';
    const params = [productId];

    if (partCode && partCode !== 'ALL') {
      deleteSql += ' AND part_code = ?';
      params.push(partCode);
    }

    const res = await query(deleteSql, params);
    return { success: true, deletedCount: Number(res.affectedRows || 0) };
  }

  async syncProductPrice(productId, calculatedSellingPrice) {
    const sql = `UPDATE products SET price = ? WHERE id = ?`;
    await query(sql, [Math.round(calculatedSellingPrice), productId]);
    return { success: true, updated_price: Math.round(calculatedSellingPrice) };
  }
}

export const cableCostRepository = new CableCostRepository();
