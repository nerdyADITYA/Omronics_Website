import { BaseRepository } from './base.repository.js';
import { query } from '../config/database.js';

export class EnquiryRepository extends BaseRepository {
  constructor() {
    super('enquiries', ['customer_name', 'company_name', 'email', 'phone', 'subject', 'requirement', 'city', 'country'], false);
  }

  /**
   * Find enquiries filtered by source_type, status, or date
   */
  async findAll({
    page = 1,
    limit = 10,
    offset = 0,
    search = '',
    sort = 'created_at',
    order = 'DESC',
    status = null,
    sourceType = null,
  } = {}) {
    const whereClauses = [];
    const params = [];

    if (status) {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (sourceType) {
      whereClauses.push('source_type = ?');
      params.push(sourceType);
    }

    if (search && this.searchFields.length > 0) {
      const searchOrs = this.searchFields.map((field) => `${field} LIKE ?`).join(' OR ');
      whereClauses.push(`(${searchOrs})`);
      const searchPattern = `%${search}%`;
      this.searchFields.forEach(() => params.push(searchPattern));
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const safeSort = /^[a-zA-Z0-9_.]+$/.test(sort) ? sort : 'created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const sql = `SELECT * FROM enquiries ${whereSql} ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`;
    const countSql = `SELECT COUNT(*) as total FROM enquiries ${whereSql}`;

    const rows = await query(sql, [...params, limit, offset]);
    const countRes = await query(countSql, params);
    const total = Number(countRes[0]?.total || 0);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get total count grouped by enquiry status for KPI dashboard
   */
  async getStatusStats() {
    const rows = await query('SELECT status, COUNT(*) as count FROM enquiries GROUP BY status');
    return rows;
  }
}

export default new EnquiryRepository();
