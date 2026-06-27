const express = require('express')
const router = express.Router()
const {
  getBlogs, getTrending, getFeatured, getRecommended, getBlogBySlug, getRelatedBlogs,
  createBlog, updateBlog, updateStatus, toggleFeatured,
  deleteBlog, restoreBlog, permanentDeleteBlog, getTrash,
  toggleLike
} = require('../controllers/blogController')
const { protect, adminOnly, optionalAuth } = require('../middleware/auth')

// IMPORTANT: specific named routes BEFORE /:slug
router.get('/trending',      getTrending)
router.get('/featured',      getFeatured)
router.get('/recommended',   optionalAuth, getRecommended)
router.get('/trash',         protect, adminOnly, getTrash)
router.get('/',              getBlogs)
router.get('/:id/related',   getRelatedBlogs)
router.get('/:slug',         getBlogBySlug)

router.post('/',                     protect, adminOnly, createBlog)
router.put('/:id',                   protect, updateBlog)
router.put('/:id/status',            protect, updateStatus)
router.put('/:id/featured',          protect, adminOnly, toggleFeatured)
router.put('/:id/restore',           protect, adminOnly, restoreBlog)
router.delete('/:id',                protect, deleteBlog)
router.delete('/:id/permanent',      protect, adminOnly, permanentDeleteBlog)
router.post('/:id/like',             protect, toggleLike)

module.exports = router