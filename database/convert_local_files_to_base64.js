import fs from 'fs';
import path from 'path';
import mariadb from 'mariadb';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();

const dbHost = (process.env.DB_HOST || '127.0.0.1').trim();
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = (process.env.DB_USERNAME || 'root').trim();
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = (process.env.DB_DATABASE || 'omronics').trim();
const isRemoteHost = dbHost !== '127.0.0.1' && dbHost !== 'localhost';
const useSsl = process.env.DB_SSL === 'true' || isRemoteHost;

async function fileToBase64(relativePath) {
  if (!relativePath || relativePath.startsWith('data:image')) return relativePath;
  const cleanPath = relativePath.replace(/^\//, '');
  const absolutePath = path.join(process.cwd(), 'server', cleanPath);

  if (!fs.existsSync(absolutePath)) {
    console.warn(`   ⚠️ File not found on disk: ${absolutePath}`);
    return relativePath;
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  const webpBuffer = await sharp(fileBuffer).webp({ quality: 85 }).toBuffer();
  return `data:image/webp;base64,${webpBuffer.toString('base64')}`;
}

async function convertDatabaseImagesToBase64() {
  let conn;
  try {
    console.log(`🔌 Connecting to Database (${dbUser}@${dbHost}:${dbPort}/${dbName})...`);
    conn = await mariadb.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    });
    console.log('✅ Connected successfully!');

    // 1. Website Settings (logo & favicon)
    console.log('\n⚙️ Converting website_settings logo & favicon...');
    const settings = await conn.query('SELECT * FROM website_settings');
    for (const row of settings) {
      const logoBase64 = await fileToBase64(row.logo);
      const faviconBase64 = await fileToBase64(row.favicon);
      await conn.query('UPDATE website_settings SET logo = ?, favicon = ? WHERE id = ?', [logoBase64, faviconBase64, row.id]);
    }
    console.log('   ✅ website_settings updated!');

    // 2. Categories
    console.log('\n📁 Converting categories images...');
    const categories = await conn.query('SELECT * FROM categories');
    for (const row of categories) {
      const bannerBase64 = await fileToBase64(row.banner_image);
      const thumbBase64 = await fileToBase64(row.thumbnail_image);
      await conn.query('UPDATE categories SET banner_image = ?, thumbnail_image = ? WHERE id = ?', [bannerBase64, thumbBase64, row.id]);
    }
    console.log('   ✅ categories updated!');

    // 3. Products (thumbnail_image)
    console.log('\n📦 Converting products thumbnail_image...');
    const products = await conn.query('SELECT * FROM products');
    for (const row of products) {
      const thumbBase64 = await fileToBase64(row.thumbnail_image);
      await conn.query('UPDATE products SET thumbnail_image = ? WHERE id = ?', [thumbBase64, row.id]);
    }
    console.log('   ✅ products updated!');

    // 4. Product Images (image_url)
    console.log('\n🖼️ Converting product_images gallery...');
    const productImages = await conn.query('SELECT * FROM product_images');
    for (const row of productImages) {
      const imgBase64 = await fileToBase64(row.image_url);
      await conn.query('UPDATE product_images SET image_url = ? WHERE id = ?', [imgBase64, row.id]);
    }
    console.log('   ✅ product_images updated!');

    // 5. Clients (logo_url)
    console.log('\n🤝 Converting clients logo_url...');
    const clients = await conn.query('SELECT * FROM clients');
    for (const row of clients) {
      const logoBase64 = await fileToBase64(row.logo_url);
      await conn.query('UPDATE clients SET logo_url = ? WHERE id = ?', [logoBase64, row.id]);
    }
    console.log('   ✅ clients updated!');

    // 6. Services & Industries
    console.log('\n🔧 Converting services & industries images...');
    const services = await conn.query('SELECT * FROM services');
    for (const row of services) {
      const bannerBase64 = await fileToBase64(row.banner_image);
      const thumbBase64 = await fileToBase64(row.thumbnail_image);
      await conn.query('UPDATE services SET banner_image = ?, thumbnail_image = ? WHERE id = ?', [bannerBase64, thumbBase64, row.id]);
    }

    const industries = await conn.query('SELECT * FROM industries');
    for (const row of industries) {
      const bannerBase64 = await fileToBase64(row.banner_image);
      const thumbBase64 = await fileToBase64(row.thumbnail_image);
      await conn.query('UPDATE industries SET banner_image = ?, thumbnail_image = ? WHERE id = ?', [bannerBase64, thumbBase64, row.id]);
    }
    console.log('   ✅ services & industries updated!');

    console.log('\n🎉 ALL IMAGES CONVERTED & SAVED DIRECTLY INTO DATABASE IN WEBP BASE64 FORMAT!');
  } catch (err) {
    console.error('❌ Conversion error:', err.message || err);
  } finally {
    if (conn) await conn.end();
  }
}

convertDatabaseImagesToBase64();
