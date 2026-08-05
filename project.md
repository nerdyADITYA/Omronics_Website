# Industrial Corporate CMS
## Software Design Specification (SDS)

**Document Version:** 1.0

**Part:** 1

**Title:** Project Foundation & System Architecture

**Project Codename:** Industrial Corporate CMS

**Client Implementation:** Omronics

**Prepared By:** Aditya

---

# Document Purpose

This Software Design Specification (SDS) serves as the single source of truth for the complete development of the Industrial Corporate CMS.

This documentation is intended for:

- Software Developers
- AI Coding Assistants (Cursor, Claude Code, Windsurf, Cline, GitHub Copilot)
- Future Maintenance Developers
- Project Stakeholders

The objective of this document is to completely define the architecture, standards, modules, and implementation strategy before any development begins.

Every subsequent document in this series builds upon this foundation.

---

# 1. Project Overview

## Project Name

Industrial Corporate CMS

---

## Client

Omronics

---

## Project Type

Corporate Website with Dynamic Content Management System (CMS)

---

## Development Model

Monolithic Full Stack Web Application

Although the frontend and backend are developed independently, they are maintained within a single repository to simplify deployment, version control, and maintenance.

---

# 2. Project Vision

The objective of this project is **not** to build a website for a single company.

Instead, the objective is to develop a reusable Industrial Corporate CMS capable of powering websites for multiple industrial companies with minimal customization.

Future client implementations should only require changing:

- Company branding
- Product categories
- Products
- Services
- Industries
- Client logos
- Contact information

The underlying application architecture should remain unchanged.

---

# 3. Project Objectives

The system should:

- Provide a modern corporate website
- Showcase products dynamically
- Manage services
- Manage industries
- Display company clients
- Handle customer enquiries
- Allow administrators to manage all content
- Support SEO
- Be mobile responsive
- Be scalable
- Be reusable
- Follow clean architecture principles

---

# 4. Core Design Principles

The entire application must follow the following principles.

---

## 4.1 Modular Development

Every module must be completely independent.

Example:

Products should not directly depend upon Services.

Testimonials should not directly depend upon Products.

Each module should expose only its own API.

---

## 4.2 Single Responsibility Principle

Each file should have one responsibility.

Example

✔ ProductController

Handles HTTP requests only.

✔ ProductService

Contains business logic.

✔ ProductRepository

Contains database queries.

Do NOT mix these responsibilities.

---

## 4.3 Reusability

Components should be reusable.

Example

Instead of

```
ProductTable
```

Develop

```
DataTable
```

that can display

- Products
- Services
- Clients
- Industries

using configuration.

---

## 4.4 Scalability

The project should support future additions without modifying existing modules.

Example

Today

```
Products
```

Tomorrow

```
Projects

Case Studies

Blogs

News

Downloads
```

These modules should plug into the existing architecture.

---

## 4.5 Security First

Security should never be an afterthought.

Every endpoint requiring authentication must validate:

- JWT Token
- Token Expiry
- User Authorization

Passwords must never be stored in plain text.

---

## 4.6 Performance

Every design decision should prioritize performance.

Examples

- Lazy Loading
- Code Splitting
- Image Compression
- Database Indexing
- Pagination
- API Caching

---

# 5. Technology Stack

## Frontend

| Technology | Purpose |
|------------|----------|
| React | User Interface |
| Vite | Build Tool |
| React Router | Routing |
| Tailwind CSS | Styling |
| TanStack Query | Server State |
| Axios | API Communication |
| Framer Motion | Animations |
| React Hook Form | Forms |
| Zod | Validation |

---

## Backend

| Technology | Purpose |
|------------|----------|
| Node.js | Runtime |
| Express.js | REST API |
| JWT | Authentication |
| bcrypt | Password Hashing |
| Multer | File Upload |
| Sharp | Image Optimization |
| Nodemailer | Email Service |
| dotenv | Configuration |

---

## Database

MariaDB

---

## Deployment

Frontend

Vercel

Backend

Vercel Serverless Functions

Future

GoDaddy Domain

---

# 6. High-Level Architecture

```
                    Internet
                        │
                        │
             ┌────────────────────┐
             │   React Frontend   │
             └────────────────────┘
                        │
                HTTPS REST APIs
                        │
             ┌────────────────────┐
             │ Express Backend    │
             └────────────────────┘
                        │
              Business Services
                        │
             ┌────────────────────┐
             │ MariaDB Database   │
             └────────────────────┘
```

---

# 7. Application Architecture

The backend follows a layered architecture.

```
Request

↓

Route

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Response
```

No layer should bypass another layer.

Controllers must never directly query the database.

---

# 8. Project Modules

The application consists of the following modules.

## Public Website

- Home
- About
- Products
- Services
- Industries
- Clients
- Contact

---

## Admin Panel

- Dashboard
- Product Management
- Category Management
- Service Management
- Industry Management
- Client Management
- Testimonial Management
- Contact Enquiries

---

## Shared Modules

- Authentication
- File Upload
- SEO
- Email
- Search
- Logging
- Error Handling

---

# 9. Project Folder Structure

```
industrial-corporate-cms/

│

├── client/

├── server/

├── shared/

├── database/

├── docs/

├── public/

├── scripts/

├── .env

├── package.json

└── README.md
```

---

# 10. Frontend Architecture

```
client/

│

├── assets/

├── components/

│      common/

│      layout/

│      ui/

│      forms/

│      sections/

│

├── pages/

│      public/

│      admin/

│

├── hooks/

├── services/

├── context/

├── routes/

├── utils/

├── constants/

├── types/

└── styles/
```

---

# 11. Backend Architecture

```
server/

│

├── config/

├── controllers/

├── routes/

├── middlewares/

├── services/

├── repositories/

├── models/

├── validators/

├── uploads/

├── utils/

├── constants/

└── app.js
```

---

# 12. Coding Standards

## Naming Convention

Variables

```
camelCase
```

Functions

```
camelCase
```

React Components

```
PascalCase
```

Database Tables

```
snake_case
```

Database Columns

```
snake_case
```

Environment Variables

```
UPPER_CASE
```

---

# 13. API Standards

Every API must follow the same response format.

Success

```json
{
    "success": true,
    "message": "Operation completed successfully.",
    "data": {}
}
```

Failure

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": []
}
```

Never return inconsistent response structures.

---

# 14. Error Handling Strategy

Every error should pass through a centralized error handler.

Example

```
Validation Error

↓

Custom Error

↓

Error Middleware

↓

JSON Response
```

The frontend should never receive raw Node.js errors.

---

# 15. Logging Strategy

Log the following:

- Authentication
- File Uploads
- Database Errors
- API Errors
- Server Startup
- Email Failures

Do not log:

- Passwords
- JWT Secrets
- Environment Variables

---

# 16. Security Standards

The application must implement:

- JWT Authentication
- Password Hashing
- Input Validation
- SQL Injection Prevention
- CORS
- Helmet
- Rate Limiting
- Environment Variable Protection

---

# 17. Performance Standards

The application should satisfy the following goals.

Initial Load

< 2 seconds

API Response

< 300 ms

Image Loading

Lazy Loaded

Database Queries

Indexed

Pagination

Enabled

Caching

Enabled where applicable

---

# 18. Development Workflow

Development should follow the following sequence.

```
Database Design

↓

API Design

↓

Backend Development

↓

Frontend Development

↓

Testing

↓

Deployment
```

No frontend implementation should begin until the database schema and API contracts are finalized.

---

# 19. Out of Scope (Version 1)

The following features are intentionally excluded from the first release.

- Customer Login
- Payment Gateway
- E-commerce Checkout
- Inventory Management
- Order Management
- Multi-language Support
- Blog System
- AI Chatbot
- Dealer Portal
- ERP Integration
- WhatsApp Automation
- Push Notifications

These may be added in future versions without requiring major architectural changes.

---

# 20. Next Document

The next part of this Software Design Specification is:

**Part 2 – Complete Database Design**

It will include:

- Complete MariaDB Schema
- Entity Relationship Diagram (ERD)
- All Tables
- Every Column
- Primary Keys
- Foreign Keys
- Constraints
- Indexes
- Relationships
- Cascade Rules
- File Storage Strategy
- Normalization Decisions
- SQL DDL Scripts

# Industrial Corporate CMS
## Software Design Specification (SDS)

**Document Version:** 1.0

**Part:** 2

**Title:** Complete Database Design

**Database Engine:** MariaDB 11+

**Character Set:** utf8mb4

**Collation:** utf8mb4_unicode_ci

---

# 1. Database Design Philosophy

The database has been designed using the following principles.

- Third Normal Form (3NF)
- Modular Architecture
- Scalable Design
- Soft Delete Support
- Audit Tracking
- SEO Friendly
- High Performance
- Future Extensibility

This database is designed as a reusable CMS backend rather than a one-time website database.

---

# 2. Entity Relationship Overview

```text
Admins
    │
    ├──────────────┐
    │              │
    ▼              ▼
Products       Categories
    │
    ├──────────────┐
    ▼              ▼
Product Images   Product Documents

Services

Industries

Clients

Testimonials

Enquiries

Website Settings
```

---

# 3. Database Tables

```
admins

categories

products

product_images

product_documents

services

industries

clients

testimonials

enquiries

website_settings
```

---

# 4. Common Column Standards

Every content table must include these columns.

| Column | Type | Description |
|----------|---------|------------|
| id | BIGINT | Primary Key |
| status | ENUM | ACTIVE / INACTIVE |
| sort_order | INT | Display Order |
| created_at | TIMESTAMP | Creation Time |
| updated_at | TIMESTAMP | Last Update |
| deleted_at | TIMESTAMP NULL | Soft Delete |

---

# 5. Admins Table

Purpose

Stores administrator accounts.

```sql
admins

id BIGINT PK

full_name VARCHAR(150)

email VARCHAR(150)

password_hash VARCHAR(255)

phone VARCHAR(20)

last_login DATETIME

status ENUM('ACTIVE','INACTIVE')

created_at

updated_at
```

---

Indexes

```
PRIMARY KEY(id)

UNIQUE(email)
```

---

# 6. Categories Table

Purpose

Stores all product categories.

Examples

- Servo Cables

- Relay Cards

- Ethernet Patch Cables

- Servo Connectors

```sql
categories

id BIGINT PK

name VARCHAR(150)

slug VARCHAR(200)

short_description TEXT

description LONGTEXT

banner_image VARCHAR(500)

thumbnail_image VARCHAR(500)

seo_title VARCHAR(255)

seo_description TEXT

sort_order INT

status ENUM('ACTIVE','INACTIVE')

created_at

updated_at

deleted_at
```

---

Indexes

```
PRIMARY KEY(id)

UNIQUE(slug)

INDEX(status)

INDEX(sort_order)
```

---

# 7. Products Table

Purpose

Stores all products.

Each product belongs to exactly one category.

```sql
products

id BIGINT PK

category_id BIGINT FK

product_name VARCHAR(255)

slug VARCHAR(255)

model_number VARCHAR(100)

short_description TEXT

description LONGTEXT

features LONGTEXT

specifications LONGTEXT

applications LONGTEXT

thumbnail_image VARCHAR(500)

datasheet_available BOOLEAN

featured BOOLEAN

status ENUM('ACTIVE','INACTIVE')

sort_order INT

seo_title VARCHAR(255)

seo_description TEXT

created_at

updated_at

deleted_at
```

---

Relationship

```
Category

1

↓

Many

Products
```

---

Foreign Key

```
category_id

↓

categories.id
```

---

Indexes

```
INDEX(category_id)

INDEX(status)

INDEX(featured)

INDEX(slug)
```

---

# 8. Product Images Table

Purpose

Stores multiple images for each product.

```sql
product_images

id BIGINT PK

product_id BIGINT FK

image_url VARCHAR(500)

alt_text VARCHAR(255)

display_order INT

created_at
```

---

Relationship

```
Product

1

↓

Many

Images
```

---

# 9. Product Documents Table

Purpose

Stores downloadable files.

Examples

- PDF Catalogue

- Datasheet

- Technical Drawing

```sql
product_documents

id BIGINT PK

product_id BIGINT FK

document_name VARCHAR(255)

document_url VARCHAR(500)

document_type ENUM

display_order INT

created_at
```

Document Types

```
PDF

CATALOGUE

DATASHEET

MANUAL

DRAWING

CERTIFICATE
```

---

# 10. Services Table

Purpose

Stores company services.

Examples

Electrical Panel Manufacturing

Machine Retrofitting

SCADA

Industry 4.0

```sql
services

id BIGINT PK

service_name VARCHAR(200)

slug VARCHAR(200)

short_description TEXT

description LONGTEXT

banner_image VARCHAR(500)

thumbnail_image VARCHAR(500)

seo_title VARCHAR(255)

seo_description TEXT

sort_order INT

status ENUM

created_at

updated_at

deleted_at
```

---

# 11. Industries Table

Purpose

Stores industries served.

Examples

Manufacturing

Energy

Process Plants

```sql
industries

id BIGINT PK

industry_name VARCHAR(200)

slug VARCHAR(200)

description LONGTEXT

banner_image VARCHAR(500)

thumbnail_image VARCHAR(500)

seo_title VARCHAR(255)

seo_description TEXT

sort_order INT

status ENUM

created_at

updated_at

deleted_at
```

---

# 12. Clients Table

Purpose

Stores client information.

```sql
clients

id BIGINT PK

client_name VARCHAR(255)

logo_url VARCHAR(500)

website_url VARCHAR(255)

description TEXT

sort_order INT

status ENUM

created_at

updated_at
```

---

# 13. Testimonials Table

Purpose

Stores customer testimonials.

```sql
testimonials

id BIGINT PK

customer_name VARCHAR(150)

company_name VARCHAR(150)

designation VARCHAR(150)

photo VARCHAR(500)

rating INT

review LONGTEXT

display_order INT

status ENUM

created_at

updated_at
```

---

# 14. Enquiries Table

Purpose

Stores all customer enquiries.

This is the most important business table because every lead generated from the website is stored here.

```sql
enquiries

id BIGINT PK

source_type ENUM

reference_id BIGINT NULL

customer_name VARCHAR(150)

company_name VARCHAR(200)

email VARCHAR(150)

phone VARCHAR(30)

city VARCHAR(100)

country VARCHAR(100)

subject VARCHAR(255)

requirement LONGTEXT

attachment VARCHAR(500)

status ENUM

remarks LONGTEXT

created_at

updated_at
```

---

## Source Types

```
CONTACT

PRODUCT

SERVICE

INDUSTRY
```

---

## Status

```
NEW

CONTACTED

IN_PROGRESS

COMPLETED

CLOSED
```

---

Example

```
Customer opens

Servo Cable

↓

Clicks

Request Quote

↓

Creates

source_type = PRODUCT

reference_id = 14
```

The sales team immediately knows which product generated the enquiry.

---

# 15. Website Settings Table

Purpose

Stores global website configuration.

Only one record should exist.

```sql
website_settings

id BIGINT PK

company_name

company_email

support_email

phone

alternate_phone

address

google_maps_embed

facebook_url

instagram_url

linkedin_url

youtube_url

meta_title

meta_description

logo

favicon

created_at

updated_at
```

---

# 16. File Storage Strategy

Files will NOT be stored inside MariaDB.

MariaDB stores only file paths.

```
Database

↓

/uploads/products/image1.webp

↓

Actual File

↓

Object Storage / Local Storage
```

Supported Files

Images

```
jpg

jpeg

png

webp
```

Documents

```
pdf
```

---

# 17. Data Relationships

```
Categories

1

↓

∞

Products

↓

1

↓

∞

Product Images

↓

1

↓

∞

Product Documents
```

---

No direct relationship exists between

- Services

- Industries

- Clients

- Testimonials

These modules remain independent.

---

# 18. Soft Delete Strategy

Content should never be permanently deleted.

Instead

```
deleted_at = current_timestamp
```

The application filters records where

```
deleted_at IS NULL
```

Benefits

- Recovery

- Audit

- Safety

---

# 19. Naming Standards

Tables

```
snake_case

plural
```

Examples

```
product_images

website_settings

contact_enquiries
```

Columns

```
snake_case
```

Examples

```
created_at

updated_at

category_id

product_name
```

---

# 20. Database Indexing Strategy

Indexes should be created on

Products

```
category_id

slug

status

featured
```

Categories

```
slug

status
```

Services

```
slug

status
```

Industries

```
slug

status
```

Enquiries

```
email

phone

status

created_at
```

---

# 21. Database Constraints

- Every product must belong to one category.
- Category deletion is blocked while products reference it.
- Product deletion cascades to images and documents (soft delete preferred at the application layer).
- Slugs must be unique within each entity.
- Email addresses in enquiries are optional only if a phone number is provided.
- Rating in testimonials must be between **1 and 5**.
- `website_settings` should contain only a single active record.

---

# 22. Future Expansion

The schema is intentionally designed to accommodate future modules without structural changes, such as:

- Blogs
- News
- Careers
- Downloads
- Certifications
- Case Studies
- Team Members
- Awards
- Multi-language content
- Role-based permissions

These additions can be introduced as new tables linked to the existing architecture without modifying the current schema.

---

# Part 3 Preview

The next document is **Part 3 – Backend Architecture**, which will define:

- Complete Express.js folder structure
- Controller layer
- Service layer
- Repository layer
- Middleware architecture
- Validation strategy
- Error handling
- Dependency flow
- Coding standards
- Project bootstrapping
- Configuration management

# Industrial Corporate CMS
## Software Design Specification (SDS)

**Version:** 1.0

**Part:** 3

**Title:** Backend Architecture & Implementation Design

**Technology Stack**

- Node.js
- Express.js
- MariaDB
- JWT
- bcrypt
- Multer
- Sharp
- Nodemailer

---

# 1. Backend Philosophy

The backend should **NOT** be developed as a collection of Express routes.

Instead, it should follow a layered architecture inspired by enterprise applications.

Every layer should have only one responsibility.

```
HTTP Request

