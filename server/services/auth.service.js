import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import { MESSAGES } from '../constants/messages.js';
import { AppError } from '../middlewares/error.middleware.js';
import authRepository from '../repositories/auth.repository.js';
import { logger } from '../utils/logger.js';

export class AuthService {
  /**
   * Authenticate admin with email and password
   * @param {string} email
   * @param {string} password
   * @param {string} ipAddress
   */
  async login(email, password, ipAddress) {
    const admin = await authRepository.findByEmail(email);

    if (!admin) {
      logger.auth('LOGIN_FAILED_UNKNOWN_EMAIL', email, ipAddress);
      throw new AppError(MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (admin.status !== 'ACTIVE') {
      logger.auth('LOGIN_FAILED_INACTIVE_ACCOUNT', email, ipAddress);
      throw new AppError('Your account is inactive. Please contact system admin.', 403);
    }

    // Check account lockout
    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      logger.auth('LOGIN_FAILED_LOCKED_ACCOUNT', email, ipAddress);
      throw new AppError('Account is temporarily locked due to repeated failed logins. Try again later.', 403);
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      const attempts = (admin.failed_login_attempts || 0) + 1;
      const shouldLock = attempts >= 5;
      await authRepository.recordFailedLogin(admin.id, attempts, shouldLock);
      logger.auth(`LOGIN_FAILED_BAD_PASSWORD (Attempt ${attempts})`, email, ipAddress);
      throw new AppError(MESSAGES.INVALID_CREDENTIALS, 401);
    }

    // Successful login
    await authRepository.updateLoginSuccess(admin.id);
    logger.auth('LOGIN_SUCCESS', email, ipAddress);

    // Generate JWT Payload
    const payload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    return {
      token,
      user: {
        id: admin.id,
        fullName: admin.full_name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.last_login,
      },
    };
  }

  /**
   * Get authenticated user profile
   * @param {number|string} id
   */
  async getProfile(id) {
    const user = await authRepository.findById(id);
    if (!user) {
      throw new AppError(MESSAGES.NOT_FOUND, 404);
    }
    return user;
  }

  /**
   * Change current admin password
   * @param {number|string} id
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  async changePassword(id, currentPassword, newPassword) {
    const admin = await authRepository.findByEmail((await authRepository.findById(id))?.email);
    if (!admin) {
      throw new AppError(MESSAGES.NOT_FOUND, 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isMatch) {
      throw new AppError('Current password is incorrect.', 400);
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await authRepository.updatePassword(id, newHash);
  }
}

export default new AuthService();
