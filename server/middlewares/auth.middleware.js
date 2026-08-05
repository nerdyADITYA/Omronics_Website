import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import { MESSAGES } from '../constants/messages.js';
import { sendError } from '../utils/response.js';

/**
 * Verify JWT token in Authorization header
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, MESSAGES.UNAUTHORIZED, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Session expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid authorization token.', 401);
  }
}

/**
 * Verify user role requirement
 * @param {...string} roles
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, MESSAGES.FORBIDDEN, 403);
    }
    next();
  };
}
