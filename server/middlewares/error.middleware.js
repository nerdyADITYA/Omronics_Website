import { MESSAGES } from '../constants/messages.js';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

/**
 * Custom Error Class for API application errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized Express Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, { stack: err.stack });

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // Handle Syntax / JSON parse error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Invalid JSON payload received.', 400);
  }

  // Default internal error
  const message = process.env.NODE_ENV === 'production' ? MESSAGES.INTERNAL_ERROR : err.message;
  return sendError(res, message, 500);
}
