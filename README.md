# 🏭 Omronics Industrial Corporate CMS & Cable Cost Calculator

> **Production-Grade Industrial Motion Control Corporate CMS, E-Commerce Product Catalog, Interactive Servo Cable Cost Engine, and Multi-Provider Lead Management System.**

---

## 📋 Executive Summary & Platform Overview

**Omronics Industrial Corporate CMS** is a state-of-the-art web application engineered for **Omronics Motions and Control Pvt. Ltd.** — a premier manufacturer and distributor of industrial automation, servo power/encoder cables, servo drives, motion controllers, and precision control systems.

The platform provides a dual-interface architecture:
1. **Public Corporate Portal**: An immersive, high-performance web application built with **React 18**, **Vite**, **Tailwind CSS**, **Framer Motion**, and **React Three Fiber (R3F)** featuring 3D interactive hero models, dynamic technical spec tables, PDF catalog downloads, and single-click quote enquiry modals with variant precision.
2. **Executive Admin CMS & Cable Calculator Suite**: A secure, JWT-authenticated management dashboard enabling industrial engineers and site administrators to configure products, upload technical documentation, track customer leads, manage categories/industries, and calculate complex Servo Cable pricing via a real-time formula engine with multi-image clipboard support and filter-aware Excel import/export capabilities.

---

## 🛠️ Technology Stack & Architecture

### Backend Stack (Node.js & Express Monolith)
- **Runtime Environment**: Node.js v18+ / v20+
- **Web Framework**: Express.js (v4.x)
- **Software Architecture**: Enterprise Layered Design (`Routes` ➔ `Middlewares` ➔ `Validators` ➔ `Controllers` ➔ `Services` ➔ `Repositories` ➔ `MariaDB Database`)
- **Database Engine**: MariaDB 11+ / MySQL 8+ with Connection Pooling (`mysql2/promise`)
- **Authentication & Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs` (12 Salt Rounds), `helmet` HTTP headers, `cors`, `express-rate-limit`
- **File & Media Handling**: `multer` with disk storage & memory buffer processing
- **Spreadsheet Processing**: `xlsx` (SheetJS) for server-side Excel parsing, template generation, and validation
- **Multi-Provider Email Dispatch Engine**: Native `fetch` with **Resend HTTPS API** (Primary) ➔ **Brevo HTTPS API** (Secondary) ➔ **Nodemailer SMTP** (Local Fallback)

### Frontend Stack (React 18 & Vite SPA)
- **Core Library**: React 18.3+ with Functional Components & Custom Hooks
- **Build Tooling**: Vite 5.4+ (Production Minification, Dynamic Chunking, Hot Module Replacement)
- **Styling & UI Systems**: Tailwind CSS v3.4+, Vanilla CSS Variables, Custom Industrial Palette (`#113F67`, `#226597`, `#87C0CD`, `#E4F1F5`, `#F3F9FB`)
- **Animations & 3D Visuals**: Framer Motion, AnimeJS, React Three Fiber (`@react-three/fiber`), Three.js, `@react-three/drei`
- **Iconography**: Lucide React (`lucide-react`)
- **Data Fetching & State**: Axios (with Request/Response Interceptors for JWT handling), React Context API (`AuthContext`)
- **Client Spreadsheet Processing**: `xlsx` (SheetJS) for filter-aware Excel exports in admin views

---

## 📐 Enterprise Layered System Architecture

