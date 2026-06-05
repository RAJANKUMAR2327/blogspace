const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ✅ STEP 3A: Protect — verify JWT, attach user to req
exports.protect = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized — no token' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' })
    }
    if (req.user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned' })
    }

    return next()
  } catch (err) {
    // ✅ Forward to Express 5 error handler (not res.json — avoids "next is not a function")
    return next(err)
  }
}

// ✅ STEP 3B: Admin-only guard
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' })
  }
  return next()
}