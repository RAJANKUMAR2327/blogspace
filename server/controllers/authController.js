const jwt = require('jsonwebtoken')
const LoginActivity = require('../models/LoginActivity')
const crypto = require('crypto')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const axios = require('axios')

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' })
}

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '30d' })
}

// Short-lived token proving "this browser already entered the correct
// password" — used to bridge password-check and 2FA-code-check without
// re-sending the password. Deliberately NOT a valid access token (different
// purpose claim), so it can't be used to call protected routes.
const generateTempToken = (id) => {
  return jwt.sign({ id, purpose: '2fa-challenge' }, process.env.JWT_SECRET, { expiresIn: '5m' })
}

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  })
}

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
    await completeLogin(user, req, res, { statusCode: 201 })
  } catch (error) { next(error) }
}

// @POST /api/auth/refresh
exports.refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' })

    let decoded
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token' })
    }

    const user = await User.findById(decoded.id).select('+refreshTokens')
    if (!user) return res.status(401).json({ message: 'User not found' })

    const tokenExists = user.refreshTokens?.some(t => t.token === refreshToken)
    if (!tokenExists) return res.status(401).json({ message: 'Refresh token revoked' })

    if (user.isBanned) return res.status(403).json({ message: 'Account banned' })

    const newAccessToken = generateAccessToken(user._id)
    res.json({
      success: true,
      token: newAccessToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage }
    })
  } catch (error) { next(error) }
}

// @POST /api/auth/logout — revoke the current refresh token
exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken
    if (refreshToken && req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: { token: refreshToken } }
      })
    }
    res.clearCookie('refreshToken')
    res.json({ success: true, message: 'Logged out' })
  } catch (error) { next(error) }
}
// Core of "log this user in": issues a short-lived access token + a
// revocable, httpOnly, rotating refresh-token cookie, and records the
// session/login activity. Returns the access token so callers can either
// send it as JSON (completeLogin) or embed it in a redirect (GitHub OAuth).
const issueSession = async (user, req, res, opts = {}) => {
  const accessToken  = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  user.refreshTokens = opts.revokeExisting ? [] : (user.refreshTokens || [])
  user.refreshTokens.push({ token: refreshToken, userAgent: req.headers['user-agent'], ip: req.ip })
  if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5)
  await user.save({ validateBeforeSave: false })

  setRefreshCookie(res, refreshToken)

  LoginActivity.create({
    user: user._id, ip: req.ip, userAgent: req.headers['user-agent'], success: true
  }).catch(() => {})

  return accessToken
}

// Shared by normal login, post-2FA-verification login, register, and
// Google sign-in — issues a real (short-lived + revocable) session and
// responds with it as JSON.
// `opts.statusCode` lets callers like register() keep responding 201.
// `opts.revokeExisting` clears all other active sessions first — used after
// a password reset, since a token stolen before the reset shouldn't still
// work after it.
const completeLogin = async (user, req, res, opts = {}) => {
  const accessToken = await issueSession(user, req, res, opts)
  res.status(opts.statusCode || 200).json({
    success: true,
    token: accessToken,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage }
  })
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const user = await User.findOne({ email }).select('+password +refreshTokens')

    // Accounts created via Google/GitHub have no password set (by design —
    // see githubCallback/googleAuth). Reject those explicitly here instead
    // of letting comparePassword() run against a missing hash, which
    // otherwise risks throwing and surfacing a confusing 500 instead of the
    // same clean "invalid credentials" response every other wrong attempt gets.
    if (!user || !user.password || !(await user.comparePassword(password))) {
      // Log failed attempt (only if user exists, so we don't leak account existence via timing later)
      if (user) {
        LoginActivity.create({
          user: user._id, ip: req.ip, userAgent: req.headers['user-agent'],
          success: false, reason: 'wrong_password'
        }).catch(() => {})
      }
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (user.isBanned) {
      LoginActivity.create({
        user: user._id, ip: req.ip, userAgent: req.headers['user-agent'],
        success: false, reason: 'banned'
      }).catch(() => {})
      return res.status(403).json({ message: 'Your account has been banned' })
    }

    // Password is correct — if 2FA is on, stop here and ask for the code
    // instead of issuing real tokens yet.
    if (user.twoFactorEnabled) {
      return res.json({
        success: true,
        requires2FA: true,
        tempToken: generateTempToken(user._id)
      })
    }

    await completeLogin(user, req, res)
  } catch (error) { next(error) }
}

// @POST /api/auth/2fa/verify-login — second step of login when 2FA is enabled
exports.verifyLoginTwoFactor = async (req, res, next) => {
  try {
    const { tempToken, code } = req.body
    if (!tempToken || !code) return res.status(400).json({ message: 'Missing verification code' })

    let decoded
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET)
    } catch {
      return res.status(401).json({ message: 'Session expired — please log in again' })
    }
    if (decoded.purpose !== '2fa-challenge') {
      return res.status(401).json({ message: 'Invalid verification session' })
    }

    const user = await User.findById(decoded.id).select('+twoFactorSecret +twoFactorBackupCodes +refreshTokens')
    if (!user || !user.twoFactorEnabled) {
      return res.status(401).json({ message: 'Two-factor authentication is not enabled for this account' })
    }

    const { verify } = require('otplib')
    // otplib's verify() throws on malformed input (e.g. a non-6-digit
    // string) instead of returning { valid: false } — but backup codes are
    // longer than a TOTP code, so a legitimate backup-code attempt would
    // otherwise crash here before ever reaching the backup-code check below.
    let result
    try {
      result = await verify({ secret: user.twoFactorSecret, token: code })
    } catch {
      result = { valid: false }
    }

    if (!result.valid) {
      // Not a valid TOTP code — check if it matches (and consume) a backup code instead
      const bcrypt = require('bcryptjs')
      let matchedIndex = -1
      for (let i = 0; i < (user.twoFactorBackupCodes || []).length; i++) {
        if (await bcrypt.compare(code.trim().toUpperCase(), user.twoFactorBackupCodes[i])) {
          matchedIndex = i
          break
        }
      }

      if (matchedIndex === -1) {
        return res.status(401).json({ message: 'Invalid verification code' })
      }

      // Backup codes are one-time use — remove it so it can't be replayed
      user.twoFactorBackupCodes.splice(matchedIndex, 1)
      await user.save({ validateBeforeSave: false })
    }

    await completeLogin(user, req, res)
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

    await completeLogin(user, req, res)
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

    // Revoke every existing session — if the account was compromised, a
    // refresh token issued before the reset must not keep working after it.
    await completeLogin(user, req, res, { revokeExisting: true })
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

    // Same session scheme as every other login path: short-lived access
    // token + httpOnly rotating refresh cookie (set on this response before
    // the redirect). The token still has to travel in the redirect URL
    // since this is a full-page browser navigation, not an AJAX call — but
    // it now expires in 15 minutes instead of 30 days, and the browser
    // picks up a real refresh cookie to silently renew it going forward, so
    // logout/revocation actually work for GitHub-authed accounts too.
    const appAccessToken = await issueSession(user, req, res)
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${appAccessToken}`)
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