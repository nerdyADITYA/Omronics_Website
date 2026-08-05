/**
 * Parse and validate pagination parameters from request query
 * @param {object} query - Express req.query
 * @returns {{ page: number, limit: number, offset: number, search: string, sort: string, order: string }}
 */
export function getPagination(query = {}) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  const offset = (page - 1) * limit;
  const search = (query.search || '').trim();
  const sort = (query.sort || 'created_at').trim();
  const order = (query.order || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  return { page, limit, offset, search, sort, order };
}
