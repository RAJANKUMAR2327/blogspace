const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

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
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    minlength: 6,
    select: false
  },
  profileImage: { type: String, default: '' },
  bio:          { type: String, maxlength: 200, default: '' },
  role:         { type: String, enum: ['user', 'admin'], default: 'user' },
  savedBlogs:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
  readHistory:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
  following:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  socialLinks: {
    twitter:  { type: String, default: '' },
    github:   { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website:  { type: String, default: '' }
  },
  isVerified:   { type: Boolean, default: false },
  googleId: { type: String },
  githubId: { type: String },
  verificationToken:    { type: String, select: false },
  verificationExpire:   { type: Date },
  isBanned:     { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret:  { type: String, select: false }, // never returned by default queries
  twoFactorBackupCodes: [{ type: String, select: false }], // bcrypt-hashed, one-time use each
  resetPasswordToken:  { type: String, select: false },
  refreshTokens: {
    type: [{
      token:     { type: String },
      createdAt: { type: Date, default: Date.now },
      userAgent: { type: String },
      ip:        { type: String }
    }],
    select: false // session tokens must never be returned by default queries
  },
  resetPasswordExpire: { type: Date, select: false }
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.models.User || mongoose.model('User', userSchema)