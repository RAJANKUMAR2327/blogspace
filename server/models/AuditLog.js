const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
  actor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:     { type: String, required: true }, // e.g. 'ban_user', 'delete_user'
  targetType: { type: String },                 // e.g. 'User', 'Blog', 'Comment'
  targetId:   { type: mongoose.Schema.Types.ObjectId },
  details:    { type: String },
  ip:         { type: String }
}, { timestamps: true })

auditLogSchema.index({ createdAt: -1 })

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema)
