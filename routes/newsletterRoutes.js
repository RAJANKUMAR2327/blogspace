const express = require('express')
const router = express.Router()

const subscribers = []
const express = require('express')
const router = express.Router()
const { subscribe, unsubscribe, getSubscribers, sendNewsletter } = require('../controllers/newsletterController')
const { protect, adminOnly } = require('../middleware/auth')

router.post('/subscribe', subscribe)
router.post('/unsubscribe', unsubscribe)
router.get('/subscribers', protect, adminOnly, getSubscribers)
router.post('/send', protect, adminOnly, sendNewsletter)

module.exports = router

router.post('/subscribe', (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'Email required' })
  if (subscribers.includes(email)) {
    return res.status(400).json({ message: 'Already subscribed' })
  }
  subscribers.push(email)
  res.json({ success: true, message: 'Subscribed successfully' })
})

router.post('/unsubscribe', (req, res) => {
  const { email } = req.body
  const index = subscribers.indexOf(email)
  if (index > -1) subscribers.splice(index, 1)
  res.json({ success: true, message: 'Unsubscribed successfully' })
})

module.exports = router