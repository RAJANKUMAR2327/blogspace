const mongoose = require('mongoose')

const loginActivitySchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ip:        { type: String },
  userAgent: { type: String },
  success:   { type: Boolean, default: true },
  reason:    { type: String } // e.g. 'wrong_password', 'banned' — set only on failed attempts
}, { timestamps: true })

loginActivitySchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('LoginActivity', loginActivitySchema)
