const express = require('express')
const router = express.Router()
const {
  getBlogs, getTrending, getBlogBySlug,
  createBlog, updateBlog, deleteBlog,
  toggleLike, clapBlog
} = require('../controllers/blogController')
const { protect, adminOnly } = require('../middleware/auth')

// IMPORTANT: specific named routes BEFORE /:slug
router.get('/trending',   getTrending)
router.get('/',           getBlogs)
router.get('/:slug',      getBlogBySlug)

router.post('/',          protect, adminOnly, createBlog)
router.put('/:id',        protect, updateBlog)
router.delete('/:id',     protect, deleteBlog)
router.post('/:id/like',  protect, toggleLike)
router.post('/:id/clap',  protect, clapBlog)

module.exports = router
