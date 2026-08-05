import settingsRepository from '../repositories/settings.repository.js';

export class SettingsService {
  async getSettings() {
    let settings = await settingsRepository.getSettings();
    if (!settings) {
      // Default initial fallback
      settings = await settingsRepository.updateSettings({
        company_name: 'Omronics',
        company_email: 'info@omronics.com',
        support_email: 'support@omronics.com',
        phone: '+91 98765 43210',
        address: 'Industrial Automation Complex, Plot 42, Sector 18, Gurugram, Haryana - 122015, India',
        meta_title: 'Omronics - Next Generation Industrial Automation & Servo Solutions',
        meta_description:
          'Leading manufacturer and solution provider for servo cables, relay cards, SCADA integration, and industrial automation assemblies.',
      });
    }
    return settings;
  }

  async updateSettings(data) {
    return settingsRepository.updateSettings(data);
  }
}

export default new SettingsService();
