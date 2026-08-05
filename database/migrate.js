import fs from 'fs';
import path from 'path';
import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = (process.env.DB_HOST || '127.0.0.1').trim();
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = (process.env.DB_USERNAME || 'root').trim();
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = (process.env.DB_DATABASE || 'omronics').trim();
const isRemoteHost = dbHost !== '127.0.0.1' && dbHost !== 'localhost';
const useSsl = process.env.DB_SSL === 'true' || isRemoteHost;

async function runSchema() {
  let conn;
  try {
    console.log(`🔌 Connecting to MariaDB/TiDB (${dbUser}@${dbHost}:${dbPort}/${dbName})...`);
    conn = await mariadb.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      multipleStatements: true,
      connectTimeout: 15000,
    });

    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    console.log(`📄 Reading DDL script from ${schemaPath}...`);
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⚡ Executing Database Schema DDL...');
    await conn.query(sql);
    console.log('✅ Database schema created/updated successfully!');
  } catch (err) {
    console.error('❌ Failed to execute schema.sql:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

runSchema();
