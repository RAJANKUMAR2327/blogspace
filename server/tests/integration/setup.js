import { beforeAll, afterAll, afterEach } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod

export async function setupTestDB() {
  process.env.JWT_SECRET = 'integration-test-secret'
  process.env.JWT_REFRESH_SECRET = 'integration-test-refresh-secret'
  process.env.NODE_ENV = 'test'
  // Deliberately no RECAPTCHA_SECRET_KEY / CRON_SECRET — tests exercise the
  // real "not configured" fail-safe paths already covered in unit tests.

  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
}

export async function teardownTestDB() {
  await mongoose.disconnect()
  if (mongod) await mongod.stop()
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}
