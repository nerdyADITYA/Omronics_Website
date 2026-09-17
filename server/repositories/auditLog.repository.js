import { query } from '../config/database.js';

function getLocalDateTime() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export class AuditLogRepository {
  /**
   * Insert a new audit log record
   * @param {Object} data
   */
  async create({
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
    created_at = null,
  }) {
    const detailsStr = typeof details === 'object' && details !== null ? JSON.stringify(details) : (details || null);
    const localCreatedAt = created_at || getLocalDateTime();

    const sql = `
      INSERT INTO audit_logs (
        admin_id,
        admin_name,
        admin_email,
        action,
        entity_type,
        entity_id,
        page,
        method,
        endpoint,
        ip_address,
        user_agent,
        status,
        details,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      admin_id ? BigInt(admin_id) : null,
      admin_name || null,
      admin_email || null,
      action,
      entity_type || null,
      entity_id ? String(entity_id) : null,
      page || null,
      method || null,
      endpoint || null,
      ip_address || null,
      user_agent ? String(user_agent).substring(0, 500) : null,
      status || 'SUCCESS',
      detailsStr,
      localCreatedAt,
    ];

    return await query(sql, params);
  }

  /**
   * Find audit logs with pagination and filters (for database query/inspection)
   */
  async findAll({
    page = 1,
    limit = 50,
    search = '',
    action = null,
    entity_type = null,
    status = null,
    admin_id = null,
    startDate = null,
    endDate = null,
  } = {}) {
    const whereClauses = [];
    const params = [];

    if (action && action !== 'ALL') {
      whereClauses.push('action = ?');
      params.push(action);
    }

    if (entity_type && entity_type !== 'ALL') {
      whereClauses.push('entity_type = ?');
      params.push(entity_type);
    }

    if (status && status !== 'ALL') {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (admin_id) {
      whereClauses.push('admin_id = ?');
      params.push(BigInt(admin_id));
    }

    if (startDate) {
      whereClauses.push('created_at >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereClauses.push('created_at <= ?');
      params.push(endDate);
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      whereClauses.push('(admin_name LIKE ? OR admin_email LIKE ? OR action LIKE ? OR entity_type LIKE ? OR page LIKE ? OR details LIKE ?)');
      params.push(s, s, s, s, s, s);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const offset = (Number(page) - 1) * Number(limit);

    const countSql = `SELECT COUNT(*) as total FROM audit_logs ${whereSql}`;
    const countRows = await query(countSql, params);
    const total = Number(countRows[0]?.total || 0);

    const selectSql = `
      SELECT id, admin_id, admin_name, admin_email, action, entity_type, entity_id, page, method, endpoint, ip_address, user_agent, status, details, created_at
      FROM audit_logs
      ${whereSql}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await query(selectSql, [...params, Number(limit), Number(offset)]);

    return {
      data: rows,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }
}

export default new AuditLogRepository();
