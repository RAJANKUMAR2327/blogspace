const express = require('express')
const router = express.Router()
const { askAI } = require('../utils/aiClient')
const { protect, adminOnly } = require('../middleware/auth')

router.get('/test', protect, adminOnly, async (req, res, next) => {
  try {
    const result = await askAI({
      prompt: 'Say "BlogSpace AI connection successful!" and nothing else.',
      maxTokens: 50
    })
    res.json({ success: true, result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router