```
                               ┌────────────────────────────────────────┐
                               │           Client Browser (SPA)         │
                               │   React 18 + Vite + Tailwind + R3F    │
                               └───────────────────┬────────────────────┘
                                                   │
                                     HTTP / REST API (JSON / FormData)
                                                   │
                               ┌───────────────────▼────────────────────┐
                               │         Express.js Web Server          │
                               │              (Port 5000)               │
                               └───────────────────┬────────────────────┘
                                                   │
                       ┌───────────────────────────┼───────────────────────────┐
                       │                           │                           │
          ┌────────────▼────────────┐  ┌───────────▼───────────┐  ┌────────────▼────────────┐
          │  Middlewares & Auth     │  │   Input Validation    │  │  Static & Uploads      │
          │ (JWT, CORS, Rate Limit) │  │     (Zod Schemas)     │  │ (Images & PDF Manuals) │
          └────────────┬────────────┘  └───────────┬───────────┘  └────────────┬────────────┘
                       │                           │                           │
                       └───────────────────────────┼───────────────────────────┘
                                                   │
                                       ┌───────────▼───────────┐
                                       │    Controller Layer   │
                                       │  (Request / Response) │
                                       └───────────┬───────────┘
                                                   │
                                       ┌───────────▼───────────┐
                                       │     Service Layer     │
                                       │ (Business Logic Rules)│
                                       └───────────┬───────────┘
                                                   │
                                       ┌───────────▼───────────┐
                                       │    Repository Layer   │
                                       │ (Raw SQL Data Access) │
                                       └───────────┬───────────┘
                                                   │
                                       ┌───────────▼───────────┐
                                       │    MariaDB Database   │
                                       │ (12 Relational Tables)│
                                       └───────────────────────┘
```

---

## ✨ Core Features & Technical Highlights

### 1. Servo Cable Cost Engine & Price Calculator (`CableCalculator.jsx`)
An interactive engineering calculator designed specifically for industrial servo power and encoder cable assemblies.

#### 🧮 Live Mathematical Formula Engine
The engine computes real-time pricing for custom cable configurations based on the following line items:
- **Raw Cable Cost**: $\text{Length (m)} \times \text{Cable Cost per Meter (₹)}$
- **Primary Connector ($C_1$) Cost**: Fixed connector unit price in ₹
- **Secondary Connector ($C_2$) Cost**: Fixed connector unit price in ₹
- **Assembly Labour Cost**: Wiring, crimping, and soldering labor fee (Default: ₹150)
- **Battery Module Cost**: Optional absolute encoder battery unit price in ₹
- **Extra Hardware Items**: Dynamic array of custom connectors, terminal lugs, or heat-shrink sleeving items ($\sum \text{Item Cost}$)
- **Landing Cost ($C_{10}$)**:
  $$\text{Landing Cost} = (\text{Length} \times \text{Cost/m}) + C_1 + C_2 + \text{Labour} + \text{Battery} + \sum \text{Extra Components}$$
- **Profit Margin Percentage ($C_{11}$)**: Configurable margin (Default: 35%)
- **Calculated Selling Price ($C_{13}$)**:
  $$\text{Final Selling Price} = \text{Landing Cost} \times \left(1 + \frac{\text{Margin \%}}{100}\right)$$

#### 🖼️ Multi-Image Dropzone & Clipboard `Ctrl+V` Paste System
- Allows uploading multiple image files or pasting clipboard images directly (`Ctrl+V`) for any cable variant.
- Interactive gallery grid with thumbnail previews, individual deletion, and primary image designation.
- Automatically stores images as a JSON array of Base64 or URL strings inside `product_cable_costs.image_url`.

#### 🖼️ Strict Gallery Isolation Logic
- **Variant Mode**: Selecting a specific Part Code variant displays **ONLY** that variant's images.
- **Default Mode**: If no variant is selected or if a variant has 0 images, **ONLY** default product catalog images are shown.
- **Catalog Database Separation**: Variant images are stored strictly within `product_cable_costs` and never pollute the main `product_images` catalog table.

#### 💵 Catalog Default Price Independence
- Saving or editing a cable variant updates only that variant's calculated price and **never overwrites** the default catalog product price (`products.price`), keeping the main product pricing independent.

#### 📊 Filter-Aware Excel Export Engine
- Exports filtered cable configurations to `.xlsx` files.
- Live export button reflects the active row count (e.g., `Export Excel (8)` vs `Export Excel (2)`).
- Dynamically names export files based on selected filters (e.g., `servo_cables_INNOVANCE_S6-L-P014.xlsx`).