↓

Route

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Repository

↓

Service

↓

Controller

↓

HTTP Response
```

No layer should skip another layer.

For example,

A Controller should never directly execute SQL queries.

---

# 2. Backend Folder Structure

```
server/

│

├── app.js
├── server.js
│
├── config/
│      database.js
│      jwt.js
│      mail.js
│      multer.js
│      app.js
│
├── routes/
│      index.routes.js
│      auth.routes.js
│      category.routes.js
│      product.routes.js
│      service.routes.js
│      industry.routes.js
│      client.routes.js
│      testimonial.routes.js
│      enquiry.routes.js
│      upload.routes.js
│      settings.routes.js
│
├── controllers/
│      auth.controller.js
│      category.controller.js
│      product.controller.js
│      service.controller.js
│      industry.controller.js
│      client.controller.js
│      testimonial.controller.js
│      enquiry.controller.js
│      upload.controller.js
│      settings.controller.js
│
├── services/
│      auth.service.js
│      category.service.js
│      product.service.js
│      service.service.js
│      industry.service.js
│      client.service.js
│      testimonial.service.js
│      enquiry.service.js
│      upload.service.js
│      settings.service.js
│
├── repositories/
│      auth.repository.js
│      category.repository.js
│      product.repository.js
│      service.repository.js
│      industry.repository.js
│      client.repository.js
│      testimonial.repository.js
│      enquiry.repository.js
│      upload.repository.js
│      settings.repository.js
│
├── middlewares/
│      auth.middleware.js
│      validation.middleware.js
│      upload.middleware.js
│      error.middleware.js
│      logger.middleware.js
│      rateLimiter.middleware.js
│
├── validators/
│      auth.validator.js
│      category.validator.js
│      product.validator.js
│      service.validator.js
│      industry.validator.js
│      client.validator.js
│      testimonial.validator.js
│      enquiry.validator.js
│
├── utils/
│      response.js
│      pagination.js
│      slug.js
│      logger.js
│      email.js
│      image.js
│
├── constants/
│      status.js
│      roles.js
│      messages.js
│
├── uploads/
│
└── sql/
```

---

# 3. Layer Responsibilities

---

## Routes

Responsibilities

- Register API endpoints
- Apply middleware
- Call controller

Routes must contain **NO BUSINESS LOGIC**.

Example

```javascript
router.post(
    "/",
    verifyToken,
    validateProduct,
    ProductController.create
);
```

---

## Controllers

Responsibilities

- Receive Request
- Validate Request
- Call Service
- Return Response

Controllers must never

- Execute SQL
- Send Emails
- Upload Files
- Hash Passwords

Example

```text
Request

↓

Controller

↓

ProductService

↓

Response
```

---

## Services

The Service Layer contains the business logic.

Examples

- Create Product

- Update Product

- Generate Slug

- Resize Images

- Send Email

- Validate Business Rules

Services are the heart of the application.

---

## Repository

Repository handles database operations.

Examples

```
SELECT

INSERT

UPDATE

DELETE
```

Repositories should return only data.

No business logic should exist here.

---

## Validators

Every API request should be validated before reaching the controller.

Examples

```
Create Product

Update Product

Login

Create Category
```

Validation includes

- Required Fields
- Length
- Email
- Phone
- File Types
- File Size

---

## Middleware

Middleware should be reusable.

Examples

Authentication

Rate Limiting

Error Handling

Logging

Request Validation

File Upload

---

# 4. Application Bootstrap

```
server.js

↓

Load Environment Variables

↓

Connect Database

↓

Initialize Express

↓

Register Middleware

↓

Register Routes

↓

Start Server
```

---

# 5. Express Application Structure

```
server.js

↓

app.js

↓

Middlewares

↓

Routes

↓

Controllers

↓

Services

↓

Repositories

↓

MariaDB
```

---

# 6. Route Organization

```
/api

│

├── auth

├── categories

├── products

├── services

├── industries

├── clients

├── testimonials

├── enquiries

├── uploads

└── settings
```

Every module should own its routes.

---

# 7. Configuration Management

Never hardcode values.

Everything should come from `.env`.

Example

```
PORT

JWT_SECRET

JWT_EXPIRES_IN

DB_HOST

DB_PORT

DB_NAME

DB_USER

DB_PASSWORD

EMAIL_HOST

EMAIL_PORT

EMAIL_USER

EMAIL_PASSWORD
```

---

# 8. Database Connection

Create a single reusable database connection.

```
config/database.js

↓

Connection Pool

↓

Repositories
```

The entire application should use a single pool.

Never create multiple database connections.

---

# 9. Response Structure

Every API response should follow the same format.

Success

```json
{
    "success": true,
    "message": "Product created successfully.",
    "data": {}
}
```

Failure

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": []
}
```

---

# 10. Exception Flow

```
Request

↓

Controller

↓

Service

↓

Repository

↓

Database Error

↓

Service

↓

Throw Custom Error

↓

Error Middleware

↓

JSON Response
```

---

# 11. Business Rules

Product

- Must belong to one category.
- Slug must be unique.
- Product name cannot be duplicated within the same category.
- At least one product image is recommended.
- Product can have multiple PDF documents.
- Soft delete should be used.

---

Category

- Name must be unique.
- Slug must be unique.
- Cannot be deleted while active products exist.

---

Services

- Name must be unique.
- Slug must be unique.

---

Industries

- Name must be unique.

---

Testimonials

- Rating between 1 and 5.
- Hidden testimonials remain in the database.

---

Enquiries

- Every enquiry receives default status `NEW`.
- Product enquiries must reference a valid product.
- Contact form enquiries use `CONTACT` as the source type.

---

# 12. Pagination Standard

Every listing endpoint should support pagination.

Example

```
?page=1

&limit=10

&search=servo

&sort=name

&order=asc
```

Response

```json
{
    "success": true,
    "data": [],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 145,
        "totalPages": 15
    }
}
```

---

# 13. Filtering Standard

Products

- Category
- Search
- Featured
- Status

Services

- Search
- Status

Industries

- Search
- Status

Clients

- Search

Enquiries

- Status
- Date
- Search

---

# 14. Search Strategy

Search should support

```
LIKE '%keyword%'
```

Fields

Products

- Name
- Model Number
- Description

Categories

- Name

Services

- Name

Industries

- Name

Clients

- Name

---

# 15. File Upload Flow

```
Request

↓

Multer

↓

Validation

↓

Sharp

↓

Storage

↓

Database

↓

Response
```

Supported Images

```
jpg

jpeg

png

webp
```

Supported Documents

```
pdf
```

---

# 16. Logging Strategy

Log

- Login
- Logout
- Failed Login
- API Errors
- Database Errors
- Email Errors
- Upload Errors

Do not log

- Passwords
- JWT Tokens
- Secrets

---

# 17. Error Codes

```
400

Validation Error

401

Unauthorized

403

Forbidden

404

Not Found

409

Duplicate Record

422

Business Validation Failed

500

Internal Server Error
```

---

# 18. Environment Variables

```
APP_NAME=

NODE_ENV=

PORT=

DB_HOST=

DB_PORT=

DB_DATABASE=

DB_USERNAME=

DB_PASSWORD=

JWT_SECRET=

JWT_EXPIRES_IN=

EMAIL_HOST=

EMAIL_PORT=

EMAIL_USERNAME=

EMAIL_PASSWORD=

UPLOAD_PATH=
```

---

# 19. Code Standards

Every function should

- Perform one task only.
- Return early on validation failures.
- Throw custom errors instead of generic errors.
- Never catch and ignore exceptions.
- Be fully documented with JSDoc comments.

---

# 20. Dependency Rules

Allowed dependency flow:

```
Routes
    ↓
Controllers
    ↓
Services
    ↓
Repositories
    ↓
Database
```

Forbidden dependency flow:

- Controller → Database
- Route → Service
- Service → Express Response
- Repository → HTTP Request

Keeping these boundaries strict ensures maintainability and testability.

---

# 21. Backend Completion Checklist

- Express application initialized
- Environment configuration loaded
- MariaDB connection pool configured
- Modular routing established
- Controllers implemented
- Services implemented
- Repositories implemented
- Validation layer implemented
- Centralized error handling added
- JWT middleware added
- Logging enabled
- File upload pipeline configured
- Standard API responses implemented
- Pagination and filtering supported
- Soft delete respected across repositories

---

# Part 4 Preview

The next document, **Part 4 – Authentication & Security**, will cover:

- JWT architecture
- Login flow
- Token generation and validation
- Route protection
- Password hashing with bcrypt
- Refresh token strategy (or justification for omitting it)
- Role and permission model
- Security middleware
- CORS, Helmet, rate limiting
- Authentication sequence diagrams
- API contracts for login, logout, and token verification

# Industrial Corporate CMS
## Software Design Specification (SDS)

**Version:** 1.0

**Part:** 4

**Title:** Authentication & Security Architecture

**Module Version:** 1.0

---

# 1. Authentication Overview

The Industrial Corporate CMS contains only one type of authenticated user.

```
Administrator
```

There are **NO**

- Customer Accounts
- Dealer Accounts
- Employee Accounts
- Public User Accounts

The public website is accessible without authentication.

Authentication is required only for the Admin Portal.

---

# 2. Authentication Goals

The authentication system should:

- Secure the Admin Panel
- Protect all admin APIs
- Prevent unauthorized access
- Secure passwords
- Secure API requests
- Protect against common attacks
- Maintain user sessions
- Support future Role Based Access Control (RBAC)

---

# 3. Authentication Flow

```
Administrator

↓

Login Page

↓

Enter Credentials

↓

POST /api/auth/login

↓

Validate Credentials

↓

Generate JWT

↓

Return Token

↓

Store Token

↓

Authenticated Requests

↓

Verify JWT Middleware

↓

Protected API

↓

Response
```

---

# 4. Authentication Architecture

```
Frontend

↓

Axios

↓

Authorization Header

↓

JWT Middleware

↓

Controller

↓

Service

↓

Repository

↓

MariaDB
```

---

# 5. Login Flow

```
Admin

↓

Enter Email

↓

Enter Password

↓

POST /api/auth/login

↓

Validation

↓

Find Admin

↓

Compare Password

↓

Generate JWT

↓

Return JWT

↓

Save Token

↓

Redirect Dashboard
```

---

# 6. Logout Flow

```
Dashboard

↓

Logout Button

↓

Remove JWT

↓

Remove User Session

↓

Redirect Login
```

No server-side logout is required because JWT is stateless.

Future versions may implement a token blacklist if needed.

---

# 7. Password Storage

Passwords must NEVER be stored in plain text.

Passwords must be hashed using

```
bcrypt
```

Recommended

```
Salt Rounds = 12
```

Database Example

```
$2b$12$8fgV0....
```

---

# 8. Login Validation Rules

Email

- Required
- Valid Email Format
- Maximum 150 Characters

Password

- Required
- Minimum 8 Characters
- Maximum 100 Characters

---

# 9. Password Policy

Passwords should contain

✔ Uppercase

✔ Lowercase

✔ Number

✔ Special Character

Minimum Length

```
8
```

Recommended

```
12+
```

---

# 10. JWT Configuration

Algorithm

```
HS256
```

Payload

```json
{
    "id": 1,
    "email": "admin@omronics.com",
    "role": "ADMIN"
}
```

Expiry

```
12 Hours
```

Secret

```
JWT_SECRET
```

Stored in

```
.env
```

---

# 11. JWT Storage

Frontend should store JWT in

```
HTTP Only Cookie (Preferred)
```

If cookies are not used,

Store inside

```
Memory

or

Session Storage
```

Do NOT store JWT inside Local Storage unless absolutely necessary.

---

# 12. Authorization Header

Every protected request

```
Authorization

Bearer <JWT>
```

Example

```
Authorization:

Bearer eyJhbGciOiJIUzI1Ni...
```

---

# 13. JWT Middleware Flow

```
Incoming Request

↓

Authorization Header

↓

Missing?

↓

401

↓

Extract Token

↓

Verify Token

↓

Invalid?

↓

401

↓

Expired?

↓

401

↓

Attach User

↓

Next()
```

---

# 14. Route Protection

Public Routes

```
/

about

products

services

industries

clients

contact

downloads
```

Protected Routes

```
/api/products

/api/categories

/api/services

/api/industries

/api/clients

/api/testimonials

/api/uploads

/api/settings

/api/enquiries

/api/auth/profile
```

---

# 15. Authentication APIs

---

## Login

```
POST

/api/auth/login
```

Request

```json
{
    "email":"admin@omronics.com",
    "password":"Password123!"
}
```

Success

```json
{
    "success":true,
    "message":"Login successful.",
    "data":{
        "token":"JWT_TOKEN",
        "user":{
            "id":1,
            "name":"Administrator",
            "email":"admin@omronics.com"
        }
    }
}
```

Errors

```
400 Validation

401 Invalid Credentials

500 Server Error
```

---

## Get Profile

```
GET

/api/auth/profile
```

Authentication Required

Returns

```json
{
    "id":1,
    "name":"Administrator",
    "email":"admin@omronics.com"
}
```

---

## Change Password

```
PUT

/api/auth/change-password
```

Request

```json
{
    "currentPassword":"OldPassword",
    "newPassword":"NewPassword123!"
}
```

Validation

- Current Password Correct
- Password Policy
- Password Confirmation

---

## Verify Token

```
GET

/api/auth/verify
```

Purpose

Check whether token is still valid.

Returns

```
200

Authenticated
```

or

```
401

Expired
```

---

# 16. Middleware Structure

```
verifyToken()

↓

Extract Token

↓

Verify JWT

↓

Load User

↓

Attach req.user

↓

Next()
```

Example

```javascript
req.user = {
    id:1,
    email:"admin@omronics.com",
    role:"ADMIN"
}
```

---

# 17. Password Reset

Version 1

```
Manual Reset Only
```

Reason

Only one administrator account exists.

Forgot Password functionality is intentionally excluded.

Future versions may support

- OTP

- Email Reset Link

- Token Reset

---

# 18. Session Management

Session expires when

```
JWT Expired
```

or

```
Logout
```

When expired

Frontend automatically redirects

```
Dashboard

↓

Login
```

---

# 19. Account Lock Strategy

To prevent brute-force attacks

After

```
5 Failed Attempts
```

Lock account for

```
15 Minutes
```

Database Fields

```
failed_login_attempts

locked_until
```

---

# 20. Security Middleware

Application should use

Helmet

```
helmet()
```

CORS

```
cors()
```

Compression

```
compression()
```

Rate Limiter

```
express-rate-limit
```

Request Logger

```
morgan
```

---

# 21. CORS Policy

Allowed Origins

Development

```
http://localhost:5173
```

Production

```
https://omronics.in
```

Methods

```
GET

POST

PUT

PATCH

DELETE
```

Headers

```
Authorization

Content-Type
```

---

# 22. Rate Limiting

Login API

```
5 Requests

per Minute

per IP
```

General APIs

```
100 Requests

per Minute
```

---

# 23. Security Headers

Enable

```
X-Frame-Options

DENY
```

```
X-Content-Type-Options

nosniff
```

```
Content-Security-Policy
```

```
Referrer-Policy
```

```
Permissions-Policy
```

---

# 24. Input Validation

Validate

Email

Phone

Password

URLs

Integers

Files

Image Types

File Size

Reject

```
HTML

JavaScript

SQL Injection

Malformed JSON
```

---

# 25. SQL Injection Prevention

Never build queries like

```javascript
"SELECT * FROM admins WHERE email='" + email + "'"
```

Always use

Prepared Statements

Parameterized Queries

Repository Layer

---

# 26. XSS Prevention

Escape

```
HTML

JavaScript

SVG
```

Sanitize

```
Descriptions

Testimonials

Messages
```

---

# 27. CSRF Protection

If JWT is stored in HTTP-only cookies

Enable

```
CSRF Protection
```

If JWT is passed only in Authorization headers

CSRF protection is not required because cookies are not used for authentication.

---

# 28. File Upload Security

Allowed Images

```
jpg

jpeg

png

webp
```

Allowed Documents

```
pdf
```

Reject

```
exe

js

php

bat

zip

rar

iso
```

Maximum Image Size

```
5 MB
```

Maximum PDF Size

```
15 MB
```

All uploaded filenames should be replaced with unique generated names.

---

# 29. Audit Logging

Log

```
Successful Login

Failed Login

Password Change

Create

Update

Delete

Upload

Authentication Failure
```

Example

```
2026-08-05 10:15:20

ADMIN

LOGIN SUCCESS

IP

192.168.1.10
```

---

# 30. Future RBAC

