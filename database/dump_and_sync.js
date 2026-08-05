import mariadb from 'mariadb';

const localConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'aditya',
  password: 'aditya123!@#',
  database: 'omronics',
};

const liveConfig = {
  host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'ZSSayf3LGxEGeJE.root',
  password: 'AusD01rjaJUBVyFG',
  database: 'omronics',
  ssl: { rejectUnauthorized: false },
};

const tables = [
  'website_settings',
  'admins',
  'categories',
  'products',
  'product_images',
  'product_documents',
  'services',
  'industries',
  'clients',
  'testimonials',
  'enquiries',
];

async function syncLocalToLive() {
  let localConn;
  let liveConn;

  try {
    console.log('🔌 Connecting to Local MariaDB (127.0.0.1:3306)...');
    localConn = await mariadb.createConnection(localConfig);
    console.log('✅ Local MariaDB connected!');

    console.log('🔌 Connecting to Live TiDB Cloud (gateway01...:4000)...');
    liveConn = await mariadb.createConnection(liveConfig);
    console.log('✅ Live TiDB Cloud connected!');

    console.log('🔒 Disabling foreign key checks on TiDB Cloud...');
    await liveConn.query('SET FOREIGN_KEY_CHECKS = 0;');

    for (const table of tables) {
      console.log(`\n📦 Syncing table: "${table}"...`);
      const rows = await localConn.query(`SELECT * FROM \`${table}\``);
      console.log(`   Found ${rows.length} rows in local database.`);

      if (rows.length === 0) continue;

      // Truncate live table
      await liveConn.query(`TRUNCATE TABLE \`${table}\``);

      // Build bulk insert
      const columns = Object.keys(rows[0]);
      const colNames = columns.map((col) => `\`${col}\``).join(', ');
      const placeholders = columns.map(() => '?').join(', ');
      const insertSql = `INSERT INTO \`${table}\` (${colNames}) VALUES (${placeholders})`;

      let insertedCount = 0;
      for (const row of rows) {
        const values = columns.map((col) => row[col]);
        await liveConn.query(insertSql, values);
        insertedCount++;
      }
      console.log(`   ✅ Transferred ${insertedCount} rows to TiDB Cloud!`);
    }

    console.log('\n🔓 Re-enabling foreign key checks on TiDB Cloud...');
    await liveConn.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('\n🎉 ALL LOCAL DATABASE DATA HAS BEEN COPIED TO LIVE TiDB CLOUD SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ Sync Error:', err.message || err);
  } finally {
    if (localConn) await localConn.end();
    if (liveConn) await liveConn.end();
  }
}

syncLocalToLive();
