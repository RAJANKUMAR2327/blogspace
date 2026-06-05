const express = require('express')
const router = express.Router()
const {
  getProfile, updateProfile, toggleSaveBlog,
  getSavedBlogs, getAllUsers, toggleBan, deleteUser
} = require('../controllers/userController')
const { protect, adminOnly } = require('../middleware/auth')

router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)
router.post('/save/:blogId', protect, toggleSaveBlog)
router.get('/saved', protect, getSavedBlogs)
router.get('/', protect, adminOnly, getAllUsers)
router.put('/:id/ban', protect, adminOnly, toggleBan)
router.delete('/:id', protect, adminOnly, deleteUser)

module.exports = router