Although Version 1 supports only one administrator role, the authentication system should be designed to support future Role-Based Access Control without major refactoring.

Possible roles:

```
SUPER_ADMIN

ADMIN

EDITOR

CONTENT_MANAGER

VIEWER
```

The JWT payload and authorization middleware should already be structured so these roles can be introduced later.

---

# 31. Security Checklist

- Passwords hashed using bcrypt
- JWT authentication enabled
- Centralized authentication middleware
- Authorization header validation
- Prepared SQL statements
- Input validation
- File upload restrictions
- Rate limiting
- Helmet security headers
- CORS configured
- Account lockout after repeated failures
- Audit logging enabled
- Environment secrets isolated in `.env`
- No sensitive data exposed in API responses

---

# Part 5 Preview

**Part 5 – Complete REST API Specification** will define every endpoint in the system, including:

- URI structure
- HTTP methods
- Request parameters
- Request body schemas
- Validation rules
- Success responses
- Error responses
- Pagination
- Filtering
- Search
- Upload APIs
- Authentication requirements
- API versioning conventions

This document will serve as the complete API contract between the frontend and backend teams.

# Industrial Corporate CMS
## Software Design Specification (SDS)

**Version:** 1.0

**Part:** 5

**Title:** Complete REST API Specification

---

# 1. API Overview

The backend exposes a RESTful API that serves both the public website and the admin panel.

## Base URL

Development

```
http://localhost:5000/api
```

Production

```
https://api.omronics.in/api
```

---

# API Version

```
v1
```

All endpoints should follow

```
/api/v1/...
```

Example

```
/api/v1/products
```

---

# Authentication

Public APIs

```
No Authentication Required
```

Admin APIs

```
JWT Authentication Required
```

Header

```
Authorization: Bearer <TOKEN>
```

---

# Standard API Response

Success

```json
{
    "success": true,
    "message": "Operation completed successfully.",
    "data": {}
}
```

Error

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": []
}
```

---

# HTTP Status Codes

| Code | Meaning |
|-------|----------|
|200|Success|
|201|Created|
|204|Deleted|
|400|Validation Error|
|401|Unauthorized|
|403|Forbidden|
|404|Not Found|
|409|Duplicate Record|
|422|Business Rule Failed|
|500|Internal Server Error|

---

# API Modules

```
Authentication

Categories

Products

Services

Industries

Clients

Testimonials

Enquiries

Uploads

Website Settings
```

---

# 2. Authentication APIs

---

## Login

```
POST

/api/v1/auth/login
```

Authentication

```
Public
```

Request

```json
{
    "email":"admin@omronics.com",
    "password":"Password123!"
}
```

Success

```json
{
    "success":true,
    "message":"Login successful.",
    "data":{
        "token":"JWT",
        "user":{
            "id":1,
            "name":"Administrator",
            "email":"admin@omronics.com"
        }
    }
}
```

---

## Get Profile

```
GET

/api/v1/auth/profile
```

Authentication

```
JWT Required
```

---

## Verify Token

```
GET

/api/v1/auth/verify
```

---

## Change Password

```
PUT

/api/v1/auth/change-password
```

Request

```json
{
    "currentPassword":"OldPassword",
    "newPassword":"NewPassword123!"
}
```

---

# 3. Category APIs

---

## Get All Categories

```
GET

/api/v1/categories
```

Query Parameters

```
?page=1

&limit=20

&search=

&status=ACTIVE
```

Response

```json
{
    "success":true,
    "data":[]
}
```

---

## Get Category By Slug

```
GET

/api/v1/categories/:slug
```

---

## Create Category

```
POST

/api/v1/categories
```

Authentication

```
JWT
```

Request

```json
{
    "name":"Servo Cables",
    "shortDescription":"",
    "description":"",
    "status":"ACTIVE"
}
```

---

## Update Category

```
PUT

/api/v1/categories/:id
```

---

## Delete Category

```
DELETE

/api/v1/categories/:id
```

Soft Delete

---

# 4. Product APIs

---

## Get Products

```
GET

/api/v1/products
```

Query Parameters

```
?page

limit

category

search

featured

status

sort

order
```

Example

```
GET

/products?page=1&limit=12&category=servo-cables
```

---

## Featured Products

```
GET

/featured-products
```

Returns

```
Homepage Featured Products
```

---

## Product Details

```
GET

/api/v1/products/:slug
```

Returns

- Product

- Images

- Documents

- Category

---

## Related Products

```
GET

/api/v1/products/:id/related
```

Returns

Products from same category.

---

## Create Product

```
POST

/api/v1/products
```

JWT Required

Request

```json
{
    "categoryId":1,
    "productName":"Servo Cable",
    "modelNumber":"ABC-100",
    "description":"",
    "features":"",
    "applications":"",
    "status":"ACTIVE"
}
```

---

## Update Product

```
PUT

/api/v1/products/:id
```

---

## Delete Product

```
DELETE

/api/v1/products/:id
```

Soft Delete

---

# 5. Service APIs

---

## List Services

```
GET

/api/v1/services
```

---

## Service Details

```
GET

/api/v1/services/:slug
```

---

## Create Service

```
POST

/api/v1/services
```

---

## Update Service

```
PUT

/api/v1/services/:id
```

---

## Delete Service

```
DELETE

/api/v1/services/:id
```

---

# 6. Industry APIs

---

## List Industries

```
GET

/api/v1/industries
```

---

## Industry Details

```
GET

/api/v1/industries/:slug
```

---

## Create Industry

```
POST

/api/v1/industries
```

---

## Update Industry

```
PUT

/api/v1/industries/:id
```

---

## Delete Industry

```
DELETE

/api/v1/industries/:id
```

---

# 7. Client APIs

---

## List Clients

```
GET

/api/v1/clients
```

---

## Create Client

```
POST

/api/v1/clients
```

---

## Update Client

```
PUT

/api/v1/clients/:id
```

---

## Delete Client

```
DELETE

/api/v1/clients/:id
```

---

# 8. Testimonial APIs

---

## List Testimonials

```
GET

/api/v1/testimonials
```

---

## Create Testimonial

```
POST

/api/v1/testimonials
```

---

## Update Testimonial

```
PUT

/api/v1/testimonials/:id
```

---

## Delete Testimonial

```
DELETE

/api/v1/testimonials/:id
```

---

# 9. Enquiry APIs

---

## Submit Contact Form

```
POST

/api/v1/enquiries
```

Authentication

```
Public
```

Request

```json
{
    "sourceType":"PRODUCT",
    "referenceId":10,
    "customerName":"John Doe",
    "companyName":"ABC Industries",
    "email":"john@example.com",
    "phone":"+91xxxxxxxxxx",
    "subject":"Need Servo Cable",
    "requirement":"Looking for 10 meter cable."
}
```

Server Actions

```
Save Enquiry

↓

Send Email

↓

Return Success
```

---

## List Enquiries

```
GET

/api/v1/enquiries
```

JWT Required

Filters

```
status

search

date

page

limit
```

---

## Get Single Enquiry

```
GET

/api/v1/enquiries/:id
```

---

## Update Status

```
PATCH

/api/v1/enquiries/:id/status
```

Request

```json
{
    "status":"CONTACTED"
}
```

---

## Add Internal Remark

```
PATCH

/api/v1/enquiries/:id/remark
```

---

## Delete Enquiry

```
DELETE

/api/v1/enquiries/:id
```

---

# 10. Upload APIs

---

## Upload Image

```
POST

/api/v1/uploads/image
```

JWT Required

Multipart

```
image
```

Response

```json
{
    "url":"/uploads/products/abc.webp"
}
```

---

## Upload PDF

```
POST

/ uploads/pdf
```

Multipart

```
pdf
```

---

## Delete File

```
DELETE

/uploads/:id
```

---

# 11. Website Settings APIs

---

## Get Website Settings

```
GET

/api/v1/settings
```

Public

Returns

Company Information

Logo

Footer

Social Links

SEO

---

## Update Website Settings

```
PUT

/api/v1/settings
```

JWT Required

---

# 12. Public Website APIs

Home Page

```
GET

/api/v1/home
```

Returns

- Hero

- Featured Products

- Featured Services

- Clients

- Testimonials

---

Search

```
GET

/api/v1/search
```

Query

```
?q=servo
```

Returns

```
Products

Services

Industries
```

---

Navigation

```
GET

/api/v1/navigation
```

Returns

Dynamic Menu

---

Footer

```
GET

/api/v1/footer
```

Returns

Company Information

Social Links

Quick Links

---

# 13. Pagination Standard

```
?page=1

&limit=10
```

Response

```json
{
    "pagination":{
        "page":1,
        "limit":10,
        "totalRecords":250,
        "totalPages":25
    }
}
```

---

# 14. Filtering Standard

Products

```
Category

Search

Featured

Status
```

Services

```
Search

Status
```

Industries

```
Search
```

Clients

```
Search
```

Enquiries

```
Status

Date

Search
```

---

# 15. API Validation Rules

Every POST/PUT/PATCH endpoint must validate:

- Required fields
- Maximum lengths
- Data types
- Email format
- Phone format
- File size
- File type
- Duplicate values where applicable

Validation errors return:

```json
{
    "success":false,
    "message":"Validation failed.",
    "errors":[
        {
            "field":"productName",
            "message":"Product name is required."
        }
    ]
}
```

---

# 16. API Naming Conventions

- Use plural nouns for collections (`/products`, `/services`)
- Use resource identifiers in the path (`/:id` or `/:slug`)
- Use `GET` for retrieval, `POST` for creation, `PUT` for full updates, `PATCH` for partial updates, and `DELETE` for soft deletion.
- Keep endpoints noun-based; avoid verbs in URLs except where the action is not CRUD (e.g., `/auth/login`).

---

# 17. API Versioning

All endpoints are versioned:

```
/api/v1/...
```

Future breaking changes will introduce:

```
/api/v2/...
```

without affecting existing clients.

---

# 18. API Completion Checklist

- Authentication APIs
- Category CRUD APIs
- Product CRUD APIs
- Service CRUD APIs
- Industry CRUD APIs
- Client CRUD APIs
- Testimonial CRUD APIs
- Enquiry APIs
- Upload APIs
- Website Settings APIs
- Public Homepage APIs
- Search API
- Navigation API
- Footer API
- Pagination
- Filtering
- Validation
- Standardized responses

---

# 19. Implementation Notes

- Public endpoints must never expose inactive or soft-deleted records.
- Admin endpoints should return additional metadata needed for management screens.
- All list endpoints should support pagination, filtering, and sorting.
- Slug-based endpoints are preferred for public-facing pages to improve SEO and readability.

---

# Part 6 Preview

**Part 6 – Frontend Architecture & Application Design** will define:

- React application structure
- Routing strategy
- Layout architecture
- Component hierarchy
- State management
- API service layer
- Custom hooks
- Protected admin routes
- Reusable UI components
- Page-level architecture
- Error boundaries
- Loading states
- Form handling strategy

# Industrial Corporate CMS
## Software Design Specification (SDS)

**Version:** 1.0

**Part:** 6

**Title:** Frontend Architecture & Application Design

**Frontend Stack**

- React 19
- Vite
- React Router
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- Axios
- Framer Motion
- Lucide Icons

---

# 1. Frontend Overview

The frontend should be developed as a **Single Page Application (SPA)** using React and Vite.

The frontend has two completely independent applications.

```
Public Website

AND

Admin Dashboard
```

Although they share the same React project, they should be logically separated.

---

# 2. Frontend Goals

The frontend should be

- Fast
- Responsive
- SEO Friendly
- Component Based
- Easy to Maintain
- Easy to Scale
- Accessible
- Mobile First

---

# 3. High Level Architecture

```
Browser

↓

React

↓

Pages

↓

Components

↓

Custom Hooks

↓

API Services

↓

Axios

↓

Express Backend

↓

MariaDB
```

---

# 4. Folder Structure

```
client/

│

├── public/

├── src/

│

├── assets/

│      images/

│      icons/

│      logos/

│

├── components/

│      common/

│      layout/

│      forms/

│      ui/

│      sections/

│      cards/

│      tables/

│      modals/

│

├── layouts/

│      PublicLayout.jsx

│      AdminLayout.jsx

│

├── pages/

│      public/

│

│           Home/

│           About/

│           Products/

│           ProductDetails/

│           Services/

│           ServiceDetails/

│           Industries/

│           IndustryDetails/

│           Clients/

│           Contact/

│           NotFound/

│

│      admin/

│

│           Dashboard/

│           Login/

│           Products/

│           Categories/

│           Services/

│           Industries/

│           Clients/

│           Testimonials/

│           Enquiries/

│           Settings/

│

├── routes/

├── hooks/

├── services/

├── context/

├── constants/

├── utils/

├── validations/

├── styles/

├── App.jsx

└── main.jsx
```

---

# 5. Layout Architecture

The project contains two layouts.

```
Public Layout

↓

Navbar

↓

Page

↓

Footer
```

```
Admin Layout

↓

Sidebar

↓

Header

↓

Content

↓

Footer
```

Layouts should never contain business logic.

---

# 6. Public Pages

```
Home

About

Products

Product Details

Services

Service Details

Industries

Industry Details

Clients

Contact

404
```

---

# 7. Admin Pages

```
Login

Dashboard

Categories

Products

Services

Industries

Clients

Testimonials

Enquiries

Website Settings
```

---

# 8. Navigation Structure

```
Home

About Us

Products

Services

Industries

Clients

Contact
```

Products

↓

Dynamic Categories

↓

Products

↓

Product Details

---

# 9. Routing

```
/

↓

Home
```

```
/about
```

```
/products
```

```
/products/:categorySlug
```

```
/products/:categorySlug/:productSlug
```

Example

```
/products/servo-cables/panasonic-servo-cable
```

Services

```
/services
```

```
/services/:slug
```

Industries

```
/industries
```

```
/industries/:slug
```

Clients

```
/clients
```

Contact

```
/contact
```

---

# 10. Admin Routes

```
/admin/login
```

```
/admin/dashboard
```

```
/admin/products
```

```
/admin/categories
```

```
/admin/services
```

```
/admin/industries
```

```
/admin/clients
```

```
/admin/testimonials
```

```
/admin/enquiries
```

```
/admin/settings
```

---

# 11. Protected Routes

Every Admin route must be protected.

Flow

```
Open Route

↓

JWT Available?

↓

No

↓

Redirect Login

↓

Yes

↓

Verify Token

↓

Valid

↓

Open Dashboard
```

---

# 12. Component Hierarchy

```
Page

↓

Section

↓

Component

↓

UI Component
```

Example

```
Home

↓

Featured Products Section

↓

Product Card

↓

Button
```

---

# 13. Component Library

## Layout Components

```
Navbar

Footer

Sidebar

Header

Container

Section

Page Banner
```

---

## UI Components

```
Button

Input

Textarea

Dropdown

Modal

Card

Badge

Loader

Toast

Pagination

Breadcrumb

Tabs

Accordion
```

---

## Form Components

```
Text Input

Email Input

Phone Input

Select

Multi Select

Rich Text Editor

Image Upload

PDF Upload
```

---

## Product Components

```
Category Card

Product Card

Product Gallery

Specification Table

PDF Downloads

Related Products

Product Filters
```

---

## Service Components

```
Service Card

Service Banner

Service Details
```

---

## Industry Components

```
Industry Card

Industry Details
```

---

## Client Components

```
Client Logo Slider

Client Card
```

---

## Testimonial Components

```
Review Card

Rating

Carousel
```

---

# 14. State Management

Global State

```
Authentication

Website Settings

Theme

Navigation
```

Server State

```
TanStack Query
```

Local State

```
useState
```

---

# 15. API Layer

Every module gets its own API service.

```
services/

auth.service.js

product.service.js

category.service.js

service.service.js

industry.service.js

client.service.js

testimonial.service.js

enquiry.service.js

upload.service.js

settings.service.js
```

Each service only communicates with its own backend module.

---

# 16. Custom Hooks

```
useAuth()

useProducts()

useCategories()

useServices()

useIndustries()

useClients()

useTestimonials()

useEnquiries()

useUpload()

usePagination()

useSearch()
```

Custom hooks should encapsulate all React Query logic.

---

# 17. Form Architecture

Every form follows the same pattern.

```
React Hook Form

↓

Zod Validation

↓

Submit

↓

API

↓

Toast

↓

Reset Form
```

No page should implement validation manually.

---

# 18. Loading States

Every page should support

```
Loading

Empty

Success

Error
```

Example

```
Products

↓

Loading Spinner

↓

Products Loaded

↓

Display Grid
```

---

# 19. Error Handling

Every page should gracefully handle

- API Failure
- Network Failure
- Unauthorized Access
- Empty Data
- Invalid Route

The user should never see raw JavaScript errors.

---

# 20. Search Architecture

Search Bar

↓

Debounce (300–500 ms)

↓

API Request

↓

Results

Search should work for

- Products
- Categories
- Services
- Industries

---

# 21. Responsive Design

Breakpoints

```
Mobile

0–767px
```

```
Tablet

768–1023px
```

```
Desktop

1024px+
```

Every component must be responsive.

---

# 22. Image Strategy

Images should be

- Lazy Loaded
- Responsive
- Optimized
- WebP Preferred

Product Gallery should support

- Zoom
- Thumbnail Navigation
- Full Screen Preview

---

# 23. Public Page Data Flow

```
Page Loads

