const jwt  = require('jsonwebtoken')
const User = require('../models/User')

exports.protect = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) {
      return res.status(401).json({ message: 'Not authorized — no token' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' })
    }
    if (req.user.isBanned) {
      return res.status(403).json({ message: 'Your account has been banned' })
    }
    next()
  } catch {
    res.status(401).json({ message: 'Not authorized — token invalid' })
  }
}

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}
// Attaches req.user if a valid token is present, but doesn't block the request if absent
exports.optionalAuth = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) return next()

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (user && !user.isBanned) req.user = user
    next()
  } catch {
    next() // invalid token — just proceed without a user
  }
}