#### 🛡️ Pre-Import Excel Safety Analysis Modal
- Selecting an Excel file analyzes the file first without altering the database.
- Displays an interactive summary modal categorizing rows into:
  - **New Records**: Rows that will be inserted.
  - **Existing Records**: Rows that match an existing `product_name` + `part_code` combination and will be updated/overwritten (with side-by-side landing price and selling price diffs).
  - **Unchanged Records**: Rows with identical parameters.
  - **Validation Errors**: Rows missing required fields (`product_name`, `part_code`, `cable_cost_per_meter`).
- Requires explicit user confirmation before committing database changes.

#### 📥 Downloadable Sample Excel Template
- Provides a pre-formatted `.xlsx` sample template with mandatory and optional column headers, default values, and example rows.

---

### 2. Multi-Provider Email Notification Engine & Quote System

#### 📩 Variant-Specific Quote Enquiry Modal (`LeadModal.jsx`)
- When a customer clicks **Request Official Quote** on a product page, the active `selectedVariant` details are passed into the modal.
- Renders an inline **Selected Cable Spec Variant** preview card displaying Part Code, Frame Size, Motor Spec, Connectors, Cable Length, and Estimated Price.

#### ✉️ Multi-Provider Dispatch Architecture (`server/utils/email.js`)
The backend uses a multi-provider fallback hierarchy to guarantee email delivery regardless of cloud host port blocking:
1. **Resend HTTPS API** (Port 443 - Primary for Vercel/Render/AWS)
2. **Brevo HTTPS API** (Port 443 - Secondary API fallback)
3. **Nodemailer SMTP** (Port 465/587 - Local development fallback)

#### 📄 HTML Email Notification Templates
- **Customer Confirmation Email**: Sent to the user submitting the enquiry, containing a formatted **Requested Part Code Spec Breakdown** box with itemized cable specifications and pricing.
- **Admin Lead Alert Email**: Sent to the sales engineering team (`EMAIL_USERNAME`), containing customer contact information, location, technical notes, and full variant specifications.

---

### 3. Product Catalog & Document Management System
- **Product CRUD**: Full admin management for industrial products, model numbers, categories, descriptions, specifications, features, and applications.
- **PDF Datasheet Uploader**: Allows uploading and attaching technical PDFs, drawings, and catalogues to products.
- **Drag-and-Drop Gallery**: Multiple image gallery support per product.
- **SEO Meta Management**: Configurable SEO titles, meta descriptions, and clean URL slugs.

---

### 4. Executive KPI Dashboard & CMS Management Modules
- **KPI Overview**: Live metrics for Total Products, Active Categories, Pending Enquiries, and Cable Configurations.
- **Category Management**: Hierarchical product categories with custom banner images and sort ordering.
- **Enquiry Pipeline**: Customer lead management with status updates (`NEW`, `CONTACTED`, `IN_PROGRESS`, `COMPLETED`, `CLOSED`).
- **Services & Industries**: Dedicated CMS modules for managing engineering service offerings and target industry sectors.
- **Client & Testimonial Manager**: OEM partner logo showcase and customer review management.
- **Global Settings Manager**: Site-wide configuration for company contacts, social links, Google Maps embeds, and branding logos.

---

## 📁 Repository Directory Structure & File Map

