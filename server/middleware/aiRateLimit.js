const rateLimit = require('express-rate-limit')

// Stricter than your general API rate limit — AI calls cost money/quota
exports.aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,              // 10 AI requests per minute per IP
  message: { success: false, message: 'Too many AI requests — please wait a moment and try again' },
  validate: { xForwardedForHeader: false }
})

const rateLimit = require('express-rate-limit')

exports.aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many AI requests — please wait a moment and try again' },
  validate: { xForwardedForHeader: false }
})

// Full article generation is expensive — much stricter limit
exports.articleGenerationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                    // 5 full article generations per hour
  message: { success: false, message: 'Article generation limit reached. Try again in an hour.' },
  validate: { xForwardedForHeader: false }
})