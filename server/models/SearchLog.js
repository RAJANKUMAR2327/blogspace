const mongoose = require('mongoose')

const searchLogSchema = new mongoose.Schema({
  query: { type: String, required: true, trim: true },
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

searchLogSchema.index({ createdAt: -1 })
searchLogSchema.index({ query: 1 })

module.exports = mongoose.model('SearchLog', searchLogSchema)
