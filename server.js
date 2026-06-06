const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

const authRoutes      = require('./routes/authRoutes')
const blogRoutes      = require('./routes/blogRoutes')
const commentRoutes   = require('./routes/commentRoutes')
const userRoutes      = require('./routes/userRoutes')
const newsletterRoutes = require('./routes/newsletterRoutes')
const uploadRoutes    = require('./routes/uploadRoutes')

const app = express()

connectDB()

// ── CORS ──────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }))

// ── SECURITY ──────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── RATE LIMIT ────────────────────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  validate: { xForwardedForHeader: false }
}))

// ── ROUTES ────────────────────────────────────────────
app.use('/api/auth',       authRoutes)
app.use('/api/blogs',      blogRoutes)
app.use('/api/comments',   commentRoutes)
app.use('/api/users',      userRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/upload',     uploadRoutes)

// ── HEALTH CHECK ──────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: '✅ Blog API is running!', version: '1.0.0' })
})

// ── 404 ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ── ERROR HANDLER ─────────────────────────────────────
app.use(errorHandler)

// ── START ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))