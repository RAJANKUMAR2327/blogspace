import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['server/tests/**/*.test.js'],
    testTimeout: 30000, // integration tests spin up an in-memory MongoDB, which takes a moment
    // beforeAll() in the integration tests calls MongoMemoryServer.create(),
    // which downloads the MongoDB binary the first few times it runs on a
    // machine — that alone can take longer than Vitest's 10s hookTimeout
    // default on a slow connection, failing the whole suite before a single
    // test runs. 60s gives that download comfortable room.
    hookTimeout: 60000,
  }
})
