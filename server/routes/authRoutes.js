const express = require('express')
const router = express.Router()
const {
  register, login, getMe,
  forgotPassword, resetPassword,
  githubRedirect, githubCallback,
  sendVerificationEmail, verifyEmail
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')

router.post('/register',               register)
router.post('/login',                  login)
router.get ('/me',         protect,    getMe)
router.post('/forgot-password',        forgotPassword)
router.put ('/reset-password/:token',  resetPassword)

// GitHub OAuth
router.get('/github',           githubRedirect)
router.get('/github/callback',  githubCallback)

// Email verification
router.post('/send-verification', protect, sendVerificationEmail)
router.get ('/verify-email/:token', verifyEmail)

module.exports = router