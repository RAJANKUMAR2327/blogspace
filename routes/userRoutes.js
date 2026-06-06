const express = require('express')
const router = express.Router()
const {
  getProfile, updateProfile,
  toggleSaveBlog, getSavedBlogs,
  getHistory, addToHistory,
  followToggle,
  getAllUsers, getStats, toggleBan, deleteUser
} = require('../controllers/userController')
const { protect, adminOnly } = require('../middleware/auth')

// IMPORTANT: specific named routes BEFORE /:id routes
router.get('/profile',          protect, getProfile)
router.put('/profile',          protect, updateProfile)
router.post('/save/:blogId',    protect, toggleSaveBlog)
router.get('/saved',            protect, getSavedBlogs)
router.get('/history',          protect, getHistory)          // NEW
router.post('/history/:blogId', protect, addToHistory)        // NEW
router.get('/stats',            protect, adminOnly, getStats) // NEW

// Admin routes
router.get('/',          protect, adminOnly, getAllUsers)
router.put('/:id/ban',   protect, adminOnly, toggleBan)
router.delete('/:id',    protect, adminOnly, deleteUser)

// Follow toggle (after /stats, /history etc.)
router.post('/:id/follow', protect, followToggle)             // NEW

module.exports = router