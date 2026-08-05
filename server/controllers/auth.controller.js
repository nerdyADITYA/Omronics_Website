import authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

export class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const data = await authService.login(email, password, ipAddress);
      return sendSuccess(res, data, 'Login successful.');
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const profile = await authService.getProfile(req.user.id);
      return sendSuccess(res, profile, 'Profile fetched successfully.');
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, currentPassword, newPassword);
      return sendSuccess(res, {}, 'Password changed successfully.');
    } catch (err) {
      next(err);
    }
  }

  async verifyToken(req, res) {
    return sendSuccess(res, { user: req.user }, 'Token is valid.');
  }
}

export default new AuthController();
