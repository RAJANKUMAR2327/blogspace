const Blog = require('../models/Blog')
const slugify = require('slugify')

// @GET /api/blogs
exports.getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 9
    const { category, search, tag, sortBy, minReadTime, maxReadTime } = req.query

    let query = { status: 'published' }
    if (category) query.category = category
    if (tag) query.tags = { $in: [tag] }
    if (minReadTime) query.readTime = { ...query.readTime, $gte: parseInt(minReadTime) }
    if (maxReadTime) query.readTime = { ...query.readTime, $lte: parseInt(maxReadTime) }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ]
    }

    const sortOptions = {
      latest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { views: -1 },
      liked: { likes: -1 }
    }
    const sort = sortOptions[sortBy] || sortOptions.latest

    const total = await Blog.countDocuments(query)
    const blogs = await Blog.find(query)
      .populate('author', 'name profileImage')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)

    res.json({ success: true, blogs, pagination: { page, pages: Math.ceil(total / limit), total } })
  } catch (error) {
    next(error)
  }
}

// @GET /api/blogs/trending
exports.getTrending = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name profileImage')
      .sort({ views: -1 })
      .limit(5)
    res.json({ success: true, blogs })
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
    ).populate('author', 'name profileImage bio followers')

    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    res.json({ success: true, blog })
  } catch (error) {
    next(error)
  }
}

// @POST /api/blogs
exports.createBlog = async (req, res, next) => {
  try {
    const { title, content, category, tags, status, image, featured, scheduledAt } = req.body

    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now()

    // If scheduledAt is in the future, keep as draft
    const actualStatus = scheduledAt && new Date(scheduledAt) > new Date()
      ? 'draft'
      : status

    const blog = await Blog.create({
      title, content, category, tags, image, featured, slug,
      status: actualStatus,
      scheduledAt: scheduledAt || null,
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

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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

      // Create notification for blog author
      if (blog.author.toString() !== req.user._id.toString()) {
        const Notification = require('../models/Notification')
        await Notification.create({
          recipient: blog.author,
          sender:    req.user._id,
          type:      'like',
          blog:      blog._id,
          message:   `${req.user.name} liked your article "${blog.title}"`
        })
      }
    }

    await blog.save()
    res.json({ success: true, likes: blog.likes.length, isLiked: !isLiked })
  } catch (error) {
    next(error)
  }
}

// @POST /api/blogs/:id/clap  (NEW)
exports.clapBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { claps: 1 } },
      { new: true }
    )
    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    res.json({ success: true, claps: blog.claps })
  } catch (error) {
    next(error)
  }
}

// @GET /api/blogs/trending
exports.getTrending = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name profileImage')
      .sort({ views: -1, createdAt: -1 })
      .limit(5)
    res.json({ success: true, blogs })
  } catch (error) {
    next(error)
  }
}