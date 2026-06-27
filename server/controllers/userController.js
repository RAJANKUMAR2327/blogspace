const User = require('../models/User')
const Blog = require('../models/Blog')
const { logAction } = require('../utils/auditLog')

// @GET /api/users/profile
exports.getProfile = async (req, res) => {
  res.json({ success: true, user: req.user })
}

// @PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, profileImage, socialLinks } = req.body
    const updateData = { name, bio, profileImage }
    if (socialLinks) updateData.socialLinks = socialLinks

    const user = await User.findByIdAndUpdate(
      req.user._id, updateData, { new: true, runValidators: true }
    )
    res.json({ success: true, user })
  } catch (error) { next(error) }
}

// @POST /api/users/save/:blogId
exports.toggleSaveBlog = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    const isSaved = user.savedBlogs.includes(req.params.blogId)
    if (isSaved) user.savedBlogs.pull(req.params.blogId)
    else         user.savedBlogs.push(req.params.blogId)
    await user.save()
    res.json({ success: true, isSaved: !isSaved })
  } catch (error) { next(error) }
}

// @GET /api/users/saved
exports.getSavedBlogs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({ path: 'savedBlogs', populate: { path: 'author', select: 'name profileImage' } })
    res.json({ success: true, blogs: user.savedBlogs })
  } catch (error) { next(error) }
}

// @GET /api/users/history
exports.getHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({ path: 'readHistory', populate: { path: 'author', select: 'name profileImage' } })
    res.json({ success: true, history: user.readHistory || [] })
  } catch (error) { next(error) }
}

// @POST /api/users/history/:blogId
exports.addToHistory = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { readHistory: req.params.blogId }
    })
    res.json({ success: true })
  } catch (error) { next(error) }
}

// @POST /api/users/:id/follow — unified follow toggle
exports.followToggle = async (req, res, next) => {
  try {
    const targetId = req.params.id
    const userId   = req.user._id.toString()

    if (targetId === userId) {
      return res.status(400).json({ message: "You can't follow yourself" })
    }

    const target = await User.findById(targetId)
    if (!target) return res.status(404).json({ message: 'User not found' })

    const isFollowing = target.followers.map(id => id.toString()).includes(userId)

    if (isFollowing) {
      await User.findByIdAndUpdate(targetId, { $pull: { followers: userId } })
      await User.findByIdAndUpdate(userId,   { $pull: { following: targetId } })
    } else {
      await User.findByIdAndUpdate(targetId, { $addToSet: { followers: userId } })
      await User.findByIdAndUpdate(userId,   { $addToSet: { following: targetId } })

      try {
        const Notification = require('../models/notification')
        await Notification.create({
          recipient: targetId,
          sender:    userId,
          type:      'follow',
          message:   `${req.user.name} started following you`
        })
      } catch { /* notifications optional */ }
    }

    res.json({ success: true, isFollowing: !isFollowing })
  } catch (error) { next(error) }
}

// @GET /api/users/:id/profile
exports.getPublicProfile = async (req, res, next) => {
  try {
    const Blog = require('../models/Blog')
    const user = await User.findById(req.params.id).select('-password -email')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const blogs = await Blog.find({ author: req.params.id, status: 'published' })
      .sort({ createdAt: -1 })
      .limit(12)

    const totalViews = await Blog.aggregate([
      { $match: { author: user._id, status: 'published' } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ])

    res.json({
      success: true,
      user,
      blogs,
      stats: {
        articleCount: blogs.length,
        totalViews: totalViews[0]?.total || 0,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0
      }
    })
  } catch (error) { next(error) }
}

// ── Admin ────────────────────────────────────────────────

// @GET /api/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json({ success: true, users })
  } catch (error) { next(error) }
}

// @GET /api/users/stats — full platform analytics (admin)
exports.getStats = async (req, res, next) => {
  try {
    const Blog = require('../models/Blog')
    const Comment = require('../models/Comment')

    const [totalUsers, totalBlogs, totalComments, publishedBlogs, draftBlogs, bannedUsers] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      Comment.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      User.countDocuments({ isBanned: true }),
    ])

    const totalViewsAgg = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ])
    const totalLikesAgg = await Blog.aggregate([
      { $project: { likeCount: { $size: { $ifNull: ['$likes', []] } } } },
      { $group: { _id: null, total: { $sum: '$likeCount' } } }
    ])

    const topBlogs = await Blog.find({ status: 'published' })
      .sort('-views').limit(5)
      .select('title slug views likes category readTime')

    const recentUsers = await User.find()
      .sort('-createdAt').limit(5)
      .select('name email role createdAt')

    // ── Growth data — last 30 days, grouped by day ──────────
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const articleGrowth = await Blog.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Build a complete 30-day series (fill in zero days so the chart doesn't have gaps)
    const buildSeries = (data) => {
      const map = {}
      data.forEach(d => { map[d._id] = d.count })
      const series = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const key = date.toISOString().split('T')[0]
        series.push({ date: key, count: map[key] || 0 })
      }
      return series
    }

    // Category distribution
    const categoryDistribution = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    res.json({
      success: true,
      stats: {
        totalUsers, totalBlogs, totalComments,
        publishedBlogs, draftBlogs, bannedUsers,
        totalViews: totalViewsAgg[0]?.total || 0,
        totalLikes: totalLikesAgg[0]?.total || 0,
      },
      topBlogs,
      recentUsers,
      growth: {
        users: buildSeries(userGrowth),
        articles: buildSeries(articleGrowth)
      },
      categoryDistribution: categoryDistribution.map(c => ({ name: c._id, value: c.count }))
    })
  } catch (error) { next(error) }
}

