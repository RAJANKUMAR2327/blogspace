const rateLimit = require('express-rate-limit')

// Applies to any endpoint that sends an email to an address the caller
// supplies (newsletter subscribe, forgot-password) — without this, someone
// can use the endpoint to spam/harass an arbitrary third-party inbox, or
// hammer the mail provider hard enough to get the sending domain flagged.
// Deliberately stricter than the general API limiter and separate from it.
exports.emailSendRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 emails triggered per IP per window
  message: { success: false, message: 'Too many requests — please wait a few minutes and try again' }
})
