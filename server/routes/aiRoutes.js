const express = require('express')
const router = express.Router()
const { suggestTitlesAndTags, summarizeArticle } = require('../controllers/aiController')
const { getChat, askAboutArticle } = require('../controllers/articleChatController')
const { protect, optionalAuth } = require('../middleware/auth')
const { aiRateLimit } = require('../middleware/aiRateLimit')

router.post('/suggest-titles-tags', protect, aiRateLimit, suggestTitlesAndTags)
router.post('/summarize/:id', optionalAuth, aiRateLimit, summarizeArticle)

router.get('/chat/:blogId',  optionalAuth, getChat)
router.post('/chat/:blogId', optionalAuth, aiRateLimit, askAboutArticle)

module.exports = router