const express = require('express')
const cors    = require('cors')
const helmet  = require('helmet')
const morgan  = require('morgan')
const rateLimit = require('express-rate-limit')
require('dotenv').config()
const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const connectDB    = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

const authRoutes       = require('./routes/authRoutes')
const blogRoutes       = require('./routes/blogRoutes')
const commentRoutes    = require('./routes/commentRoutes')
const userRoutes       = require('./routes/userRoutes')
const newsletterRoutes = require('./routes/newsletterRoutes')
const uploadRoutes     = require('./routes/uploadRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const app = express()

// Connect Database
connectDB()

// CORS — allow all origins (update for production)
app.use(cors({ origin: true, credentials: true }))

// Security & Logging
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate Limiting
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: 'Too many requests, try again later' }
}))

// Routes
app.use('/api/auth',       authRoutes)
app.use('/api/blogs',      blogRoutes)
app.use('/api/comments',   commentRoutes)
app.use('/api/users',      userRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/upload',     uploadRoutes)
app.use('/api/notifications', notificationRoutes)

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

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
