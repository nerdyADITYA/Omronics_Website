import { processAndSaveImage } from '../utils/image.js';
import { AppError } from '../middlewares/error.middleware.js';

export class UploadService {
  /**
   * Process and save single image
   * @param {object} file - Express multer file
   * @param {string} folder - Subfolder name
   */
  async uploadSingleImage(file, folder = 'general') {
    if (!file || !file.buffer) {
      throw new AppError('No image file provided.', 400);
    }
    const relativeUrl = await processAndSaveImage(file.buffer, folder);
    return {
      url: relativeUrl,
      filename: file.originalname,
    };
  }

  /**
   * Process and save multiple images
   * @param {object[]} files - Array of Express multer files
   * @param {string} folder - Subfolder name
   */
  async uploadMultipleImages(files, folder = 'general') {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new AppError('No image files provided.', 400);
    }

    const results = [];
    for (const file of files) {
      const relativeUrl = await processAndSaveImage(file.buffer, folder);
      results.push({
        url: relativeUrl,
        filename: file.originalname,
      });
    }

    return results;
  }

  /**
   * Process single PDF document upload
   * @param {object} file - Express multer file
   */
  async uploadSingleDocument(file) {
    if (!file) {
      throw new AppError('No PDF document file provided.', 400);
    }
    return {
      url: `/uploads/documents/${file.filename}`,
      filename: file.originalname,
    };
  }
}

export default new UploadService();
