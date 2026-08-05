import { query } from '../config/database.js';

export class AuthRepository {
  /**
   * Find admin by email
   * @param {string} email
   */
  async findByEmail(email) {
    const rows = await query('SELECT * FROM admins WHERE email = ? LIMIT 1', [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find admin by ID
   * @param {number|string} id
   */
  async findById(id) {
    const rows = await query(
      'SELECT id, full_name, email, phone, role, status, last_login, created_at FROM admins WHERE id = ? LIMIT 1',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Update last login timestamp and reset failed attempts
   * @param {number|string} id
   */
  async updateLoginSuccess(id) {
    await query(
      'UPDATE admins SET last_login = NOW(), failed_login_attempts = 0, locked_until = NULL WHERE id = ?',
      [id]
    );
  }

  /**
   * Increment failed login attempts and optionally lock account for 15 mins
   * @param {number|string} id
   * @param {number} attempts
   * @param {boolean} lock
   */
  async recordFailedLogin(id, attempts, lock = false) {
    if (lock) {
      await query(
        'UPDATE admins SET failed_login_attempts = ?, locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?',
        [attempts, id]
      );
    } else {
      await query('UPDATE admins SET failed_login_attempts = ? WHERE id = ?', [attempts, id]);
    }
  }

  /**
   * Update password hash
   * @param {number|string} id
   * @param {string} passwordHash
   */
  async updatePassword(id, passwordHash) {
    await query('UPDATE admins SET password_hash = ? WHERE id = ?', [passwordHash, id]);
  }
}

export default new AuthRepository();
