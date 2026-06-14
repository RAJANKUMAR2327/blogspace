const express = require('express')
const router = express.Router()
const {
  getComments, addComment, deleteComment, getAllComments
} = require('../controllers/commentController')
const { protect, adminOnly } = require('../middleware/auth')

router.get('/admin/all',  protect, adminOnly, getAllComments)
router.get('/:blogId',    getComments)
router.post('/:blogId',   protect, addComment)
router.delete('/:id',     protect, deleteComment)

module.exports = router
