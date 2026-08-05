import { query } from '../config/database.js';

export class BaseRepository {
  /**
   * @param {string} tableName
   * @param {string[]} searchFields
   * @param {boolean} isSoftDelete
   */
  constructor(tableName, searchFields = [], isSoftDelete = true) {
    this.tableName = tableName;
    this.searchFields = searchFields;
    this.isSoftDelete = isSoftDelete;
  }

  /**
   * Find paginated records with search and filters
   */
  async findAll({
    page = 1,
    limit = 10,
    offset = 0,
    search = '',
    sort = 'created_at',
    order = 'DESC',
    status = null,
    extraWhere = '',
    extraParams = [],
    isSoftDelete = this.isSoftDelete,
  } = {}) {
    const whereClauses = [];
    const params = [];

    if (isSoftDelete) {
      whereClauses.push('deleted_at IS NULL');
    }

    if (status) {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (search && this.searchFields.length > 0) {
      const searchOrs = this.searchFields.map((field) => `${field} LIKE ?`).join(' OR ');
      whereClauses.push(`(${searchOrs})`);
      const searchPattern = `%${search}%`;
      this.searchFields.forEach(() => params.push(searchPattern));
    }

    if (extraWhere) {
      whereClauses.push(extraWhere);
      params.push(...extraParams);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const safeSort = /^[a-zA-Z0-9_.]+$/.test(sort) ? sort : 'created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const sql = `SELECT * FROM ${this.tableName} ${whereSql} ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`;
    const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereSql}`;

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
   * Find single record by ID
   */
  async findById(id, isSoftDelete = this.isSoftDelete) {
    let sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    if (isSoftDelete) {
      sql += ' AND deleted_at IS NULL';
    }
    sql += ' LIMIT 1';
    const rows = await query(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find single record by Slug
   */
  async findBySlug(slug, isSoftDelete = this.isSoftDelete) {
    let sql = `SELECT * FROM ${this.tableName} WHERE slug = ?`;
    if (isSoftDelete) {
      sql += ' AND deleted_at IS NULL';
    }
    sql += ' LIMIT 1';
    const rows = await query(sql, [slug]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Create new record
   */
  async create(data) {
    const payload = { ...data };
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;

    const keys = Object.keys(payload);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    const res = await query(sql, Object.values(payload));
    return this.findById(res.insertId, this.isSoftDelete);
  }

  /**
   * Update existing record
   */
  async update(id, data) {
    const payload = { ...data };
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;

    const keys = Object.keys(payload);
    if (keys.length === 0) return this.findById(id, this.isSoftDelete);
    const setSql = keys.map((key) => `${key} = ?`).join(', ');
    const sql = `UPDATE ${this.tableName} SET ${setSql} WHERE id = ?`;
    await query(sql, [...Object.values(payload), id]);
    return this.findById(id, this.isSoftDelete);
  }

  /**
   * Delete record (soft or hard)
   */
  async delete(id, softDelete = this.isSoftDelete) {
    if (softDelete) {
      await query(`UPDATE ${this.tableName} SET deleted_at = NOW() WHERE id = ?`, [id]);
    } else {
      await query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    }
    return true;
  }
}
