const { askAI } = require('../utils/aiClient')

// @POST /api/ai/suggest-titles-tags
exports.suggestTitlesAndTags = async (req, res, next) => {
  try {
    const { content, category } = req.body
    if (!content || content.trim().length < 50) {
      return res.status(400).json({ message: 'Write at least a few sentences before requesting suggestions' })
    }

    // Trim content to avoid sending huge token counts for very long drafts
    const trimmedContent = content.slice(0, 3000)

    const prompt = `You are helping a blog writer come up with a title and tags for their article.

Category: ${category || 'General'}

Article content (may be partial/draft):
"""
${trimmedContent}
"""

Respond ONLY with valid JSON in exactly this format, no markdown code fences, no extra text:
{
  "titles": ["title option 1", "title option 2", "title option 3", "title option 4", "title option 5"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Rules:
- Titles should be engaging, specific, under 70 characters, and avoid clickbait
- Tags should be lowercase, single words or short phrases (max 2 words), relevant to the actual content
- Provide exactly 5 titles and exactly 5 tags`

    const rawResponse = await askAI({ prompt, maxTokens: 500 })

    // Gemini sometimes wraps JSON in markdown fences despite instructions — strip them defensively
    const cleaned = rawResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return res.status(502).json({ message: 'AI response could not be parsed, please try again' })
    }

    if (!Array.isArray(parsed.titles) || !Array.isArray(parsed.tags)) {
      return res.status(502).json({ message: 'AI response was malformed, please try again' })
    }

    res.json({ success: true, titles: parsed.titles, tags: parsed.tags })
  } catch (error) {
    console.error('AI suggestion error:', error.message)
    res.status(500).json({ message: 'AI suggestion failed. Please try again or write your own title/tags.' })
  }
}