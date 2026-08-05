import dotenv from 'dotenv';
import mysql from 'mariadb';

dotenv.config();

// Polyfill BigInt JSON serialization for MariaDB BIGINT IDs
BigInt.prototype.toJSON = function () {
  const intVal = Number(this);
  return Number.isSafeInteger(intVal) ? intVal : this.toString();
};

const dbHost = (process.env.DB_HOST || '127.0.0.1').trim();
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = (process.env.DB_USERNAME || 'root').trim();
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = (process.env.DB_DATABASE || 'omronics').trim();
const isRemoteHost = dbHost !== '127.0.0.1' && dbHost !== 'localhost';
const useSsl = process.env.DB_SSL === 'true' || isRemoteHost;

// Create MariaDB Connection Pool
const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  acquireTimeout: 15000,
  connectTimeout: 15000,
});

/**
 * Execute a SQL query using connection from pool
 * @param {string} sql - SQL query string
 * @param {Array} params - Array of query parameters
 * @returns {Promise<any>} Query result
 */
export async function query(sql, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const res = await conn.query(sql, params);
    return res;
  } catch (err) {
    console.error('Database Query Error:', err.message, '| Query:', sql);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

/**
 * Test Database Connection Pool
 */
export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log(`✅ MariaDB Connected Successfully to database "${dbName}"`);
    conn.release();
    return true;
  } catch (err) {
    console.error(`❌ MariaDB Connection Failed:`, err.message);
    return false;
  }
}

export default pool;
