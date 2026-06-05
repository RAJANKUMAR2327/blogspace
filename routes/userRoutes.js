const express = require('express')
const router = express.Router()

const {
  getProfile,
  updateProfile,
  toggleSaveBlog,
  getSavedBlogs,
  getAllUsers,
  toggleBan,
  deleteUser,
  getHistory,
  addToHistory,
  followToggle
} = require('../controllers/userController')

const { protect, adminOnly } = require('../middleware/auth')

// Reading History
router.get('/history', protect, getHistory)
router.post('/history/:blogId', protect, addToHistory)

// Profile
router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)

// Saved Blogs
router.post('/save/:blogId', protect, toggleSaveBlog)
router.get('/saved', protect, getSavedBlogs)

// Follow / Unfollow
router.post('/:id/follow', protect, followToggle)

// Admin Routes
router.get('/', protect, adminOnly, getAllUsers)
router.put('/:id/ban', protect, adminOnly, toggleBan)
router.delete('/:id', protect, adminOnly, deleteUser)

module.exports = router