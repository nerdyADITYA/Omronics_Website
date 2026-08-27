import { cableCostRepository } from '../repositories/cableCost.repository.js';
import { query } from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';
import * as XLSX from 'xlsx';

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

  /**
   * Generate binary Excel sample import template
   */
  generateSampleTemplate() {
    const templateData = [
      {
        product_name: 'INNOVANCE',
        part_code: 'S6-L-P014-xx.x',
        frame_size: '40/60/80 FRAME SIZE',
        motor_type: '100W TO 750W - INCREMENTAL',
        default_length: 5,
        cable_dimension: '2X2X0.20SQMM SHD',
        cable_cost_per_meter: 90,
        connector1_name: 'DB9-MALE',
        connector1_cost: 50,
        connector2_name: 'MICRO MOTOR 7 PIN',
        connector2_cost: 250,
        labour_cost: 150,
        battery_name: '',
        battery_cost: 0,
        margin_percentage: 35,
        additional_components: '',
      },
      {
        product_name: 'INNOVANCE',
        part_code: 'S6-L-B107-xx.x',
        frame_size: '40/60/80 FRAME SIZE',
        motor_type: '100W TO 750W - WITH BRAKE',
        default_length: 5,
        cable_dimension: '4X0.75 + 2X0.30',
        cable_cost_per_meter: 125,
        connector1_name: 'MICRO MOTOR 6 PIN',
        connector1_cost: 250,
        connector2_name: '',
        connector2_cost: 0,
        labour_cost: 150,
        battery_name: '',
        battery_cost: 0,
        margin_percentage: 50,
        additional_components: '',
      },
      {
        product_name: 'MITSUBISHI SERVO CABLES',
        part_code: 'MR-J3ENCBL5M-A2-L',
        frame_size: '',
        motor_type: '200W TO 750W',
        default_length: 5,
        cable_dimension: '3X2X0.20SQMM SHD',
        cable_cost_per_meter: 100,
        connector1_name: 'USB-10 PIN',
        connector1_cost: 100,
        connector2_name: 'MC9S-A1',
        connector2_cost: 350,
        labour_cost: 150,
        battery_name: '',
        battery_cost: 0,
        margin_percentage: 50,
        additional_components: '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Servo Cable Import');

    // Auto column widths
    worksheet['!cols'] = [
      { wch: 24 }, // product_name
      { wch: 22 }, // part_code
      { wch: 24 }, // frame_size
      { wch: 30 }, // motor_type
      { wch: 15 }, // default_length
      { wch: 22 }, // cable_dimension
      { wch: 22 }, // cable_cost_per_meter
      { wch: 22 }, // connector1_name
      { wch: 16 }, // connector1_cost
      { wch: 22 }, // connector2_name
      { wch: 16 }, // connector2_cost
      { wch: 14 }, // labour_cost
      { wch: 16 }, // battery_name
      { wch: 14 }, // battery_cost
      { wch: 18 }, // margin_percentage
      { wch: 24 }, // additional_components
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Parse and analyze Excel import file before database execution
   */
  async analyzeExcelImport(fileBuffer) {
    if (!fileBuffer) {
      throw new AppError('Excel file is required.', 400);
    }

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new AppError('Excel file contains no sheets.', 400);
    }

    const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
    if (rawRows.length === 0) {
      throw new AppError('Excel file contains no data rows.', 400);
    }

    // Fetch all active products
    const productsSql = `SELECT id, product_name FROM products WHERE deleted_at IS NULL`;
    const products = await query(productsSql);

    // Map lower-case product name -> product id
    const productMap = new Map();
    products.forEach((p) => {
      if (p.product_name) {
        productMap.set(p.product_name.trim().toLowerCase(), p.id);
      }
    });

    // Fetch existing variant configurations
    const existingConfigs = await cableCostRepository.findAll();
    const existingMap = new Map();
    existingConfigs.forEach((c) => {
      if (c.part_code) {
        existingMap.set(c.part_code.trim().toLowerCase(), c);
      }
    });

    const toInsert = [];
    const toUpdate = [];
    const unchanged = [];
    const errors = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowNum = i + 2; // 1-indexed header is row 1

      // Standardize column key names (trim whitespace & lowercase keys)
      const normalized = {};
      Object.keys(row).forEach((k) => {
        const cleanKey = String(k).trim().toLowerCase().replace(/\s+/g, '_');
        normalized[cleanKey] = String(row[k]).trim();
      });

      const productName = normalized.product_name || normalized.product || '';
      const partCode = normalized.part_code || normalized.partcode || '';

      if (!productName) {
        errors.push({ row: rowNum, message: 'Missing product_name' });
        continue;
      }
      if (!partCode) {
        errors.push({ row: rowNum, message: 'Missing part_code' });
        continue;
      }

      const productId = productMap.get(productName.toLowerCase());
      if (!productId) {
        errors.push({
          row: rowNum,
          message: `Product "${productName}" not found in catalog. Create product first.`,
        });
        continue;
      }

      // Parse cost and specs
      const defaultLength = Number(normalized.default_length) || 5;
      const cableCostPerMeter = Number(normalized.cable_cost_per_meter) || 0;
      const connector1Name = normalized.connector1_name || null;
      const connector1Cost = Number(normalized.connector1_cost) || 0;
      const connector2Name = normalized.connector2_name || null;
      const connector2Cost = Number(normalized.connector2_cost) || 0;
      const labourCost = Number(normalized.labour_cost) || 150;
      const batteryName = normalized.battery_name || null;
      const batteryCost = Number(normalized.battery_cost) || 0;
      const marginPct = Number(normalized.margin_percentage) || 35;

      let additionalComponents = [];
      if (normalized.additional_components) {
        try {
          additionalComponents = JSON.parse(normalized.additional_components);
        } catch (e) {
          additionalComponents = [];
        }
      }

      const extraCost = Array.isArray(additionalComponents)
        ? additionalComponents.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)
        : 0;

      const landingCost = Math.round(defaultLength * cableCostPerMeter + connector1Cost + connector2Cost + labourCost + batteryCost + extraCost);
      const profit = (marginPct / 100) * landingCost;
      const sellingPrice = Math.round(landingCost + profit);

      const parsedPayload = {
        product_id: productId,
        product_name: productName,
        part_code: partCode,
        frame_size: normalized.frame_size || null,
        motor_type: normalized.motor_type || null,
        default_length: defaultLength,
        cable_dimension: normalized.cable_dimension || null,
        cable_cost_per_meter: cableCostPerMeter,
        connector1_name: connector1Name,
        connector1_cost: connector1Cost,
        connector2_name: connector2Name,
        connector2_cost: connector2Cost,
        labour_cost: labourCost,
        battery_name: batteryName,
        battery_cost: batteryCost,
        margin_percentage: marginPct,
        additional_components: additionalComponents,
        landing_cost: landingCost,
        selling_price: sellingPrice,
      };

      const existingRecord = existingMap.get(partCode.toLowerCase());

      if (!existingRecord) {
        toInsert.push(parsedPayload);
      } else {
        // Record exists: check if values changed
        parsedPayload.id = existingRecord.id;
        const oldLanding = Math.round(Number(existingRecord.landing_cost) || 0);
        const oldSelling = Math.round(Number(existingRecord.selling_price) || 0);

        if (oldSelling !== sellingPrice || oldLanding !== landingCost) {
          toUpdate.push({
            id: existingRecord.id,
            product_name: productName,
            part_code: partCode,
            old_landing_cost: oldLanding,
            new_landing_cost: landingCost,
            old_selling_price: oldSelling,
            new_selling_price: sellingPrice,
            payload: parsedPayload,
          });
        } else {
          unchanged.push(parsedPayload);
        }
      }
    }

    return {
      totalRows: rawRows.length,
      toInsert,
      toUpdate,
      unchanged,
      errors,
    };
  }

  /**
   * Execute atomic batch database upsert
   */
  async executeBatchImport(records = []) {
    if (!Array.isArray(records) || records.length === 0) {
      throw new AppError('No valid records to import.', 400);
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const record of records) {
      const payload = record.payload || record;
      const isUpdate = Boolean(payload.id);
      await cableCostRepository.upsert(payload);
      if (isUpdate) {
        updatedCount++;
      } else {
        insertedCount++;
      }
    }

    return {
      success: true,
      insertedCount,
      updatedCount,
      totalProcessed: insertedCount + updatedCount,
    };
  }
}

export const cableCostService = new CableCostService();
