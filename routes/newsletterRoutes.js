const express = require('express')
const router = express.Router()
const {
  subscribe, unsubscribe, getSubscribers, sendNewsletter
} = require('../controllers/newsletterController')
const { protect, adminOnly } = require('../middleware/auth')

router.post('/subscribe',   subscribe)
router.post('/unsubscribe', unsubscribe)
router.get ('/subscribers', protect, adminOnly, getSubscribers)
router.post('/send',        protect, adminOnly, sendNewsletter)

module.exports = router
