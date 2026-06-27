const Blog = require('../models/Blog')
const slugify = require('slugify')

// @GET /api/blogs
exports.getBlogs = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 9
    const { category, search, tag, sortBy, status, featured } = req.query

    let query = {}

    // Public requests only see published; admin can request any status
    if (req.user?.role === 'admin' && status) {
      query.status = status
    } else {
      query.status = 'published'
    }

    if (featured === 'true') query.featured = true
    if (category) query.category = category
    if (tag) query.tags = { $in: [tag] }
    if (search) {
      query.$or = [
        { title:   { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags:    { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ]
    }

    const sortOptions = {
      latest:  { createdAt: -1 },
      oldest:  { createdAt:  1 },
      popular: { views: -1 },
      liked:   { likes: -1 }
    }
    const sort = sortOptions[sortBy] || sortOptions.latest

    const total = await Blog.countDocuments(query)
    const blogs = await Blog.find(query)
      .populate('author', 'name profileImage')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)

    res.json({ success: true, blogs, pagination: { page, pages: Math.ceil(total / limit), total } })
  } catch (error) { next(error) }
}

// @GET /api/blogs/trending
exports.getTrending = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name profileImage')
      .sort({ views: -1, createdAt: -1 })
      .limit(5)
    res.json({ success: true, blogs })
  } catch (error) { next(error) }
}

// @GET /api/blogs/featured
exports.getFeatured = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ status: 'published', featured: true })
      .populate('author', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(6)
    res.json({ success: true, blogs })
  } catch (error) { next(error) }
}

// @GET /api/blogs/:slug
exports.getBlogBySlug = async (req, res, next) => {
  try {
    const filter = { slug: req.params.slug }
    // Admins can preview drafts/archived by slug; public only sees published
    if (req.user?.role !== 'admin') filter.status = 'published'

    const blog = await Blog.findOneAndUpdate(
      filter,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name profileImage bio')

    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    res.json({ success: true, blog })
  } catch (error) { next(error) }
}

// @POST /api/blogs
exports.createBlog = async (req, res, next) => {
  try {
    const { title, content, category, tags, status, image, featured } = req.body
    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now()

    const blog = await Blog.create({
      title, content, category, tags, image, slug,
      status: status || 'draft',
      featured: !!featured,
      author: req.user._id
    })
    res.status(201).json({ success: true, blog })
  } catch (error) { next(error) }
}

// @PUT /api/blogs/:id
exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }
    const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    res.json({ success: true, blog: updated })
  } catch (error) { next(error) }
}

// @PUT /api/blogs/:id/status — change status only (draft/published/archived)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }
    blog.status = status
    await blog.save()
    res.json({ success: true, blog })
  } catch (error) { next(error) }
}

// @PUT /api/blogs/:id/featured — toggle featured (admin only)
exports.toggleFeatured = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    blog.featured = !blog.featured
    await blog.save()
    res.json({ success: true, featured: blog.featured })
  } catch (error) { next(error) }
}

// @DELETE /api/blogs/:id — SOFT delete (default)
exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }
    blog.isDeleted = true
    blog.deletedAt = new Date()
    await blog.save()
    res.json({ success: true, message: 'Blog moved to trash' })
  } catch (error) { next(error) }
}

// @PUT /api/blogs/:id/restore — restore a soft-deleted blog (admin only)
exports.restoreBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, includeDeleted: true })
    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    blog.isDeleted = false
    blog.deletedAt = null
    await blog.save()
    res.json({ success: true, message: 'Blog restored', blog })
  } catch (error) { next(error) }
}

// @DELETE /api/blogs/:id/permanent — HARD delete (admin only, irreversible)
exports.permanentDeleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndDelete({ _id: req.params.id, includeDeleted: true })
    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    res.json({ success: true, message: 'Blog permanently deleted' })
  } catch (error) { next(error) }
}

// @GET /api/blogs/trash — list soft-deleted blogs (admin only)
exports.getTrash = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ isDeleted: true, includeDeleted: true })
      .populate('author', 'name profileImage')
      .sort({ deletedAt: -1 })
    res.json({ success: true, blogs })
  } catch (error) { next(error) }
}

// @POST /api/blogs/:id/like
exports.toggleLike = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    const isLiked = blog.likes.includes(req.user._id)
    if (isLiked) blog.likes.pull(req.user._id)
    else         blog.likes.push(req.user._id)
    await blog.save()
    res.json({ success: true, likes: blog.likes.length, isLiked: !isLiked })
  } catch (error) { next(error) }
}