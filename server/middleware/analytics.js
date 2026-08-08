const ActivityLog = require('../models/ActivityLog')

// Classifies an incoming request's Referer header into a coarse traffic source
// bucket, used by Blog.referrers analytics (see blogController.getBlogBySlug).
exports.parseReferrerSource = (req) => {
  const referer = req.headers.referer || req.headers.referrer
  if (!referer) return 'direct'

  try {
    const host = new URL(referer).hostname.replace(/^www\./, '')
    if (host.includes('google.'))                      return 'google'
    if (host.includes('bing.'))                         return 'bing'
    if (host.includes('twitter.') || host === 'x.com')  return 'twitter'
    if (host.includes('facebook.'))                     return 'facebook'
    if (host.includes('linkedin.'))                     return 'linkedin'
    if (host.includes('reddit.'))                        return 'reddit'
    if (host === (process.env.CLIENT_URL || '').replace(/^https?:\/\//, '').replace(/^www\./, '')) {
      return 'internal'
    }
    return 'other'
  } catch {
    return 'direct'
  }
}

// Records one lightweight row per request so /api/users/platform-analytics can
// compute Daily Active Users. Never blocks or slows down the actual request —
// the log write happens in the background and failures are swallowed.
exports.logActivity = (req, res, next) => {
  // Skip noisy/irrelevant paths so the collection doesn't fill up with junk
  if (req.method !== 'GET' && req.method !== 'POST') return next()
  if (req.path.startsWith('/api/notifications')) return next()

  const today = new Date().toISOString().split('T')[0]

  ActivityLog.create({
    date:      today,
    user:      req.user?._id,
    sessionId: req.headers['x-session-id'] || undefined,
    path:      req.path,
    method:    req.method
  }).catch(() => {}) // analytics must never break the request

  next()
}
