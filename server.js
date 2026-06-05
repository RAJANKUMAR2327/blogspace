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

const app = express()

// =======================
// CONNECT DATABASE
// =======================
connectDB()

// =======================
// CORS CONFIGURATION
// =======================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://blogspace-2f5r.vercel.app',
  'https://blogspace-six.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    // allow tools like Postman / server requests
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

// =======================
// SECURITY MIDDLEWARE
// =======================
app.use(helmet())
app.use(morgan('dev'))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// =======================
// RATE LIMITING
// =======================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  validate: {
    xForwardedForHeader: false
  }
})

app.use('/api', limiter)

// =======================
// ROUTES
// =======================
app.use('/api/auth', authRoutes)
app.use('/api/blogs', blogRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/upload', uploadRoutes)

// =======================
// HEALTH CHECK
// =======================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Blog API is running!',
    version: '1.0.0'
  })
})

// =======================
// 404 HANDLER
// =======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// =======================
// GLOBAL ERROR HANDLER
// =======================
app.use(errorHandler)

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})