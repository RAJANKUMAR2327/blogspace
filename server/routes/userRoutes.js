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

const { protect, adminOnly, optionalAuth } = require('../middleware/auth')
const { getAuditLogs, getLoginActivity } = require('../controllers/userController')

// IMPORTANT: specific named routes BEFORE /:id routes
router.get('/profile',          protect, getProfile)
router.put('/profile',          protect, updateProfile)
router.post('/save/:blogId',    protect, toggleSaveBlog)
router.get('/saved',            protect, getSavedBlogs)
router.get('/history',          protect, getHistory)
router.post('/history/:blogId', protect, addToHistory)
router.get('/author-stats',     protect, getAuthorStats)
router.get('/stats',            protect, adminOnly, getStats)
router.get('/platform-analytics', protect, adminOnly, getPlatformAnalytics)
router.get('/audit-logs',       protect, adminOnly, getAuditLogs)
router.get('/login-activity',   protect, getLoginActivity)

// Admin routes
router.get('/',          protect, adminOnly, getAllUsers)
router.put('/:id/ban',   protect, adminOnly, toggleBan)
router.delete('/:id',    protect, adminOnly, deleteUser)

// Public profile + follow (after named routes — /:id/profile would otherwise
// swallow /audit-logs, /login-activity etc. since Express matches top-down)
router.get('/:id/profile',  optionalAuth, getPublicProfile)
router.post('/:id/follow',  protect, followToggle)

module.exports = router
