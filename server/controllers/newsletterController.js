const nodemailer = require('nodemailer')

// In-memory store — replace with DB model for production
let subscribers = []

const getTransporter = () => nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// @POST /api/newsletter/subscribe
exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email required' })
    if (subscribers.find(s => s.email === email)) {
      return res.status(400).json({ message: 'Already subscribed' })
    }

    subscribers.push({ email, subscribedAt: new Date() })

    // Welcome email
    try {
      const transporter = getTransporter()
      await transporter.sendMail({
        from:    `"BlogSpace" <${process.env.EMAIL_USER}>`,
        to:      email,
        subject: '🎉 Welcome to BlogSpace Newsletter!',
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#080810;padding:40px;border-radius:16px">
            <h2 style="color:#a78bfa;margin-bottom:8px">Welcome to BlogSpace ✦</h2>
            <p style="color:rgba(255,255,255,0.6);line-height:1.6">
              You're now subscribed! Every Sunday we'll send you the best stories handpicked by our team.
            </p>
            <p style="color:rgba(255,255,255,0.3);font-size:13px;margin-top:24px">
              If you didn't subscribe, you can safely ignore this email.
            </p>
          </div>
        `
      })
    } catch (emailErr) {
      console.log('Email send failed (non-critical):', emailErr.message)
    }

    res.json({ success: true, message: 'Subscribed successfully!' })
  } catch (error) { next(error) }
}

// @POST /api/newsletter/unsubscribe
exports.unsubscribe = async (req, res) => {
  const { email } = req.body
  subscribers = subscribers.filter(s => s.email !== email)
  res.json({ success: true, message: 'Unsubscribed successfully' })
}

// @GET /api/newsletter/subscribers (admin)
exports.getSubscribers = async (req, res) => {
  res.json({ success: true, count: subscribers.length, subscribers })
}

// @POST /api/newsletter/send (admin)
exports.sendNewsletter = async (req, res, next) => {
  try {
    const { subject, content } = req.body
    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content required' })
    }
    if (subscribers.length === 0) {
      return res.status(400).json({ message: 'No subscribers yet' })
    }

    const transporter = getTransporter()
    const promises = subscribers.map(({ email }) =>
      transporter.sendMail({
        from:    `"BlogSpace" <${process.env.EMAIL_USER}>`,
        to:      email,
        subject,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
            <h2 style="color:#7c3aed">${subject}</h2>
            <div style="color:#555;line-height:1.7">${content}</div>
            <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
            <p style="font-size:12px;color:#999">
              You're receiving this because you subscribed to BlogSpace.
            </p>
          </div>
        `
      })
    )

    await Promise.allSettled(promises)
    res.json({ success: true, message: `Newsletter sent to ${subscribers.length} subscribers` })
  } catch (error) { next(error) }
}
