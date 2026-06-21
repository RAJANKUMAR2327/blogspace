const crypto = require('crypto')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password })
    const token = generateToken(user._id)
    res.status(201).json({
      success: true, token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage }
    })
  } catch (error) { next(error) }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    if (user.isBanned) return res.status(403).json({ message: 'Your account has been banned' })

    const token = generateToken(user._id)
    res.json({
      success: true, token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage }
    })
  } catch (error) { next(error) }
}

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user })
}

exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body
    if (!credential) return res.status(400).json({ message: 'Missing Google credential' })

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload()
    const { email, name, picture, sub: googleId } = payload

    if (!email) return res.status(400).json({ message: 'Google account has no email' })

    let user = await User.findOne({ $or: [{ googleId }, { email }] })

    if (user) {
      if (user.isBanned) return res.status(403).json({ message: 'Your account has been banned' })
      if (!user.googleId) {
        user.googleId = googleId
        await user.save({ validateBeforeSave: false })
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        profileImage: picture || '',
        isVerified: true
      })
    }

    const token = generateToken(user._id)
    res.json({
      success: true, token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage }
    })
  } catch (error) {
    console.error('❌ Google auth error:', error.message)
    res.status(401).json({ message: 'Google sign-in failed' })
  }
}

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link was sent' })

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken  = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000
    await user.save({ validateBeforeSave: false })

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    })

    await transporter.sendMail({
      from: `"BlogSpace" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#080810;padding:40px;border-radius:16px;color:#fff">
          <h2 style="color:#a78bfa;margin-bottom:12px">Reset your password</h2>
          <p style="color:rgba(255,255,255,0.6);line-height:1.6">You requested a password reset for your BlogSpace account.</p>
          <a href="${resetURL}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;margin:20px 0;font-weight:500">
            Reset Password
          </a>
          <p style="color:rgba(255,255,255,0.3);font-size:13px">This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `
    })

    res.json({ success: true, message: 'Reset link sent to your email' })
  } catch (error) { next(error) }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    })
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' })

    user.password            = req.body.password
    user.resetPasswordToken  = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    const token = generateToken(user._id)
    res.json({
      success: true, token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage }
    })
  } catch (error) { next(error) }
}