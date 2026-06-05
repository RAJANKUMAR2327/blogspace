const Comment = require('../models/Comment')

// @GET /api/comments/:blogId
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({
      blog: req.params.blogId,
      parentComment: null,
      isApproved: true
    })
    .populate('user', 'name profileImage')
    .populate({
      path: 'replies',
      populate: { path: 'user', select: 'name profileImage' }
    })
    .sort({ createdAt: -1 })

    res.json({ success: true, comments })
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

    if (comment.user.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await comment.deleteOne()
    res.json({ success: true, message: 'Comment deleted' })
  } catch (error) {
    next(error)
  }
}