↓

React Query

↓

API Call

↓

Cache

↓

Render

↓

Background Refresh
```

---

# 24. Admin Data Flow

```
Open Module

↓

Fetch Data

↓

Display Table

↓

Create / Update

↓

Invalidate Query

↓

Refresh List
```

---

# 25. Notification Strategy

Use Toast notifications.

Success

```
Product Created

Category Updated

Image Uploaded
```

Errors

```
Validation Error

Upload Failed

Server Error
```

---

# 26. Reusable Table Component

Instead of creating separate tables for every module, build one configurable component.

Capabilities

- Pagination
- Search
- Sorting
- Status Badge
- Action Buttons
- Bulk Selection (future)
- Responsive Layout

This component should power Products, Categories, Services, Clients, Testimonials, and Enquiries.

---

# 27. Accessibility

Ensure

- Keyboard navigation
- Visible focus states
- Proper labels
- Semantic HTML
- Alt text for images
- Sufficient color contrast

---

# 28. Performance

- Lazy-load page routes
- Code split by route
- Cache API responses with TanStack Query
- Optimize images
- Minimize unnecessary re-renders
- Memoize expensive components where appropriate

---

# 29. Frontend Completion Checklist

- Public Layout
- Admin Layout
- Routing
- Protected Routes
- API Service Layer
- Custom Hooks
- Reusable Components
- Form Validation
- Responsive Design
- Loading States
- Error Handling
- Search
- Pagination
- Image Optimization
- Toast Notifications
- Accessibility

---

# 30. Next Document

**Part 7 – UI/UX Design System & Component Library**

It will define:

- Design language
- Color palette
- Typography
- Spacing system
- Iconography
- Buttons
- Forms
- Cards
- Tables
- Modals
- Navigation
- Animations
- Glassmorphism effects
- Hero sections
- Product cards
- Admin dashboard styling
- Responsive behavior
- Reusable design tokens

This document will establish a consistent visual identity for both the public website and the admin panel.

# Frontend Animation & 3D Experience

## Animation Philosophy

Animations should enhance the user experience rather than distract from it.

The website should feel:

- Premium
- Modern
- Industrial
- Smooth
- Responsive
- Professional

Animations should be subtle, fast, and meaningful.

Avoid excessive motion that slows down the website or affects usability.

---

# Animation Libraries

The frontend will use the following animation libraries.

| Library | Purpose |
|----------|----------|
| AnimeJS | High-performance UI animations, page transitions, counters, timelines, hover effects |
| Three.js | Interactive 3D scenes and industrial visualizations |
| Framer Motion | React component animations, route transitions, entrance/exit animations |

Each library has a distinct responsibility.

---

# AnimeJS Responsibilities

AnimeJS will be responsible for:

- Hero text animations
- Button hover animations
- Card hover effects
- Number counters
- Timeline animations
- Scroll-triggered content reveals
- Staggered list animations
- Loading animations
- Progress indicators
- Smooth micro-interactions

AnimeJS should not be used for 3D rendering.

---

# Three.js Responsibilities

Three.js will be used to create immersive visual experiences.

Possible use cases include:

- Interactive hero section
- Animated industrial cable models
- Floating electronics components
- PCB-inspired background elements
- Particle systems
- Animated wireframe grids
- Rotating connector assemblies
- Abstract industrial environments
- Camera parallax effects
- Mouse interaction effects

Three.js should be optimized to maintain smooth performance across devices.

---

# Framer Motion Responsibilities

Framer Motion will handle React-specific animations such as:

- Page transitions
- Component mounting/unmounting
- Modal animations
- Navigation transitions
- Accordion animations
- Image fade-ins
- Route transitions

Framer Motion should complement AnimeJS rather than duplicate its functionality.

---

# Animation Guidelines

Animations should follow these principles:

- Duration between 200ms and 800ms for UI interactions
- Ease-in-out timing for most transitions
- Stagger animations for lists and grids
- Respect user preferences for reduced motion
- Avoid blocking user interaction
- Trigger animations only when elements enter the viewport where appropriate

---

# Hero Section Experience

The homepage hero should include:

- Full-screen responsive layout
- Three.js powered industrial 3D scene
- Animated headline using AnimeJS
- Smooth call-to-action button animations
- Mouse parallax effect
- Animated particle background
- Scroll indicator

The hero should immediately communicate innovation and engineering excellence.

---

# Scroll Experience

Scrolling should feel fluid.

Examples:

- Sections fade in as they enter the viewport
- Images slide into view
- Statistics animate from 0 to their values
- Cards reveal with staggered timing
- Timeline elements animate progressively

Avoid excessive scroll hijacking.

---

# Product Showcase

Each product card should include:

- Smooth hover elevation
- Image zoom effect
- Animated border highlight
- Quick fade transitions
- Responsive interaction feedback

Product detail pages may include:

- 360° image rotation (future enhancement)
- Interactive exploded views (future enhancement)
- Animated specification highlights

---

# Background Effects

Subtle background animations may include:

- Floating geometric elements
- Gradient transitions
- Particle systems
- Animated SVG paths
- Soft lighting effects
- Industrial grid overlays

Background animations must not reduce readability.

---

# Performance Requirements

Animations must maintain:

- 60 FPS on modern desktops
- Graceful degradation on lower-end devices
- Lazy loading of Three.js assets
- GPU-accelerated transforms where possible
- Code splitting for animation modules

Heavy 3D assets should load only when needed.

---

# Accessibility

The application must respect the user's system preference for reduced motion.

When `prefers-reduced-motion` is enabled:

- Disable non-essential animations
- Remove continuous motion
- Keep only functional transitions

Accessibility takes precedence over visual effects.

---

# Future Enhancements

Potential future additions include:

- Interactive product configurators
- 3D cable assemblies
- Factory floor visualizations
- WebGL-based product explorer
- Interactive SCADA dashboards
- Digital twin demonstrations

# Industrial Corporate CMS
## Software Design Specification (SDS)

**Version:** 1.0

**Part:** 7

**Title:** UI/UX Design System & Component Library

---

# 1. Design Philosophy

The Omronics website should not look like a traditional industrial website.

Most industrial websites suffer from:

- Outdated UI
- Poor responsiveness
- Heavy text
- Generic templates
- Weak branding
- No interactions
- Poor user experience

Our objective is to create a website that immediately communicates

- Innovation
- Engineering Excellence
- Technology
- Precision
- Reliability
- Professionalism

The design language should combine modern SaaS aesthetics with industrial engineering.

---

# 2. User Experience Goals

Every visitor should experience the following journey:

```
Visitor

↓

Beautiful Landing Page

↓

Engaging Animation

↓

Professional Company

↓

Explore Products

↓

Explore Services

↓

Build Trust

↓

Contact Omronics
```

The UI should naturally guide users toward making an enquiry.

---

# 3. Design Language

The design language should be based on

- Minimalism
- Large whitespace
- Premium typography
- High contrast
- Smooth animations
- Modern glassmorphism
- Subtle gradients
- Industrial textures
- 3D visual elements

Think

```
Apple

+

Stripe

+

Tesla

+

ABB

+

Siemens
```

NOT

```
Bootstrap Admin Template
```

---

# 4. Design Keywords

The interface should feel

- Premium
- Clean
- Professional
- Industrial
- Technical
- Futuristic
- Elegant
- Modern
- Trustworthy

---

# 5. Color Palette

## Primary

```
#0F172A
```

Deep Navy

---

## Secondary

```
#2563EB
```

Professional Blue

---

## Accent

```
#06B6D4
```

Cyan

---

## Success

```
#22C55E
```

---

## Warning

```
#F59E0B
```

---

## Danger

```
#EF4444
```

---

## Background

```
#F8FAFC
```

---

## Cards

```
#FFFFFF
```

---

## Text

Heading

```
#0F172A
```

Paragraph

```
#475569
```

---

# 6. Typography

Primary Font

```
Poppins
```

Secondary Font

```
Inter
```

Monospace

```
JetBrains Mono
```

---

Typography Scale

```
Hero

64px

----------------

H1

48px

----------------

H2

36px

----------------

H3

28px

----------------

Body

18px

----------------

Small

14px
```

---

# 7. Spacing System

```
4px

8px

12px

16px

24px

32px

48px

64px

96px

128px
```

Never use arbitrary spacing.

---

# 8. Border Radius

Buttons

```
12px
```

Cards

```
20px
```

Modals

```
24px
```

Inputs

```
12px
```

---

# 9. Shadows

Cards

```
Soft Shadow
```

Hover

```
Medium Shadow
```

Hero

```
Glow Shadow
```

Never use harsh shadows.

---

# 10. Glassmorphism

Glass effects should be used sparingly.

Allowed

- Navbar
- Hero Cards
- Floating Panels
- Statistics Cards
- Call To Action

Avoid glassmorphism for forms and long text sections.

---

# 11. Animation System

Animation Libraries

- AnimeJS
- React Three Fiber
- Three.js
- Framer Motion

---

Animation Philosophy

Animation should communicate

- Quality
- Precision
- Confidence

Never animation for the sake of animation.

---

# 12. Motion Principles

Every animation should

- Feel natural
- Be smooth
- Never block interaction
- Support user flow

Target

```
60 FPS
```

---

# 13. Homepage Hero

The Hero is the most important section.

Structure

```
Navbar

↓

Hero

↓

3D Scene

↓

Headline

↓

Sub Heading

↓

CTA Buttons

↓

Scroll Indicator
```

---

Hero Headline Example

```
Engineering Tomorrow.

Automating Today.
```

or

```
Industrial Automation

Built For Precision.
```

---

# 14. Three.js Experience

The hero section should include an interactive 3D environment.

Possible Concepts

### Option 1

Floating Servo Cable

---

### Option 2

Rotating Electrical Panel

---

### Option 3

Industrial Automation Network

---

### Option 4

Abstract PCB Circuit

---

### Option 5

Factory Grid with Particles

---

Mouse movement should create

- Camera Parallax
- Floating Motion
- Soft Rotation

---

# 15. AnimeJS Usage

AnimeJS should control

- Hero text reveal
- Statistics counter
- Timeline animations
- Button hover
- Card hover
- Product reveal
- Stagger animations
- Scroll animations
- CTA animations

---

# 16. Framer Motion Usage

Framer Motion should handle

- Page Transitions
- Modal Opening
- Drawer
- Navigation
- Tabs
- Accordion
- Fade
- Scale
- Route Animations

---

# 17. Component Library

## Buttons

Types

```
Primary

Secondary

Outline

Ghost

Icon

Danger
```

States

```
Default

Hover

Active

Loading

Disabled
```

---

## Cards

Reusable Cards

```
Product Card

Service Card

Industry Card

Client Card

Testimonial Card

Dashboard Card

Statistics Card
```

Every card should support

- Hover Animation
- Elevation
- Border Glow
- Mobile Layout

---

## Inputs

Standard Inputs

```
Text

Email

Phone

Password

Textarea

Dropdown

Search

Multi Select
```

Every input should support

- Validation
- Error
- Disabled
- Loading

---

## Tables

Admin Tables

Features

- Search
- Sort
- Pagination
- Responsive
- Export Ready
- Status Badge
- Action Buttons

---

## Badges

```
ACTIVE

INACTIVE

NEW

CONTACTED

COMPLETED
```

---

## Breadcrumb

Example

```
Home

>

Products

>

Servo Cables

>

Panasonic Servo Cable
```

---

## Modals

Used for

- Delete Confirmation
- Image Preview
- PDF Preview
- Edit Forms

---

## Loaders

Three Types

```
Page Loader

Section Loader

Button Loader
```

The Page Loader should include a subtle animated industrial-inspired element rather than a generic spinner.

---

# 18. Section Design

Every section follows

```
Section

↓

Container

↓

Header

↓

Content

↓

CTA
```

Spacing between sections

```
120px
```

---

# 19. Homepage Structure

```
Hero

↓

About

↓

Featured Products

↓

Services

↓

Industries

↓

Why Choose Us

↓

Clients

↓

Testimonials

↓

Contact CTA

↓

Footer
```

---

# 20. Product Listing

Cards should contain

- Product Image
- Product Name
- Category
- Short Description
- View Details

Hover

- Lift
- Glow
- Image Zoom

---

# 21. Product Detail Page

Sections

```
Gallery

↓

Product Information

↓

Specifications

↓

Applications

↓

Downloads

↓

Related Products

↓

Enquiry CTA
```

---

# 22. Services Page

Layout

```
Banner

↓

Overview

↓

Service Cards

↓

Detailed Content

↓

CTA
```

---

# 23. Industries Page

Layout

```
Industry Banner

↓

Industry Cards

↓

Applications

↓

Related Services

↓

Contact CTA
```

---

# 24. Clients Section

Display

- Logo Carousel
- Grid View
- Smooth Auto Scroll

Hover

- Color Reveal
- Slight Scale
- Company Name Tooltip

---

# 25. Testimonials

Card Layout

```
Photo

↓

Name

↓

Company

↓

Rating

↓

Review
```

Carousel

- Auto Play
- Manual Controls
- Infinite Loop

---

# 26. Contact Section

Include

- Contact Form
- Company Information
- Google Maps
- Social Media
- CTA

Success animation after submission.

---

# 27. Admin Dashboard Theme

Admin UI should be

- Minimal
- Fast
- Data Focused
- Professional

Avoid excessive animations inside the dashboard.

Use animation only for

- Loading
- Notifications
- Drawer
- Modal
- Charts

---

# 28. Responsive Strategy

Desktop First Design

Optimized for

- 1920px
- 1600px
- 1440px
- 1366px
- 1280px

Then

- Tablet
- Mobile

No horizontal scrolling should occur.

---

# 29. Accessibility

Support

- Keyboard Navigation
- Screen Readers
- Reduced Motion
- Focus Indicators
- Proper Contrast
- Semantic HTML

---

# 30. Performance Guidelines

- Lazy load heavy sections
- Lazy load Three.js scenes
- Code split routes
- Use WebP images
- Optimize animations
- Avoid layout shifts
- Minimize CLS and LCP

---

# 31. Design Tokens

Centralize reusable values for:

- Colors
- Typography
- Spacing
- Border Radius
- Shadows
- Animation Durations
- Z-Index Layers
- Breakpoints

These tokens should be defined once and consumed throughout the application to ensure consistency and simplify future redesigns.

---

# 32. Completion Checklist

- Complete Design System
- Color Palette
- Typography
- Component Library
- Animation Guidelines
- Three.js Strategy
- AnimeJS Strategy
- Responsive Rules
- Accessibility Rules
- Design Tokens
- UI Standards
- Dashboard Design
- Public Website Design

---

# Part 8 Preview

**Part 8 – Public Website Pages (Complete Functional Specification)**

This document will define every public page in detail, including:

- Home Page (section-by-section)
- About Us
- Products
- Product Details
- Services
- Service Details
- Industries
- Industry Details
- Clients
- Contact Us
- Footer
- Navigation
- User flows
- Component hierarchy
- API integration
- Animation behavior
- Responsive behavior
- SEO requirements
- Content management strategy

Every page will be specified down to the component level so it can be implemented directly from the documentation.

# Industrial Corporate CMS
## Software Design Specification (SDS)

**Version:** 1.0

**Part:** 8

**Title:** Public Website Pages - Complete Functional Specification

---

# 1. Introduction

This document defines every public page of the Omronics Corporate Website.

Unlike a traditional website, every page should be dynamic and content-driven.

The website should focus on three primary goals:

- Present Omronics professionally.
- Showcase products and services.
- Generate customer enquiries.

No e-commerce functionality will exist.

The website is purely a Product Showcase & Lead Generation Platform.

---

# 2. Public Website Structure

```
Home

About Us

Products
    ├── Category Listing
    ├── Product Listing
    └── Product Details

Services
    └── Service Details

Industries
    └── Industry Details

Our Clients

Contact Us
```

---

# 3. Global Layout

Every public page should follow the same structure.

```
Navbar

↓

Page Banner

↓

Page Content

↓

Call To Action

↓

Footer
```

Navigation and Footer should never reload.

---

# 4. Navigation Bar

The Navbar is fixed to the top of the screen.

Transparent while on the Hero section.

Changes to a solid background after scrolling.

---

## Menu Items

```
Home

About Us

Products

Services

Industries

Clients

Contact Us
```

---

## Features

- Sticky Navigation
- Active Menu Highlight
- Smooth Scroll (Home)
- Mobile Drawer
- Animated Hover Effects
- CTA Button (Contact Us)

---

## Products Dropdown

```
Products

↓

Servo Cables

↓

Relay Cards

↓

Breakout Boards

↓

Sensor & Encoder Cables

↓

Interface Modules

↓

Ethernet Patch Cables

↓

Customized Cables

↓

Servo Connectors

↓

Programming Cables
```

The dropdown is generated dynamically from the Categories table.

---

# 5. Home Page

The homepage is the most important page.

Its objective is to convert visitors into enquiries.

---

## Section Order

```
Hero

↓

About Omronics

↓

Featured Products

↓

Services

↓

Industries

↓

Why Choose Us

↓

Our Clients

↓

Testimonials

↓

Contact CTA

↓

Footer
```

---

# 6. Hero Section

Purpose

Create an immediate premium impression.

---

## Layout

```
Headline

↓

