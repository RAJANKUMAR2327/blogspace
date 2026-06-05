const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6,
    select: false        // Never returned in queries by default
  },
  profileImage: { type: String, default: '' },
  bio: { type: String, maxlength: 200, default: '' },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  savedBlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
  isVerified: { type: Boolean, default: false },
  googleId:   { type: String },
  isBanned:   { type: Boolean, default: false },

  // --- Forgot password fields ---
  resetPasswordToken:  { type: String },
  resetPasswordExpire: { type: Date }
}, { timestamps: true })

// ✅ STEP 2A: Async pre-save — hash password (no next() param — avoids Express 5 conflict)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

// ✅ STEP 2B: Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// ✅ STEP 2C: Generate reset token (for Forgot Password)
userSchema.methods.getResetPasswordToken = function () {
  const rawToken = crypto.randomBytes(20).toString('hex')
  // Store hashed version in DB
  this.resetPasswordToken  = crypto.createHash('sha256').update(rawToken).digest('hex')
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000  // 15 minutes
  return rawToken  // Send raw token to user's email
}

module.exports = mongoose.model('User', userSchema)
// models/User.js — add inside the schema
readHistory: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Blog'
}]
// models/User.js — add to schema
following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]