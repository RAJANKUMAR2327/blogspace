const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    maxlength: 300
  },
  image: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Technology', 'Programming', 'Design',
      'Business', 'Science', 'Health',
      'Travel', 'Food', 'Lifestyle', 'Other'
    ]
  },
  tags:     [{ type: String, lowercase: true, trim: true }],
  views:    { type: Number, default: 0 },
  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  claps:    { type: Number, default: 0 },  // NEW — clap system
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  featured:    { type: Boolean, default: false },
  readTime:    { type: Number, default: 1 },
  scheduledAt: { type: Date, default: null },  // NEW — scheduled publishing
}, { timestamps: true })

// Auto-generate excerpt and readTime
blogSchema.pre('save', async function () {
  const plainText = this.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

  if (plainText && !this.excerpt) {
    this.excerpt = plainText.substring(0, 200) + '...'
  }
  if (this.content) {
    const wordCount = plainText.split(' ').filter(Boolean).length
    this.readTime = Math.max(1, Math.ceil(wordCount / 200))
  }
})

module.exports = mongoose.model('Blog', blogSchema)
