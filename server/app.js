import 'dotenv/config';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import seoController from './controllers/seo.controller.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { httpLogger } from './middlewares/logger.middleware.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';
import apiRoutes from './routes/index.routes.js';

// Polyfill BigInt JSON serialization for Express JSON responses
BigInt.prototype.toJSON = function () {
  const intVal = Number(this);
  return Number.isSafeInteger(intVal) ? intVal : this.toString();
};

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Policy
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5000', 'https://omronics.in'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during dev/staging
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Compression & Body Parsers
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(httpLogger);

// Static Uploads Folder
const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Dynamic SEO Routes
app.get('/sitemap.xml', seoController.getSitemap);
app.get('/robots.txt', seoController.getRobots);

// Root Landing Handler (for direct browser navigation to port 5000)
app.get('/', (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Omronics Industrial CMS API</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #050a17; color: #f0f6ff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #0f172a; border: 1px solid #1e293b; padding: 2rem; border-radius: 1rem; max-width: 480px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
          h1 { color: #38bdf8; font-size: 1.5rem; margin-top: 0; }
          p { color: #94a3b8; font-size: 0.875rem; line-height: 1.5; }
          .btn { display: inline-block; background: linear-gradient(to right, #06b6d4, #2563eb); color: #020617; font-weight: bold; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; margin-top: 1rem; font-size: 0.875rem; }
          .badge { display: inline-block; background: #064e3b; color: #34d399; font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 9999px; margin-bottom: 1rem; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">API Operational</div>
          <h1>Omronics Industrial CMS</h1>
          <p>The Express.js REST API server is running on <strong>Port 5000</strong>.</p>
          <p>To view the React Web Application & Admin Dashboard, open the frontend dev server:</p>
          <a href="${clientUrl}" class="btn">Open Web Application (${clientUrl})</a>
        </div>
      </body>
    </html>
  `);
});

// API General Rate Limiting
app.use('/api', apiLimiter);

// API v1 Routes
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes); // Fallback alias

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource endpoint ${req.originalUrl} not found.`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
