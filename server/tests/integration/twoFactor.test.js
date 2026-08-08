import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import { generate } from 'otplib'
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js'

let app

beforeAll(async () => {
  await setupTestDB()
  app = (await import('../../app.js')).default
})
afterEach(async () => { await clearTestDB() })
afterAll(async () => { await teardownTestDB() })

async function registerAndLogin(email = '2fa@example.com') {
  const res = await request(app).post('/api/auth/register')
    .send({ name: '2FA Test', email, password: 'password123' })
  return { token: res.body.token, userId: res.body.user._id }
}

describe('2FA setup and enforcement', () => {
  it('setup returns a QR code and a secret', async () => {
    const { token } = await registerAndLogin()
    const res = await request(app)
      .post('/api/auth/2fa/setup')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.qrCode).toMatch(/^data:image\/png;base64,/)
    expect(res.body.secret).toBeTruthy()
  })

  it('verify-setup with the correct code enables 2FA and issues 8 backup codes', async () => {
    const { token } = await registerAndLogin()
    const setupRes = await request(app)
      .post('/api/auth/2fa/setup')
      .set('Authorization', `Bearer ${token}`)

    const validCode = await generate({ secret: setupRes.body.secret })

    const verifyRes = await request(app)
      .post('/api/auth/2fa/verify-setup')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: validCode })

    expect(verifyRes.status).toBe(200)
    expect(verifyRes.body.backupCodes).toHaveLength(8)
    expect(verifyRes.body.backupCodes[0]).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/)
  })

  it('verify-setup rejects an invalid code and does not enable 2FA', async () => {
    const { token } = await registerAndLogin()
    await request(app).post('/api/auth/2fa/setup').set('Authorization', `Bearer ${token}`)

    const res = await request(app)
      .post('/api/auth/2fa/verify-setup')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '000000' })

    expect(res.status).toBe(401)
  })

  it('login asks for a 2FA code once enabled, instead of logging straight in', async () => {
    const email = 'twofa-login@example.com'
    const { token } = await registerAndLogin(email)
    const setupRes = await request(app).post('/api/auth/2fa/setup').set('Authorization', `Bearer ${token}`)
    const validCode = await generate({ secret: setupRes.body.secret })
    await request(app).post('/api/auth/2fa/verify-setup').set('Authorization', `Bearer ${token}`).send({ code: validCode })

    const loginRes = await request(app).post('/api/auth/login')
      .send({ email, password: 'password123' })

    expect(loginRes.status).toBe(200)
    expect(loginRes.body.requires2FA).toBe(true)
    expect(loginRes.body.tempToken).toBeTruthy()
    expect(loginRes.body.token).toBeUndefined() // must NOT issue a real access token yet
  })

  it('completes login with a valid TOTP code after the 2FA challenge', async () => {
    const email = 'twofa-complete@example.com'
    const { token } = await registerAndLogin(email)
    const setupRes = await request(app).post('/api/auth/2fa/setup').set('Authorization', `Bearer ${token}`)
    const setupCode = await generate({ secret: setupRes.body.secret })
    await request(app).post('/api/auth/2fa/verify-setup').set('Authorization', `Bearer ${token}`).send({ code: setupCode })

    const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'password123' })
    const loginCode = await generate({ secret: setupRes.body.secret })

    const finalRes = await request(app).post('/api/auth/2fa/verify-login')
      .send({ tempToken: loginRes.body.tempToken, code: loginCode })

    expect(finalRes.status).toBe(200)
    expect(finalRes.body.token).toBeTruthy()
    expect(finalRes.body.user.email).toBe(email)
  })

  it('a backup code works exactly once — second use of the same code fails', async () => {
    const email = 'backup-code@example.com'
    const { token } = await registerAndLogin(email)
    const setupRes = await request(app).post('/api/auth/2fa/setup').set('Authorization', `Bearer ${token}`)
    const setupCode = await generate({ secret: setupRes.body.secret })
    const verifyRes = await request(app).post('/api/auth/2fa/verify-setup').set('Authorization', `Bearer ${token}`).send({ code: setupCode })
    const backupCode = verifyRes.body.backupCodes[0]

    const loginRes1 = await request(app).post('/api/auth/login').send({ email, password: 'password123' })
    const firstUse = await request(app).post('/api/auth/2fa/verify-login')
      .send({ tempToken: loginRes1.body.tempToken, code: backupCode })
    expect(firstUse.status).toBe(200) // works the first time

    const loginRes2 = await request(app).post('/api/auth/login').send({ email, password: 'password123' })
    const secondUse = await request(app).post('/api/auth/2fa/verify-login')
      .send({ tempToken: loginRes2.body.tempToken, code: backupCode })
    expect(secondUse.status).toBe(401) // rejected the second time — already consumed
  })

  it('rejects a completely wrong code at the login-verification step', async () => {
    const email = 'wrong-code@example.com'
    const { token } = await registerAndLogin(email)
    const setupRes = await request(app).post('/api/auth/2fa/setup').set('Authorization', `Bearer ${token}`)
    const setupCode = await generate({ secret: setupRes.body.secret })
    await request(app).post('/api/auth/2fa/verify-setup').set('Authorization', `Bearer ${token}`).send({ code: setupCode })

    const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'password123' })
    const res = await request(app).post('/api/auth/2fa/verify-login')
      .send({ tempToken: loginRes.body.tempToken, code: '999999' })

    expect(res.status).toBe(401)
  })
})
