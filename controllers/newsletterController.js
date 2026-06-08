const nodemailer = require('nodemailer')

// In-memory store (replace with MongoDB model for production)
let subscribers = []

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
})

exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email required' })
    if (subscribers.find(s => s.email === email)) {
      return res.status(400).json({ message: 'Already subscribed' })
    }
    subscribers.push({ email, subscribedAt: new Date() })

    // Send welcome email
    await transporter.sendMail({
      from: `"BlogSpace" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to BlogSpace Newsletter!',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#080810;padding:40px;border-radius:16px">
          <h2 style="color:#a78bfa;font-size:28px;margin-bottom:8px">Welcome to BlogSpace ✦</h2>
          <p style="color:#888;font-size:16px;line-height:1.6">You're now subscribed to our weekly newsletter. Every Sunday we'll send you the best stories handpicked by our editorial team.</p>
          <p style="color:#888;font-size:14px;margin-top:24px">If you didn't subscribe, you can safely ignore this email.</p>
        </div>
      `
    })

    res.json({ success: true, message: 'Subscribed! Check your email.' })
  } catch (error) {
    next(error)
  }
}

exports.unsubscribe = async (req, res) => {
  const { email } = req.body
  subscribers = subscribers.filter(s => s.email !== email)
  res.json({ success: true, message: 'Unsubscribed successfully' })
}

exports.getSubscribers = async (req, res) => {
  res.json({ success: true, count: subscribers.length, subscribers })
}

exports.sendNewsletter = async (req, res, next) => {
  try {
    const { subject, content } = req.body
    if (!subject || !content) return res.status(400).json({ message: 'Subject and content required' })

    const promises = subscribers.map(({ email }) =>
      transporter.sendMail({
        from: `"BlogSpace" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
            <h2 style="color:#a78bfa">${subject}</h2>
            <div style="color:#555;line-height:1.6">${content}</div>
            <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
            <p style="font-size:12px;color:#999">Unsubscribe at any time from your account settings.</p>
          </div>
        `
      })
    )
    await Promise.all(promises)
    res.json({ success: true, message: `Newsletter sent to ${subscribers.length} subscribers` })
  } catch (error) {
    next(error)
  }
}