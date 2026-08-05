import categoryRepository from '../repositories/category.repository.js';
import industryRepository from '../repositories/industry.repository.js';
import productRepository from '../repositories/product.repository.js';
import serviceRepository from '../repositories/service.repository.js';

export class SeoController {
  async getSitemap(req, res, next) {
    try {
      const baseUrl = process.env.CLIENT_URL || 'https://omronics.in';

      const staticPages = ['', '/about', '/products', '/services', '/industries', '/clients', '/contact'];
      const categories = await categoryRepository.findAll({ limit: 500, status: 'ACTIVE' });
      const products = await productRepository.findAll({ limit: 1000, status: 'ACTIVE' });
      const services = await serviceRepository.findAll({ limit: 500, status: 'ACTIVE' });
      const industries = await industryRepository.findAll({ limit: 500, status: 'ACTIVE' });

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // Static URLs
      staticPages.forEach((path) => {
        xml += `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${path === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
      });

      // Categories
      categories.data.forEach((cat) => {
        xml += `  <url>\n    <loc>${baseUrl}/products?category=${cat.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      });

      // Products
      products.data.forEach((p) => {
        xml += `  <url>\n    <loc>${baseUrl}/products/${p.slug}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      });

      // Services
      services.data.forEach((s) => {
        xml += `  <url>\n    <loc>${baseUrl}/services/${s.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      });

      // Industries
      industries.data.forEach((ind) => {
        xml += `  <url>\n    <loc>${baseUrl}/industries/${ind.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      });

      xml += `</urlset>`;

      res.header('Content-Type', 'application/xml');
      return res.status(200).send(xml);
    } catch (err) {
      next(err);
    }
  }

  getRobots(req, res) {
    const baseUrl = process.env.CLIENT_URL || 'https://omronics.in';
    const content = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
    res.header('Content-Type', 'text/plain');
    return res.status(200).send(content);
  }
}

export default new SeoController();
