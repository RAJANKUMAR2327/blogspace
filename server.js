const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

const authRoutes = require('./routes/authRoutes')
const blogRoutes = require('./routes/blogRoutes')
const commentRoutes = require('./routes/commentRoutes')
const userRoutes = require('./routes/userRoutes')
const newsletterRoutes = require('./routes/newsletterRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const notificationRoutes = require('./routes/notificationRoutes')

const app = express()

// Connect to MongoDB
connectDB()

// ─── CORS ──────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  process.env.CLIENT_URL,
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

// ─── Middleware ─────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(morgan('dev'))

// ─── Rate Limiting ──────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
  validate: { xForwardedForHeader: false }
})
app.use('/api', limiter)

// ─── Routes ────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes)
app.use('/api/blogs',         blogRoutes)
app.use('/api/comments',      commentRoutes)
app.use('/api/users',         userRoutes)
app.use('/api/newsletter',    newsletterRoutes)
app.use('/api/upload',        uploadRoutes)
app.use('/api/notifications', notificationRoutes)

// ─── Sitemap ────────────────────────────────────────────────────
app.get('/sitemap.xml', async (req, res) => {
  try {
    const Blog = require('./models/Blog')
    const base = process.env.CLIENT_URL || 'https://your-app.vercel.app'
    const blogs = await Blog.find({ status: 'published' }).select('slug updatedAt')

    const urls = blogs.map(b => `
  <url>
    <loc>${base}/blog/${b.slug}</loc>
    <lastmod>${new Date(b.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${base}/blogs</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  ${urls}
</urlset>`

    res.header('Content-Type', 'application/xml')
    res.send(xml)
  } catch (err) {
    res.status(500).send('Error generating sitemap')
  }
})

app.get('/robots.txt', (req, res) => {
  const base = process.env.CLIENT_URL || 'https://your-app.vercel.app'
  res.type('text/plain')
  res.send(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml`)
})

// ─── Health Check ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '✅ BlogSpace API is running!', version: '2.0.0' })
})

// ─── 404 ────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ─── Global Error Handler ───────────────────────────────────────
app.use(errorHandler)

// ─── Scheduled Publishing (every 60s) ──────────────────────────
const publishScheduledBlogs = async () => {
  try {
    const Blog = require('./models/Blog')
    const result = await Blog.updateMany(
      { status: 'draft', scheduledAt: { $lte: new Date(), $ne: null } },
      { $set: { status: 'published', scheduledAt: null } }
    )
    if (result.modifiedCount > 0) {
      console.log(`📅 Auto-published ${result.modifiedCount} scheduled blog(s)`)
    }
  } catch (err) {
    console.error('Scheduler error:', err.message)
  }
}
setInterval(publishScheduledBlogs, 60 * 1000)

// ─── Start Server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  publishScheduledBlogs()
})