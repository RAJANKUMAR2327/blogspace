const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true }
}, { timestamps: true })

const articleChatSchema = new mongoose.Schema({
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for anonymous, identified via sessionId instead
  sessionId: { type: String }, // for anonymous users, a random ID stored in their browser
  messages: [messageSchema]
}, { timestamps: true })

articleChatSchema.index({ blog: 1, user: 1 })
articleChatSchema.index({ blog: 1, sessionId: 1 })

module.exports = mongoose.model('ArticleChat', articleChatSchema)