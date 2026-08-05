import { query } from '../config/database.js';

export class SettingsRepository {
  async getSettings() {
    const rows = await query('SELECT * FROM website_settings LIMIT 1');
    return rows.length > 0 ? rows[0] : null;
  }

  async updateSettings(data) {
    const existing = await this.getSettings();
    const payload = { ...data };
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;

    if (!existing) {
      const keys = Object.keys(payload);
      if (keys.length === 0) return null;
      const placeholders = keys.map(() => '?').join(', ');
      const sql = `INSERT INTO website_settings (${keys.join(', ')}) VALUES (${placeholders})`;
      await query(sql, Object.values(payload));
    } else {
      const keys = Object.keys(payload);
      if (keys.length === 0) return existing;
      const setSql = keys.map((key) => `${key} = ?`).join(', ');
      const sql = `UPDATE website_settings SET ${setSql} WHERE id = ?`;
      await query(sql, [...Object.values(payload), existing.id]);
    }
    return this.getSettings();
  }
}

export default new SettingsRepository();
