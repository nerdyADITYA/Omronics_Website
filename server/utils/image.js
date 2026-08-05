import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Compress image buffer into WebP format and save to target directory
 * @param {Buffer} buffer - Image file buffer
 * @param {string} folder - Target subfolder inside uploads (e.g. 'products', 'categories')
 * @param {number} maxWidth - Maximum width (optional)
 * @returns {Promise<string>} Relative URL path to saved image
 */
export async function processAndSaveImage(buffer, folder = 'general', maxWidth = 1920) {
  const uploadDir = path.join(process.cwd(), 'server', 'uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const filePath = path.join(uploadDir, filename);

  let transform = sharp(buffer);
  const metadata = await transform.metadata();

  if (metadata.width && metadata.width > maxWidth) {
    transform = transform.resize(maxWidth, null, { withoutEnlargement: true });
  }

  await transform.webp({ quality: 85 }).toFile(filePath);

  return `/uploads/${folder}/${filename}`;
}
