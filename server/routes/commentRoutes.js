const express = require('express')
const router = express.Router()
const {
  getComments, addComment, editComment, deleteComment,
  toggleCommentLike, flagComment,
  getAllComments, approveComment, rejectComment
} = require('../controllers/commentController')
const { protect, adminOnly } = require('../middleware/auth')

// Admin moderation (before /:blogId to avoid route collision)
router.get('/admin/all',      protect, adminOnly, getAllComments)
router.put('/:id/approve',    protect, adminOnly, approveComment)
router.put('/:id/reject',     protect, adminOnly, rejectComment)

router.get('/:blogId',        getComments)
router.post('/:blogId',       protect, addComment)
router.put('/:id',            protect, editComment)
router.post('/:id/like',      protect, toggleCommentLike)
router.post('/:id/flag',      protect, flagComment)
router.delete('/:id',         protect, deleteComment)

module.exports = router