import settingsRepository from '../repositories/settings.repository.js';

function cleanImageUrl(val) {
  if (!val) return null;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        return parsed.url || parsed.document_url || val;
      } catch (e) {
        return val;
      }
    }
    return val;
  }
  if (typeof val === 'object') {
    return val.url || val.document_url || null;
  }
  return null;
}

export class SettingsService {
  async getSettings() {
    let settings = await settingsRepository.getSettings();
    if (!settings) {
      // Default initial fallback
      settings = await settingsRepository.updateSettings({
        company_name: 'Omronics Automation',
        company_email: 'pranav@omronics.com',
        support_email: 'sales@omronics.com',
        phone: '+91 9512953737',
        alternate_phone: '+91 9512983737',
        address: 'Plot No. 12, Phase 3, GIDC Industrial Estate, Naroda, Ahmedabad, Gujarat - 382330',
        meta_title: 'Omronics Automation | Industrial Automation & Electrical Engineering',
        meta_description:
          'Leading manufacturer and solution provider for servo cables, relay cards, SCADA integration, and industrial automation assemblies.',
      });
    }

    if (settings) {
      if (settings.logo) settings.logo = cleanImageUrl(settings.logo);
      if (settings.favicon) settings.favicon = cleanImageUrl(settings.favicon);
    }

    return settings;
  }

  async updateSettings(data) {
    const payload = { ...data };
    if (payload.logo !== undefined) {
      payload.logo = cleanImageUrl(payload.logo);
    }
    if (payload.favicon !== undefined) {
      payload.favicon = cleanImageUrl(payload.favicon);
    }
    return settingsRepository.updateSettings(payload);
  }
}

export default new SettingsService();
