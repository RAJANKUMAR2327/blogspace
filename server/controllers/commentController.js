const Comment = require('../models/Comment')

// @GET /api/comments/:blogId
exports.getComments = async (req, res, next) => {
  try {
    const filter = { blog: req.params.blogId, parentComment: null }
    // Public only sees approved comments; admin sees everything
    if (req.user?.role !== 'admin') filter.isApproved = true

    const comments = await Comment.find(filter)
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 })

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replyFilter = { parentComment: comment._id }
        if (req.user?.role !== 'admin') replyFilter.isApproved = true

        const replies = await Comment.find(replyFilter)
          .populate('user', 'name profileImage')
          .sort({ createdAt: 1 })
        return { ...comment.toObject(), replies }
      })
    )

    res.json({ success: true, comments: commentsWithReplies })
  } catch (error) { next(error) }
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

    if (!parentComment) {
      try {
        const Blog = require('../models/Blog')
        const blog = await Blog.findById(req.params.blogId).select('author title')
        if (blog && blog.author.toString() !== req.user._id.toString()) {
          const Notification = require('../models/notification')
          await Notification.create({
            recipient: blog.author,
            sender: req.user._id,
            type: 'comment',
            blog: blog._id,
            message: `${req.user.name} commented on "${blog.title}"`
          })
        }
      } catch { }
    } else {
      // Notify the parent comment's author about a reply
      try {
        const parent = await Comment.findById(parentComment).populate('user', '_id name')
        if (parent && parent.user._id.toString() !== req.user._id.toString()) {
          const Notification = require('../models/notification')
          await Notification.create({
            recipient: parent.user._id,
            sender: req.user._id,
            type: 'reply',
            blog: req.params.blogId,
            message: `${req.user.name} replied to your comment`
          })
        }
      } catch { }
    }

    res.status(201).json({ success: true, comment })
  } catch (error) { next(error) }
}

// @PUT /api/comments/:id — edit a comment (own comment only)
exports.editComment = async (req, res, next) => {
  try {
    const { content } = req.body
    if (!content?.trim()) return res.status(400).json({ message: 'Comment cannot be empty' })

    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ message: 'Comment not found' })
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    comment.content  = content
    comment.isEdited = true
    comment.editedAt = new Date()
    await comment.save()
    await comment.populate('user', 'name profileImage')

    res.json({ success: true, comment })
  } catch (error) { next(error) }
}

// @POST /api/comments/:id/like — toggle reaction
exports.toggleCommentLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ message: 'Comment not found' })

    const isLiked = comment.likes.includes(req.user._id)
    if (isLiked) comment.likes.pull(req.user._id)
    else         comment.likes.push(req.user._id)
    await comment.save()

    res.json({ success: true, likes: comment.likes.length, isLiked: !isLiked })
  } catch (error) { next(error) }
}

// @DELETE /api/comments/:id
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ message: 'Comment not found' })
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }
    await Comment.deleteMany({ parentComment: comment._id })
    await comment.deleteOne()
    res.json({ success: true, message: 'Comment deleted' })
  } catch (error) { next(error) }
}

// @POST /api/comments/:id/flag — user flags a comment for review
exports.flagComment = async (req, res, next) => {
  try {
    const { reason } = req.body
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isFlagged: true, flagReason: reason || 'Reported by user' },
      { new: true }
    )
    if (!comment) return res.status(404).json({ message: 'Comment not found' })
    res.json({ success: true, message: 'Comment flagged for review' })
  } catch (error) { next(error) }
}

// ── Admin Moderation ─────────────────────────────────

// @GET /api/comments/admin/all — all comments, with flagged-first sort
exports.getAllComments = async (req, res, next) => {
  try {
    const { filter } = req.query // 'flagged' | 'pending' | undefined
    let query = {}
    if (filter === 'flagged') query.isFlagged = true
    if (filter === 'pending') query.isApproved = false

    const comments = await Comment.find(query)
      .populate('user', 'name profileImage')
      .populate('blog', 'title slug')
      .sort({ isFlagged: -1, createdAt: -1 })
      .limit(100)
    res.json({ success: true, comments })
  } catch (error) { next(error) }
}

// @PUT /api/comments/:id/approve — admin approves/restores a comment
exports.approveComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, isFlagged: false, flagReason: '' },
      { new: true }
    )
    if (!comment) return res.status(404).json({ message: 'Comment not found' })
    res.json({ success: true, comment })
  } catch (error) { next(error) }
}

// @PUT /api/comments/:id/reject — admin hides a comment without deleting
exports.rejectComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    )
    if (!comment) return res.status(404).json({ message: 'Comment not found' })
    res.json({ success: true, comment })
  } catch (error) { next(error) }
}