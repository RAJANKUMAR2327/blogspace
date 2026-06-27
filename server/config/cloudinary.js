const cloudinary = require('cloudinary').v2
const multer = require('multer')
const cloudinaryStorage = require('multer-storage-cloudinary')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const blogStorage = new cloudinaryStorage({
  cloudinary,
  folder:         'blogspace/blogs',
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [
    { width: 1600, height: 900, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
  ]
})

const profileStorage = new cloudinaryStorage({
  cloudinary,
  folder:         'blogspace/profiles',
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [
    { width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
  ]
})

exports.uploadBlogImage    = multer({ storage: blogStorage })
exports.uploadProfileImage = multer({ storage: profileStorage })
exports.cloudinary         = cloudinary
