// This file defines the Express app itself — no connectDB(), no app.listen(),
// no dotenv loading. That separation is what lets tests import the app
// directly (via supertest) and run it against an isolated in-memory
// database, without touching the real production database or port 5000.
// server.js is the thin wrapper that actually boots this for real.
const express = require('express')
const cors    = require('cors')
const helmet  = require('helmet')
const compression = require('compression')
const morgan  = require('morgan')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')

const errorHandler = require('./middleware/errorHandler')

const authRoutes       = require('./routes/authRoutes')
const blogRoutes       = require('./routes/blogRoutes')
const commentRoutes    = require('./routes/commentRoutes')
const userRoutes       = require('./routes/userRoutes')
const newsletterRoutes = require('./routes/newsletterRoutes')
const uploadRoutes     = require('./routes/uploadRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const aiRoutes = require('./routes/aiRoutes')
const { logActivity } = require('./middleware/analytics')
const { generateSitemap, generateRobotsTxt } = require('./controllers/sitemapController')
const { sanitizeBody } = require('./middleware/sanitize')

const app = express()

// Deployed behind a single reverse proxy (Render/Cloudflare) — trust exactly
// one hop so req.ip resolves to the real client IP instead of the proxy's,
// which is required for per-visitor rate limiting to work correctly below.
app.set('trust proxy', 1)

// CORS — restricted to an explicit allowlist (localhost dev origins + configured client URL)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true
}))

// Security & Logging
// CSP lives in client/vercel.json instead — this server only ever returns
// JSON, so a Content-Security-Policy header here has no real effect on what
// gets rendered (that's governed by the HTML document's own origin).
app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }))
app.use(compression())
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev')) // keep test output clean
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(sanitizeBody)
app.use(logActivity)
app.use('/api/notifications', notificationRoutes)
app.use('/api/ai', aiRoutes)
app.get('/sitemap.xml', generateSitemap)
app.get('/robots.txt', generateRobotsTxt)

// Rate Limiting
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, try again later' }
}))
// Cache public GET endpoints at the CDN/browser level for a short time
app.use((req, res, next) => {
  if (req.method === 'GET' && (
    req.path.startsWith('/api/blogs') ||
    req.path.startsWith('/api/blogs/trending') ||
    req.path.startsWith('/api/blogs/featured')
  ) && !req.headers.authorization) {
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  }
  next()
})
// Routes
app.use('/api/auth',       authRoutes)
app.use('/api/blogs',      blogRoutes)
app.use('/api/comments',   commentRoutes)
app.use('/api/users',      userRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/upload',     uploadRoutes)

// Health Check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '✅ BlogSpace API is running!',
    version: '2.0.0',
    uptime: process.uptime().toFixed(0) + 's'
  })
})

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// Global Error Handler
app.use(errorHandler)

module.exports = app