// @GET /api/users/platform-analytics — DAU, top tags, top authors (admin)
exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const Blog = require('../models/Blog')
    const ActivityLog = require('../models/ActivityLog')
    const SearchLog = require('../models/SearchLog')

    // ── Daily Active Users — last 14 days ──────────────
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const dauRaw = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      { $group: { _id: '$date', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])

    const dauSeries = []
    for (let i = 13; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = date.toISOString().split('T')[0]
      const found = dauRaw.find(d => d._id === key)
      dauSeries.push({ date: key.slice(5), count: found?.count || 0 })
    }

    // ── Top Searched Tags/Queries — last 30 days ───────
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const topSearches = await SearchLog.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])

    // ── Top Authors by total views ──────────────────────
    const topAuthors = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: {
          _id: '$author',
          totalViews: { $sum: '$views' },
          articleCount: { $sum: 1 }
        }
      },
      { $sort: { totalViews: -1 } },
      { $limit: 5 },
      { $lookup: {
          from: 'users', localField: '_id', foreignField: '_id', as: 'authorInfo'
        }
      },
      { $unwind: '$authorInfo' },
      { $project: {
          name: '$authorInfo.name',
          profileImage: '$authorInfo.profileImage',
          totalViews: 1, articleCount: 1
        }
      }
    ])

    res.json({
      success: true,
      dau: dauSeries,
      topSearches: topSearches.map(s => ({ query: s._id, count: s.count })),
      topAuthors
    })
  } catch (error) { next(error) }
}

// @PUT /api/users/:id/ban
exports.toggleBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    user.isBanned = !user.isBanned
    await user.save()

    logAction({
      actor: req.user._id,
      action: user.isBanned ? 'ban_user' : 'unban_user',
      targetType: 'User',
      targetId: user._id,
      details: `${user.isBanned ? 'Banned' : 'Unbanned'} user ${user.email}`,
      req
    })

    res.json({ success: true, isBanned: user.isBanned })
  } catch (error) { next(error) }
}

// @DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    logAction({
      actor: req.user._id,
      action: 'delete_user',
      targetType: 'User',
      targetId: user._id,
      details: `Deleted user ${user.email}`,
      req
    })

    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'User deleted' })
  } catch (error) { next(error) }
}
// @GET /api/users/audit-logs (admin)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const AuditLog = require('../models/AuditLog')
    const logs = await AuditLog.find()
      .populate('actor', 'name email')
      .sort({ createdAt: -1 })
      .limit(100)
    res.json({ success: true, logs })
  } catch (error) { next(error) }
}

// @GET /api/users/login-activity — own login history
exports.getLoginActivity = async (req, res, next) => {
  try {
    const LoginActivity = require('../models/LoginActivity')
    const activity = await LoginActivity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
    res.json({ success: true, activity })
  } catch (error) { next(error) }
}
// @GET /api/users/author-stats — stats for the logged-in author
exports.getAuthorStats = async (req, res, next) => {
  try {
    const Blog = require('../models/Blog')
    const Comment = require('../models/Comment')

    const blogs = await Blog.find({ author: req.user._id })

    const totalViews     = blogs.reduce((sum, b) => sum + (b.views || 0), 0)
    const totalLikes     = blogs.reduce((sum, b) => sum + (b.likes?.length || 0), 0)
    const publishedCount = blogs.filter(b => b.status === 'published').length
    const draftCount     = blogs.filter(b => b.status === 'draft').length

    // Comment count across all this author's blogs
    const blogIds = blogs.map(b => b._id)
    const commentCount = await Comment.countDocuments({ blog: { $in: blogIds } })

    // Top 5 performing articles by views
    const topArticles = [...blogs]
      .filter(b => b.status === 'published')
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(b => ({
        _id: b._id, title: b.title, slug: b.slug,
        views: b.views, likes: b.likes?.length || 0, readTime: b.readTime
      }))

    res.json({
      success: true,
      stats: {
        totalArticles: blogs.length,
        publishedCount,
        draftCount,
        totalViews,
        totalLikes,
        commentCount,
        followersCount: req.user.followers?.length || 0
      },
      topArticles
    })
  } catch (error) { next(error) }
}