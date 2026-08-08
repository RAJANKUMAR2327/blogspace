const cron = require('node-cron')
const { sendWeeklyDigest } = require('../controllers/newsletterController')

// Kicks off all background cron jobs. Called once from server.js after the
// server starts listening.
exports.startScheduler = () => {
  // Every Monday at 09:00 server time — sends the weekly digest email to
  // all active newsletter subscribers.
  cron.schedule('0 9 * * 1', async () => {
    console.log('🗓️  Running scheduled weekly digest...')
    try {
      await sendWeeklyDigest()
      console.log('✅ Weekly digest sent')
    } catch (err) {
      console.error('❌ Weekly digest failed:', err.message)
    }
  })

  console.log('⏰ Scheduler started — weekly digest set for Mondays 09:00')
}
