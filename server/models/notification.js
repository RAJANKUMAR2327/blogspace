const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type:      { type: String, enum: ['like', 'comment', 'follow', 'reply'], required: true },
  blog:      { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
  message:   { type: String, required: true },
  isRead:    { type: Boolean, default: false }
}, { timestamps: true })

notificationSchema.index({ recipient: 1, createdAt: -1 })

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema)