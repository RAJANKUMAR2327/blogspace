const crypto = require('crypto')
const nodemailer = require('nodemailer')
const Subscriber = require('../models/Subscriber')
const Blog = require('../models/Blog')

const getTransporter = () => nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
})

// @POST /api/newsletter/subscribe
exports.subscribe = async (req, res, next) => {
  try {
    const { email, categories } = req.body
    if (!email) return res.status(400).json({ message: 'Email required' })

    const existing = await Subscriber.findOne({ email })
    if (existing) {
      if (existing.isActive) return res.status(400).json({ message: 'Already subscribed' })
      // Reactivate if they previously unsubscribed
      existing.isActive = true
      await existing.save()
      return res.json({ success: true, message: 'Welcome back! Subscription reactivated.' })
    }

    const unsubscribeToken = crypto.randomBytes(24).toString('hex')
    const subscriber = await Subscriber.create({
      email,
      user: req.user?._id,
      preferences: { categories: categories || [] },
      unsubscribeToken
    })

    try {
      const transporter = getTransporter()
      const unsubUrl = `${process.env.CLIENT_URL}/newsletter/unsubscribe/${unsubscribeToken}`
      await transporter.sendMail({
        from: `"BlogSpace" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🎉 Welcome to BlogSpace Newsletter!',
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#080810;padding:40px;border-radius:16px;color:#fff">
            <h2 style="color:#a78bfa;margin-bottom:8px">Welcome to BlogSpace ✦</h2>
            <p style="color:rgba(255,255,255,0.6);line-height:1.6">
              You're now subscribed! Every week we'll send you the best stories handpicked just for you.
            </p>
            <p style="color:rgba(255,255,255,0.25);font-size:12px;margin-top:24px">
              <a href="${unsubUrl}" style="color:rgba(255,255,255,0.4)">Unsubscribe</a> at any time.
            </p>
          </div>
        `
      })
    } catch (emailErr) {
      console.log('Welcome email failed (non-critical):', emailErr.message)
    }

    res.json({ success: true, message: 'Subscribed successfully!' })
  } catch (error) { next(error) }
}

// @POST /api/newsletter/unsubscribe — by email (logged-in flow)
exports.unsubscribe = async (req, res, next) => {
  try {
    const { email } = req.body
    await Subscriber.findOneAndUpdate({ email }, { isActive: false })
    res.json({ success: true, message: 'Unsubscribed successfully' })
  } catch (error) { next(error) }
}

// @GET /api/newsletter/unsubscribe/:token — one-click unsubscribe from email link
exports.unsubscribeByToken = async (req, res, next) => {
  try {
    const subscriber = await Subscriber.findOneAndUpdate(
      { unsubscribeToken: req.params.token },
      { isActive: false },
      { new: true }
    )
    if (!subscriber) return res.status(404).json({ message: 'Invalid unsubscribe link' })
    res.json({ success: true, message: 'You have been unsubscribed', email: subscriber.email })
  } catch (error) { next(error) }
}

// @GET /api/newsletter/subscribers (admin)
exports.getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 })
    const activeCount = subscribers.filter(s => s.isActive).length
    res.json({ success: true, count: subscribers.length, activeCount, subscribers })
  } catch (error) { next(error) }
}

// @POST /api/newsletter/send — manual one-off send (admin)
exports.sendNewsletter = async (req, res, next) => {
  try {
    const { subject, content } = req.body
    if (!subject || !content) return res.status(400).json({ message: 'Subject and content required' })

    const subscribers = await Subscriber.find({ isActive: true })
    if (subscribers.length === 0) return res.status(400).json({ message: 'No active subscribers' })

    const transporter = getTransporter()
    const promises = subscribers.map(sub => {
      const unsubUrl = `${process.env.CLIENT_URL}/newsletter/unsubscribe/${sub.unsubscribeToken}`
      return transporter.sendMail({
        from: `"BlogSpace" <${process.env.EMAIL_USER}>`,
        to: sub.email,
        subject,
        html: buildEmailTemplate({ subject, bodyHtml: content, unsubUrl })
      })
    })

    await Promise.allSettled(promises)
    await Subscriber.updateMany({ isActive: true }, { lastSentAt: new Date() })

    res.json({ success: true, message: `Newsletter sent to ${subscribers.length} subscribers` })
  } catch (error) { next(error) }
}

