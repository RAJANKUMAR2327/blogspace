const express = require('express')
const router = express.Router()
const {
  getBlogs, getTrending, getBlogBySlug,
  createBlog, updateBlog, deleteBlog,
  toggleLike, clapBlog
} = require('../controllers/blogController')
const { protect, adminOnly } = require('../middleware/auth')
const { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog, toggleLike, getTrending } = require('../controllers/blogController')

router.get('/trending', getTrending)

// IMPORTANT: specific routes must come BEFORE /:slug
router.get('/trending', getTrending)     // GET /api/blogs/trending
router.get('/', getBlogs)                // GET /api/blogs
router.get('/:slug', getBlogBySlug)      // GET /api/blogs/:slug

router.post('/',          protect, adminOnly, createBlog)
router.put('/:id',        protect, updateBlog)
router.delete('/:id',     protect, deleteBlog)
router.post('/:id/like',  protect, toggleLike)
router.post('/:id/clap',  protect, clapBlog)   // NEW

module.exports = router