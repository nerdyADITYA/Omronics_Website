import multer from 'multer';
import path from 'path';
import { AppError } from '../middlewares/error.middleware.js';

// Memory storage to process images with Sharp before saving
const storage = multer.memoryStorage();

// File filter for images (jpg, jpeg, png, webp)
const imageFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPG, JPEG, PNG, WEBP) are allowed.', 400), false);
  }
};

// File filter for PDF documents
const documentFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf' || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF document files are allowed.', 400), false);
  }
};

export const uploadImageMulter = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: imageFilter,
});

export const uploadMultipleImagesMulter = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: imageFilter,
});

export const uploadDocumentMulter = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), 'server', 'uploads', 'documents'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uniqueSuffix}${ext}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
  fileFilter: documentFilter,
});