Sub Heading

↓

Buttons

↓

3D Scene

↓

Scroll Indicator
```

---

## Components

Headline

Subheading

Primary CTA

Secondary CTA

Animated Background

ThreeJS Scene

AnimeJS Text

Particle Effects

---

## CTA Buttons

```
Explore Products

Contact Us
```

---

## Animations

AnimeJS

- Headline Reveal
- Subtitle Reveal
- Button Reveal

ThreeJS

- Floating Industrial Objects
- Camera Movement
- Mouse Interaction

Framer Motion

- Fade
- Scale
- Entrance

---

# 7. About Omronics Section

Purpose

Introduce the company.

---

## Components

Company Overview

Vision

Mission

Statistics

CTA

---

## Statistics

Example

```
Years Experience

Projects Completed

Industries Served

Happy Clients
```

Statistics animate using AnimeJS.

---

# 8. Featured Products

Purpose

Highlight the company's primary product categories.

---

## Layout

```
Section Heading

↓

Category Cards

↓

View All Products
```

---

Each Category Card

Contains

- Image
- Category Name
- Short Description
- Explore Button

---

Hover Animation

- Scale
- Glow
- Border Animation

---

# 9. Services Section

Display service cards.

Each card contains

- Image
- Title
- Description
- Learn More

---

Hover

- Lift
- Glow
- Arrow Animation

---

# 10. Industries Section

Purpose

Show industries served.

Cards

```
Smart Infrastructure

Manufacturing

Energy & Utility

Process Plants
```

---

Click

↓

Industry Details

---

# 11. Why Choose Us

Purpose

Differentiate Omronics.

Suggested Cards

- Experienced Team
- Quality Products
- Customized Solutions
- Reliable Support
- Modern Technology
- Fast Response

---

Cards animate on scroll.

---

# 12. Clients Section

Display

Logo Carousel

↓

Grid

↓

Client Details (Optional)

---

Animation

Continuous horizontal scrolling.

Pause on hover.

---

# 13. Testimonials

Carousel

Card Design

```
Customer Image

↓

Name

↓

Company

↓

Review

↓

Rating
```

Auto Play

Infinite

---

# 14. Contact CTA

Purpose

Encourage enquiries.

Layout

```
Background Image

↓

Title

↓

Description

↓

Contact Button
```

---

# 15. Footer

Contains

Quick Links

Products

Services

Company Information

Social Links

Google Map

Copyright

Newsletter removed (Version 1)

---

# 16. About Us Page

Sections

```
Banner

↓

Company Introduction

↓

Vision

↓

Mission

↓

Core Values

↓

Why Omronics

↓

CTA
```

---

# 17. Products Page

Purpose

Display all product categories.

Layout

```
Banner

↓

Search

↓

Category Filter

↓

Product Grid

↓

Pagination
```

---

Search

Searches

- Product Name

- Model Number

- Description

---

Filters

Category

Search

Sort

---

# 18. Category Page

URL

```
/products/:categorySlug
```

Example

```
/products/servo-cables
```

Layout

```
Banner

↓

Category Information

↓

Search

↓

Products

↓

Pagination
```

---

# 19. Product Details

URL

```
/products/:categorySlug/:productSlug
```

---

Sections

```
Gallery

↓

Product Information

↓

Features

↓

Specifications

↓

Applications

↓

Downloads

↓

Related Products

↓

Request Enquiry
```

---

Gallery

Supports

- Zoom
- Lightbox
- Fullscreen
- Multiple Images

---

Downloads

Display

PDF

Datasheet

Certificates

Manuals

---

Request Enquiry

Button

↓

Modal

↓

Product Auto Selected

↓

Submit

---

# 20. Services Page

Layout

```
Banner

↓

Service Cards

↓

CTA
```

Each Service Card

Contains

Image

Title

Description

Learn More

---

# 21. Service Details

Sections

```
Banner

↓

Overview

↓

Benefits

↓

Applications

↓

Related Products

↓

Enquiry CTA
```

---

# 22. Industries Page

Layout

```
Banner

↓

Industry Cards
```

---

# 23. Industry Details

Sections

```
Banner

↓

Overview

↓

Solutions

↓

Products Used

↓

Services

↓

Enquiry CTA
```

---

# 24. Clients Page

Purpose

Showcase client portfolio.

Layout

```
Banner

↓

Logo Grid

↓

Client Information (Optional)
```

---

# 25. Contact Page

Sections

```
Banner

↓

Contact Information

↓

Contact Form

↓

Google Map

↓

Social Media
```

---

Contact Form Fields

```
Name

Company Name

Email

Phone

Subject

Requirement

Message
```

---

Submission Flow

```
Submit

↓

Validation

↓

API

↓

Database

↓

Email

↓

Success Message
```

---

# 26. 404 Page

Message

```
Oops!

Page Not Found
```

Buttons

```
Home

Products

Contact
```

---

# 27. Search Experience

Global Product Search

Results

Grouped By

```
Products

Categories

Services
```

Debounce

```
300ms
```

---

# 28. Responsive Behaviour

Desktop

- Full Navigation
- Mega Menu
- 4-column Product Grid

Tablet

- Drawer Navigation
- 2-column Grid

Mobile

- Hamburger Menu
- Single-column Layout
- Sticky Contact Button

---

# 29. Animation Guidelines

Every page should include:

AnimeJS

- Text Reveal
- Number Counter
- Card Stagger
- CTA Hover

Framer Motion

- Page Transitions
- Component Entrance
- Modal Animations

React Three Fiber

- Hero Scene
- Interactive Background
- Mouse Parallax

---

# 30. SEO Requirements

Every public page must include:

- Dynamic Page Title
- Meta Description
- Canonical URL
- Open Graph Tags
- Twitter Card Tags
- Structured Data (JSON-LD)
- Breadcrumb Schema
- Sitemap Inclusion

Product, Service, and Industry detail pages should generate SEO metadata dynamically from the database.

---

# 31. Performance Requirements

- Lazy-load images
- Lazy-load 3D scenes
- Route-based code splitting
- Prefetch likely navigation targets
- Optimize WebP assets
- Maintain Core Web Vitals targets (LCP, CLS, INP)

---

# 32. Public Website Completion Checklist

- Global Layout
- Responsive Navigation
- Dynamic Products
- Dynamic Categories
- Dynamic Services
- Dynamic Industries
- Clients Showcase
- Testimonials
- Contact Form
- Google Maps
- Downloads
- Search
- SEO
- Responsive Design
- Animations
- 3D Hero Experience
- Lead Generation Flow

---

# Part 9 Preview

**Part 9 – Admin Dashboard & CMS Functional Specification**

This document will define the complete Content Management System, including:

- Dashboard Overview
- Login Flow
- Sidebar Navigation
- Dashboard Widgets
- Product Management
- Category Management
- Service Management
- Industry Management
- Client Management
- Testimonial Management
- Enquiry Management
- Website Settings
- Media Management
- File Upload Workflow
- Validation Rules
- Admin User Experience
- Complete CRUD Operations
- Table Actions
- Forms
- Search
- Filters
- Pagination
- Role Expansion Strategy

# Industrial Corporate CMS
## Software Design Specification (SDS)

**Version:** 1.0

**Part:** 9

**Title:** Admin Dashboard & CMS Functional Specification

---

# 1. Introduction

The Admin Dashboard is the heart of the application.

Unlike the public website, which focuses on showcasing products and services, the Admin Dashboard provides Omronics with complete control over all website content.

The dashboard should be:

- Fast
- Minimal
- Responsive
- Secure
- Easy to Learn
- Highly Scalable

The administrator should never need to modify the database manually.

Everything should be manageable from the CMS.

---

# 2. Dashboard Goals

The Admin Dashboard should allow administrators to:

- Manage Products
- Manage Categories
- Manage Services
- Manage Industries
- Manage Clients
- Manage Testimonials
- View Customer Enquiries
- Manage Website Information
- Upload Images
- Upload PDF Catalogues

---

# 3. Dashboard Architecture

```
Login

↓

Dashboard

↓

Sidebar

↓

Selected Module

↓

CRUD Operations

↓

Database

↓

Frontend Update
```

---

# 4. Dashboard Layout

```
+--------------------------------------------------------+

 LOGO

----------------------------------------------------------

 Sidebar             Header

                    Breadcrumb

                    Search

                    Profile

----------------------------------------------------------

                    Main Content

----------------------------------------------------------

                    Footer

+--------------------------------------------------------+
```

---

# 5. Sidebar Navigation

```
Dashboard

Content Management

    Categories

    Products

    Services

    Industries

    Clients

    Testimonials

Lead Management

    Enquiries

Website

    Website Settings

Account

    Profile

    Change Password

Logout
```

---

# 6. Header

The Header should contain

- Breadcrumb
- Global Search (Future)
- Notifications (Future)
- Admin Profile
- Logout Button

---

# 7. Dashboard Home

The Dashboard Homepage should provide an overview of the website.

Widgets

```
Products

Categories

Services

Industries

Clients

Testimonials

Enquiries
```

Each widget should display

- Total Count
- Icon
- Trend Indicator (Future)
- Quick Action

---

# 8. Dashboard Statistics

Example

```
Products

158

----------------

Categories

9

----------------

Services

6

----------------

Industries

4

----------------

Clients

35

----------------

Testimonials

12

----------------

New Enquiries

18
```

---

# 9. Dashboard Quick Actions

Buttons

```
Add Product

Add Category

Add Service

View Enquiries
```

---

# 10. Generic CMS Philosophy

Every CMS module should follow exactly the same structure.

```
List

↓

Search

↓

Filter

↓

Create

↓

Edit

↓

Delete
```

This ensures consistency and reduces the learning curve.

---

# 11. Generic Data Table

Instead of building separate tables for every module, create a reusable table component.

Features

- Pagination
- Sorting
- Search
- Status Badge
- Responsive Layout
- Action Buttons
- Empty State
- Loading State

---

Columns Example

```
Image

Name

Status

Created

Actions
```

---

Actions

```
View

Edit

Delete
```

---

# 12. Categories Module

Purpose

Manage Product Categories.

---

Fields

```
Category Name

Slug

Short Description

Description

Banner Image

Thumbnail

SEO Title

SEO Description

Display Order

Status
```

---

Operations

```
Create

Edit

Delete

Search

Filter

Pagination
```

---

Validation

- Category Name Required
- Category Name Unique
- Slug Unique

---

# 13. Products Module

Purpose

Manage all products.

---

List Page

Columns

```
Image

Product Name

Category

Model Number

Featured

Status

Created

Actions
```

---

Product Form

Basic Information

```
Category

Product Name

Model Number

Slug

Short Description

Description
```

---

Technical Information

```
Features

Specifications

Applications
```

---

Media

```
Thumbnail

Gallery Images

PDF Documents
```

---

SEO

```
SEO Title

SEO Description
```

---

Settings

```
Featured

Status

Display Order
```

---

Validation

- Product Name Required
- Category Required
- Slug Unique

---

# 14. Services Module

Fields

```
Service Name

Slug

Banner

Thumbnail

Description

SEO

Status

Display Order
```

Operations

```
CRUD
```

---

# 15. Industries Module

Fields

```
Industry Name

Slug

Banner

Thumbnail

Description

SEO

Status

Display Order
```

Operations

```
CRUD
```

---

# 16. Clients Module

Purpose

Display company clients.

Fields

```
Client Name

Logo

Website

Description

Display Order

Status
```

Operations

```
CRUD
```

---

# 17. Testimonials Module

Fields

```
Customer Name

Company

Designation

Photo

Rating

Review

Status
```

Validation

```
Rating

1-5
```

---

# 18. Enquiry Management

Purpose

Manage customer enquiries.

---

List Columns

```
Date

Customer

Company

Email

Phone

Source

Status

Actions
```

---

View Page

```
Customer Details

↓

Product / Service

↓

Requirement

↓

Remarks

↓

Status
```

---

Status Flow

```
NEW

↓

CONTACTED

↓

IN_PROGRESS

↓

COMPLETED

↓

CLOSED
```

---

Admin can

- Update Status
- Add Remarks
- Delete Enquiry

---

# 19. Website Settings

This module controls all website-wide information.

---

Company Information

```
Company Name

Address

Phone

Email

Support Email
```

---

Branding

```
Logo

Favicon
```

---

Social Media

```
Facebook

Instagram

LinkedIn

YouTube
```

---

SEO

```
Meta Title

Meta Description
```

---

Google Maps

```
Embed URL
```

---

# 20. Form Design

Every CMS form follows the same structure.

```
Basic Information

↓

Media

↓

SEO

↓

Settings

↓

Submit
```

---

Buttons

```
Save Draft (Future)

Publish

Cancel
```

---

# 21. Delete Workflow

Deleting data should always require confirmation.

Flow

```
Delete

↓

Confirmation Modal

↓

Soft Delete

↓

Success Message
```

No record should be permanently deleted.

---

# 22. Search

Every module should support

- Instant Search
- Debounce (300ms)

Search Fields

Products

- Product Name
- Model Number

Categories

- Category Name

Services

- Service Name

Industries

- Industry Name

Clients

- Client Name

Testimonials

- Customer Name

Enquiries

- Customer Name
- Company Name
- Email

---

# 23. Filtering

Every module should support filters.

Products

```
Category

Status

Featured
```

Services

```
Status
```

Industries

```
Status
```

Clients

```
Status
```

Testimonials

```
Status

Rating
```

Enquiries

```
Status

Date

Source
```

---

# 24. Bulk Actions (Future Ready)

Although Version 1 may not expose these in the UI, the architecture should support:

- Bulk Delete
- Bulk Status Update
- Bulk Export
- Bulk Import

This should influence how list APIs and selection state are designed.

---

# 25. Dashboard Notifications

Display notifications for:

- Product Created
- Product Updated
- Upload Successful
- Validation Errors
- New Enquiry Received

Notifications should use toast messages and should not interrupt the user's workflow.

---

# 26. Media Integration

The Products, Categories, Services, Industries, Clients, and Testimonials modules should all use the same media upload components.

Supported media:

- Images
- PDF Documents (Products only)

The upload experience should include:

- Drag & Drop
- Progress Indicator
- Preview
- Remove
- Replace

---

# 27. Responsive Dashboard

Desktop

- Full Sidebar
- Expanded Tables

Tablet

- Collapsible Sidebar
- Responsive Tables

Mobile

- Drawer Sidebar
- Card-based Lists where appropriate

The admin dashboard should remain fully usable on tablets. Mobile support is desirable but secondary.

---

# 28. User Experience Guidelines

The dashboard should prioritize efficiency.

Principles:

- Maximum three clicks to reach any module.
- Consistent button placement.
- Consistent form layouts.
- Keyboard-friendly navigation.
- Fast feedback after every action.

---

# 29. Security Rules

- All dashboard routes require JWT authentication.
- Sensitive actions require server-side authorization checks.
- File uploads must be validated.
- Soft delete only.
- Audit logs should be generated for create, update, and delete operations.

---

# 30. Admin Dashboard Completion Checklist

- Secure Login
- Dashboard Overview
- Sidebar Navigation
- Categories Management
- Products Management
- Services Management
- Industries Management
- Clients Management
- Testimonials Management
- Enquiry Management
- Website Settings
- Shared Data Tables
- Shared Forms
- Shared Upload Components
- Search
- Filters
- Pagination
- Responsive Layout
- Toast Notifications
- Soft Delete Workflow

---

# 31. Next Document

**Part 10 – Media Management System**

This document will define:

- Image upload architecture
- PDF management
- Storage strategy
- Compression pipeline
- WebP conversion
- File validation
- Naming conventions
- Folder organization
- Media APIs
- Preview components
- Security considerations
- Reusable upload components


# Industrial Corporate CMS
## Software Design Specification (SDS)

**Version:** 1.0

**Part:** 10

**Title:** Media Management System & Reusable CRUD Framework

---

# 1. Introduction

The Media Management System is responsible for handling every file uploaded to the CMS.

This includes

- Product Images
- Category Images
- Service Images
- Industry Images
- Client Logos
- Testimonial Photos
- Product PDF Catalogues
- Technical Datasheets
- Product Manuals

Instead of creating separate upload components for every module, the application will contain **one centralized Media Management System**.

---

# 2. Design Philosophy

The media system should follow these principles.

- Reusable
- Secure
- Fast
- Scalable
- Optimized
- Independent

Every module should use exactly the same upload engine.

Example

```
Products

↓

Media Upload Component

↓

Media Service

↓

Storage

↓

Database
```

```
Services

↓

Media Upload Component

↓

Media Service

↓

Storage

↓

Database
```

The upload logic should never be duplicated.

---

# 3. Reusable CRUD Philosophy

One of the biggest mistakes made in CMS development is building separate CRUD pages for every module.

Instead of this

```
Products

↓

Product Table

↓

Product Form

------------------------

Categories

↓

Category Table

↓

Category Form

------------------------

Services

↓

Service Table

↓

Service Form
```

We will build

```
Reusable Data Table

↓

Reusable CRUD Form

↓

Reusable Upload Component

↓

Configuration

↓

Products

Categories

Services

Industries

Clients

Testimonials
```

Every module becomes configuration-driven.

---

# 4. Generic CRUD Architecture

```
CMS Module

↓

Module Configuration

↓

Generic CRUD Engine

↓

