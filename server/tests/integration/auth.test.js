import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js'

let app

beforeAll(async () => {
  await setupTestDB()
  app = (await import('../../app.js')).default
})

afterEach(async () => {
  await clearTestDB()
})

afterAll(async () => {
  await teardownTestDB()
})

describe('POST /api/auth/register', () => {
  it('creates a new account and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user.email).toBe('test@example.com')
    // Password must never be echoed back in the response, under any field name
    expect(JSON.stringify(res.body)).not.toContain('password123')
  })

  it('rejects registration with a missing field', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com' }) // no password

    expect(res.status).toBe(400)
  })

  it('rejects registering the same email twice', async () => {
    await request(app).post('/api/auth/register')
      .send({ name: 'First', email: 'dup@example.com', password: 'password123' })

    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Second', email: 'dup@example.com', password: 'differentpass' })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/already registered/i)
  })
})

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    // registered once per file run via the shared app/db above; re-created
    // fresh each test via afterEach's clearTestDB, so register here per-test
  })

  it('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register')
      .send({ name: 'Login Test', email: 'login@example.com', password: 'correctpass' })

    const res = await request(app).post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'correctpass' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user.email).toBe('login@example.com')
  })

  it('rejects an incorrect password', async () => {
    await request(app).post('/api/auth/register')
      .send({ name: 'Login Test', email: 'login2@example.com', password: 'correctpass' })

    const res = await request(app).post('/api/auth/login')
      .send({ email: 'login2@example.com', password: 'wrongpass' })

    expect(res.status).toBe(401)
  })

  it('rejects login for a non-existent email', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever123' })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  it('rejects a request with no auth token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('returns the current user for a valid token', async () => {
    const registerRes = await request(app).post('/api/auth/register')
      .send({ name: 'Me Test', email: 'me@example.com', password: 'password123' })

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registerRes.body.token}`)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('me@example.com')
  })
})
