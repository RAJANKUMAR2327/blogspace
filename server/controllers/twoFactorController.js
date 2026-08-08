const { generateSecret, verify, generateURI } = require('otplib')
const qrcode = require('qrcode')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

// Generates 8 human-friendly one-time backup codes (e.g. "A3F9-K2M7"),
// returns both the plain codes (shown once, never stored) and their bcrypt
// hashes (what actually gets saved).
async function generateBackupCodes() {
  const plainCodes = []
  const hashedCodes = []
  for (let i = 0; i < 8; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase().match(/.{1,4}/g).join('-')
    plainCodes.push(code)
    hashedCodes.push(await bcrypt.hash(code, 10))
  }
  return { plainCodes, hashedCodes }
}

// @POST /api/auth/2fa/setup — generates a new secret + QR code.
// Not yet enabled — user must confirm with a real code first (see verifySetup)
// so we don't lock someone out with a secret they never actually saved.
exports.setupTwoFactor = async (req, res, next) => {
  try {
    const secret = generateSecret()
    const uri = generateURI({
      issuer: 'BlogSpace',
      label: req.user.email,
      secret
    })
    const qrCodeDataUrl = await qrcode.toDataURL(uri)

    // Stash the pending secret (not yet active) so verifySetup can check against it
    await User.findByIdAndUpdate(req.user._id, { twoFactorSecret: secret })

    res.json({ success: true, qrCode: qrCodeDataUrl, secret })
  } catch (error) { next(error) }
}

// @POST /api/auth/2fa/verify-setup — confirms the user's authenticator app
// is actually working before turning 2FA on for real. Also issues backup
// codes at this point — shown to the user exactly once.
exports.verifySetupTwoFactor = async (req, res, next) => {
  try {
    const { code } = req.body
    if (!code) return res.status(400).json({ message: 'Verification code is required' })

    const user = await User.findById(req.user._id).select('+twoFactorSecret')
    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: 'No pending 2FA setup found — please start setup again' })
    }

    const result = await verify({ secret: user.twoFactorSecret, token: code })
    if (!result.valid) {
      return res.status(401).json({ message: 'Invalid code — check your authenticator app and try again' })
    }

    const { plainCodes, hashedCodes } = await generateBackupCodes()

    user.twoFactorEnabled = true
    user.twoFactorBackupCodes = hashedCodes
    await user.save({ validateBeforeSave: false })

    res.json({
      success: true,
      message: 'Two-factor authentication enabled',
      backupCodes: plainCodes // shown once — client must prompt the user to save these
    })
  } catch (error) { next(error) }
}

// @POST /api/auth/2fa/regenerate-backup-codes — invalidates old codes and
// issues a fresh set. Requires password confirmation since old codes stop
// working immediately (avoid someone doing this to lock the real owner out).
exports.regenerateBackupCodes = async (req, res, next) => {
  try {
    const { password } = req.body
    const user = await User.findById(req.user._id).select('+password +twoFactorEnabled')

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: 'Two-factor authentication is not enabled' })
    }
    if (user.password && !(await user.comparePassword(password || ''))) {
      return res.status(401).json({ message: 'Incorrect password' })
    }

    const { plainCodes, hashedCodes } = await generateBackupCodes()
    user.twoFactorBackupCodes = hashedCodes
    await user.save({ validateBeforeSave: false })

    res.json({ success: true, backupCodes: plainCodes })
  } catch (error) { next(error) }
}

// @POST /api/auth/2fa/disable — requires the current password as confirmation
exports.disableTwoFactor = async (req, res, next) => {
  try {
    const { password } = req.body
    const user = await User.findById(req.user._id).select('+password +twoFactorSecret')

    if (user.password && !(await user.comparePassword(password || ''))) {
      return res.status(401).json({ message: 'Incorrect password' })
    }

    user.twoFactorEnabled = false
    user.twoFactorSecret = undefined
    user.twoFactorBackupCodes = []
    await user.save({ validateBeforeSave: false })

    res.json({ success: true, message: 'Two-factor authentication disabled' })
  } catch (error) { next(error) }
}
