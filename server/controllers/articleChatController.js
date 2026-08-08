const ArticleChat = require('../models/ArticleChat')
const Blog = require('../models/Blog')
const { askAI } = require('../utils/aiClient')

const MAX_MESSAGES_PER_CHAT = 20 // 10 question/answer pairs — caps cost per reader per article

// @GET /api/article-chat/:blogId — get existing conversation (if any)
exports.getChat = async (req, res, next) => {
  try {
    const filter = { blog: req.params.blogId }
    if (req.user) {
      filter.user = req.user._id
    } else {
      if (!req.query.sessionId) return res.json({ success: true, messages: [] })
      filter.sessionId = req.query.sessionId
    }

    const chat = await ArticleChat.findOne(filter)
    res.json({ success: true, messages: chat?.messages || [] })
  } catch (error) { next(error) }
}

// @POST /api/article-chat/:blogId — ask a question
exports.askAboutArticle = async (req, res, next) => {
  try {
    const { question, sessionId } = req.body
    if (!question?.trim()) return res.status(400).json({ message: 'Question is required' })

    const blogFilter = { _id: req.params.blogId }
    if (req.user?.role !== 'admin') blogFilter.status = 'published'
    const blog = await Blog.findOne(blogFilter)
    if (!blog) return res.status(404).json({ message: 'Article not found' })

    const filter = { blog: blog._id }
    if (req.user) filter.user = req.user._id
    else filter.sessionId = sessionId

    let chat = await ArticleChat.findOne(filter)
    if (!chat) {
      chat = await ArticleChat.create({
        blog: blog._id,
        user: req.user?._id,
        sessionId: req.user ? undefined : sessionId,
        messages: []
      })
    }

    if (chat.messages.length >= MAX_MESSAGES_PER_CHAT) {
      return res.status(429).json({ message: 'You\'ve reached the question limit for this article. Try a different article!' })
    }

    const plainContent = blog.content.replace(/<[^>]*>/g, '').replace(/```[\s\S]*?```/g, '').slice(0, 6000)

    // Build conversation history for context (last 6 messages = 3 exchanges, keeps prompt size reasonable)
    const recentHistory = chat.messages.slice(-6)
      .map(m => `${m.role === 'user' ? 'Reader' : 'Assistant'}: ${m.content}`)
      .join('\n')

    const systemPrompt = `You are a helpful assistant answering reader questions about a specific blog article. Only answer based on the article content provided. If the question can't be answered from the article, say so honestly rather than making things up. Keep answers concise — 2-4 sentences unless the question genuinely requires more detail.

Article title: "${blog.title}"
Article content:
"""
${plainContent}
"""`

    const prompt = `${recentHistory ? `Previous conversation:\n${recentHistory}\n\n` : ''}Reader's new question: ${question.trim()}`

    const answer = await askAI({ system: systemPrompt, prompt, maxTokens: 400 })

    chat.messages.push({ role: 'user', content: question.trim() })
    chat.messages.push({ role: 'assistant', content: answer.trim() })
    await chat.save()

    res.json({
      success: true,
      answer: answer.trim(),
      remainingQuestions: Math.floor((MAX_MESSAGES_PER_CHAT - chat.messages.length) / 2)
    })
  } catch (error) {
    console.error('Article chat error:', error.message)
    res.status(500).json({ message: 'Failed to get an answer. Please try again.' })
  }
}