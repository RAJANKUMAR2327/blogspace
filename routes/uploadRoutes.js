const express = require('express')
const router  = express.Router()
const { uploadBlogImage, uploadProfileImage } = require('../config/cloudinary')
const { protect } = require('../middleware/auth')

// @POST /api/upload/blog
router.post('/blog', protect, uploadBlogImage.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    res.json({
      success: true,
      url: req.file.path,
      public_id: req.file.filename
    })
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' })
  }
})

// @POST /api/upload/profile
router.post('/profile', protect, uploadProfileImage.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    res.json({
      success: true,
      url: req.file.path,
      public_id: req.file.filename
    })
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' })
  }
})

module.exports = router