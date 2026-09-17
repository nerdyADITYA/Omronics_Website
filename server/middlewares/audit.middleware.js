import auditLogService from '../services/auditLog.service.js';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import { getClientIp } from '../utils/ip.js';

/**
 * Route prefix to entity type mapping
 */
const ROUTE_ENTITY_MAP = [
  { match: '/sub-products', entity: 'SubProduct', defaultPage: '/admin/sub-products' },
  { match: '/products', entity: 'Product', defaultPage: '/admin/products' },
  { match: '/cable-costs', entity: 'CableCost', defaultPage: '/admin/cable-calculator' },
  { match: '/categories', entity: 'Category', defaultPage: '/admin/categories' },
  { match: '/services', entity: 'Service', defaultPage: '/admin/services' },
  { match: '/industries', entity: 'Industry', defaultPage: '/admin/industries' },
  { match: '/clients', entity: 'Client', defaultPage: '/admin/clients' },
  { match: '/testimonials', entity: 'Testimonial', defaultPage: '/admin/testimonials' },
  { match: '/enquiries', entity: 'Enquiry', defaultPage: '/admin/enquiries' },
  { match: '/settings', entity: 'Settings', defaultPage: '/admin/settings' },
  { match: '/uploads', entity: 'Upload', defaultPage: '/admin/media' },
  { match: '/auth', entity: 'Auth', defaultPage: '/admin/login' },
];

/**
 * Resolve entity type and fallback page from URL
 */
function resolveRouteContext(url) {
  const normalized = (url || '').toLowerCase();
  for (const item of ROUTE_ENTITY_MAP) {
    if (normalized.includes(item.match)) {
      return { entity: item.entity, defaultPage: item.defaultPage };
    }
  }
  return { entity: 'General', defaultPage: '/admin' };
}

/**
 * Resolve frontend page path from headers or route
 */
function resolvePage(req, defaultPage) {
  // 1. Explicit header sent by Axios interceptor
  if (req.headers['x-admin-page']) {
    return String(req.headers['x-admin-page']).trim();
  }

  // 2. Referer header from browser navigation
  if (req.headers['referer']) {
    try {
      const url = new URL(req.headers['referer']);
      return url.pathname;
    } catch (e) {}
  }

  // 3. Fallback to default page for this entity
  return defaultPage;
}

/**
 * Extract authenticated user if available
 */
function extractUser(req) {
  if (req.user) return req.user;
  const auth = req.headers?.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const token = auth.split(' ')[1];
      const decoded = jwt.verify(token, jwtConfig.secret);
      return decoded;
    } catch (e) {}
  }
  return null;
}

/**
 * Express Middleware to automatically audit all mutating requests (POST, PUT, PATCH, DELETE)
 */
export function auditMiddleware(req, res, next) {
  // Only audit mutations
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  // Skip /auth/login because auth.service.js specifically logs LOGIN and LOGIN_FAILED with admin credentials
  if (req.originalUrl.includes('/auth/login')) {
    return next();
  }

  // Skip public enquiry submissions if not from authenticated admin
  const isPublicEnquiry = req.method === 'POST' && req.originalUrl.includes('/enquiries') && !extractUser(req);
  if (isPublicEnquiry) {
    return next();
  }

  const { entity, defaultPage } = resolveRouteContext(req.originalUrl);
  const page = resolvePage(req, defaultPage);
  const ipAddress = getClientIp(req);
  const userAgent = req.headers['user-agent'] || null;

  // Derive action
  let action = 'CREATE';
  if (req.originalUrl.includes('/import') || req.originalUrl.includes('/bulk')) {
    action = 'BULK_IMPORT';
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    action = 'UPDATE';
  } else if (req.method === 'DELETE') {
    action = 'DELETE';
  }

  // Capture snapshot of request body
  const bodySnapshot = req.body && typeof req.body === 'object' ? { ...req.body } : null;

  // Entity ID if present
  const entityId = req.params?.id || req.params?.slug || req.body?.id || req.body?.partcode || null;

  // Listen to response finish to capture status
  res.on('finish', () => {
    // If request was already explicitly logged (e.g. bulk import), avoid duplicate
    if (req._auditLogged) return;

    // Only log if user was authenticated
    const user = extractUser(req);
    if (!user) {
      return;
    }

    const isSuccess = res.statusCode >= 200 && res.statusCode < 400;

    auditLogService.logAction({
      admin_id: user?.id || null,
      admin_name: user?.full_name || null,
      admin_email: user?.email || null,
      action,
      entity_type: entity,
      entity_id: entityId,
      page,
      method: req.method,
      endpoint: req.originalUrl,
      ip_address: ipAddress,
      user_agent: userAgent,
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      details: bodySnapshot,
    });
  });

  next();
}
