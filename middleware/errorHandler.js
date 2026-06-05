// ✅ FIX: Express 5 compatible error handler
// - Added res.headersSent guard
// - Added return statements
// - Handles err.status (Express 5 uses .status, Express 4 used .statusCode)
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack)

  // Don't try to send a response if headers already sent
  if (res.headersSent) return

  let statusCode = err.statusCode || err.status || 500
  let message = err.message || 'Internal Server Error'

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    message = `${field} already exists`
    statusCode = 400
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(e => e.message).join(', ')
    statusCode = 400
  }

  // Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    message = 'Invalid ID format'
    statusCode = 400
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token'
    statusCode = 401
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Token expired, please login again'
    statusCode = 401
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

module.exports = errorHandler