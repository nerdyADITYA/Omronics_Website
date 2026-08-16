import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

/**
 * Format bytes to human readable string (KB / MB)
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Compress PDF buffer using pdf-lib stream dictionary optimization & save Data URI + Disk file
 * @param {Buffer} buffer - Raw PDF buffer
 * @param {string} originalName - Original uploaded filename
 */
export async function compressAndSavePdf(buffer, originalName = 'document.pdf') {
  try {
    const originalSizeBytes = buffer.length;

    // Load PDF document
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

    // Save with object streams compression & dictionary optimization
    const compressedPdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const compressedBuffer = Buffer.from(compressedPdfBytes);
    const compressedSizeBytes = compressedBuffer.length;

    // Generate Base64 Data URI for instant database & cloud persistence
    const base64Data = compressedBuffer.toString('base64');
    const dataUriUrl = `data:application/pdf;base64,${base64Data}`;

    // Ensure uploads/documents directory exists locally
    const uploadDir = path.join(process.cwd(), 'server', 'uploads', 'documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeFilename = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, safeFilename);
    fs.writeFileSync(filePath, compressedBuffer);

    const relativeUrl = `/uploads/documents/${safeFilename}`;

    console.log(`✅ [PDF COMPRESSION] "${originalName}": ${formatBytes(originalSizeBytes)} -> ${formatBytes(compressedSizeBytes)}`);

    return {
      url: dataUriUrl, // Compressed Base64 Data URI for database
      relativeUrl,
      filename: originalName,
      originalSizeBytes,
      compressedSizeBytes,
      fileSize: formatBytes(compressedSizeBytes),
    };
  } catch (err) {
    console.error('⚠️ [PDF COMPRESSION WARN] pdf-lib compression error, using raw buffer fallback:', err.message);
    const originalSizeBytes = buffer.length;
    const base64Data = buffer.toString('base64');
    const dataUriUrl = `data:application/pdf;base64,${base64Data}`;

    return {
      url: dataUriUrl,
      filename: originalName,
      originalSizeBytes,
      compressedSizeBytes: originalSizeBytes,
      fileSize: formatBytes(originalSizeBytes),
    };
  }
}