```
Omronics/
├── client/                             # React 18 + Vite Frontend Application
│   ├── public/                         # Public Static Assets & Favicons
│   │   ├── favicon.ico
│   │   └── robots.txt
│   ├── src/
│   │   ├── assets/                     # Graphic Assets & Background Images
│   │   │   ├── home-bg.jpeg
│   │   │   └── logo.png
│   │   ├── components/                 # Shared UI & Layout Components
│   │   │   ├── common/                 # Reusable Controls & Modals
│   │   │   │   ├── Footer.jsx          # Site-wide Footer with Category Links
│   │   │   │   ├── Header.jsx          # Responsive Navigation Bar & Mobile Menu
│   │   │   │   ├── LeadModal.jsx       # Quote Enquiry Modal with Variant Preview
│   │   │   │   └── SEOManager.jsx      # Dynamic React Helmet SEO Injector
│   │   │   ├── home/                   # Home Page Specialized Sections
│   │   │   │   ├── Hero3D.jsx          # Interactive 3D Canvas Model (R3F)
│   │   │   │   ├── ProductShowcase.jsx # Featured Products Carousel
│   │   │   │   └── ServicesGrid.jsx    # Engineering Services Grid
│   │   │   └── admin/                  # Admin Layout & Sidebar Navigation
│   │   │       ├── AdminLayout.jsx     # Protected Admin Wrapper with Sidebar
│   │   │       └── Sidebar.jsx         # Admin Navigation Menu
│   │   ├── context/                    # React Context Providers
│   │   │   └── AuthContext.jsx         # Global Auth State (JWT & User Profile)
│   │   ├── pages/                      # Page Level Views
│   │   │   ├── admin/                  # Protected Admin Management Views
│   │   │   │   ├── CableCalculator.jsx # Servo Cable Cost Calculator Engine
│   │   │   │   ├── CategoryManagement.jsx # Category CRUD View
│   │   │   │   ├── ClientManagement.jsx   # OEM Partner Client CRUD View
│   │   │   │   ├── Dashboard.jsx          # Executive KPI Dashboard View
│   │   │   │   ├── EnquiryManagement.jsx  # Customer Lead Pipeline View
│   │   │   │   ├── IndustryManagement.jsx # Industry Sector CRUD View
│   │   │   │   ├── Login.jsx              # Admin Authentication View
│   │   │   │   ├── ProductManagement.jsx  # Product Catalog & Spec CRUD View
│   │   │   │   ├── ServiceManagement.jsx  # Engineering Services CRUD View
│   │   │   │   ├── SettingsManagement.jsx # Site Global Settings View
│   │   │   │   └── TestimonialManagement.jsx # Testimonials CRUD View
│   │   │   └── public/                 # Public Visitor Facing Views
│   │   │       ├── About.jsx           # Corporate Profile & Certifications
│   │   │       ├── Clients.jsx         # OEM Partners & Client Logo Grid
│   │   │       ├── Contact.jsx         # Contact Form & Office Map
│   │   │       ├── Home.jsx            # Landing Page with 3D Visuals
│   │   │       ├── Industries.jsx      # Target Industry Solutions
│   │   │       ├── NotFound.jsx        # Custom 404 Error Page
│   │   │       ├── ProductDetail.jsx   # Product Datasheet & Variant Gallery
│   │   │       ├── Products.jsx        # Searchable Products Catalog
│   │   │       ├── ServiceDetail.jsx   # Individual Service Technical View
│   │   │       └── Services.jsx        # Engineering Capabilities Catalog
│   │   ├── routes/                     # App Routing Guard Definitions
│   │   │   ├── AppRoutes.jsx           # Main Router Switch
│   │   │   └── ProtectedRoute.jsx      # JWT Auth Guard Wrapper
│   │   ├── services/                   # API HTTP Service Handlers
│   │   │   └── api.js                  # Axios Instance with Interceptors
│   │   ├── App.jsx                     # Application Root Component
│   │   ├── main.jsx                    # Vite React Mount Entrypoint
│   │   └── index.css                   # Tailwind CSS Directives & Custom Styles
│   ├── index.html                      # HTML5 Template Page
│   ├── package.json                    # Client Package Manifest & Dependencies
│   ├── tailwind.config.js              # Tailwind Design System Configuration
│   └── vite.config.js                  # Vite Build & Proxy Settings
│
├── server/                             # Express.js Backend Application
│   ├── config/                         # Core Server Configurations
│   │   ├── database.js                 # MariaDB Pool & Query Runner
│   │   ├── jwt.js                      # Token Signing & Verification Keys
│   │   └── multer.js                   # Media Upload Storage Engines
│   ├── controllers/                    # HTTP Request Handlers
│   │   ├── auth.controller.js          # Admin Login & Auth Check
│   │   ├── cableCost.controller.js     # Cable Calculator Handlers
│   │   ├── category.controller.js      # Category CRUD Handlers
│   │   ├── client.controller.js        # Client Partner Handlers
│   │   ├── enquiry.controller.js       # Customer Lead Handlers
│   │   ├── industry.controller.js      # Industry Sector Handlers
│   │   ├── product.controller.js       # Product Catalog Handlers
│   │   ├── service.controller.js       # Engineering Service Handlers
│   │   ├── settings.controller.js      # Website Settings Handlers
│   │   ├── testimonial.controller.js  # Testimonial Handlers
│   │   └── upload.controller.js       # Single/Multi File Upload Handlers
│   ├── services/                       # Business Logic Layer
│   │   ├── auth.service.js             # Auth Logic & Password Hashing
│   │   ├── cableCost.service.js        # Calculator Business Logic & Excel Processing
│   │   ├── category.service.js         # Category Business Logic
│   │   ├── client.service.js           # Client Partner Logic
│   │   ├── enquiry.service.js          # Enquiry Processing & Email Trigger
│   │   ├── industry.service.js         # Industry Sector Logic
│   │   ├── product.service.js          # Product & Document Handling Logic
│   │   ├── service.service.js          # Service Business Logic
│   │   ├── settings.service.js         # Global Settings Logic
│   │   └── testimonial.service.js     # Testimonial Logic
│   ├── repositories/                   # MariaDB SQL Data Access Layer
│   │   ├── base.repository.js          # Base Abstract Repository Class
│   │   ├── admin.repository.js         # Admin SQL Queries
│   │   ├── cableCost.repository.js     # Cable Cost SQL & Upsert Queries
│   │   ├── category.repository.js      # Category SQL Queries
│   │   ├── client.repository.js        # Client Partner SQL Queries
│   │   ├── enquiry.repository.js       # Enquiry SQL Queries
│   │   ├── industry.repository.js      # Industry SQL Queries
│   │   ├── product.repository.js       # Product & Docs SQL Queries
│   │   ├── service.repository.js       # Service SQL Queries
│   │   ├── settings.repository.js      # Settings SQL Queries
│   │   └── testimonial.repository.js  # Testimonial SQL Queries
│   ├── middlewares/                    # Express Custom Middlewares
│   │   ├── auth.middleware.js          # JWT Verification Middleware
│   │   ├── error.middleware.js         # Global Async Error Handler
│   │   └── rateLimiter.middleware.js   # Endpoint Rate Limiters
│   ├── validators/                     # Request Validation Schemas
│   │   ├── auth.validator.js           # Login Input Validation
│   │   ├── category.validator.js       # Category Input Validation
│   │   ├── enquiry.validator.js        # Enquiry Form Validation
│   │   └── product.validator.js        # Product Schema Validation
│   ├── utils/                          # Helper Utilities
│   │   ├── email.js                    # Multi-Provider Email Engine (Resend/Brevo/Nodemailer)
│   │   ├── logger.js                   # Console & File Logger
│   │   ├── response.js                 # Standardized JSON API Formatters
│   │   └── slug.js                     # URL Slug Generator
│   ├── uploads/                        # Server Media Storage Directory
│   │   ├── documents/                  # Technical PDF Datasheets
│   │   └── images/                     # Product & Banner Images
│   ├── app.js                          # Express App Middleware Setup
│   └── server.js                       # Server Startup & Database Auto-Migrations
│
├── database/                           # Database Schema & Seed Assets
│   ├── schema.sql                      # Complete DDL Schema for MariaDB
│   └── seed.js                         # Database Seeder Script
│
├── package.json                        # Root Monorepo Management Scripts
└── .env.example                        # Environment Variables Reference Template
```

