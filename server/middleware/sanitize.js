const createDOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')

const window = new JSDOM('').window
const DOMPurify = createDOMPurify(window)

// Fields that should never be HTML-sanitized (would corrupt hashes/tokens/urls)
const SKIP_FIELDS = new Set(['password', 'token', 'unsubscribeToken', 'refreshToken'])

function clean(value) {
  if (typeof value === 'string') {
    // Strips <script>, inline event handlers, javascript: URLs etc. while keeping
    // safe formatting tags — blog content is markdown/HTML so we don't want to
    // strip everything, just the dangerous parts.
    return DOMPurify.sanitize(value, { USE_PROFILES: { html: true } })
  }
  if (Array.isArray(value)) {
    return value.map(clean)
  }
  if (value && typeof value === 'object') {
    const result = {}
    for (const key of Object.keys(value)) {
      result[key] = SKIP_FIELDS.has(key) ? value[key] : clean(value[key])
    }
    return result
  }
  return value
}

// Recursively strips XSS-unsafe HTML from every string field in req.body
exports.sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = clean(req.body)
  }
  next()
}
