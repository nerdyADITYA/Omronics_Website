import auditLogRepository from '../repositories/auditLog.repository.js';
import { logger } from '../utils/logger.js';

/**
 * Sensitive fields that must be masked before storing in audit logs
 */
const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'passwordHash',
  'oldPassword',
  'newPassword',
  'token',
  'refreshToken',
  'secret',
  'authorization',
  'cookie',
]);

/**
 * Recursively sanitize objects to remove passwords and large binary data
 */
function sanitizePayload(data, depth = 0) {
  if (!data || depth > 4) return data;

  if (Array.isArray(data)) {
    if (data.length > 50) {
      return `[Array with ${data.length} items]`;
    }
    return data.map((item) => sanitizePayload(item, depth + 1));
  }

  if (typeof data === 'object' && data !== null) {
    const clean = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('password') || lowerKey.includes('secret')) {
        clean[key] = '[REDACTED]';
      } else if (typeof value === 'string' && (value.startsWith('data:image') || value.length > 3000)) {
        clean[key] = `[TRUNCATED (${value.length} chars)]`;
      } else {
        clean[key] = sanitizePayload(value, depth + 1);
      }
    }
    return clean;
  }

  return data;
}

export class AuditLogService {
  /**
   * Asynchronously log an administrative action
   * @param {Object} entry
   */
  async logAction({
    admin_id = null,
    admin_name = null,
    admin_email = null,
    action,
    entity_type = null,
    entity_id = null,
    page = null,
    method = null,
    endpoint = null,
    ip_address = null,
    user_agent = null,
    status = 'SUCCESS',
    details = null,
  }) {
    try {
      const sanitizedDetails = details ? sanitizePayload(details) : null;

      await auditLogRepository.create({
        admin_id,
        admin_name,
        admin_email,
        action: action ? String(action).toUpperCase() : 'UNKNOWN',
        entity_type,
        entity_id,
        page,
        method,
        endpoint,
        ip_address,
        user_agent,
        status: status === 'FAILED' ? 'FAILED' : 'SUCCESS',
        details: sanitizedDetails,
      });
    } catch (err) {
      logger.warn(`[AuditLogService] Failed to record audit log: ${err.message}`);
    }
  }

  /**
   * Helper to query audit logs directly from repository
   */
  async getLogs(filters = {}) {
    return await auditLogRepository.findAll(filters);
  }
}

export default new AuditLogService();
