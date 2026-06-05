const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const blogStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blogspace/blogs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 630, crop: 'fill', quality: 'auto' }]
  }
})

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blogspace/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill', quality: 'auto' }]
  }
})

exports.uploadBlogImage   = multer({ storage: blogStorage })
exports.uploadProfileImage = multer({ storage: profileStorage })
exports.cloudinary        = cloudinary