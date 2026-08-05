import settingsService from '../services/settings.service.js';
import { sendSuccess } from '../utils/response.js';

export class SettingsController {
  async getSettings(req, res, next) {
    try {
      const settings = await settingsService.getSettings();
      return sendSuccess(res, settings, 'Website settings retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const settings = await settingsService.updateSettings(req.body);
      return sendSuccess(res, settings, 'Website settings updated successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export default new SettingsController();
