const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title:    { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
  slug:     { type: String, unique: true, lowercase: true },
  content:  { type: String, required: [true, 'Content is required'] },
  excerpt:  { type: String, maxlength: 300 },
  image:    { type: String, default: '' },
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Technology','Programming','Design','Business','Science','Health','Travel','Food','Lifestyle','Other']
  },
  tags:     [{ type: String, lowercase: true, trim: true }],
  views:    { type: Number, default: 0 },
  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status:   { type: String, enum: ['draft', 'published'], default: 'draft' },
  readTime: { type: Number, default: 1 },
  featured: { type: Boolean, default: false }
}, { timestamps: true })

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

module.exports = mongoose.model('Blog', blogSchema)