Table

↓

Form

↓

API

↓

Database
```

---

# 5. CRUD Engine

Every CMS module should use the same CRUD engine.

```
List

↓

Search

↓

Filter

↓

Create

↓

Edit

↓

Delete
```

The only thing that changes is

```
Fields

Validation

API Endpoint
```

Everything else remains identical.

---

# 6. Generic Data Table

The project will contain one reusable table component.

```
<DataTable />
```

Features

- Search
- Pagination
- Sorting
- Status Badge
- Responsive
- Empty State
- Loading State
- Actions
- Selection
- Bulk Operations (Future)

---

Configuration Example

```javascript
<DataTable
    columns={columns}
    endpoint="/products"
    searchable={true}
    pagination={true}
/>
```

The same component powers

- Products
- Categories
- Services
- Industries
- Clients
- Testimonials
- Enquiries

---

# 7. Generic CRUD Form

Instead of

```
Product Form

Category Form

Service Form
```

We build

```
<CrudForm />
```

The form renders itself using metadata.

Example

```javascript
[
    {
        name: "productName",
        type: "text"
    },
    {
        name: "description",
        type: "textarea"
    },
    {
        name: "featured",
        type: "switch"
    }
]
```

The engine automatically creates the UI.

---

# 8. Shared Form Components

Every CRUD page uses

```
Text Input

Textarea

Dropdown

Switch

Checkbox

Image Upload

PDF Upload

Rich Text Editor

Tag Input

SEO Panel
```

---

# 9. Generic Upload Component

Create one reusable upload component.

```
<MediaUploader />
```

Capabilities

- Drag & Drop
- Multi Upload
- Preview
- Delete
- Replace
- Progress Bar
- Validation
- Compression

This component should never know which module is using it.

---

# 10. Upload Workflow

```
Select File

↓

Validation

↓

Compression

↓

Preview

↓

Upload

↓

Database

↓

Success
```

---

# 11. Supported Files

Images

```
jpg

jpeg

png

webp
```

Documents

```
pdf
```

Reject

```
exe

php

bat

dll

rar

zip

iso
```

---

# 12. Maximum File Sizes

Images

```
5 MB
```

Recommended

```
1920 x 1080
```

PDF

```
15 MB
```

---

# 13. Image Processing

Every uploaded image should pass through the following pipeline.

```
Upload

↓

Validate

↓

Read Metadata

↓

Resize

↓

Compress

↓

Convert to WebP

↓

Save

↓

Return URL
```

Compression should use

```
Sharp
```

---

# 14. Image Variants

For every uploaded image generate

```
Thumbnail

Small

Medium

Original
```

Example

```
thumbnail.webp

small.webp

medium.webp

original.webp
```

Frontend chooses the appropriate size.

---

# 15. File Naming Convention

Never store original filenames.

Generate unique names.

Example

```
prd_01J4AZ3X8NQ.webp
```

PDF

```
pdf_01J4AZ3X8NQ.pdf
```

Avoid

```
servo cable.pdf
```

---

# 16. Storage Structure

```
uploads/

│

├── products/

│      images/

│      pdf/

│

├── categories/

│

├── services/

│

├── industries/

│

├── clients/

│

└── testimonials/
```

Future

```
blogs/

team/

careers/
```

---

# 17. Media Database Strategy

Instead of storing images inside every table,

Store media separately.

```
media

↓

entity_type

entity_id

↓

File Path
```

Example

```
PRODUCT

15

↓

image.webp
```

This allows one upload engine for the whole CMS.

---

# 18. Upload Validation

Validate

- File Extension
- MIME Type
- File Size
- Virus Check (Future)
- Duplicate Name
- Corrupted Files

---

# 19. Upload Security

Never trust

```
Extension
```

Always validate

```
MIME Type
```

Reject executable files.

Store uploads outside the public root whenever possible.

Serve media through controlled routes or signed/static URLs as appropriate.

---

# 20. Upload Progress

The UI should display

```
Uploading...

45%

↓

Complete
```

For multiple uploads

```
File 1

██████

File 2

██████

File 3

██████
```

---

# 21. Image Preview

Images

↓

Preview

↓

Replace

↓

Delete

↓

Reorder

Gallery images should support drag-and-drop ordering.

---

# 22. PDF Preview

Show

```
PDF Icon

↓

File Name

↓

Size

↓

Preview

↓

Download

↓

Delete
```

---

# 23. Drag & Drop

Supported

Images

PDF

Multiple Upload

Visual Drop Zone

Hover State

---

# 24. Reusable SEO Panel

Every CRUD form should include

```
SEO Title

Meta Description

Slug
```

Instead of recreating this panel

Create

```
<SeoPanel />
```

Products

Services

Industries

Categories

All use the same component.

---

# 25. Reusable Status Component

Instead of

```
Dropdown

Dropdown

Dropdown
```

Create

```
<StatusSelector />
```

Supports

```
ACTIVE

INACTIVE
```

Future

```
ARCHIVED
```

---

# 26. Reusable Delete Modal

Single component

```
<DeleteModal />
```

Parameters

```
Title

Description

Entity Name

Confirm

Cancel
```

Every module uses the same confirmation dialog.

---

# 27. Reusable Empty State

Instead of empty tables

Display

```
📂

No Products Found

Create your first Product.
```

Reusable for every module.

---

# 28. Reusable Loading Components

```
Page Loader

Table Loader

Card Loader

Button Loader

Upload Loader
```

Never use plain browser spinners.

Use branded loaders consistent with the design system.

---

# 29. Reusable Notification System

Single

```
Toast Provider
```

Supports

```
Success

Warning

Error

Info
```

Every module uses the same notification system.

---

# 30. Media API

Upload Image

```
POST

/api/v1/uploads/image
```

Upload PDF

```
POST

/api/v1/uploads/pdf
```

Delete File

```
DELETE

/api/v1/uploads/{id}
```

Get Media

```
GET

/api/v1/uploads/{id}
```

---

# 31. Performance

Media system should support

- Lazy Loading
- Progressive Images
- Compression
- Browser Cache
- CDN Ready
- WebP Conversion
- Thumbnail Generation

---

# 32. Future Expansion

The media engine should later support

- Videos
- CAD Files
- ZIP Files
- Office Documents
- Audio
- 360° Product Images
- 3D Models (.glb, .gltf)
- AR Assets
- Interactive Product Configurators

No architectural changes should be required to support these file types.

---

# 33. Completion Checklist

- Generic CRUD Engine
- Generic Data Table
- Generic CRUD Form
- Generic Upload Component
- Shared SEO Panel
- Shared Status Selector
- Shared Delete Modal
- Shared Empty State
- Shared Notification System
- Image Processing Pipeline
- PDF Management
- Secure File Validation
- Drag & Drop Uploads
- Gallery Ordering
- Reusable Media APIs
- Future-ready Media Architecture

---

# Part 11 Preview

**Part 11 – SEO, Search Engine Optimization & Discoverability**

Topics include:

- Technical SEO Architecture
- Dynamic Metadata
- Open Graph & Twitter Cards
- Structured Data (JSON-LD)
- Canonical URLs
- Dynamic Sitemap Generation
- Robots.txt
- Breadcrumb Schema
- Product SEO
- Service SEO
- Industry SEO
- Performance & Core Web Vitals
- Social Sharing Optimization
- Search Engine Best Practices
- URL Strategy

# Industrial Corporate CMS
## Software Design Specification (SDS)

**Version:** 1.0

**Part:** 11

**Title:** SEO, Search Engine Optimization & Discoverability

---

# 1. Introduction

Search Engine Optimization (SEO) is one of the most important aspects of the Omronics website.

The primary objective of SEO is to ensure that Omronics products, services, and industries appear prominently in search engine results when potential customers search for relevant industrial automation solutions.

Unlike e-commerce websites, the objective is **Lead Generation**, not online sales.

SEO should therefore maximize:

- Organic Traffic
- Product Discoverability
- Service Discoverability
- Industry Discoverability
- Local Search Presence
- Brand Visibility

---

# 2. SEO Goals

The website should achieve the following:

- Google Friendly
- Mobile Friendly
- Fast Loading
- Semantic HTML
- Structured Data
- Rich Search Results
- Dynamic Metadata
- Clean URLs
- Sitemap Generation
- Core Web Vitals Compliance

---

# 3. SEO Architecture

```
Database

↓

SEO Fields

↓

API

↓

React

↓

Meta Tags

↓

Google

↓

Search Results
```

Every page should generate SEO dynamically.

---

# 4. Dynamic SEO

The following pages must generate metadata dynamically.

```
Home

About

Products

Categories

Product Details

Services

Service Details

Industries

Industry Details

Clients

Contact
```

Every page should have unique metadata.

---

# 5. SEO Database Fields

Every content module should contain:

```
seo_title

seo_description

slug
```

Future Fields

```
seo_keywords

canonical_url

robots

schema_type
```

---

# 6. URL Structure

URLs must be clean and human-readable.

Correct

```
/

/about

/products

/products/servo-cables

/products/servo-cables/panasonic-servo-cable

/services

/services/scada-process-automation

/industries/manufacturing

/clients

/contact
```

Avoid

```
?id=15

?page=3

/product?id=52
```

---

# 7. Slug Rules

Every public page uses slugs.

Rules

- Lowercase
- Hyphen Separated
- No Spaces
- No Special Characters
- Unique

Example

```
Servo Cable

↓

servo-cable
```

---

# 8. Page Titles

Every page should have a unique title.

Examples

Home

```
Omronics | Industrial Automation & Electrical Engineering Solutions
```

Category

```
Servo Cables | Omronics
```

Product

```
Panasonic Servo Cable | Servo Cables | Omronics
```

Service

```
SCADA & Process Automation | Omronics
```

---

# 9. Meta Descriptions

Every page should include a unique meta description.

Length

```
120–160 Characters
```

The description should summarize the page content and encourage clicks.

---

# 10. Canonical URLs

Every page must define a canonical URL.

Example

```html
<link rel="canonical" href="https://www.omronics.in/products/servo-cables">
```

This prevents duplicate content issues.

---

# 11. Robots.txt

Example

```
User-agent: *

Allow: /

Sitemap: https://www.omronics.in/sitemap.xml
```

Disallow

```
/admin

/api

/uploads/private
```

---

# 12. Sitemap

The application should generate a dynamic sitemap.

Include

```
Home

About

Products

Categories

Services

Industries

Clients

Contact
```

New products should automatically appear in the sitemap.

---

# 13. Open Graph

Every page should define:

```
og:title

og:description

og:image

og:url

og:type
```

Example

```html
<meta property="og:title">
```

This improves link previews on social platforms.

---

# 14. Twitter Cards

Support

```
summary_large_image
```

Include

```
twitter:title

twitter:description

twitter:image
```

---

# 15. Structured Data

Use JSON-LD.

Implement:

```
Organization

WebSite

BreadcrumbList

Product

Service

LocalBusiness

ContactPoint
```

---

# 16. Organization Schema

Include

```
Company Name

Logo

Address

Phone

Email

Website

Social Links
```

Google uses this for knowledge panels.

---

# 17. Local Business SEO

Include

```
Company Name

Address

City

State

Country

Phone

Email

Working Hours

Google Maps
```

This improves Google Maps and local search visibility.

---

# 18. Product SEO

Each product page should include:

- Product Name
- Category
- Description
- Images
- Downloadable Documents
- Structured Data
- Canonical URL
- Breadcrumbs

Products should be indexable individually.

---

# 19. Service SEO

Each service page should include:

- Title
- Description
- Benefits
- Applications
- Related Products
- FAQ (Future)
- Structured Data

---

# 20. Industry SEO

Each industry page should include:

- Industry Overview
- Solutions
- Related Services
- Related Products
- CTA

---

# 21. Image SEO

Every uploaded image should include:

```
File Name

Alt Text

Title

Caption (Optional)
```

Example

Correct

```
panasonic-servo-cable.webp
```

Avoid

```
IMG_9384.png
```

---

# 22. Breadcrumb Navigation

Every detail page should display breadcrumbs.

Example

```
Home

>

Products

>

Servo Cables

>

Panasonic Servo Cable
```

Generate structured breadcrumb schema.

---

# 23. Internal Linking

Improve discoverability by linking related content.

Examples

Product

↓

Related Products

↓

Related Services

↓

Related Industries

Service

↓

Related Products

Industry

↓

Related Services

This strengthens site architecture and SEO.

---

# 24. Search Optimization

The website search should support:

- Product Name
- Model Number
- Category
- Service Name
- Industry Name

Future

- PDF Content Search
- Full-text Search

---

# 25. Performance & SEO

Maintain:

Largest Contentful Paint (LCP)

```
< 2.5 seconds
```

Interaction to Next Paint (INP)

```
< 200 ms
```

Cumulative Layout Shift (CLS)

```
< 0.1
```

---

# 26. Mobile SEO

The website must be fully responsive.

Requirements

- Mobile-first layout
- Readable fonts
- Touch-friendly controls
- Responsive images
- Optimized navigation

Google should treat the mobile version as the primary version.

---

# 27. Core Web Vitals

Optimize:

- Image loading
- Font loading
- JavaScript bundles
- Route splitting
- Lazy loading
- Preloading critical assets

---

# 28. Social Media Integration

Every page should support rich previews when shared.

Supported platforms:

- LinkedIn
- Facebook
- X (Twitter)
- WhatsApp
- Telegram

Each page should display:

- Title
- Description
- Featured Image
- URL

---

# 29. 404 SEO

The custom 404 page should:

- Return HTTP 404 status
- Suggest popular pages
- Include a search option
- Link back to Home

Do not redirect all unknown URLs to the homepage.

---

# 30. Security & SEO

Do not index:

```
/admin

/api

/private uploads

/login
```

Public assets should remain crawlable.

---

# 31. Future SEO Enhancements

The architecture should support:

- Blog articles
- News
- FAQs
- Case Studies
- Careers
- Knowledge Base

Each future module should automatically integrate with the sitemap and structured data system.

---

# 32. SEO Checklist

- Dynamic page titles
- Dynamic meta descriptions
- Canonical URLs
- Clean URLs
- Slug generation
- Open Graph tags
- Twitter Cards
- JSON-LD structured data
- Organization schema
- Local Business schema
- Product schema
- Service schema
- Breadcrumb schema
- Dynamic sitemap
- Robots.txt
- Image optimization
- Alt text
- Internal linking
- Mobile optimization
- Core Web Vitals compliance
- Proper 404 handling

---

# 33. SEO Monitoring

After deployment, the following tools should be configured:

- Google Search Console
- Google Analytics 4 (GA4)
- Google Tag Manager (optional)
- Microsoft Bing Webmaster Tools

These tools will be used to monitor:

- Search performance
- Indexing status
- Crawl errors
- Keyword rankings
- Page performance
- User behavior

---

# 34. SEO Completion Criteria

The SEO implementation will be considered complete when:

- Every public page has unique metadata.
- Every dynamic page generates SEO content from the database.
- Sitemap updates automatically.
- Structured data validates successfully.
- Images include optimized filenames and alt text.
- Core Web Vitals targets are met.
- Search engines can crawl all public content without errors.
- Admin, API, and private resources remain hidden from indexing.

---

# Next Document

**Part 12 – Advanced Search, Filtering & Product Discovery Engine**

This document will define:

- Global Search Architecture
- Product Search
- Category Navigation
- Dynamic Filters
- URL-based Filtering
- Search Suggestions
- Debounced Search
- Related Products Algorithm
- Pagination Strategy
- Sorting
- Search Analytics
- Search Performance Optimization
- AI-ready Search Architecture

# Industrial Corporate CMS
## Software Design Specification (SDS)

**Version:** 1.0

**Part:** 12

**Title:** Customer Discovery, Search, Filtering & Lead Generation System

---

# 1. Introduction

The Customer Discovery System is responsible for helping visitors quickly discover the products and services they need while encouraging them to contact Omronics with their specific requirements.

Unlike an e-commerce website, users are **not purchasing products online**.

The objective of this system is to:

- Reduce search time
- Improve product discovery
- Increase enquiry conversions
- Improve user experience
- Generate qualified business leads

---

# 2. Customer Journey

The website should guide visitors through the following flow.

```
Landing Page

↓

Browse Products

↓

Search

↓

Filter

↓

Product Details

↓

Download Catalogue

↓

Request Quote

↓

Submit Enquiry

↓

Lead Stored

↓

Admin Follow-up
```

Every page should naturally encourage the next step.

---

# 3. Product Discovery Architecture

```
Visitor

↓

Navigation

↓

Category

↓

Product Listing

↓

Filters

↓

Product Details

↓

Downloads

↓

Contact
```

The visitor should never require more than **three clicks** to reach any product.

---

# 4. Navigation System

The website navigation consists of

```
Home

About

Products

Services

Industries

Clients

Contact
```

Products contains a dynamic mega menu.

```
Products

↓

Categories

↓

Products
```

Categories are loaded from the database.

---

# 5. Search Architecture

The website contains a **Global Search Engine**.

Search should work across

```
Products

Categories

Services

Industries
```

Future

```
Blogs

Downloads

Case Studies
```

---

# 6. Search UI

Desktop

```
Navbar Search

↓

Dropdown Results
```

Mobile

```
Full Screen Search

↓

