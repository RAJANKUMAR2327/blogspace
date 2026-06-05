const crypto = require('crypto')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')
const nodemailer = require('nodemailer')

// ─────────────────────────────────────────────
// Helper: send JSON response with token + user
// ─────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id)
  return res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id:          user._id,
      name:         user.name,
      email:        user.email,
      role:         user.role,
      profileImage: user.profileImage,
      bio:          user.bio,
      isVerified:   user.isVerified
    }
  })
}

// ─────────────────────────────────────────────
// STEP 4A: POST /api/auth/register
// ─────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    // Create user (password hashed in pre-save hook)
    const user = await User.create({ name, email, password })

    return sendTokenResponse(user, 201, res)
  } catch (error) {
    return next(error)
  }
}

// ─────────────────────────────────────────────
// STEP 4B: POST /api/auth/login
// ─────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    // select('+password') because password has select:false in schema
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned' })
    }

    return sendTokenResponse(user, 200, res)
  } catch (error) {
    return next(error)
  }
}

// ─────────────────────────────────────────────
// STEP 4C: GET /api/auth/me  (protected)
// ─────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    return res.json({ success: true, user })
  } catch (error) {
    return next(error)
  }
}

// ─────────────────────────────────────────────
// STEP 4D: POST /api/auth/forgot-password
// ─────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      // Return success even if user not found (security: don't reveal email existence)
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent' })
    }

    // Generate reset token and save hashed version to DB
    const rawToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    // Build reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`

    // Send email
    const transporter = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST,
      port:   Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    await transporter.sendMail({
      from:    `"BlogSpace" <${process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2>Reset your password</h2>
          <p>Click the button below to reset your BlogSpace password. This link expires in 15 minutes.</p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#9333ea;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Reset Password
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px">
            If you didn't request this, ignore this email.
          </p>
        </div>
      `
    })

    return res.json({ success: true, message: 'If that email exists, a reset link has been sent' })
  } catch (error) {
    return next(error)
  }
}

// ─────────────────────────────────────────────
// STEP 4E: PUT /api/auth/reset-password/:token
// ─────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    // Hash the raw URL token and find matching user
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() }   // must not be expired
    })

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' })
    }

    // Set new password and clear reset fields
    user.password           = password
    user.resetPasswordToken  = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    return sendTokenResponse(user, 200, res)
  } catch (error) {
    return next(error)
  }
}

// @POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link was sent' })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken   = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.resetPasswordExpire  = Date.now() + 15 * 60 * 1000 // 15 minutes
    await user.save({ validateBeforeSave: false })

    // Reset URL
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

    // Send email
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST,
      port:   process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    await transporter.sendMail({
      from:    `"BlogSpace" <${process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#9333ea">Reset your password</h2>
          <p>You requested a password reset for your BlogSpace account.</p>
          <a href="${resetURL}"
            style="display:inline-block;background:#9333ea;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">
            Reset Password
          </a>
          <p style="color:#6b7280;font-size:14px">This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `
    })

    res.json({ success: true, message: 'Reset link sent to your email' })
  } catch (error) {
    next(error)
  }
}

// @PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    user.password            = req.body.password
    user.resetPasswordToken  = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    const token = generateToken(user._id)
    res.json({
      success: true,
      token,
      user: {
        _id:          user._id,
        name:         user.name,
        email:        user.email,
        role:         user.role,
        profileImage: user.profileImage
      }
    })
  } catch (error) {
    next(error)
  }
}