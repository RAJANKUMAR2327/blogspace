const express = require('express')
const router = express.Router()
const {
  suggestTitlesAndTags, summarizeArticle,
  generateArticle, checkGrammarAndSEO
} = require('../controllers/aiController')
const { getChat, askAboutArticle } = require('../controllers/articleChatController')
const { protect, optionalAuth, adminOnly } = require('../middleware/auth')
const { aiRateLimit, articleGenerationRateLimit } = require('../middleware/aiRateLimit')

router.post('/suggest-titles-tags', protect, aiRateLimit, suggestTitlesAndTags)
router.post('/summarize/:id', optionalAuth, aiRateLimit, summarizeArticle)
router.post('/generate-article', protect, adminOnly, articleGenerationRateLimit, generateArticle)
router.post('/check-writing', protect, aiRateLimit, checkGrammarAndSEO)

router.get('/chat/:blogId', optionalAuth, getChat)
router.post('/chat/:blogId', optionalAuth, aiRateLimit, askAboutArticle)

module.exports = router