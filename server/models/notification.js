const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['comment', 'like', 'follow', 'reply', 'clap'],
    required: true
  },
  blog:    { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
  message: { type: String },
  read:    { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Notification', notificationSchema)