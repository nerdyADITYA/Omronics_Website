import productService from '../services/product.service.js';
import { getPagination } from '../utils/pagination.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';
import path from 'path';
import fs from 'fs';

export class ProductController {
  async getAll(req, res, next) {
    try {
      const pagination = getPagination(req.query);
      const status = req.query.status || null;
      const categoryId = req.query.category_id || null;
      const featured = req.query.featured || null;

      const result = await productService.getAll({
        ...pagination,
        status,
        categoryId,
        featured,
      });

      return sendPaginated(res, result.data, result.pagination, 'Products retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getById(req.params.id);
      return sendSuccess(res, product, 'Product details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const product = await productService.getBySlug(req.params.slug);
      return sendSuccess(res, product, 'Product details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async downloadDocument(req, res, next) {
    try {
      const doc = await productService.getDocument(req.params.docId);
      const fileName = doc.document_name || 'Product_Catalog.pdf';
      const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

      if (doc.document_url.startsWith('data:application/pdf;base64,')) {
        const base64Data = doc.document_url.replace(/^data:application\/pdf;base64,/, '');
        const pdfBuffer = Buffer.from(base64Data, 'base64');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${cleanFileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        return res.send(pdfBuffer);
      }

      if (doc.document_url.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'server', doc.document_url);
        if (fs.existsSync(filePath)) {
          return res.download(filePath, cleanFileName);
        }
      }

      return res.redirect(doc.document_url);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const product = await productService.create(req.body);
      return sendSuccess(res, product, 'Product created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const product = await productService.update(req.params.id, req.body);
      return sendSuccess(res, product, 'Product updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await productService.delete(req.params.id);
      return sendSuccess(res, {}, 'Product deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export default new ProductController();