---

## 🗄️ Database Architecture & Relational Schema

The application runs on **MariaDB 11+** with InnoDB storage engine and `utf8mb4_unicode_ci` character encoding.

```
                  ┌─────────────────┐             ┌─────────────────┐
                  │    categories   │             │     admins      │
                  ├─────────────────┤             ├─────────────────┤
                  │ id (PK)         │             │ id (PK)         │
                  │ name            │             │ full_name       │
                  │ slug (UNIQUE)   │             │ email (UNIQUE)  │
                  │ description     │             │ password_hash   │
                  │ status          │             │ role            │
                  └────────┬────────┘             └─────────────────┘
                           │ 1
                           │
                           │ N
                  ┌────────┴────────┐             ┌─────────────────┐
                  │    products     │             │    enquiries    │
                  ├─────────────────┤             ├─────────────────┤
                  │ id (PK)         │             │ id (PK)         │
                  │ category_id (FK)│             │ customer_name   │
                  │ product_name    │             │ email           │
                  │ slug (UNIQUE)   │             │ phone           │
                  │ price           │             │ requirement     │
                  │ status          │             │ variant_details │
                  └────────┬────────┘             └─────────────────┘
                           │ 1
       ┌───────────────────┼───────────────────┐
       │ 1                 │ 1                 │ 1
       │ N                 │ N                 │ N
┌──────┴──────────┐ ┌──────┴──────────┐ ┌──────┴──────────────┐
│ product_images  │ │product_documents│ │product_cable_costs  │
├─────────────────┤ ├─────────────────┤ ├─────────────────────┤
│ id (PK)         │ │ id (PK)         │ │ id (PK)             │
│ product_id (FK) │ │ product_id (FK) │ │ product_id (FK)     │
│ image_url       │ │ document_name   │ │ part_code           │
│ display_order   │ │ document_url    │ │ cable_cost_per_meter│
└─────────────────┘ └─────────────────┘ │ landing_cost        │
                                        │ selling_price       │
                                        │ image_url (LONGTEXT)│
                                        └─────────────────────┘
```

