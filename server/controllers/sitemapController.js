const Blog = require('../models/Blog')

const STATIC_PATHS = ['', '/blogs', '/categories', '/login', '/register']

// @GET /sitemap.xml
exports.generateSitemap = async (req, res, next) => {
  try {
    const siteUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const blogs = await Blog.find({ status: 'published' })
      .select('slug updatedAt')
      .sort({ updatedAt: -1 })
      .lean()

    const staticUrls = STATIC_PATHS.map(path => `
  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>${path === '' ? '1.0' : '0.7'}</priority>
  </url>`).join('')

    const blogUrls = blogs.map(blog => `
  <url>
    <loc>${siteUrl}/blog/${blog.slug}</loc>
    <lastmod>${new Date(blog.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${blogUrls}
</urlset>`

    res.set('Content-Type', 'application/xml')
    res.send(xml)
  } catch (error) { next(error) }
}

// @GET /robots.txt
exports.generateRobotsTxt = (req, res) => {
  const siteUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  const txt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard

Sitemap: ${siteUrl.replace(/\/$/, '')}/sitemap.xml`

  res.set('Content-Type', 'text/plain')
  res.send(txt)
}
