const Comment = require('../models/Comment')
const Notification = require('../models/Notification')
const Blog = require('../models/Blog')

// @GET /api/comments/:blogId
exports.getComments = async (req, res, next) => {
  try {
    // Get top-level comments only
    const comments = await Comment.find({
      blog: req.params.blogId,
      parentComment: null,
      isApproved: true
    })
    .populate('user', 'name profileImage')
    .sort({ createdAt: -1 })

    // For each comment, get its replies
    const withReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id, isApproved: true })
          .populate('user', 'name profileImage')
          .sort('createdAt')
        return { ...comment.toObject(), replies }
      })
    )

    res.json({ success: true, comments: withReplies })
  } catch (error) {
    next(error)
  }
}

// @POST /api/comments/:blogId
exports.addComment = async (req, res, next) => {
  try {
    const { content, parentComment } = req.body

    const comment = await Comment.create({
      blog: req.params.blogId,
      user: req.user._id,
      content,
      parentComment: parentComment || null
    })

    await comment.populate('user', 'name profileImage')

    // Send notification to blog author (or parent comment author for replies)
    const blog = await Blog.findById(req.params.blogId).select('author title')

    if (blog && blog.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: blog.author,
        sender:    req.user._id,
        type:      parentComment ? 'reply' : 'comment',
        blog:      blog._id,
        message:   parentComment
          ? `${req.user.name} replied to a comment on "${blog.title}"`
          : `${req.user.name} commented on "${blog.title}"`
      })
    }

    res.status(201).json({ success: true, comment })
  } catch (error) {
    next(error)
  }
}

// @DELETE /api/comments/:id
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ message: 'Comment not found' })

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    // Also delete replies to this comment
    await Comment.deleteMany({ parentComment: comment._id })
    await comment.deleteOne()

    res.json({ success: true, message: 'Comment deleted' })
  } catch (error) {
    next(error)
  }
}

// @GET /api/comments (admin — get all)
exports.getAllComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ isApproved: true })
      .populate('user', 'name profileImage')
      .populate('blog', 'title slug')
      .sort('-createdAt')
      .limit(100)
    res.json({ success: true, comments })
  } catch (error) {
    next(error)
  }
}