Results
```

---

# 7. Search Experience

User Types

```
Servo
```

↓

Debounce

↓

API

↓

Database

↓

Results

↓

Display

Search requests should not fire on every keystroke.

Debounce

```
300ms
```

---

# 8. Search Ranking

Search results should appear in the following priority.

```
Exact Product Name

↓

Model Number

↓

Category Name

↓

Service Name

↓

Industry Name

↓

Description
```

Exact matches should always appear first.

---

# 9. Search Suggestions

While typing

```
Serv...
```

Display

```
Servo Cables

Servo Connectors

Servo Motor Cable

Servo Feedback Cable
```

Suggestions should update dynamically.

---

# 10. Search Result Layout

```
Products

Categories

Services

Industries
```

Each section displays

- Thumbnail
- Title
- Short Description
- Link

---

# 11. Product Filters

Products should support

```
Category

Search

Sort
```

Version 1 intentionally avoids excessive filtering because the product catalog is relatively focused.

---

# 12. Category Filter

Example

```
All Products

Servo Cables

Relay Cards

Breakout Boards

Ethernet Patch Cables

Servo Connectors
```

Selecting a category updates the product listing without reloading the page.

---

# 13. Sorting

Supported

```
Newest

Oldest

A-Z

Z-A
```

Future

```
Most Viewed

Most Downloaded

Most Enquired
```

---

# 14. Product Listing

Each Product Card

Contains

```
Image

Category

Product Name

Short Description

View Details
```

Hover

- Elevation
- Border Glow
- Image Zoom
- CTA Animation

---

# 15. Product Detail Page

The Product Detail Page is the conversion page.

Layout

```
Gallery

↓

Product Information

↓

Specifications

↓

Applications

↓

Downloads

↓

Related Products

↓

Enquiry Form
```

---

# 16. Product Downloads

Every product may contain

```
PDF Catalogue

Datasheet

Technical Manual

Certificates
```

Downloads should be tracked.

Store

```
Product ID

Document

Download Time

IP Address (Optional)

User Agent (Optional)
```

Future dashboard analytics can use this information.

---

# 17. Related Products

Every Product Detail Page should display

```
4 Related Products
```

Selection Priority

```
Same Category

↓

Similar Product

↓

Featured Product

↓

Newest Product
```

---

# 18. Service Discovery

Users should discover services through

- Home Page
- Services Page
- Industry Pages
- Product Pages

Each Service Page should link to related products.

---

# 19. Industry Discovery

Industry pages should display

```
Overview

↓

Challenges

↓

Solutions

↓

Related Products

↓

Related Services

↓

Contact CTA
```

---

# 20. Lead Generation Strategy

Every page should contain at least one Call To Action.

Examples

```
Explore Products

Download Catalogue

Request Quote

Contact Our Experts

Talk To Sales
```

The visitor should always know what to do next.

---

# 21. Enquiry Entry Points

Users should be able to submit enquiries from

```
Home

Products

Product Details

Services

Service Details

Industries

Industry Details

Contact Page
```

The form automatically knows where it originated.

---

# 22. Context-Aware Enquiry Form

If a visitor clicks

```
Servo Cable

↓

Request Quote
```

The enquiry form automatically fills

```
Product

Servo Cable
```

If a visitor clicks

```
SCADA

↓

Request Consultation
```

The enquiry automatically stores

```
Service

SCADA
```

No manual selection required.

---

# 23. Lead Source Tracking

Every enquiry stores

```
Source Type

Reference ID

Landing Page

Referrer URL

Submission Date
```

Example

```
PRODUCT

15

/products/servo-cables/panasonic-servo-cable
```

This helps the sales team understand where the lead originated.

---

# 24. Customer Information

Every enquiry should capture

```
Full Name

Company Name

Email

Phone

Subject

Requirement

Message
```

Optional

```
City

Country

Attachment
```

---

# 25. Email Flow

```
Customer

↓

Submit

↓

Database

↓

Confirmation Email

↓

Admin Notification

↓

Dashboard
```

The customer receives an acknowledgement.

The admin receives the enquiry details.

---

# 26. Lead Workflow

```
NEW

↓

CONTACTED

↓

IN_PROGRESS

↓

COMPLETED

↓

CLOSED
```

Status is updated from the Admin Dashboard.

---

# 27. Conversion Opportunities

The following actions should encourage enquiries.

```
Download PDF

↓

Request Quote

↓

Contact Expert

↓

Call Now

↓

WhatsApp (Future)
```

No page should end without a conversion opportunity.

---

# 28. Search Analytics (Future Ready)

Track

```
Search Keyword

Results Found

Clicked Product

Search Time
```

Future reports

```
Most Searched Products

Zero Result Searches

Popular Categories
```

---

# 29. Empty Search Results

Instead of displaying

```
No Results
```

Display

```
No matching products found.

Try another keyword.

↓

Popular Categories

↓

Featured Products

↓

Contact Our Team
```

---

# 30. Pagination

Products

```
12

24

36

Per Page
```

Maintain

```
Current Filters

Search

Sort
```

During pagination.

---

# 31. URL Based Filtering

Example

```
/products?category=servo-cables

/products?search=relay

/products?sort=az
```

URLs should remain shareable and bookmarkable.

---

# 32. Performance Strategy

Search results

- Debounced
- Cached
- Lazy Loaded

Filters should update without refreshing the page.

---

# 33. Mobile Experience

Mobile Search

- Full Screen Overlay
- Large Search Input
- Touch-Friendly Results
- Quick Category Access

The enquiry form should be optimized for one-handed usage.

---

# 34. AI Ready Search

The architecture should allow future integration with semantic search or AI-powered recommendations without changing the public API.

Potential future enhancements:

- Vector-based product search
- Natural language queries
- Intelligent product recommendations
- AI-assisted enquiry routing

---

# 35. Completion Checklist

- Global Search
- Dynamic Categories
- Product Filters
- Sorting
- Product Discovery
- Service Discovery
- Industry Discovery
- Related Products
- Download Tracking
- Context-Aware Enquiry Forms
- Lead Source Tracking
- Email Notifications
- Mobile Search
- URL-Based Filtering
- Future AI Compatibility

---

# Next Document

**Part 13 – Email Communication & Lead Management System**

This document will define:

- Contact form processing
- Email architecture
- SMTP configuration
- Email templates
- Customer acknowledgement emails
- Admin notifications
- Lead lifecycle management
- Internal notes
- Follow-up workflow
- Email logging
- Attachment handling
- Security and spam prevention

# Industrial Corporate CMS
## Software Design Specification (SDS)

**Version:** 1.0

**Part:** 13

**Title:** Email Communication & Lead Management System

---

# 1. Introduction

The Lead Management System is one of the most critical modules of the Industrial Corporate CMS.

Unlike an e-commerce website where customers place orders directly, this website generates business leads.

The objective of this module is to ensure that every customer enquiry is:

- Captured
- Stored
- Acknowledged
- Assigned
- Managed
- Tracked
- Converted into a business opportunity

The system should never lose an enquiry.

---

# 2. Lead Generation Flow

```
Website Visitor

↓

Browse Website

↓

View Product / Service

↓

Click Request Quote

↓

Fill Contact Form

↓

Submit

↓

Backend Validation

↓

Save to Database

↓

Send Customer Email

↓

Send Admin Email

↓

Dashboard Notification

↓

Lead Follow-up
```

---

# 3. Lead Sources

Every enquiry must have a source.

Possible Sources

```
CONTACT

PRODUCT

SERVICE

INDUSTRY

HOME_PAGE

CLIENTS_PAGE
```

Example

```
Source

PRODUCT

Reference ID

15

Reference Name

Panasonic Servo Cable
```

This allows Omronics to know exactly where every enquiry originated.

---

# 4. Lead Information

Every enquiry should store

## Customer Information

```
Customer Name

Company Name

Email Address

Phone Number

City

Country
```

---

## Enquiry Information

```
Subject

Requirement

Message

Attachment (Optional)

Preferred Contact Method
```

---

## System Information

```
Source Type

Reference ID

Landing Page

Referrer URL

IP Address

Browser

Submitted At
```

---

# 5. Contact Form Types

The website contains multiple enquiry forms.

## General Contact

```
Contact Us Page
```

---

## Product Enquiry

```
Product Details Page
```

---

## Service Enquiry

```
Service Details Page
```

---

## Industry Consultation

```
Industry Details Page
```

---

## Quick Contact

```
Homepage CTA
```

Although all forms look different, they all submit to the same API.

---

# 6. Form Validation

Required

```
Name

Company Name

Email

Phone

Requirement
```

Optional

```
Subject

Message

Attachment

City

Country
```

Validation Rules

```
Email Format

Phone Format

Required Fields

Maximum Length

Attachment Type

Attachment Size
```

---

# 7. Anti-Spam Protection

Every enquiry should pass through spam validation.

Checks

```
Rate Limiting

Google reCAPTCHA v3

Honeypot Field

Duplicate Submission Detection

Email Validation
```

Future

```
AI Spam Detection
```

---

# 8. Enquiry Submission Flow

```
Customer

↓

Fill Form

↓

Frontend Validation

↓

Backend Validation

↓

Store Database

↓

Generate Lead ID

↓

Send Emails

↓

Return Success

↓

Thank You Screen
```

---

# 9. Lead ID Generation

Every enquiry receives a unique ID.

Example

```
ENQ-2026-000001

ENQ-2026-000002

ENQ-2026-000003
```

Benefits

- Easy reference
- Customer communication
- Internal tracking

---

# 10. Customer Acknowledgement Email

Immediately after successful submission

Customer receives

```
Subject

Thank You For Contacting Omronics
```

---

Contents

```
Company Logo

Greeting

Thank You Message

Lead Number

Summary

Support Contact

Social Links
```

---

Example

```
Hello John,

Thank you for contacting Omronics.

Your enquiry has been successfully received.

Reference Number

ENQ-2026-000152

Our engineering team will review your requirements and contact you shortly.

Regards

Omronics Team
```

---

# 11. Admin Notification Email

The Admin should receive an email immediately.

Subject

```
New Product Enquiry Received
```

Contents

```
Lead Number

Customer

Company

Phone

Email

Product

Requirement

Date

Dashboard Link
```

---

# 12. Dashboard Integration

Every enquiry automatically appears in

```
Dashboard

↓

Lead Management

↓

Enquiries
```

Newest enquiries should appear first.

---

# 13. Lead Status Workflow

Every enquiry follows the same lifecycle.

```
NEW

↓

CONTACTED

↓

IN_PROGRESS

↓

QUOTATION_SENT

↓

NEGOTIATION

↓

COMPLETED

↓

CLOSED
```

---

Status Definitions

### NEW

Recently submitted.

---

### CONTACTED

Customer has been contacted.

---

### IN_PROGRESS

Requirements being discussed.

---

### QUOTATION_SENT

Official quotation shared.

---

### NEGOTIATION

Commercial discussion in progress.

---

### COMPLETED

Business successfully completed.

---

### CLOSED

Lead closed.

Reason

- Customer Cancelled
- Lost Opportunity
- Duplicate
- Invalid Lead

---

# 14. Internal Remarks

Every lead supports unlimited remarks.

Example

```
05 Aug

Customer requested customized cable.

----------------

06 Aug

Engineering team preparing quotation.

----------------

08 Aug

Waiting for customer approval.
```

Remarks are only visible inside the dashboard.

---

# 15. Lead Timeline

Each enquiry should maintain a complete activity timeline.

```
Created

↓

Customer Email Sent

↓

Admin Email Sent

↓

Status Updated

↓

Remark Added

↓

Closed
```

Future

```
Phone Calls

Meetings

Quotation Upload
```

---

# 16. File Attachments

Customers may attach

```
PDF

JPG

PNG
```

Examples

- Product Requirement
- Technical Drawing
- Existing Panel Images
- Wiring Diagram

Maximum Size

```
10 MB
```

---

# 17. Email Templates

The application should use reusable templates.

Templates

```
Customer Acknowledgement

Admin Notification

Status Update

Quotation Ready (Future)

Lead Closed (Future)
```

---

# 18. Email Design

Every email should contain

```
Company Logo

Professional Header

Responsive Layout

Company Information

Footer

Social Links
```

Brand colors should match the website.

---

# 19. SMTP Configuration

Use

```
SMTP
```

Configuration

```
SMTP_HOST

SMTP_PORT

SMTP_USERNAME

SMTP_PASSWORD

SMTP_SECURE
```

Stored in

```
.env
```

---

# 20. Email Queue

Emails should not block API responses.

Workflow

```
Store Database

↓

Queue Email

↓

Return Success

↓

Background Email Worker

↓

Send Email
```

If queue infrastructure is not available initially, implement the email service in a way that can later be replaced with a queue without changing controller logic.

---

# 21. Failed Email Handling

If email sending fails

```
Store Enquiry

↓

Log Error

↓

Retry

↓

Notify Admin
```

The enquiry should **never** fail because of an email failure.

---

# 22. Lead Search

Admin should search by

```
Lead Number

Customer Name

Company

Email

Phone

Product

Status
```

---

# 23. Lead Filters

```
Status

Date Range

Source

Product

Service

Industry
```

---

# 24. Export Leads

Support exporting enquiries.

Formats

```
Excel

CSV
```

Future

```
PDF
```

---

# 25. Lead Statistics

Dashboard should display

```
Today's Leads

Weekly Leads

Monthly Leads

Product Enquiries

Service Enquiries

Industry Enquiries
```

Future

```
Lead Conversion Rate

Average Response Time

Most Requested Product
```

---

# 26. Follow-up Reminders (Future Ready)

Architecture should support

```
Reminder Date

Reminder Time

Assigned User

Notification
```

This feature will not be implemented in Version 1 but should not require database redesign later.

---

# 27. Security

Protect against

```
Spam

SQL Injection

XSS

Malicious Attachments

Email Header Injection
```

Never expose SMTP credentials.

---

# 28. Email Logging

Log

```
Email Type

Recipient

Status

Timestamp

Retry Count

Error Message (If Failed)
```

---

# 29. Customer Experience

After successful submission

Display

```
✓ Thank You

Your enquiry has been received.

Reference Number

ENQ-2026-000145

Our team will contact you shortly.
```

Provide

```
Back to Home

Browse More Products
```

---

# 30. Future CRM Integration

The lead management system should be designed so it can later integrate with

```
Zoho CRM

HubSpot

Salesforce

Microsoft Dynamics

Custom ERP
```

Integration should be possible through APIs or webhooks without changing the enquiry module.

---

# 31. Completion Checklist

- Unified Enquiry API
- Multiple Enquiry Sources
- Customer Acknowledgement Emails
- Admin Notification Emails
- Lead ID Generation
- Lead Status Workflow
- Internal Remarks
- Lead Timeline
- Attachment Support
- SMTP Configuration
- Email Templates
- Dashboard Integration
- Search
- Filters
- Export
- Email Logging
- Spam Protection
- CRM Ready Architecture

---
# Industrial Corporate CMS
## Software Design Specification (SDS)

**Version:** 1.0

**Part:** 15

**Title:** Performance Optimization & Scalability Strategy

---

# 1. Introduction

Performance is one of the most critical aspects of the Industrial Corporate CMS.

The objective is to ensure that every page loads quickly, interactions remain smooth, and animations never negatively affect usability.

Since the website heavily utilizes:

- React
- React Three Fiber
- Three.js
- AnimeJS
- Framer Motion

special attention must be given to optimization.

The goal is to create a website that **looks premium while performing like a lightweight application.**

---

# 2. Performance Goals

The application should satisfy the following targets.

| Metric | Target |
|----------|---------|
| Initial Page Load | < 2 Seconds |
| Largest Contentful Paint | < 2.5 Seconds |
| Interaction to Next Paint | < 200 ms |
| Cumulative Layout Shift | < 0.1 |
| Time To First Byte | < 800 ms |
| Lighthouse Performance | 90+ |
| Lighthouse Accessibility | 95+ |
| Lighthouse SEO | 95+ |

---

# 3. Performance Architecture

```
User

↓

Browser

↓

Cached Assets

↓

React Application

↓

Optimized Components

↓

Optimized APIs

↓

MariaDB

↓

Response
```

Every layer should be optimized.

---

# 4. Frontend Optimization Strategy

The frontend should optimize

- Bundle Size
- Component Rendering
- State Updates
- Images
- Fonts
- API Calls
- Animations

---

# 5. React Optimization

Use

```
React.lazy()

Suspense

memo()

useMemo()

useCallback()
```

Only where beneficial.

Avoid unnecessary memoization.

---

# 6. Route Based Code Splitting

Every page should load independently.

```
Home

↓

Lazy Load

↓

About

↓

Lazy Load

↓

Products

↓

Lazy Load

↓

Dashboard

↓

Lazy Load
```

Users should never download the entire application upfront.

---

# 7. Component Lazy Loading

Heavy components should load only when needed.

Examples

```
ThreeJS Scene

Google Maps

Charts

Rich Text Editor

PDF Viewer

Image Gallery
```

---

# 8. React Query Optimization

Cache Duration

```
5 Minutes
```

Background Refetch

```
Enabled
```

Retry

```
2 Times
```

Deduplicate Requests

```
Enabled
```

---

# 9. API Request Optimization

Avoid duplicate requests.

Flow

```
Component

↓

React Query Cache

↓

Existing Data?

