const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment cannot be empty'],
    maxlength: 1000,
    trim: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null   // null = top-level comment, value = reply
  },
  isApproved: { type: Boolean, default: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })

module.exports = mongoose.model('Comment', commentSchema)

// @GET /api/comments/:blogId — replace existing
exports.getComments = async (req, res, next) => {
  try {
    // Get top-level comments
    const comments = await Comment.find({
      blog: req.params.blogId,
      parentComment: null,
      isApproved: true
    })
    .populate('user', 'name profileImage')
    .sort({ createdAt: -1 })

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id, isApproved: true })
          .populate('user', 'name profileImage')
          .sort({ createdAt: 1 })
        return { ...comment.toObject(), replies }
      })
    )

    res.json({ success: true, comments: commentsWithReplies })
  } catch (error) {
    next(error)
  }
}