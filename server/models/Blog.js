const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title:    { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
  slug:     { type: String, unique: true, lowercase: true },
  content:  { type: String, required: [true, 'Content is required'] },
  excerpt:  { type: String, maxlength: 300 },
  image:    { type: String, default: '' },
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gallery: [{ type: String }], // additional image URLs beyond the main cover image
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Technology','Programming','Design','Business','Science','Health','Travel','Food','Lifestyle','Other']
  },
  tags:     [{ type: String, lowercase: true, trim: true }],
  views:    { type: Number, default: 0 },
  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // ── Phase 7: Article Status ──────────────────────────
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },

  // ── Phase 7: Featured Articles ───────────────────────
  featured: { type: Boolean, default: false },

  // ── Phase 7: Soft Delete ─────────────────────────────
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  // ── Phase 15: Analytics ──────────────────────────
  readCompletions: { type: Number, default: 0 }, // how many times someone scrolled to the end
  totalReadEvents:  { type: Number, default: 0 }, // how many times someone opened it and we tracked a session
  referrers: [{
  source: { type: String },  // 'google', 'twitter', 'direct', 'facebook', etc.
  count:  { type: Number, default: 1 }
}],

  readTime: { type: Number, default: 1 }
}, { timestamps: true })

// Auto-generate excerpt and readTime
blogSchema.pre('save', function(next) {
  if (this.content && !this.excerpt) {
    this.excerpt = this.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
  }
  if (this.content) {
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    this.readTime = Math.ceil(wordCount / 200) || 1
  }
  next()
})

// Exclude soft-deleted blogs from normal queries by default
blogSchema.pre(/^find/, function(next) {
  if (this.getFilter().includeDeleted !== true) {
    this.where({ isDeleted: { $ne: true } })
  } else {
    // Remove the flag so Mongo doesn't try to filter on it
    delete this.getFilter().includeDeleted
  }
  next()
})

module.exports = mongoose.models.Blog || mongoose.model('Blog', blogSchema)
