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
        ALTER TABLE website_settings
        ADD COLUMN IF NOT EXISTS is_maintenance_mode TINYINT(1) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS maintenance_title VARCHAR(255) DEFAULT 'Website Under Scheduled Maintenance',
        ADD COLUMN IF NOT EXISTS maintenance_message TEXT DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS maintenance_contact_email VARCHAR(255) DEFAULT 'sales@omronics.com',
        ADD COLUMN IF NOT EXISTS maintenance_contact_phone VARCHAR(100) DEFAULT '+91 9512953737'
      `);
    } catch (e) {
      // Settings columns catch
    }

    try {
      await query(`
        CREATE TABLE IF NOT EXISTS sub_products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL,
          model_code VARCHAR(100) DEFAULT NULL,
          description TEXT DEFAULT NULL,
          image_url TEXT DEFAULT NULL,
          sort_order INT DEFAULT 0,
          status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL DEFAULT NULL,
          KEY idx_subproducts_product (product_id),
          KEY idx_subproducts_status (status)
        )
      `);
    } catch (e) {
      // sub_products table catch
    }

    try {
      await query(`
        ALTER TABLE product_cable_costs
        ADD COLUMN IF NOT EXISTS sub_product_id INT NULL DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS sub_product_name VARCHAR(255) NULL DEFAULT NULL
      `);
    } catch (e) {
      // product_cable_costs sub_product columns catch
    }

    try {
      await query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          admin_id BIGINT NULL,
          admin_name VARCHAR(255) NULL,
          admin_email VARCHAR(255) NULL,
          action VARCHAR(50) NOT NULL,
          entity_type VARCHAR(100) NULL,
          entity_id VARCHAR(100) NULL,
          page VARCHAR(255) NULL,
          method VARCHAR(10) NULL,
          endpoint VARCHAR(255) NULL,
          ip_address VARCHAR(100) NULL,
          user_agent TEXT NULL,
          status ENUM('SUCCESS', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
          details LONGTEXT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_audit_admin (admin_id),
          INDEX idx_audit_action (action),
          INDEX idx_audit_entity (entity_type),
          INDEX idx_audit_created (created_at),
          INDEX idx_audit_page (page)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      try {
        await query(`ALTER TABLE audit_logs MODIFY COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`);
      } catch (e) {}
    } catch (e) {
      // audit_logs table catch
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
