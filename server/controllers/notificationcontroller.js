const Notification = require('../models/Notification')

// @GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name profileImage')
      .populate('blog', 'title slug')
      .sort('-createdAt')
      .limit(20)

    res.json({ success: true, notifications })
  } catch (error) {
    next(error)
  }
}

// @GET /api/notifications/unread
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    })
    res.json({ success: true, count })
  } catch (error) {
    next(error)
  }
}

// @PUT /api/notifications/mark-read
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    )
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

// @DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}