const axios = require('axios')

// Verifies a Google reCAPTCHA v3 token. If RECAPTCHA_SECRET_KEY isn't set in
// .env, this middleware no-ops (with a one-time warning) instead of blocking
// registration/login — so the site keeps working until you set up real keys
// at https://www.google.com/recaptcha/admin
let warned = false

exports.verifyRecaptcha = (minScore = 0.5) => async (req, res, next) => {
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    if (!warned) {
      console.warn('⚠️  RECAPTCHA_SECRET_KEY not set — skipping bot protection on auth routes. See .env.example.')
      warned = true
    }
    return next()
  }

  const token = req.body.recaptchaToken
  if (!token) {
    return res.status(400).json({ success: false, message: 'Missing CAPTCHA verification. Please refresh and try again.' })
  }

  try {
    const { data } = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: { secret: process.env.RECAPTCHA_SECRET_KEY, response: token }
    })

    if (!data.success || (typeof data.score === 'number' && data.score < minScore)) {
      return res.status(403).json({ success: false, message: 'CAPTCHA verification failed. Please try again.' })
    }

    next()
  } catch (error) {
    console.error('reCAPTCHA verification error:', error.message)
    // Fail open rather than locking everyone out if Google's API is briefly down
    next()
  }
}
