import { cableCostRepository } from '../repositories/cableCost.repository.js';
import { query } from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * Helper to extract embedded picture images from an uploaded .xlsx buffer
 * Maps 1-indexed Excel data row numbers to array of saved image URLs
 */
async function extractEmbeddedImagesFromXlsx(fileBuffer) {
  const rowImageMap = new Map();
  try {
    const zip = await JSZip.loadAsync(fileBuffer);

    // Look for drawing XML and relationship files
    const drawingFiles = zip.file(/^xl\/drawings\/drawing\d+\.xml$/i);
    const relsFiles = zip.file(/^xl\/drawings\/_rels\/drawing\d+\.xml\.rels$/i);

    if (!drawingFiles || drawingFiles.length === 0 || !relsFiles || relsFiles.length === 0) {
      return rowImageMap;
    }

    const drawingXml = await drawingFiles[0].async('string');
    const relsXml = await relsFiles[0].async('string');

    // Parse relationship IDs: rIdX -> media path
    const relsMap = new Map();
    const relRegex = /<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/gi;
    let relMatch;
    while ((relMatch = relRegex.exec(relsXml)) !== null) {
      const target = relMatch[2].replace('../', 'xl/');
      relsMap.set(relMatch[1], target);
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'server', 'uploads', 'images');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Match twoCellAnchor and oneCellAnchor blocks
    const anchorRegex = /<xdr:(?:twoCellAnchor|oneCellAnchor)[^>]*>([\s\S]*?)<\/xdr:(?:twoCellAnchor|oneCellAnchor)>/gi;
    let anchorMatch;

    while ((anchorMatch = anchorRegex.exec(drawingXml)) !== null) {
      const anchorBlock = anchorMatch[1];
      const fromRowMatch = /<xdr:from>[\s\S]*?<xdr:row>(\d+)<\/xdr:row>/i.exec(anchorBlock);
      const blipMatch = /<a:blip[^>]*r:embed="([^"]+)"/i.exec(anchorBlock);

      if (fromRowMatch && blipMatch) {
        const zeroIndexedRow = parseInt(fromRowMatch[1], 10);
        const rId = blipMatch[1];
        const mediaPath = relsMap.get(rId);

        if (mediaPath && zip.file(mediaPath)) {
          const imgBuffer = await zip.file(mediaPath).async('nodebuffer');
          if (imgBuffer && imgBuffer.length > 0) {
            const filename = `variant_excel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.webp`;
            const filepath = path.join(uploadsDir, filename);

            try {
              await sharp(imgBuffer).webp({ quality: 85 }).toFile(filepath);
              const publicUrl = `/uploads/images/${filename}`;

              // zeroIndexedRow 0 is header row, 1 is row 2 (first data row)
              const excelRowNum = zeroIndexedRow + 1;

              if (!rowImageMap.has(excelRowNum)) {
                rowImageMap.set(excelRowNum, []);
              }
              rowImageMap.get(excelRowNum).push(publicUrl);
            } catch (sharpErr) {
              console.warn('Could not optimize embedded image with sharp:', sharpErr.message);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not extract embedded images from xlsx zip archive:', err.message);
  }
  return rowImageMap;
}

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
      const fallbackSql = `SELECT id, product_name, model_number, price as current_price FROM products WHERE deleted_at IS NULL ORDER BY product_name ASC`;
      return query(fallbackSql);
    }
    return rows;
  }

  async getAllConfigurations(params = {}) {
    return cableCostRepository.findAll(params);
  }

  async getFilterOptions(productName = 'ALL') {
    return cableCostRepository.getFilterOptions(productName);
  }

  async getAllForExport(params = {}) {
    return cableCostRepository.getAllForExport(params);
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
   * Generate binary Excel sample import template with standardized 20 columns
   */
  async generateSampleTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Servo Cable Import');

    worksheet.columns = [
      { header: 'Variant Image', key: 'image', width: 16 },
      { header: 'Product Name', key: 'product_name', width: 24 },
      { header: 'Sub-Product (Series)', key: 'sub_product_name', width: 24 },
      { header: 'Part Code', key: 'part_code', width: 24 },
      { header: 'Frame Size', key: 'frame_size', width: 24 },
      { header: 'Motor / Power Spec', key: 'motor_type', width: 32 },
      { header: 'Default Length (m)', key: 'default_length', width: 18 },
      { header: 'Cable Dimension', key: 'cable_dimension', width: 22 },
      { header: 'Cable Cost / Meter (₹)', key: 'cable_cost_per_meter', width: 22 },
      { header: 'Connector 1 Name', key: 'connector1_name', width: 22 },
      { header: 'Connector 1 Cost (₹)', key: 'connector1_cost', width: 20 },
      { header: 'Connector 2 Name', key: 'connector2_name', width: 22 },
      { header: 'Connector 2 Cost (₹)', key: 'connector2_cost', width: 20 },
      { header: 'Labour Cost (₹)', key: 'labour_cost', width: 16 },
      { header: 'Battery Name', key: 'battery_name', width: 16 },
      { header: 'Battery Cost (₹)', key: 'battery_cost', width: 16 },
      { header: 'Profit Margin %', key: 'margin_percentage', width: 16 },
      { header: 'Additional Components', key: 'additional_components', width: 28 },
      { header: 'Landing Cost (₹)', key: 'landing_cost', width: 18 },
      { header: 'Final Selling Price (₹)', key: 'selling_price', width: 20 },
      { header: 'Image URLs (Links)', key: 'images_text', width: 35 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF113F67' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 28;

    const sampleRows = [
      {
        image: '(Paste photo here or leave blank)',
        product_name: 'INNOVANCE',
        sub_product_name: 'IS620N Series Incremental',
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
        landing_cost: 900,
        selling_price: 1215,
        images_text: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
      },
      {
        image: '(Paste photo here or leave blank)',
        product_name: 'INNOVANCE',
        sub_product_name: 'IS620N Series Brake',
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
        landing_cost: 1025,
        selling_price: 1538,
        images_text: '',
      },
    ];

    sampleRows.forEach((data) => {
      const row = worksheet.addRow(data);
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.height = 30;
    });

    return workbook.xlsx.writeBuffer();
  }

  /**
   * Generate visual Excel export with embedded picture images
   */
  async generateVisualExcelExport(configurations = []) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Servo Cable Setups');

    worksheet.columns = [
      { header: 'Variant Image', key: 'image', width: 16 },
      { header: 'Product Name', key: 'product_name', width: 24 },
      { header: 'Sub-Product (Series)', key: 'sub_product_name', width: 24 },
      { header: 'Part Code', key: 'part_code', width: 24 },
      { header: 'Frame Size', key: 'frame_size', width: 24 },
      { header: 'Motor / Power Spec', key: 'motor_type', width: 32 },
      { header: 'Default Length (m)', key: 'default_length', width: 18 },
      { header: 'Cable Dimension', key: 'cable_dimension', width: 22 },
      { header: 'Cable Cost / Meter (₹)', key: 'cable_cost_per_meter', width: 22 },
      { header: 'Connector 1 Name', key: 'connector1_name', width: 22 },
      { header: 'Connector 1 Cost (₹)', key: 'connector1_cost', width: 20 },
      { header: 'Connector 2 Name', key: 'connector2_name', width: 22 },
      { header: 'Connector 2 Cost (₹)', key: 'connector2_cost', width: 20 },
      { header: 'Labour Cost (₹)', key: 'labour_cost', width: 16 },
      { header: 'Battery Name', key: 'battery_name', width: 16 },
      { header: 'Battery Cost (₹)', key: 'battery_cost', width: 16 },
      { header: 'Profit Margin %', key: 'margin_percentage', width: 16 },
      { header: 'Additional Components', key: 'additional_components', width: 28 },
      { header: 'Landing Cost (₹)', key: 'landing_cost', width: 18 },
      { header: 'Final Selling Price (₹)', key: 'selling_price', width: 20 },
      { header: 'Image URLs (Links)', key: 'images_text', width: 35 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF113F67' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 28;

    for (let i = 0; i < configurations.length; i++) {
      const c = configurations[i];
      const rowIdx = i + 2;

      const len = Number(c.default_length) || 5;
      const cCost = Number(c.cable_cost_per_meter) || 0;
      const c1 = Number(c.connector1_cost) || 0;
      const c2 = Number(c.connector2_cost) || 0;
      const labour = Number(c.labour_cost) !== undefined ? Number(c.labour_cost) : 150;
      const battery = Number(c.battery_cost) || 0;
      const extra = Array.isArray(c.additional_components)
        ? c.additional_components.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)
        : 0;
      const computedLanding = Math.round(len * cCost + c1 + c2 + labour + battery + extra);
      const landingVal = c.landing_cost ? Math.round(Number(c.landing_cost)) : computedLanding;
      const sellingVal = c.selling_price ? Math.round(Number(c.selling_price)) : Math.round(landingVal * (1 + (Number(c.margin_percentage) || 35) / 100));

      let imgList = [];
      if (Array.isArray(c.image_urls) && c.image_urls.length > 0) {
        imgList = c.image_urls;
      } else if (c.image_url) {
        try {
          const parsed = JSON.parse(c.image_url);
          if (Array.isArray(parsed)) imgList = parsed;
          else imgList = [c.image_url];
        } catch (e) {
          imgList = [c.image_url];
        }
      }

      const row = worksheet.addRow({
        image: '',
        product_name: c.product_name || '',
        sub_product_name: c.sub_product_title || c.sub_product_name || '',
        part_code: c.part_code || '',
        frame_size: c.frame_size || '',
        motor_type: c.motor_type || '',
        default_length: len,
        cable_dimension: c.cable_dimension || '',
        cable_cost_per_meter: cCost,
        connector1_name: c.connector1_name || '',
        connector1_cost: c1,
        connector2_name: c.connector2_name || '',
        connector2_cost: c2,
        labour_cost: labour,
        battery_name: c.battery_name || '',
        battery_cost: battery,
        margin_percentage: Number(c.margin_percentage) || 35,
        additional_components: Array.isArray(c.additional_components) ? JSON.stringify(c.additional_components) : '',
        landing_cost: landingVal,
        selling_price: sellingVal,
        images_text: imgList.length > 0 ? (imgList.length === 1 ? imgList[0] : JSON.stringify(imgList)) : '',
      });

      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.height = 55;

      if (imgList.length > 0) {
        const firstImg = imgList[0];
        let imageBuffer = null;

        try {
          if (firstImg.startsWith('data:image')) {
            const matches = firstImg.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
            if (matches) {
              imageBuffer = Buffer.from(matches[2], 'base64');
            }
          } else if (firstImg.startsWith('/uploads/')) {
            const localPath = path.join(process.cwd(), 'server', firstImg);
            if (fs.existsSync(localPath)) {
              imageBuffer = fs.readFileSync(localPath);
            }
          } else if (firstImg.startsWith('http')) {
            const res = await fetch(firstImg);
            if (res.ok) {
              const arrayBuffer = await res.arrayBuffer();
              imageBuffer = Buffer.from(arrayBuffer);
            }
          }

          if (imageBuffer) {
            const pngBuffer = await sharp(imageBuffer).png().toBuffer();
            const imageId = workbook.addImage({
              buffer: pngBuffer,
              extension: 'png',
            });

            worksheet.addImage(imageId, {
              tl: { col: 0.1, row: rowIdx - 1 + 0.1 },
              ext: { width: 70, height: 50 },
              editAs: 'oneCell',
            });
          }
        } catch (imgErr) {
          console.warn(`Could not embed visual picture for row ${rowIdx}:`, imgErr.message);
        }
      }
    }

    return workbook.xlsx.writeBuffer();
  }

  /**
   * Parse and analyze Excel import file before database execution
   */
  async analyzeExcelImport(fileBuffer) {
    if (!fileBuffer) {
      throw new AppError('Excel file is required.', 400);
    }

    // Extract embedded pictures if user pasted images directly into Excel worksheet
    const rowEmbeddedImages = await extractEmbeddedImagesFromXlsx(fileBuffer);

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

    // Fetch existing sub-products
    let subProducts = [];
    try {
      subProducts = await query(`SELECT id, product_id, name FROM sub_products WHERE deleted_at IS NULL`);
    } catch (e) {
      subProducts = [];
    }
    const subProductMap = new Map();
    subProducts.forEach((sp) => {
      const key = `${sp.product_id}__${sp.name.trim().toLowerCase()}`;
      subProductMap.set(key, sp.id);
    });

    // Fetch existing variant configurations
    const existingConfigs = await cableCostRepository.getAllForExport();
    const existingMap = new Map();
    (Array.isArray(existingConfigs) ? existingConfigs : []).forEach((c) => {
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
      const rowNum = i + 2; // 1-indexed header is row 1, data starts at row 2

      // Standardize column key names (trim whitespace, lowercase, and loose alphanumeric indexing)
      const normalized = {};
      const looseMap = {};
      Object.keys(row).forEach((k) => {
        const strKey = String(k).trim().toLowerCase();
        const cleanKey = strKey.replace(/\s+/g, '_');
        const strippedKey = strKey.replace(/[^a-z0-9]/g, '');
        const val = String(row[k] !== undefined && row[k] !== null ? row[k] : '').trim();
        normalized[cleanKey] = val;
        looseMap[strippedKey] = val;
      });

      const getVal = (...keys) => {
        for (const k of keys) {
          const cleanK = k.toLowerCase().replace(/\s+/g, '_');
          if (normalized[cleanK] !== undefined && normalized[cleanK] !== '') return normalized[cleanK];
          const stripK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (looseMap[stripK] !== undefined && looseMap[stripK] !== '') return looseMap[stripK];
        }
        return '';
      };

      const productName = getVal('product_name', 'product', 'Product Name');
      const partCode = getVal('part_code', 'partcode', 'Part Code');

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

      // Resolve sub-product (matches by name, model_code, slug, or auto-creates if newly mentioned in Excel)
      const subProductName = getVal('sub_product_name', 'sub_product', 'Sub-Product (Series)', 'Sub-Product', 'Sub Product', 'Model Series', 'series', 'subproduct') || null;
      let subProductId = null;
      if (subProductName && subProductName.trim() && productId) {
        const spTrimmed = subProductName.trim();
        const spKey = `${productId}__${spTrimmed.toLowerCase()}`;
        if (subProductMap.has(spKey)) {
          subProductId = subProductMap.get(spKey);
        } else {
          // Check if matches existing sub-product by model_code, slug, or substring
          const found = subProducts.find(
            (sp) => sp.product_id === productId && (
              (sp.name && sp.name.trim().toLowerCase() === spTrimmed.toLowerCase()) ||
              (sp.model_code && sp.model_code.trim().toLowerCase() === spTrimmed.toLowerCase()) ||
              (sp.slug && sp.slug.trim().toLowerCase() === spTrimmed.toLowerCase()) ||
              spTrimmed.toLowerCase().includes(sp.name.trim().toLowerCase()) ||
              sp.name.trim().toLowerCase().includes(spTrimmed.toLowerCase())
            )
          );
          if (found) {
            subProductId = found.id;
            subProductMap.set(spKey, found.id);
          } else {
            // Auto-create sub_product in the database so that the part code is immediately mapped to it
            try {
              const slug = spTrimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `series-${Date.now()}`;
              const insertSpSql = `INSERT INTO sub_products (product_id, name, slug, status) VALUES (?, ?, ?, 'ACTIVE')`;
              const spRes = await query(insertSpSql, [productId, spTrimmed, slug]);
              subProductId = spRes.insertId;
              subProductMap.set(spKey, subProductId);
              subProducts.push({ id: subProductId, product_id: productId, name: spTrimmed, slug });
            } catch (spErr) {
              console.warn('Could not auto-create sub_product during import:', spErr.message);
            }
          }
        }
      }

      // Parse cost and specs
      const frameSize = getVal('frame_size', 'Frame Size') || null;
      const motorType = getVal('motor_type', 'Motor / Power Spec', 'motor_power_spec', 'motor_spec', 'motor') || null;
      const defaultLength = Number(getVal('default_length', 'Default Length (m)', 'default_length_m', 'length')) || 5;
      const cableDimension = getVal('cable_dimension', 'Cable Dimension', 'cable_spec') || null;
      const cableCostPerMeter = Number(getVal('cable_cost_per_meter', 'Cable Cost / Meter (₹)', 'cable_cost_meter', 'cable_cost')) || 0;
      const connector1Name = getVal('connector1_name', 'connector_1_name', 'Connector 1 Name') || null;
      const connector1Cost = Number(getVal('connector1_cost', 'connector_1_cost', 'Connector 1 Cost (₹)', 'connector_1_cost_rs')) || 0;
      const connector2Name = getVal('connector2_name', 'connector_2_name', 'Connector 2 Name') || null;
      const connector2Cost = Number(getVal('connector2_cost', 'connector_2_cost', 'Connector 2 Cost (₹)', 'connector_2_cost_rs')) || 0;
      const labourCostRaw = getVal('labour_cost', 'Labour Cost (₹)', 'labour_cost_rs', 'labour');
      const labourCost = labourCostRaw !== '' ? Number(labourCostRaw) : 150;
      const batteryName = getVal('battery_name', 'Battery Name') || null;
      const batteryCost = Number(getVal('battery_cost', 'Battery Cost (₹)', 'battery_cost_rs')) || 0;
      const marginPct = Number(getVal('margin_percentage', 'Profit Margin %', 'margin_pct', 'profit_margin', 'margin')) || 35;
      const addCompRaw = getVal('additional_components', 'Additional Components');

      let additionalComponents = [];
      if (addCompRaw) {
        try {
          additionalComponents = JSON.parse(addCompRaw);
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

      // Parse images from URLs / links column
      const parsedImages = [];
      const rawImagesCol = getVal('images_text', 'Image URLs (Links)', 'image_urls_links', 'images', 'image_url', 'image_urls', 'image');
      if (rawImagesCol && !rawImagesCol.startsWith('(Paste photo')) {
        if (rawImagesCol.startsWith('[')) {
          try {
            const arr = JSON.parse(rawImagesCol);
            if (Array.isArray(arr)) parsedImages.push(...arr);
            else parsedImages.push(rawImagesCol);
          } catch (e) {
            parsedImages.push(rawImagesCol);
          }
        } else {
          rawImagesCol.split(/[,;\n]+/).forEach((img) => {
            const clean = img.trim();
            if (clean && !clean.startsWith('(Paste photo')) parsedImages.push(clean);
          });
        }
      }

      // Merge any embedded picture files pasted directly into this Excel row
      if (rowEmbeddedImages.has(rowNum)) {
        const embeddedList = rowEmbeddedImages.get(rowNum);
        embeddedList.forEach((embUrl) => {
          if (!parsedImages.includes(embUrl)) {
            parsedImages.push(embUrl);
          }
        });
      }

      const parsedPayload = {
        product_id: productId,
        product_name: productName,
        sub_product_id: subProductId,
        sub_product_name: subProductName,
        part_code: partCode,
        frame_size: frameSize,
        motor_type: motorType,
        default_length: defaultLength,
        cable_dimension: cableDimension,
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
        image_urls: parsedImages,
      };

      const existingRecord = existingMap.get(partCode.toLowerCase());

      if (!existingRecord) {
        toInsert.push(parsedPayload);
      } else {
        parsedPayload.id = existingRecord.id;
        // If no new images provided in Excel, preserve existing variant images
        if (parsedImages.length === 0 && existingRecord.image_urls && existingRecord.image_urls.length > 0) {
          parsedPayload.image_urls = existingRecord.image_urls;
        }
        if (subProductId) {
          parsedPayload.sub_product_id = subProductId;
          parsedPayload.sub_product_name = subProductName;
        } else if (existingRecord.sub_product_id) {
          parsedPayload.sub_product_id = existingRecord.sub_product_id;
          parsedPayload.sub_product_name = existingRecord.sub_product_title || existingRecord.sub_product_name;
        }

        const oldLanding = Math.round(Number(existingRecord.landing_cost) || 0);
        const oldSelling = Math.round(Number(existingRecord.selling_price) || 0);
        const hasNewImages = parsedImages.length > 0;
        const hasSubProductChange = Number(parsedPayload.sub_product_id || 0) !== Number(existingRecord.sub_product_id || 0);

        if (oldSelling !== sellingPrice || oldLanding !== landingCost || hasNewImages || hasSubProductChange) {
          toUpdate.push({
            id: existingRecord.id,
            product_name: productName,
            sub_product_name: parsedPayload.sub_product_name || existingRecord.sub_product_title || '',
            part_code: partCode,
            old_landing_cost: oldLanding,
            new_landing_cost: landingCost,
            old_selling_price: oldSelling,
            new_selling_price: sellingPrice,
            image_count: parsedPayload.image_urls.length,
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
