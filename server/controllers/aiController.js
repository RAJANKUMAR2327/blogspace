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

// @POST /api/ai/generate-article — drafts a full article from a topic (admin only, expensive)
exports.generateArticle = async (req, res, next) => {
  try {
    const { topic, category, tone, length } = req.body
    if (!topic?.trim()) return res.status(400).json({ message: 'Topic is required' })

    const lengthMap = {
      short:  { words: '400-600',   maxTokens: 1200 },
      medium: { words: '800-1200',  maxTokens: 2200 },
      long:   { words: '1500-2000', maxTokens: 3500 }
    }
    const config = lengthMap[length] || lengthMap.medium

    const prompt = `Write a complete, well-structured blog article on the following topic.

Topic: ${topic.trim()}
Category: ${category || 'General'}
Tone: ${tone || 'informative and engaging'}
Target length: ${config.words} words

Format the article using Markdown:
- Start with a # heading for the title
- Use ## for section headings to organize the content logically
- Use **bold** for emphasis on key terms
- Use - for bullet lists where appropriate
- Write in clear, engaging prose — avoid generic filler phrases like "in today's world" or "in conclusion"
- Do NOT include a meta-commentary intro like "Here's an article about..." — just write the article directly starting with the title heading

Write the complete article now.`

    const generatedContent = await askAI({ prompt, maxTokens: config.maxTokens })

    // Extract the title from the first # heading, separate it from the body
    const titleMatch = generatedContent.match(/^#\s+(.+)/m)
    const title = titleMatch ? titleMatch[1].trim() : topic.trim()
    const content = generatedContent.replace(/^#\s+.+\n?/, '').trim()

    res.json({ success: true, title, content })
  } catch (error) {
    console.error('Article generation error:', error.message)
    res.status(500).json({ message: 'Failed to generate article. Please try again.' })
  }
}

// @POST /api/ai/check-writing — grammar issues + SEO suggestions while writing
exports.checkGrammarAndSEO = async (req, res, next) => {
  try {
    const { content } = req.body
    if (!content || content.trim().length < 50) {
      return res.status(400).json({ message: 'Write a bit more content before checking' })
    }

    const trimmedContent = content.slice(0, 3000)

    const prompt = `Review this blog article draft and provide feedback. Respond ONLY with valid JSON in exactly this format, no markdown fences, no extra text:

{
  "grammarIssues": [
    { "issue": "brief description of the grammar/clarity problem", "suggestion": "how to fix it" }
  ],
  "seoSuggestions": [
    "one specific, actionable SEO improvement suggestion"
  ],
  "readabilityScore": "Easy" | "Medium" | "Hard",
  "overallFeedback": "one encouraging sentence about the writing"
}

Rules:
- List max 5 grammar issues (only real problems, don't nitpick style preferences)
- List max 4 SEO suggestions (e.g. missing headings, keyword usage, content length, meta-worthy phrasing)
- If no grammar issues found, return an empty array for grammarIssues
- Be constructive, not harsh

Article content:
"""
${trimmedContent}
"""`

    const rawResponse = await askAI({ prompt, maxTokens: 700 })
    const cleaned = rawResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return res.status(502).json({ message: 'Could not analyze writing, please try again' })
    }

    res.json({ success: true, ...parsed })
  } catch (error) {
    console.error('Writing check error:', error.message)
    res.status(500).json({ message: 'Writing check failed. Please try again.' })
  }
}