---

### Detailed Database Table Definitions

#### 1. `admins` Table
Stores authentication accounts for platform administrators.
```sql
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
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 2. `categories` Table
Stores product category classification.
```sql
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
  `deleted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3. `products` Table
Main catalog product table.
```sql
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
  `price` DECIMAL(10,2) DEFAULT NULL,
  `datasheet_available` BOOLEAN NOT NULL DEFAULT FALSE,
  `featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `sort_order` INT NOT NULL DEFAULT 0,
  `seo_title` VARCHAR(255) DEFAULT NULL,
  `seo_description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 4. `product_images` Table
Additional catalog images for products.
```sql
CREATE TABLE `product_images` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `product_id` BIGINT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 5. `product_documents` Table
Stores technical PDF documentation and catalogues attached to products.
```sql
CREATE TABLE `product_documents` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `product_id` BIGINT NOT NULL,
  `document_name` VARCHAR(255) NOT NULL,
  `document_url` VARCHAR(500) NOT NULL,
  `document_type` ENUM('PDF', 'CATALOGUE', 'DATASHEET', 'MANUAL', 'DRAWING', 'CERTIFICATE') NOT NULL DEFAULT 'PDF',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_product_docs_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 6. `product_cable_costs` Table
Stores individual Part Code cable variants, specs, component costs, calculated landing/selling prices, and multi-image JSON arrays.
```sql
CREATE TABLE `product_cable_costs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `product_id` BIGINT NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `part_code` VARCHAR(255) NOT NULL,
  `frame_size` VARCHAR(255) DEFAULT NULL,
  `motor_type` VARCHAR(255) DEFAULT NULL,
  `default_length` DECIMAL(10,2) DEFAULT 5.00,
  `cable_dimension` VARCHAR(255) DEFAULT NULL,
  `cable_cost_per_meter` DECIMAL(10,2) DEFAULT 0.00,
  `connector1_name` VARCHAR(255) DEFAULT NULL,
  `connector1_cost` DECIMAL(10,2) DEFAULT 0.00,
  `connector2_name` VARCHAR(255) DEFAULT NULL,
  `connector2_cost` DECIMAL(10,2) DEFAULT 0.00,
  `labour_cost` DECIMAL(10,2) DEFAULT 150.00,
  `battery_name` VARCHAR(255) DEFAULT NULL,
  `battery_cost` DECIMAL(10,2) DEFAULT 0.00,
  `margin_percentage` DECIMAL(10,2) DEFAULT 35.00,
  `additional_components` LONGTEXT DEFAULT NULL,
  `landing_cost` DECIMAL(10,2) DEFAULT 0.00,
  `selling_price` DECIMAL(10,2) DEFAULT 0.00,
  `image_url` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_cable_costs_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 7. `enquiries` Table
