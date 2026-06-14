const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message)

  let statusCode = err.statusCode || 500
  let message    = err.message    || 'Server Error'

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    message    = `${field} already exists`
    statusCode = 400
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message    = Object.values(err.errors).map(e => e.message).join(', ')
    statusCode = 400
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message    = 'Invalid token'
    statusCode = 401
  }
  if (err.name === 'TokenExpiredError') {
    message    = 'Token expired'
    statusCode = 401
  }

  // Cast error (invalid MongoDB ID)
  if (err.name === 'CastError') {
    message    = 'Resource not found'
    statusCode = 404
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

module.exports = errorHandler