// @POST /api/newsletter/send-digest — manually trigger the weekly digest right now (admin, for testing)
exports.sendDigestNow = async (req, res, next) => {
  try {
    const result = await sendWeeklyDigest()
    res.json({ success: true, message: `Digest sent to ${result.sentCount} subscribers`, ...result })
  } catch (error) { next(error) }
}
// @POST /api/newsletter/cron-trigger — for external cron services (protected by secret key, not user auth)
exports.cronTriggerDigest = async (req, res, next) => {
  try {
    const providedKey = req.headers['x-cron-secret']
    if (providedKey !== process.env.CRON_SECRET) {
      return res.status(403).json({ message: 'Invalid cron secret' })
    }
    const result = await sendWeeklyDigest()
    res.json({ success: true, ...result })
  } catch (error) { next(error) }
}

// ── Core digest logic — exported so the cron job can call it too ──
async function sendWeeklyDigest() {
  const subscribers = await Subscriber.find({ isActive: true })
  if (subscribers.length === 0) return { sentCount: 0 }

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  // Top 5 articles from the past week, by views
  const generalTopArticles = await Blog.find({ status: 'published', createdAt: { $gte: oneWeekAgo } })
    .populate('author', 'name')
    .sort({ views: -1 })
    .limit(5)

  // Fallback: if nothing new this week, use all-time trending
  const fallbackArticles = generalTopArticles.length > 0
    ? generalTopArticles
    : await Blog.find({ status: 'published' }).populate('author', 'name').sort({ views: -1 }).limit(5)

  const transporter = getTransporter()
  let sentCount = 0

  for (const sub of subscribers) {
    let articles = fallbackArticles

    // Personalize by preferred categories, if set
    if (sub.preferences?.categories?.length > 0) {
      const personalized = await Blog.find({
        status: 'published',
        category: { $in: sub.preferences.categories },
        createdAt: { $gte: oneWeekAgo }
      }).populate('author', 'name').sort({ views: -1 }).limit(5)

      if (personalized.length > 0) articles = personalized
    }

    const unsubUrl = `${process.env.CLIENT_URL}/newsletter/unsubscribe/${sub.unsubscribeToken}`
    const articlesHtml = articles.map(a => `
      <div style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08)">
        <p style="font-size:11px;color:#a78bfa;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px">${a.category}</p>
        <a href="${process.env.CLIENT_URL}/blog/${a.slug}" style="font-size:16px;font-weight:600;color:#fff;text-decoration:none;line-height:1.4">${a.title}</a>
        <p style="font-size:13px;color:rgba(255,255,255,0.4);margin:6px 0 0">by ${a.author?.name || 'Unknown'} · ${a.views} views</p>
      </div>
    `).join('')

    try {
      await transporter.sendMail({
        from: `"BlogSpace" <${process.env.EMAIL_USER}>`,
        to: sub.email,
        subject: '📬 Your Weekly BlogSpace Digest',
        html: buildEmailTemplate({
          subject: 'This Week\'s Top Stories',
          bodyHtml: articlesHtml,
          unsubUrl,
          isDigest: true
        })
      })
      sentCount++
    } catch (err) {
      console.log(`Digest send failed for ${sub.email}:`, err.message)
    }
  }

  await Subscriber.updateMany({ isActive: true }, { lastSentAt: new Date() })
  return { sentCount, totalSubscribers: subscribers.length }
}

function buildEmailTemplate({ subject, bodyHtml, unsubUrl, isDigest = false }) {
  return `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#080810;padding:0;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:32px 32px 24px">
        <p style="color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px">BlogSpace</p>
        <h1 style="color:#fff;font-size:24px;margin:0;font-weight:800">${subject}</h1>
      </div>
      <div style="padding:32px;color:rgba(255,255,255,0.7)">
        ${bodyHtml}
        ${isDigest ? `<a href="${process.env.CLIENT_URL}/blogs" style="display:inline-block;margin-top:8px;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;text-decoration:none;border-radius:10px;font-weight:500;font-size:14px">Browse all stories →</a>` : ''}
      </div>
      <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
        <p style="font-size:11px;color:rgba(255,255,255,0.25);margin:0">
          <a href="${unsubUrl}" style="color:rgba(255,255,255,0.4)">Unsubscribe</a> · You're receiving this because you subscribed to BlogSpace
        </p>
      </div>
    </div>
  `
}

module.exports.sendWeeklyDigest = sendWeeklyDigest