Stores customer lead submissions, contact inquiries, and variant specification details.
```sql
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
  `variant_details` LONGTEXT DEFAULT NULL,
  `attachment` VARCHAR(500) DEFAULT NULL,
  `status` ENUM('NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED') NOT NULL DEFAULT 'NEW',
  `remarks` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 8. `services`, `industries`, `clients`, `testimonials`, `website_settings` Tables
Refer to `database/schema.sql` for full schema definitions for services, industries, clients, testimonials, and site configurations.

---

## 🌐 Complete REST API Endpoint Specification

All REST API endpoints are prefixed with `/api/v1`.

### 1. Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Admin login authentication; returns JWT token & user profile |
| `GET` | `/auth/me` | Protected (JWT) | Verifies active session token & returns current admin details |

---

### 2. Servo Cable Calculator Endpoints (`/api/v1/cable-costs`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/cable-costs/servo-products` | Public / Admin | Returns list of products under "Servo Cables" category |
| `GET` | `/cable-costs` | Public / Admin | Returns all saved Part Code cable variant configurations |
| `GET` | `/cable-costs/:id` | Public / Admin | Returns a specific cable variant configuration by ID |
| `POST` | `/cable-costs` | Protected (JWT) | Saves or updates a Part Code variant configuration |
| `DELETE` | `/cable-costs/:id` | Protected (JWT) | Deletes a specific cable variant configuration |
| `GET` | `/cable-costs/download-template` | Protected (JWT) | Downloads a pre-formatted sample `.xlsx` import template |
| `POST` | `/cable-costs/analyze-import` | Protected (JWT) | Analyzes uploaded Excel file and returns pre-import stats |
| `POST` | `/cable-costs/execute-import` | Protected (JWT) | Executes batch upsert of analyzed Excel records into MariaDB |

---

### 3. Product Catalog Endpoints (`/api/v1/products`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Public | Returns paginated products with category filtering & search |
| `GET` | `/products/featured` | Public | Returns featured products for Home Page showcase |
| `GET` | `/products/slug/:slug` | Public | Returns detailed product datasheet with variants & docs |
| `GET` | `/products/:id` | Public / Admin | Returns single product by ID |
| `POST` | `/products` | Protected (JWT) | Creates a new product catalog item |
| `PUT` | `/products/:id` | Protected (JWT) | Updates product details, gallery images & features |
| `DELETE` | `/products/:id` | Protected (JWT) | Soft deletes a product item |
| `GET` | `/products/documents/:id/download` | Public | Streams PDF technical datasheet download |

---

### 4. Customer Enquiry & Lead Endpoints (`/api/v1/enquiries`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/enquiries` | Public | Submits a customer quote enquiry & triggers notification emails |
| `GET` | `/enquiries` | Protected (JWT) | Returns paginated customer lead list for admin pipeline |
| `GET` | `/enquiries/stats` | Protected (JWT) | Returns enquiry status count statistics for dashboard gauges |
| `GET` | `/enquiries/:id` | Protected (JWT) | Returns detailed single enquiry record |
| `PUT` | `/enquiries/:id/status` | Protected (JWT) | Updates enquiry status (`NEW`, `CONTACTED`, `IN_PROGRESS`, etc.) |
| `DELETE` | `/enquiries/:id` | Protected (JWT) | Deletes an enquiry record |

---

### 5. Media Upload Endpoints (`/api/v1/upload`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/upload/image` | Protected (JWT) | Uploads single image file, converts to `.webp`, returns URL |
| `POST` | `/upload/images` | Protected (JWT) | Uploads multiple image files, converts to `.webp` |
| `POST` | `/upload/document` | Protected (JWT) | Uploads PDF technical datasheet or drawing document |

