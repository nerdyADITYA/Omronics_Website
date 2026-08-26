import 'dotenv/config';
import app from './app.js';
import { testConnection, query } from './config/database.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5000;

async function runAutoMigrations() {
  try {
    // Ensure landing_cost and selling_price columns exist in product_cable_costs
    await query(`
      ALTER TABLE product_cable_costs
      ADD COLUMN IF NOT EXISTS landing_cost DECIMAL(10,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2) DEFAULT 0.00
    `);
    logger.info('✅ Production Database Schema Verified (product_cable_costs columns synced).');
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
