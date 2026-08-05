import sharp from 'sharp';

/**
 * Compress image buffer into Sharp-optimized WebP format and convert directly to Base64 Data URI
 * Stored directly inside database text columns without external disk file dependency
 * @param {Buffer} buffer - Image file buffer
 * @param {string} folder - Target subfolder name (ignored for Base64 storage)
 * @param {number} maxWidth - Maximum width (optional)
 * @returns {Promise<string>} Base64 Data URI string (e.g. data:image/webp;base64,...)
 */
export async function processAndSaveImage(buffer, folder = 'general', maxWidth = 1920) {
  let transform = sharp(buffer);
  const metadata = await transform.metadata();

  if (metadata.width && metadata.width > maxWidth) {
    transform = transform.resize(maxWidth, null, { withoutEnlargement: true });
  }

  const webpBuffer = await transform.webp({ quality: 85 }).toBuffer();
  const base64Data = webpBuffer.toString('base64');

  return `data:image/webp;base64,${base64Data}`;
}
