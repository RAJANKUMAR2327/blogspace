const express = require('express')
const router = express.Router()
const {
  subscribe, unsubscribe, unsubscribeByToken,
  getSubscribers, sendNewsletter, sendDigestNow, cronTriggerDigest
} = require('../controllers/newsletterController')
const { protect, adminOnly, optionalAuth } = require('../middleware/auth')

router.post('/subscribe',            optionalAuth, subscribe)
router.post('/unsubscribe',          unsubscribe)
router.get ('/unsubscribe/:token',   unsubscribeByToken)
router.post('/cron-trigger',         cronTriggerDigest) // no auth — protected by secret header instead

router.get ('/subscribers',          protect, adminOnly, getSubscribers)
router.post('/send',                 protect, adminOnly, sendNewsletter)
router.post('/send-digest',          protect, adminOnly, sendDigestNow)

module.exports = router