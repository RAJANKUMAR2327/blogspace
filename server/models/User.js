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
    trim: true
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
  following:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVerified:   { type: Boolean, default: false },
  googleId: { type: String },
  githubId: { type: String },
  verificationToken:    { type: String },
  verificationExpire:   { type: Date },
  isBanned:     { type: Boolean, default: false },
  resetPasswordToken:  { type: String },
  resetPasswordExpire: { type: Date }
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
