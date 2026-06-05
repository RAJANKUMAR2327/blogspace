const Blog = require('../models/Blog')
const slugify = require('slugify')

// @GET /api/blogs
exports.getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 9
    const { category, search, tag } = req.query

    let query = { status: 'published' }
    if (category) query.category = category
    if (tag) query.tags = tag
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    }

    const total = await Blog.countDocuments(query)
    const blogs = await Blog.find(query)
      .populate('author', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    res.json({
      success: true,
      blogs,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    next(error)
  }
}

// @GET /api/blogs/:slug
exports.getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name profileImage bio')

    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    res.json({ success: true, blog })
  } catch (error) {
    next(error)
  }
}

// @POST /api/blogs
exports.createBlog = async (req, res, next) => {
  try {
    const { title, content, category, tags, status, image } = req.body
    const slug = slugify(title, { lower: true, strict: true }) +
      '-' + Date.now()

    const blog = await Blog.create({
      title, content, category, tags, status, image, slug,
      author: req.user._id
    })
    res.status(201).json({ success: true, blog })
  } catch (error) {
    next(error)
  }
}

// @PUT /api/blogs/:id
exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ message: 'Blog not found' })

    if (blog.author.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const updated = await Blog.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    )
    res.json({ success: true, blog: updated })
  } catch (error) {
    next(error)
  }
}

// @DELETE /api/blogs/:id
exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ message: 'Blog not found' })

    if (blog.author.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await blog.deleteOne()
    res.json({ success: true, message: 'Blog deleted' })
  } catch (error) {
    next(error)
  }
}

// @POST /api/blogs/:id/like
exports.toggleLike = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ message: 'Blog not found' })

    const isLiked = blog.likes.includes(req.user._id)
    if (isLiked) {
      blog.likes.pull(req.user._id)
    } else {
      blog.likes.push(req.user._id)
    }
    await blog.save()
    res.json({ success: true, likes: blog.likes.length, isLiked: !isLiked })
  } catch (error) {
    next(error)
  }
}