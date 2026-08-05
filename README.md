# Omronics Industrial Corporate CMS

Production-Ready Pure JavaScript Industrial Corporate Content Management System built for **Omronics**.

---

## Technology Stack

- **Backend**: Node.js, Express.js (Layered Architecture: Route → Controller → Service → Repository → MariaDB)
- **Database**: MariaDB 11+ (utf8mb4_unicode_ci)
- **Authentication**: JWT, bcrypt (Salt 12)
- **Media Upload**: Multer + Sharp (Auto-converted `.webp` images & PDF documents)
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, AnimeJS, React Three Fiber (R3F)
- **State Management & Data Fetching**: TanStack React Query, Axios
- **Form & Validation**: React Hook Form, Zod

---

## Folder Hierarchy

```
Omronics/
├── client/                     # Pure JavaScript React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Reusable Public & Admin CRUD Components
│   │   ├── context/            # AuthContext State Provider
│   │   ├── pages/              # Public Pages & Protected Admin Pages
│   │   ├── routes/             # AppRoutes & ProtectedRoute Guard
│   │   └── services/           # Axios Instance with JWT Interceptor
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Layered Express.js Backend
│   ├── config/                 # MariaDB Pool, JWT, Multer
│   ├── controllers/            # Request Handlers
│   ├── services/               # Business Logic Layer
│   ├── repositories/           # MariaDB SQL Data Access Layer
│   ├── middlewares/            # JWT Auth, Error Handler, Rate Limiters
│   ├── validators/             # Zod Schemas
│   ├── utils/                  # Response, Logger, Slug, Image (Sharp)
│   ├── uploads/                # Media Storage
│   ├── app.js
│   └── server.js
│
├── database/                   # MariaDB SQL DDL Schema & Seeder
│   ├── schema.sql
│   └── seed.js
│
├── package.json                # Monorepo Scripts
└── .env.example
```

---

## Setup & Running Locally

### 1. Database Setup (MariaDB)

Run the SQL schema in MariaDB:
```bash
mysql -u root -p < database/schema.sql
```

Execute seed data (Admin credentials & initial categories):
```bash
node database/seed.js
```

Default Admin Credentials:
- **Email**: `admin@omronics.com`
- **Password**: `Password123!`

---

### 2. Install Dependencies

Install root backend dependencies:
```bash
npm install
```

Install client dependencies:
```bash
cd client && npm install && cd ..
```

---

### 3. Start Development Server

Run both Backend (Port 5000) and Frontend (Port 5173) simultaneously:
```bash
npm run dev
```

---

## Public & Admin Routes

### Public Website
- `http://localhost:5173/` - Home Page (Interactive 3D Hero + Product Highlights)
- `http://localhost:5173/products` - Products Catalog & Spec Downloads
- `http://localhost:5173/products/:slug` - Product Details & Lead Quote Modal
- `http://localhost:5173/services` - Engineering Services
- `http://localhost:5173/industries` - Industry Sector Applications
- `http://localhost:5173/clients` - OEM Clients & Partners
- `http://localhost:5173/about` - About Omronics & ISO Certifications
- `http://localhost:5173/contact` - Contact Form & Direct Support

### Admin Dashboard (Protected)
- `http://localhost:5173/admin/login` - Admin Login
- `http://localhost:5173/admin/dashboard` - Executive KPI Overview
- `http://localhost:5173/admin/products` - Product CRUD Management
- `http://localhost:5173/admin/categories` - Category Management
- `http://localhost:5173/admin/enquiries` - Customer Lead Management
- `http://localhost:5173/admin/settings` - Global Website & SEO Settings
