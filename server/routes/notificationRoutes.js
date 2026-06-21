const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  getNotifications,
  getUnreadCount,
  markAllRead,
  deleteNotification
} = require('../controllers/notificationController')

router.get('/',             protect, getNotifications)
router.get('/unread',       protect, getUnreadCount)
router.put('/mark-read',    protect, markAllRead)
router.delete('/:id',       protect, deleteNotification)

module.exports = router