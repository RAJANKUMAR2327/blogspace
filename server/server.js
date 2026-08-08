require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const app = require('./app')
const connectDB = require('./config/db')
const { startScheduler } = require('./utils/scheduler')

connectDB()

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  startScheduler()
})
