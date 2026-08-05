import { MESSAGES } from '../constants/messages.js';

/**
 * Send standard success response
 * @param {import('express').Response} res
 * @param {any} data
 * @param {string} message
 * @param {number} statusCode
 */
export function sendSuccess(res, data = {}, message = MESSAGES.SUCCESS, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send standard error response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode
 * @param {any[]} errors
 */
export function sendError(res, message = MESSAGES.INTERNAL_ERROR, statusCode = 500, errors = []) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  });
}

/**
 * Send paginated success response
 * @param {import('express').Response} res
 * @param {any[]} data
 * @param {object} pagination
 * @param {string} message
 */
export function sendPaginated(res, data = [], pagination = {}, message = MESSAGES.SUCCESS) {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || 0,
      totalPages: pagination.totalPages || Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
    },
  });
}
