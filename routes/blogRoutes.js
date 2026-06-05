const express = require('express')
const router = express.Router()
const {
  getBlogs, getBlogBySlug, createBlog,
  updateBlog, deleteBlog, toggleLike
} = require('../controllers/blogController')
const { protect, adminOnly } = require('../middleware/auth')

router.get('/', getBlogs)
router.get('/:slug', getBlogBySlug)
router.post('/', protect, adminOnly, createBlog)
router.put('/:id', protect, updateBlog)
router.delete('/:id', protect, deleteBlog)
router.post('/:id/like', protect, toggleLike)

module.exports = router