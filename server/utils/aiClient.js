const { GoogleGenerativeAI } = require('@google/generative-ai')

let client = null

function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables')
    }
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return client
}

// Shared helper: sends a prompt, returns plain text response
async function askAI({ system, prompt, maxTokens = 1024, model = 'gemini-1.5-flash' }) {
  const genAI = getClient()
  const geminiModel = genAI.getGenerativeModel({
    model,
    systemInstruction: system || undefined,
    generationConfig: { maxOutputTokens: maxTokens }
  })

  const result = await geminiModel.generateContent(prompt)
  return result.response.text() || ''
}

module.exports = { getClient, askAI }