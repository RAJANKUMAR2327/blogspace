const express = require('express')
const router = express.Router()
const {
  register, login, getMe,
  forgotPassword, resetPassword,
  githubRedirect, githubCallback,
  googleRedirect, googleCallback,
  sendVerificationEmail, verifyEmail,
  refreshAccessToken, logout, googleAuth,
  verifyLoginTwoFactor
} = require('../controllers/authController')
const {
  setupTwoFactor, verifySetupTwoFactor, disableTwoFactor, regenerateBackupCodes
} = require('../controllers/twoFactorController')

const { protect } = require('../middleware/auth')
const { verifyRecaptcha } = require('../middleware/recaptcha')
const { emailSendRateLimit } = require('../middleware/emailRateLimit')

router.post('/register',               verifyRecaptcha(0.5), register)
router.post('/login',                  verifyRecaptcha(0.5), login)
router.post('/2fa/verify-login',       verifyLoginTwoFactor)
router.post('/2fa/setup',              protect, setupTwoFactor)
router.post('/2fa/verify-setup',       protect, verifySetupTwoFactor)
router.post('/2fa/disable',            protect, disableTwoFactor)
router.post('/2fa/regenerate-backup-codes', protect, regenerateBackupCodes)
router.post('/google',                 googleAuth)
router.post('/refresh', refreshAccessToken)
router.post('/logout',  protect, logout)
router.get ('/me',         protect,    getMe)
router.post('/forgot-password',        emailSendRateLimit, forgotPassword)
router.put ('/reset-password/:token',  resetPassword)

// GitHub OAuth
router.get('/github',           githubRedirect)
router.get('/github/callback',  githubCallback)

// Google OAuth (full redirect flow — always shows Google's account picker,
// unlike the JS button's googleAuth above which can silently default to
// whichever Google account is already active in the visitor's browser)
router.get('/google',           googleRedirect)
router.get('/google/callback',  googleCallback)

// Email verification
router.post('/send-verification', protect, sendVerificationEmail)
router.get ('/verify-email/:token', verifyEmail)

module.exports = router