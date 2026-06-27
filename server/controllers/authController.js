const crypto = require('crypto')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')
const axios = require('axios')

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



// @GET /api/auth/github — redirect user to GitHub's authorization page
exports.githubRedirect = (req, res) => {
  const redirectUri = `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/github/callback`
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`
  res.redirect(githubAuthUrl)
}

// @GET /api/auth/github/callback — GitHub redirects back here with a ?code=
exports.githubCallback = async (req, res, next) => {
  try {
    const { code } = req.query
    if (!code) return res.redirect(`${process.env.CLIENT_URL}/login?error=github_no_code`)

    // Exchange code for access token
    const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      client_id:     process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, { headers: { Accept: 'application/json' } })

    const accessToken = tokenRes.data.access_token
    if (!accessToken) return res.redirect(`${process.env.CLIENT_URL}/login?error=github_token_failed`)

    // Get GitHub user profile
    const profileRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    // GitHub may not return email in profile — fetch separately if needed
    let email = profileRes.data.email
    if (!email) {
      const emailsRes = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const primary = emailsRes.data.find(e => e.primary) || emailsRes.data[0]
      email = primary?.email
    }
    if (!email) return res.redirect(`${process.env.CLIENT_URL}/login?error=github_no_email`)

    const { id: githubId, name, login, avatar_url } = profileRes.data

    // Find or create user
    let user = await User.findOne({ $or: [{ githubId }, { email }] })
    if (!user) {
      user = await User.create({
        name: name || login,
        email,
        githubId,
        profileImage: avatar_url || '',
        isVerified: true, // GitHub already verified this email
        password: undefined
      })
    } else if (!user.githubId) {
      user.githubId = githubId
      if (!user.profileImage) user.profileImage = avatar_url || ''
      await user.save()
    }

    if (user.isBanned) return res.redirect(`${process.env.CLIENT_URL}/login?error=account_banned`)

    const token = generateToken(user._id)
    // Redirect back to frontend with token in URL — frontend will pick it up and store it
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`)
  } catch (error) {
    console.error('GitHub OAuth error:', error.message)
    res.redirect(`${process.env.CLIENT_URL}/login?error=github_failed`)
  }
}

// @POST /api/auth/send-verification — send (or resend) email verification link
exports.sendVerificationEmail = async (req, res, next) => {
  try {
    const user = req.user
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' })

    const verifyToken = crypto.randomBytes(32).toString('hex')
    user.verificationToken  = crypto.createHash('sha256').update(verifyToken).digest('hex')
    user.verificationExpire = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    await user.save({ validateBeforeSave: false })

    const verifyURL = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    })

    await transporter.sendMail({
      from: `"BlogSpace" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verify your BlogSpace email',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#080810;padding:40px;border-radius:16px;color:#fff">
          <h2 style="color:#a78bfa;margin-bottom:12px">Confirm your email</h2>
          <p style="color:rgba(255,255,255,0.6);line-height:1.6">Click below to verify your BlogSpace account.</p>
          <a href="${verifyURL}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;margin:20px 0;font-weight:500">
            Verify Email
          </a>
          <p style="color:rgba(255,255,255,0.3);font-size:13px">This link expires in 24 hours.</p>
        </div>
      `
    })

    res.json({ success: true, message: 'Verification email sent' })
  } catch (error) { next(error) }
}

// @GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
      verificationToken:  hashedToken,
      verificationExpire: { $gt: Date.now() }
    })
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link' })

    user.isVerified         = true
    user.verificationToken  = undefined
    user.verificationExpire = undefined
    await user.save()

    res.json({ success: true, message: 'Email verified successfully' })
  } catch (error) { next(error) }
}