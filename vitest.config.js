import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['server/tests/**/*.test.js'],
    testTimeout: 30000, // integration tests spin up an in-memory MongoDB, which takes a moment
  }
})
