const express = require('express')
const router = express.Router()
const {
  getNotifications, markAsRead, markAllAsRead, deleteNotification
} = require('../controllers/notificationController')
const { protect } = require('../middleware/auth')

router.get('/',              protect, getNotifications)
router.put('/read-all',      protect, markAllAsRead)
router.put('/:id/read',      protect, markAsRead)
router.delete('/:id',        protect, deleteNotification)

module.exports = router