↓

Yes

↓

Use Cache

↓

No

↓

API
```

---

# 10. Image Optimization

Every uploaded image should

- Convert to WebP
- Compress automatically
- Generate multiple sizes
- Lazy load
- Use responsive dimensions

Supported Sizes

```
Thumbnail

300px

----------------

Small

600px

----------------

Medium

1200px

----------------

Original
```

---

# 11. Responsive Images

Use

```
srcset

sizes
```

Never serve desktop images to mobile devices.

---

# 12. Font Optimization

Fonts

```
Inter

Poppins
```

Only required font weights should be loaded.

Enable

```
font-display: swap
```

Preload important fonts.

---

# 13. CSS Optimization

Tailwind should

- Purge unused classes
- Minify output
- Generate production builds only

Avoid

```
!important
```

where possible.

---

# 14. JavaScript Optimization

Enable

- Tree Shaking
- Minification
- Compression
- Dynamic Imports

Never import entire libraries when only a few modules are needed.

---

# 15. AnimeJS Optimization

AnimeJS should animate

```
transform

opacity
```

Avoid animating

```
width

height

top

left
```

GPU-accelerated transforms should always be preferred.

---

# 16. React Three Fiber Optimization

The 3D scene should

- Load lazily
- Use compressed assets
- Dispose unused geometries
- Dispose unused textures
- Limit draw calls
- Use reusable materials

Target

```
60 FPS
```

---

# 17. Three.js Asset Optimization

Models

Use

```
.glb
```

instead of

```
.obj
```

Compress using

```
Draco Compression
```

Textures

Compress

↓

Resize

↓

WebP

↓

GPU

---

# 18. Animation Strategy

Animations should

- Start only when visible
- Stop when offscreen
- Pause on hidden tabs
- Respect reduced motion preferences

Never run hidden animations.

---

# 19. Scroll Performance

Use

```
Intersection Observer
```

instead of

```
window.onscroll
```

This reduces CPU usage.

---

# 20. Product Gallery Optimization

Only load

Current Image

↓

Preload

Next Image

Do not preload every gallery image.

---

# 21. Database Optimization

Index

```
Slug

Status

Category

Featured

Created At
```

Avoid

```
SELECT *
```

Retrieve only required columns.

---

# 22. Query Optimization

Good

```sql
SELECT
id,
product_name,
thumbnail_image
FROM products
WHERE status='ACTIVE';
```

Avoid

```sql
SELECT *
FROM products;
```

---

# 23. Pagination Strategy

Products

```
12

24

36
```

Never return all products in one request.

---

# 24. Caching Strategy

Cache

```
Website Settings

Categories

Services

Industries

Navigation

Footer
```

Do not cache

```
Admin Dashboard

Enquiries

Authentication
```

---

# 25. Browser Caching

Images

```
1 Year
```

CSS

```
1 Year

Hashed File Names
```

API

```
No Cache

Dynamic
```

---

# 26. HTTP Compression

Enable

```
Gzip

Brotli
```

Compress

- HTML
- CSS
- JavaScript
- JSON

---

# 27. CDN Ready

The architecture should support future migration to

```
Cloudflare

AWS CloudFront

Azure CDN
```

No code changes should be required.

---

# 28. API Performance

Target Response Times

Authentication

```
<150 ms
```

Products

```
<250 ms
```

Categories

```
<150 ms
```

Services

```
<150 ms
```

Enquiries

```
<300 ms
```

Uploads

```
Depends on File Size
```

---

# 29. Bundle Size Goals

Initial Bundle

```
<250 KB (gzipped)
```

Three.js Bundle

```
Separate Chunk
```

Admin Bundle

```
Separate Chunk
```

Public Website

```
Separate Chunk
```

---

# 30. Memory Management

Dispose

- Textures
- Geometries
- Event Listeners
- Timers
- Observers

Never leave unused resources allocated.

---

# 31. Error Recovery

If

ThreeJS

fails

↓

Display

Static Hero

If

Images

fail

↓

Fallback Image

If

API

fails

↓

Retry

↓

Display Friendly Message

---

# 32. Mobile Optimization

Reduce

- Animation Intensity
- Particle Count
- Shadow Quality

Lazy load heavy modules.

Avoid loading 3D assets on low-performance devices if they significantly impact user experience.

---

# 33. Lighthouse Optimization

Target Scores

Performance

```
95+
```

Accessibility

```
100
```

SEO

```
100
```

Best Practices

```
100
```

---

# 34. Core Web Vitals Monitoring

Monitor

- LCP
- CLS
- INP
- FCP
- TTFB

Future integration

```
Google Analytics

Google Search Console

Vercel Analytics
```

---

# 35. Monitoring

Log

- Slow APIs
- Failed APIs
- Large Images
- Memory Usage
- Upload Failures

Future

```
Sentry

LogRocket

OpenTelemetry
```

---

# 36. Performance Testing

Test

Desktop

```
Chrome

Edge

Firefox

Safari
```

Mobile

```
Android

iPhone
```

Network

```
WiFi

4G

Slow 3G
```

---

# 37. Future Optimizations

Architecture should support

- Image CDN
- Redis Cache
- Edge Functions
- Server Side Rendering (SSR)
- Static Site Generation (SSG)
- Progressive Web App (PWA)
- AI-powered image optimization
- Adaptive streaming for future video content

---

# 38. Performance Checklist

## Frontend

- Lazy-loaded routes
- Code splitting
- Dynamic imports
- Optimized React rendering
- Cached API responses
- Optimized images
- Responsive images
- Optimized fonts

## Animations

- GPU-accelerated transforms
- Lazy-loaded Three.js
- Optimized AnimeJS timelines
- Reduced motion support
- Paused offscreen animations

## Backend

- Indexed queries
- Optimized SQL
- Paginated responses
- Compressed responses
- Efficient database access

## Assets

- WebP images
- Compressed PDFs
- Hashed static assets
- Long-term browser caching

---

# 39. Performance Completion Criteria

The performance implementation is considered complete when:

- Public pages load in under 2 seconds on a standard broadband connection.
- Animations remain smooth at approximately 60 FPS on modern hardware.
- Core Web Vitals meet Google's recommended thresholds.
- The application maintains excellent Lighthouse scores.
- Large media assets are optimized automatically.
- Database queries remain efficient under expected traffic.
- The website remains responsive across desktop, tablet, and mobile devices.

---

# Next Document

## Part 18 – AI Development Blueprint

This document will become the **master implementation guide** for AI-assisted development.

It will define:

- Project creation order
- Database implementation sequence
- Backend implementation roadmap
- Frontend implementation roadmap
- API integration workflow
- CMS development order
- Component development order
- Coding constraints
- AI prompts for each phase
- Acceptance criteria
- Development milestones

This document will be the one that an AI IDE (Cursor, Claude Code, Windsurf, GitHub Copilot, etc.) can follow from start to finish to build the complete Industrial Corporate CMS with minimal ambiguity.

# Industrial Corporate CMS
## Software Design Specification (SDS)

**Version:** 1.0

**Part:** 18

**Title:** AI Development Blueprint & Master Implementation Guide

---

# 1. Introduction

This document serves as the **Master Development Blueprint** for the Industrial Corporate CMS.

Unlike traditional documentation, this document is written specifically for AI-assisted software development.

It provides the exact implementation order, coding standards, dependencies, milestones, and architectural decisions required to build the complete application.

This document is intended to be consumed by:

- Cursor
- Claude Code
- Windsurf
- GitHub Copilot
- Roo Code
- Cline
- Future Developers

---

# 2. AI Development Philosophy

The AI should never attempt to build the entire project at once.

Instead, development must happen incrementally.

Every phase must be completed successfully before moving to the next.

Never skip dependencies.

Never generate placeholder code unless explicitly requested.

Always prefer production-ready code over demo implementations.

---

# 3. High Level Development Workflow

```
Project Initialization

↓

Database Design

↓

Backend Setup

↓

Authentication

↓

REST APIs

↓

Frontend Setup

↓

Public Website

↓

Admin Dashboard

↓

Media Management

↓

SEO

↓

Search

↓

Lead Management

↓

Optimization

↓

Testing

↓

Deployment
```

Every stage depends on the successful completion of the previous stage.

---

# 4. Development Rules

The AI should follow these principles.

- Never duplicate code.
- Always build reusable components.
- Never hardcode values.
- Never bypass the service layer.
- Always validate user input.
- Always write modular code.
- Always follow the folder structure.
- Prefer composition over duplication.
- Keep files focused on a single responsibility.

---

# 5. Phase 1 - Project Initialization

## Backend

Create

```
server/

config/

controllers/

middlewares/

routes/

services/

repositories/

validators/

utils/

constants/

uploads/

sql/
```

Install

```
Node.js

Express

MariaDB Driver

bcrypt

jsonwebtoken

dotenv

helmet

cors

multer

sharp

nodemailer

compression

express-rate-limit

zod

morgan
```

---

## Frontend

Create

```
client/

components/

pages/

layouts/

hooks/

services/

routes/

context/

styles/

assets/
```

Install

```
React

Vite

React Router

Tailwind CSS

Axios

TanStack Query

React Hook Form

Zod

Framer Motion

AnimeJS

Three.js

React Three Fiber

@react-three/drei

Lucide React
```

---

# 6. Phase 2 - Database

Create all database tables.

Order

```
admins

↓

categories

↓

products

↓

media

↓

services

↓

industries

↓

clients

↓

testimonials

↓

enquiries

↓

website_settings
```

Then

Create

- Foreign Keys
- Indexes
- Constraints

Finally

Insert

Initial Admin User.

---

# 7. Phase 3 - Backend Foundation

Implement

```
Database Connection

↓

Express App

↓

Middleware

↓

Error Handler

↓

Logger

↓

Response Helpers

↓

Configuration
```

Test

Health Check API

```
GET

/api/v1/health
```

---

# 8. Phase 4 - Authentication

Implement

```
Login

JWT

Middleware

Password Hashing

Protected Routes

Profile API

Change Password
```

Do not continue until authentication is fully working.

---

# 9. Phase 5 - Generic CRUD Framework

Build reusable infrastructure before implementing modules.

Components

```
Generic Controller

Generic Service

Generic Repository

Generic CRUD Form

Generic Data Table

Generic Modal

Generic Upload Component
```

All future modules must reuse these components.

---

# 10. Phase 6 - Core CMS Modules

Development Order

```
Categories

↓

Products

↓

Services

↓

Industries

↓

Clients

↓

Testimonials

↓

Website Settings

↓

Enquiries
```

Each module must be completed before starting the next.

---

# 11. Phase 7 - Media Management

Implement

```
Image Upload

↓

Image Compression

↓

WebP Conversion

↓

PDF Upload

↓

Gallery

↓

Preview

↓

Delete
```

Supported

```
Images

PDF
```

---

# 12. Phase 8 - Public Website

Development Order

```
Navbar

↓

Footer

↓

Home

↓

About

↓

Products

↓

Product Details

↓

Services

↓

Service Details

↓

Industries

↓

Industry Details

↓

Clients

↓

Contact
```

Each page should consume live APIs.

No mock data.

---

# 13. Phase 9 - Admin Dashboard

Development Order

```
Login

↓

Dashboard

↓

Sidebar

↓

Categories

↓

Products

↓

Services

↓

Industries

↓

Clients

↓

Testimonials

↓

Enquiries

↓

Website Settings
```

All CRUD operations must use reusable components.

---

# 14. Phase 10 - Search

Implement

```
Global Search

↓

Category Filters

↓

Sorting

↓

Pagination

↓

Search Suggestions
```

---

# 15. Phase 11 - SEO

Implement

```
Meta Tags

↓

Open Graph

↓

JSON-LD

↓

Sitemap

↓

Robots

↓

Canonical URLs
```

Verify every page.

---

# 16. Phase 12 - Lead Management

Implement

```
Contact Form

↓

Database

↓

Emails

↓

Dashboard

↓

Lead Status

↓

Internal Remarks
```

---

# 17. Component Development Order

Develop reusable components first.

```
Button

↓

Input

↓

Textarea

↓

Dropdown

↓

Modal

↓

Table

↓

Pagination

↓

Upload

↓

Cards

↓

Forms
```

Only then build pages.

---

# 18. API Development Order

```
Authentication

↓

Categories

↓

Products

↓

Services

↓

Industries

↓

Clients

↓

Testimonials

↓

Enquiries

↓

Uploads

↓

Website Settings
```

Every API must be tested before frontend integration.

---

# 19. Frontend Integration Order

```
Authentication

↓

Navigation

↓

Homepage

↓

Categories

↓

Products

↓

Services

↓

Industries

↓

Clients

↓

Contact

↓

Dashboard
```

Integrate one module at a time.

---

# 20. Animation Development Order

```
Layout Animations

↓

Navbar

↓

Hero

↓

Cards

↓

Page Transitions

↓

Scroll Animations

↓

Three.js Hero Scene

↓

Background Effects
```

Optimize before adding more animations.

---

# 21. Three.js Development Strategy

The AI should:

- Load Three.js scenes lazily.
- Use React Three Fiber components.
- Keep scenes modular.
- Separate scene logic from UI.
- Optimize geometry and textures.
- Dispose resources properly.

The Hero scene should be implemented before adding decorative 3D elements elsewhere.

---

# 22. Coding Constraints

Never

- Hardcode API URLs.
- Hardcode colors.
- Hardcode spacing values.
- Duplicate CRUD logic.
- Duplicate upload logic.
- Duplicate validation logic.
- Query the database directly from controllers.
- Ignore validation errors.

Always

- Use environment variables.
- Use reusable components.
- Use centralized helpers.
- Follow the project architecture.

---

# 23. Folder Creation Order

Backend

```
config

↓

middlewares

↓

utils

↓

services

↓

repositories

↓

controllers

↓

routes
```

Frontend

```
assets

↓

components

↓

layouts

↓

pages

↓

services

↓

hooks

↓

routes
```

---

# 24. Git Workflow

Main Branch

```
main
```

Development Branch

```
develop
```

Feature Branch Example

```
feature/products

feature/services

feature/search
```

Every feature should be merged into `develop` before `main`.

---

# 25. Commit Message Convention

Examples

```
feat: implement product CRUD

fix: resolve image upload validation

refactor: optimize product service

docs: update API specification

style: improve hero animations

perf: optimize React Three Fiber scene
```

---

# 26. AI Coding Rules

The AI must:

- Read existing code before generating new code.
- Reuse existing components whenever possible.
- Avoid introducing new dependencies without justification.
- Preserve established coding conventions.
- Keep functions small and focused.
- Prefer configuration over hardcoding.
- Write descriptive variable and function names.
- Add comments only where the intent is not obvious.

---

# 27. Definition of Done

A module is complete only when:

- Backend API implemented.
- Validation completed.
- Database integrated.
- Frontend connected.
- Responsive design verified.
- Loading states added.
- Error handling implemented.
- Animations applied where appropriate.
- SEO considered (for public pages).
- No console errors.
- No TypeScript/ESLint warnings (if configured).
- Documentation updated if required.

---

# 28. AI Verification Checklist

Before marking any task complete, verify:

Backend

- API works.
- Validation passes.
- Authentication enforced.
- Database queries optimized.

Frontend

- Responsive.
- Accessible.
- No broken layouts.
- Loading states implemented.
- Error states implemented.

Media

- Upload works.
- Preview works.
- Delete works.

Animations

- Smooth.
- No frame drops.
- Respect reduced motion.

---

# 29. Development Milestones

Milestone 1

```
Backend Ready
```

Milestone 2

```
Authentication Complete
```

Milestone 3

```
CMS Complete
```

Milestone 4

```
Public Website Complete
```

Milestone 5

```
Lead Management Complete
```

Milestone 6

```
SEO Complete
```

Milestone 7

```
Performance Optimized
```

Milestone 8

```
Production Ready
```

---

# 30. Acceptance Criteria

The project will be considered production-ready when:

- All APIs are functional.
- Public website is fully responsive.
- Admin dashboard supports complete content management.
- JWT authentication secures all protected routes.
- Images and PDFs upload successfully.
- Search and filtering operate correctly.
- Enquiries are stored and emailed successfully.
- SEO is fully implemented.
- Performance targets are met.
- The codebase remains modular, reusable, and maintainable.

---

# 31. AI Prompting Strategy

When using an AI IDE, development should be requested in small, well-defined tasks.

Preferred workflow:

1. Build database schema.
2. Implement backend for one module.
3. Test APIs.
4. Build frontend for the same module.
5. Integrate APIs.
6. Test the complete flow.
7. Move to the next module.

Avoid asking the AI to generate the entire application in a single prompt.

---

# 32. Project Completion Deliverables

The final deliverables should include:

- Complete React frontend.
- Complete Express backend.
- MariaDB database schema.
- API documentation.
- Environment configuration template.
- README with setup instructions.
- Admin user creation script.
- Production build configuration.
- Sample seed data.
- Technical documentation.

---

# 33. Final Engineering Principles

The Industrial Corporate CMS should be built to achieve the following qualities:

- Modular Architecture
- Enterprise-Level Code Quality
- High Performance
- Responsive Design
- Reusable Components
- Secure Authentication
- Scalable Structure
- Maintainable Codebase
- Professional User Experience
- Premium Visual Design

Every implementation decision should reinforce these principles.
