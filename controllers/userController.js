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
// Add to controllers/userController.js

// GET /api/users/history — Get reading history
exports.getHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('readHistory', 'title slug image category readTime createdAt author')
      .populate('readHistory.author', 'name profileImage')
    
    res.json({ success: true, history: user.readHistory || [] })
  } catch (error) {
    next(error)
  }
}

// POST /api/users/history/:blogId — Add to reading history
exports.addToHistory = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { readHistory: req.params.blogId }   // addToSet prevents duplicates
    })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}
// controllers/userController.js
exports.followToggle = async (req, res, next) => {
  try {
    const targetId = req.params.id
    const userId   = req.user.id

    if (targetId === userId) {
      return res.status(400).json({ success: false, message: "Can't follow yourself" })
    }

    const target = await User.findById(targetId)
    if (!target) return res.status(404).json({ success: false, message: 'User not found' })

    const isFollowing = target.followers.includes(userId)

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(targetId, { $pull: { followers: userId } })
      await User.findByIdAndUpdate(userId,   { $pull: { following: targetId } })
    } else {
      // Follow
      await User.findByIdAndUpdate(targetId, { $addToSet: { followers: userId } })
      await User.findByIdAndUpdate(userId,   { $addToSet: { following: targetId } })
    }

    res.json({ success: true, isFollowing: !isFollowing })
  } catch (error) {
    next(error)
  }
}