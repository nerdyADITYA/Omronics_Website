-- Omronics Industrial Corporate CMS Schema
-- Database Engine: MariaDB 11+
-- Character Set: utf8mb4
-- Collation: utf8mb4_unicode_ci

-- Set foreign key check flag
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Admins Table
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `role` ENUM('SUPER_ADMIN', 'ADMIN', 'EDITOR') NOT NULL DEFAULT 'ADMIN',
  `failed_login_attempts` INT NOT NULL DEFAULT 0,
  `locked_until` DATETIME DEFAULT NULL,
  `last_login` DATETIME DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_admin_email` (`email`),
  INDEX `idx_admin_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Categories Table
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `short_description` TEXT DEFAULT NULL,
  `description` LONGTEXT DEFAULT NULL,
  `banner_image` VARCHAR(500) DEFAULT NULL,
  `thumbnail_image` VARCHAR(500) DEFAULT NULL,
  `seo_title` VARCHAR(255) DEFAULT NULL,
  `seo_description` TEXT DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_categories_slug` (`slug`),
  INDEX `idx_categories_status` (`status`),
  INDEX `idx_categories_sort` (`sort_order`),
  INDEX `idx_categories_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Products Table
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `category_id` BIGINT NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `model_number` VARCHAR(100) DEFAULT NULL,
  `short_description` TEXT DEFAULT NULL,
  `description` LONGTEXT DEFAULT NULL,
  `features` LONGTEXT DEFAULT NULL,
  `specifications` LONGTEXT DEFAULT NULL,
  `applications` LONGTEXT DEFAULT NULL,
  `thumbnail_image` VARCHAR(500) DEFAULT NULL,
  `datasheet_available` BOOLEAN NOT NULL DEFAULT FALSE,
  `featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `sort_order` INT NOT NULL DEFAULT 0,
  `seo_title` VARCHAR(255) DEFAULT NULL,
  `seo_description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_products_category` (`category_id`),
  INDEX `idx_products_slug` (`slug`),
  INDEX `idx_products_status` (`status`),
  INDEX `idx_products_featured` (`featured`),
  INDEX `idx_products_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Product Images Table
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `product_id` BIGINT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_product_images_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Product Documents Table
DROP TABLE IF EXISTS `product_documents`;
CREATE TABLE `product_documents` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `product_id` BIGINT NOT NULL,
  `document_name` VARCHAR(255) NOT NULL,
  `document_url` VARCHAR(500) NOT NULL,
  `document_type` ENUM('PDF', 'CATALOGUE', 'DATASHEET', 'MANUAL', 'DRAWING', 'CERTIFICATE') NOT NULL DEFAULT 'PDF',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_product_docs_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_product_docs_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Services Table
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `service_name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `short_description` TEXT DEFAULT NULL,
  `description` LONGTEXT DEFAULT NULL,
  `key_features` TEXT DEFAULT NULL,
  `solutions_provided` TEXT DEFAULT NULL,
  `banner_image` VARCHAR(500) DEFAULT NULL,
  `thumbnail_image` VARCHAR(500) DEFAULT NULL,
  `seo_title` VARCHAR(255) DEFAULT NULL,
  `seo_description` TEXT DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_services_slug` (`slug`),
  INDEX `idx_services_status` (`status`),
  INDEX `idx_services_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Industries Table
DROP TABLE IF EXISTS `industries`;
CREATE TABLE `industries` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `industry_name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `description` LONGTEXT DEFAULT NULL,
  `banner_image` VARCHAR(500) DEFAULT NULL,
  `thumbnail_image` VARCHAR(500) DEFAULT NULL,
  `seo_title` VARCHAR(255) DEFAULT NULL,
  `seo_description` TEXT DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_industries_slug` (`slug`),
  INDEX `idx_industries_status` (`status`),
  INDEX `idx_industries_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Clients Table
DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `client_name` VARCHAR(255) NOT NULL,
  `logo_url` VARCHAR(500) NOT NULL,
  `website_url` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_clients_status` (`status`),
  INDEX `idx_clients_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Testimonials Table
DROP TABLE IF EXISTS `testimonials`;
CREATE TABLE `testimonials` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `customer_name` VARCHAR(150) NOT NULL,
  `company_name` VARCHAR(150) DEFAULT NULL,
  `designation` VARCHAR(150) DEFAULT NULL,
  `photo` VARCHAR(500) DEFAULT NULL,
  `rating` INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  `review` LONGTEXT NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_testimonials_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Enquiries Table
DROP TABLE IF EXISTS `enquiries`;
CREATE TABLE `enquiries` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `source_type` ENUM('CONTACT', 'PRODUCT', 'SERVICE', 'INDUSTRY') NOT NULL DEFAULT 'CONTACT',
  `reference_id` BIGINT DEFAULT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `company_name` VARCHAR(200) DEFAULT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT NULL,
  `subject` VARCHAR(255) DEFAULT NULL,
  `requirement` LONGTEXT NOT NULL,
  `attachment` VARCHAR(500) DEFAULT NULL,
  `status` ENUM('NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED') NOT NULL DEFAULT 'NEW',
  `remarks` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_enquiries_status` (`status`),
  INDEX `idx_enquiries_email` (`email`),
  INDEX `idx_enquiries_source` (`source_type`, `reference_id`),
  INDEX `idx_enquiries_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Website Settings Table
DROP TABLE IF EXISTS `website_settings`;
CREATE TABLE `website_settings` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `company_name` VARCHAR(150) NOT NULL DEFAULT 'Omronics',
  `company_email` VARCHAR(150) NOT NULL DEFAULT 'info@omronics.com',
  `support_email` VARCHAR(150) DEFAULT 'support@omronics.com',
  `phone` VARCHAR(30) DEFAULT NULL,
  `alternate_phone` VARCHAR(30) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `google_maps_embed` TEXT DEFAULT NULL,
  `facebook_url` VARCHAR(255) DEFAULT NULL,
  `instagram_url` VARCHAR(255) DEFAULT NULL,
  `linkedin_url` VARCHAR(255) DEFAULT NULL,
  `youtube_url` VARCHAR(255) DEFAULT NULL,
  `meta_title` VARCHAR(255) DEFAULT NULL,
  `meta_description` TEXT DEFAULT NULL,
  `logo` VARCHAR(500) DEFAULT NULL,
  `favicon` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
