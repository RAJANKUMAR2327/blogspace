const mongoose = require('mongoose')

const activityLogSchema = new mongoose.Schema({
  // yyyy-mm-dd string — makes daily-active-user aggregation cheap (no date-math in the query)
  date:      { type: String, required: true, index: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String }, // for anonymous/unauthenticated visitors (see client sessionId.js)
  path:      { type: String },
  method:    { type: String }
}, { timestamps: true })

activityLogSchema.index({ createdAt: -1 })

module.exports = mongoose.model('ActivityLog', activityLogSchema)