---

## ⚙️ Environment Variables Reference (`.env`)

Create a `.env` file in the root directory based on the following reference:

```env
# =================================================================
# OMRONICS INDUSTRIAL CMS & BACKEND SERVER CONFIGURATION
# =================================================================

# Server Network Settings
PORT=5000
NODE_ENV=development
API_PREFIX=/api/v1

# MariaDB Database Connection Pool Settings
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mariadb_password
DB_NAME=omronics_db
DB_CONNECTION_LIMIT=20

# JWT Authentication Security Settings
JWT_SECRET=super_secret_jwt_encryption_key_omronics_2026_industrial_cms
JWT_EXPIRES_IN=7d

# Multi-Provider Email Engine Configuration
# Provider 1: Resend HTTPS API (Recommended for Vercel/Render - Port 443)
RESEND_API_KEY=re_your_resend_api_key_here

# Provider 2: Brevo HTTPS API (Fallback - Port 443)
BREVO_API_KEY=xkeysib-your_brevo_api_key_here

# Provider 3: Local SMTP Fallback (Nodemailer - Port 465/587)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USERNAME=adikadia05@gmail.com
EMAIL_PASSWORD=your_app_specific_password_here

# Client URL (For CORS Security Header)
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Setup & Local Installation Guide

### Prerequisites
- **Node.js**: v18.x or v20.x installed
- **MariaDB / MySQL Server**: v11+ running locally or remotely
- **Git**: Installed

### Step 1: Clone Repository
```bash
git clone https://github.com/nerdyADITYA/Omronics_Website.git
cd Omronics_Website
```

### Step 2: Database Initialization
1. Start your MariaDB service.
2. Create the database and import schema:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS omronics_db;"
   mysql -u root -p omronics_db < database/schema.sql
   ```
3. Seed default admin credentials and initial data:
   ```bash
   node database/seed.js
   ```
   *Default Admin Credentials:*
   - **Email**: `admin@omronics.com`
   - **Password**: `Password123!`

### Step 3: Install Dependencies
Install root backend dependencies:
```bash
npm install
```
Install frontend client dependencies:
```bash
cd client
npm install
cd ..
```

### Step 4: Configure Environment Variables
Copy `.env.example` to `.env` in the root folder and configure your MariaDB connection details and JWT secret.

### Step 5: Start Local Development Servers
Run backend (Port 5000) and frontend (Port 5173) simultaneously:
```bash
npm run dev
```

Visit the application at:
- **Public Portal**: `http://localhost:5173`
- **Admin Dashboard**: `http://localhost:5173/admin/login`

---

## 📦 Production Build & Deployment Guide

### Building Frontend Client Bundle
To compile and bundle the React SPA for production deployment:
```bash
npm run build --prefix client
```
The output directory will be generated inside `client/dist`.

### Deployment Architecture
- **Vercel / Netlify (Frontend SPA)**: Build command: `npm run build --prefix client`, Output Directory: `client/dist`.
- **Render / Railway / DigitalOcean (Node.js Backend)**: Start command: `node server/server.js`.
- **Database (Cloud MariaDB / Aiven / PlanetScale)**: Ensure SSL connection string is configured in `.env`.

---

## 🛡️ Security, Performance & Maintenance

- **Password Security**: All admin passwords are salted and hashed using `bcryptjs` with 12 rounds.
- **JWT Protection**: Protected routes require a valid Bearer token in the `Authorization` header.
- **SQL Injection Prevention**: All queries use parameterized statements executed via `mysql2/promise`.
- **Input Validation**: HTTP request bodies are validated using strict Zod schemas before hitting business logic.
- **Rate Limiting**: IP rate limiters protect login and enquiry submission endpoints from brute-force attempts.
- **Database Auto-Migrations**: On server startup (`server.js`), schema modifications are safely applied without dropping existing operational data.

---

## 📜 License & Credits

Designed & Developed for **Omronics Motions and Control Pvt. Ltd.**  
All rights reserved © 2026 Omronics Industrial Automation.
