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
        is_maintenance_mode: 0,
        maintenance_title: 'Website Under Scheduled Maintenance',
        maintenance_message:
          'We are currently performing scheduled maintenance and upgrades to serve you better. Please check back shortly.',
        maintenance_contact_email: 'sales@omronics.com',
        maintenance_contact_phone: '+91 9512953737',
      });
    }

    if (settings) {
      if (settings.logo) settings.logo = cleanImageUrl(settings.logo);
      if (settings.favicon) settings.favicon = cleanImageUrl(settings.favicon);
      settings.is_maintenance_mode = Boolean(
        settings.is_maintenance_mode === 1 ||
        settings.is_maintenance_mode === true ||
        settings.is_maintenance_mode === '1' ||
        settings.is_maintenance_mode === 'true'
      );
      if (!settings.maintenance_title) {
        settings.maintenance_title = 'Website Under Scheduled Maintenance';
      }
      if (!settings.maintenance_message) {
        settings.maintenance_message =
          'We are currently performing scheduled maintenance and upgrades to serve you better. Please check back shortly.';
      }
      if (!settings.maintenance_contact_email) {
        settings.maintenance_contact_email = settings.support_email || settings.company_email || 'sales@omronics.com';
      }
      if (!settings.maintenance_contact_phone) {
        settings.maintenance_contact_phone = settings.phone || '+91 9512953737';
      }
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
    if (payload.is_maintenance_mode !== undefined) {
      payload.is_maintenance_mode = payload.is_maintenance_mode ? 1 : 0;
    }
    return settingsRepository.updateSettings(payload);
  }
}

export default new SettingsService();
