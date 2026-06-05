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

const app = express()

// Connect to MongoDB
connectDB()

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176'
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(morgan('dev'))

// ✅ FIX: express-rate-limit v7+ requires 'validate' option with Express 5
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
  validate: { xForwardedForHeader: false }
})
app.use('/api', limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/blogs', blogRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/newsletter', newsletterRoutes)

// Health check
app.get('/', (req, res) => {
  res.json({ message: '✅ Blog API is running!', version: '1.0.0' })
})

// 404 — unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ✅ Global error handler — MUST be last, MUST have 4 params
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
const uploadRoutes = require('./routes/uploadRoutes')
app.use('/api/upload', uploadRoutes)