import { cableCostService } from '../services/cableCost.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getServoProducts(req, res) {
  try {
    const products = await cableCostService.getServoCableProducts();
    return sendSuccess(res, products, 'Servo Cable products retrieved successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to fetch Servo Cable products.', err.statusCode || 500);
  }
}

export async function getAllConfigurations(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const productName = req.query.productName || 'ALL';
    const partCode = req.query.partCode || 'ALL';

    const result = await cableCostService.getAllConfigurations({
      page,
      limit,
      offset,
      productName,
      partCode,
    });
    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Cable cost configurations retrieved successfully.',
    });
  } catch (err) {
    return sendError(res, err.message || 'Failed to fetch cable cost configurations.', err.statusCode || 500);
  }
}

export async function getFilterOptions(req, res) {
  try {
    const productName = req.query.productName || 'ALL';
    const options = await cableCostService.getFilterOptions(productName);
    return sendSuccess(res, options, 'Filter options retrieved successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to fetch filter options.', err.statusCode || 500);
  }
}

export async function getByProductId(req, res) {
  try {
    const { productId } = req.params;
    const config = await cableCostService.getByProductId(productId);
    return sendSuccess(res, config, 'Cable cost configuration retrieved successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to fetch cable cost configuration.', err.statusCode || 500);
  }
}

export async function saveConfiguration(req, res) {
  try {
    const config = await cableCostService.saveConfiguration(req.body);
    return sendSuccess(res, config, 'Cable cost configuration saved successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to save cable cost configuration.', err.statusCode || 500);
  }
}

export async function deleteConfiguration(req, res) {
  try {
    const { id } = req.params;
    const result = await cableCostService.deleteConfiguration(id);
    return sendSuccess(res, result, 'Cable cost configuration deleted successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to delete cable cost configuration.', err.statusCode || 500);
  }
}

export async function syncSellingPrice(req, res) {
  try {
    const { productId, sellingPrice } = req.body;
    const result = await cableCostService.syncSellingPrice(productId, sellingPrice);
    return sendSuccess(res, result, 'Selling price synced to product successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to sync selling price to product.', err.statusCode || 500);
  }
}

export async function downloadSampleTemplate(req, res) {
  try {
    const buffer = cableCostService.generateSampleTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="servo_cable_import_sample.xlsx"');
    return res.send(buffer);
  } catch (err) {
    return sendError(res, err.message || 'Failed to generate sample template.', 500);
  }
}

export async function exportExcel(req, res) {
  try {
    const { configurations = [], productName = 'ALL', partCode = 'ALL' } = req.body;
    let dataToExport = configurations;
    if (!Array.isArray(dataToExport) || dataToExport.length === 0) {
      dataToExport = await cableCostService.getAllForExport({ productName, partCode });
    }
    const buffer = await cableCostService.generateVisualExcelExport(dataToExport);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="servo_cables_export.xlsx"');
    return res.send(buffer);
  } catch (err) {
    return sendError(res, err.message || 'Failed to export visual Excel spreadsheet.', 500);
  }
}

export async function analyzeImport(req, res) {
  try {
    if (!req.file) {
      return sendError(res, 'Please upload an Excel file (.xlsx, .xls, .csv).', 400);
    }
    const analysis = await cableCostService.analyzeExcelImport(req.file.buffer);
    return sendSuccess(res, analysis, 'Excel import analyzed successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to analyze Excel import file.', err.statusCode || 500);
  }
}

export async function executeImport(req, res) {
  try {
    const { records } = req.body;
    const result = await cableCostService.executeBatchImport(records);
    return sendSuccess(res, result, 'Batch cable configurations imported successfully.');
  } catch (err) {
    return sendError(res, err.message || 'Failed to execute batch import.', err.statusCode || 500);
  }
}
