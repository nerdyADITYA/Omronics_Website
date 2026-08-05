import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mysql from 'mariadb';

dotenv.config();

const dbHost = (process.env.DB_HOST || '127.0.0.1').trim();
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = (process.env.DB_USERNAME || 'root').trim();
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = (process.env.DB_DATABASE || 'omronics').trim();
const isRemoteHost = dbHost !== '127.0.0.1' && dbHost !== 'localhost';
const useSsl = process.env.DB_SSL === 'true' || isRemoteHost;

const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  connectionLimit: 5,
});

async function seed() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('🌱 Connected to MariaDB/TiDB for seeding...');

    // 1. Seed Admin
    const hashedPassword = await bcrypt.hash('Password123!', 12);
    await conn.query(
      `INSERT INTO admins (full_name, email, password_hash, role, status)
       VALUES (?, ?, ?, 'SUPER_ADMIN', 'ACTIVE')
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash);`,
      ['Omronics Administrator', 'admin@omronics.com', hashedPassword]
    );
    console.log('✅ Seeded default admin: admin@omronics.com / Password123!');

    // 2. Seed Default Website Settings
    const [settingsCount] = await conn.query('SELECT COUNT(*) as cnt FROM website_settings');
    if (settingsCount.cnt === 0 || Number(settingsCount.cnt) === 0) {
      await conn.query(
        `INSERT INTO website_settings (company_name, company_email, phone, address, copyright_text)
         VALUES ('Omronics Motions and Control Pvt Ltd', 'sales@omronics.com', '+91 98765 43210', 'Plot 42, Sector 18, Gurugram, Haryana', '© 2026 Omronics Motions and Control Pvt Ltd. All Rights Reserved.');`
      );
      console.log('✅ Seeded default website settings');
    }

    // 3. Seed Initial Categories if empty
    const [categoryCount] = await conn.query('SELECT COUNT(*) as cnt FROM categories');
    if (categoryCount.cnt === 0 || Number(categoryCount.cnt) === 0) {
      await conn.query(`
        INSERT INTO categories (name, slug, description, sort_order) VALUES
        ('Servo Cables & Harnesses', 'servo-cables-harnesses', 'Pre-assembled motor power and encoder feedback cable assemblies for Panasonic, Mitsubishi, Yaskawa, and Delta drives.', 1),
        ('Relay Cards & Interface Modules', 'relay-interface-cards', 'DIN-rail mounted relay boards, optocoupler isolation cards, and CNC I/O breakout modules.', 2),
        ('Industrial Signal Converters', 'signal-converters', 'RS232 to RS485/RS422, USB to Serial, and isolated analog signal conditioners.', 3),
        ('Patch Cords & Communication Cables', 'patch-cords-communication', 'PROFINET, EtherCAT, and CANopen industrial Ethernet patch cables with M12/RJ45 shielded connectors.', 4);
      `);
      console.log('✅ Seeded initial product categories');
    }

    console.log('🎉 Seeding finished cleanly!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) {
      conn.release();
      await pool.end();
    }
  }
}

seed();
