const Notification = require('../models/notification')

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

const Notification = require('../models/notification')

// @GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name profileImage')
      .populate('blog', 'title slug')
      .sort({ createdAt: -1 })
      .limit(30)

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id, isRead: false
    })

    res.json({ success: true, notifications, unreadCount })
  } catch (error) { next(error) }
}

// @PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    )
    if (!notification) return res.status(404).json({ message: 'Notification not found' })
    res.json({ success: true, notification })
  } catch (error) { next(error) }
}

// @PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    )
    res.json({ success: true, message: 'All notifications marked as read' })
  } catch (error) { next(error) }
}

// @DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id })
    res.json({ success: true, message: 'Notification deleted' })
  } catch (error) { next(error) }
}