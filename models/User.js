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
    select: false
  },
  profileImage: { type: String, default: '' },
  bio: { type: String, maxlength: 200, default: '' },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  // Bookmarks
  savedBlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],

  // Reading History (NEW)
  readHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],

  // Follow System (NEW)
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Auth
  isVerified: { type: Boolean, default: false },
  googleId:   { type: String },
  isBanned:   { type: Boolean, default: false },

  // Password Reset
  resetPasswordToken:  { type: String },
  resetPasswordExpire: { type: Date }
}, { timestamps: true })

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Generate reset token
userSchema.methods.getResetPasswordToken = function () {
  const rawToken = crypto.randomBytes(20).toString('hex')
  this.resetPasswordToken  = crypto.createHash('sha256').update(rawToken).digest('hex')
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000
  return rawToken
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