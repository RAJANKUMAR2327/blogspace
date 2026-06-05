const User = require('../models/User')
const Blog = require('../models/Blog')

// @GET /api/users/profile
exports.getProfile = async (req, res) => {
  res.json({ success: true, user: req.user })
}

// @PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, profileImage } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, profileImage },
      { new: true, runValidators: true }
    )
    res.json({ success: true, user })
  } catch (error) {
    next(error)
  }
}

// @POST /api/users/save/:blogId
exports.toggleSaveBlog = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    const isSaved = user.savedBlogs.includes(req.params.blogId)
    if (isSaved) {
      user.savedBlogs.pull(req.params.blogId)
    } else {
      user.savedBlogs.push(req.params.blogId)
    }
    await user.save()
    res.json({ success: true, isSaved: !isSaved })
  } catch (error) {
    next(error)
  }
}

// @GET /api/users/saved
exports.getSavedBlogs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({ path: 'savedBlogs', populate: { path: 'author', select: 'name profileImage' } })
    res.json({ success: true, blogs: user.savedBlogs })
  } catch (error) {
    next(error)
  }
}

// Admin only below
// @GET /api/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json({ success: true, users })
  } catch (error) {
    next(error)
  }
}

// @PUT /api/users/:id/ban
exports.toggleBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    user.isBanned = !user.isBanned
    await user.save()
    res.json({ success: true, isBanned: user.isBanned })
  } catch (error) {
    next(error)
  }
}

// @DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'User deleted' })
  } catch (error) {
    next(error)
  }
}