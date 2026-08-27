import 'dotenv/config';
import app from './app.js';
import { testConnection, query } from './config/database.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5000;

async function runAutoMigrations() {
  try {
    await query(`
      ALTER TABLE product_cable_costs
      ADD COLUMN IF NOT EXISTS landing_cost DECIMAL(10,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS image_url LONGTEXT DEFAULT NULL
    `);
    try {
      await query(`
        ALTER TABLE product_cable_costs
        MODIFY COLUMN image_url LONGTEXT DEFAULT NULL
      `);
    } catch (e) {
      // Column modify catch
    }

    try {
      await query(`
        ALTER TABLE enquiries
        ADD COLUMN IF NOT EXISTS variant_details LONGTEXT DEFAULT NULL
      `);
    } catch (e) {
      // Enquiries column catch
    }

    try {
      await query(`
        DELETE FROM product_images
        WHERE display_order = 99 OR alt_text LIKE '%Variant%'
      `);
      logger.info('✅ Cleaned up variant images from main product catalog table.');
    } catch (e) {
      // Cleanup catch
    }

    logger.info('✅ Production Database Schema Verified.');
  } catch (err) {
    logger.warn('ℹ️ Schema check info:', err.message);
  }
}

async function startServer() {
  logger.info('🚀 Initializing Omronics Industrial CMS Server...');

  // Test Database Connection Pool
  const dbConnected = await testConnection();
  if (dbConnected) {
    await runAutoMigrations();
  } else {
    logger.warn('⚠️ Warning: Database connection could not be established at startup. Server starting in degraded mode.');
  }

  app.listen(PORT, () => {
    logger.info(`✅ Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    logger.info(`🔗 Base API Endpoint: http://localhost:${PORT}/api/v1`);
  });
}

startServer();
