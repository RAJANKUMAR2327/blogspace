const mongoose = require('mongoose')

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  preferences: {
    categories: [{ type: String }]
  },
  isActive:         { type: Boolean, default: true },
  unsubscribeToken: { type: String, required: true },
  lastSentAt:       { type: Date }
}, { timestamps: true })

subscriberSchema.index({ isActive: 1 })

module.exports = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema)
