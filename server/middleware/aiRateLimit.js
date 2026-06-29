const rateLimit = require('express-rate-limit')

// Stricter than your general API rate limit — AI calls cost money/quota
exports.aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,              // 10 AI requests per minute per IP
  message: { success: false, message: 'Too many AI requests — please wait a moment and try again' },
  validate: { xForwardedForHeader: false }
})