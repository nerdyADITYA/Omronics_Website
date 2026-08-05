import uploadService from '../services/upload.service.js';
import { sendSuccess } from '../utils/response.js';

export class UploadController {
  async uploadSingleImage(req, res, next) {
    try {
      const folder = req.body.folder || 'general';
      const result = await uploadService.uploadSingleImage(req.file, folder);
      return sendSuccess(res, result, 'Image uploaded and processed successfully.');
    } catch (err) {
      next(err);
    }
  }

  async uploadMultipleImages(req, res, next) {
    try {
      const folder = req.body.folder || 'general';
      const results = await uploadService.uploadMultipleImages(req.files, folder);
      return sendSuccess(res, results, 'Images uploaded and processed successfully.');
    } catch (err) {
      next(err);
    }
  }

  async uploadSingleDocument(req, res, next) {
    try {
      const result = await uploadService.uploadSingleDocument(req.file);
      return sendSuccess(res, result, 'Document uploaded successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export default new UploadController();
