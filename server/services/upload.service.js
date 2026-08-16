import { processAndSaveImage } from '../utils/image.js';
import { compressAndSavePdf } from '../utils/pdf.js';
import { AppError } from '../middlewares/error.middleware.js';

export class UploadService {
  /**
   * Process and save single image into Base64 Data URI
   * @param {object} file - Express multer file
   * @param {string} folder - Subfolder name
   */
  async uploadSingleImage(file, folder = 'general') {
    if (!file || !file.buffer) {
      throw new AppError('No image file provided.', 400);
    }
    try {
      const dataUriUrl = await processAndSaveImage(file.buffer, folder);
      return {
        url: dataUriUrl,
        filename: file.originalname,
      };
    } catch (err) {
      console.error('Single image processing error:', err);
      throw new AppError(`Failed to process image: ${err.message}`, 400);
    }
  }

  /**
   * Process and save multiple images into Base64 Data URIs
   * @param {object[]} files - Array of Express multer files
   * @param {string} folder - Subfolder name
   */
  async uploadMultipleImages(files, folder = 'general') {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new AppError('No image files provided.', 400);
    }

    const results = [];
    for (const file of files) {
      try {
        const dataUriUrl = await processAndSaveImage(file.buffer, folder);
        results.push({
          url: dataUriUrl,
          filename: file.originalname,
        });
      } catch (err) {
        console.error('Multi image item processing error:', err);
      }
    }

    if (results.length === 0) {
      throw new AppError('Failed to process uploaded images.', 400);
    }

    return results;
  }

  /**
   * Process and compress single PDF document upload
   * @param {object} file - Express multer file
   */
  async uploadSingleDocument(file) {
    if (!file || (!file.buffer && !file.path)) {
      throw new AppError('No document file provided.', 400);
    }

    try {
      const buffer = file.buffer || fs.readFileSync(file.path);
      const pdfResult = await compressAndSavePdf(buffer, file.originalname);
      return pdfResult;
    } catch (err) {
      console.error('Document upload error:', err);
      throw new AppError(`Failed to process document: ${err.message}`, 400);
    }
  }
}

export default new UploadService();
