const express = require('express')
const router = express.Router()
const {
  getProfile, updateProfile,
  toggleSaveBlog, getSavedBlogs,
  getHistory, addToHistory,
  followToggle, getPublicProfile,
  getAuthorStats,
  getAllUsers, getStats,
  toggleBan, deleteUser,
  getPlatformAnalytics
} = require('../controllers/userController')

// add this line among your named routes (before any /:id routes):
router.get('/author-stats', protect, getAuthorStats)
const { protect, adminOnly } = require('../middleware/auth')

// IMPORTANT: specific named routes BEFORE /:id routes
router.get('/profile',          protect, getProfile)
router.put('/profile',          protect, updateProfile)
router.post('/save/:blogId',    protect, toggleSaveBlog)
router.get('/saved',            protect, getSavedBlogs)
router.get('/history',          protect, getHistory)
router.post('/history/:blogId', protect, addToHistory)
router.get('/stats',            protect, adminOnly, getStats)
router.get('/platform-analytics', protect, adminOnly, getPlatformAnalytics)

// Admin routes
router.get('/',          protect, adminOnly, getAllUsers)
router.put('/:id/ban',   protect, adminOnly, toggleBan)
router.delete('/:id',    protect, adminOnly, deleteUser)

// Public profile + follow (after named routes)
router.get('/:id/profile',  getPublicProfile)
router.post('/:id/follow',  protect, followToggle)

module.exports = router
