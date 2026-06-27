const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  blog:          { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:       { type: String, required: [true, 'Comment cannot be empty'], maxlength: 1000, trim: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },

  // ── Phase 13: Moderation ──────────────────────────
  isApproved: { type: Boolean, default: true },
  isFlagged:  { type: Boolean, default: false },
  flagReason: { type: String, default: '' },

  // ── Phase 13: Edit tracking ───────────────────────
  isEdited:   { type: Boolean, default: false },
  editedAt:   { type: Date },

  // ── Phase 13: Reactions (replacing simple likes array with typed reactions) ──
  likes:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })

module.exports = mongoose.model('Comment', commentSchema)