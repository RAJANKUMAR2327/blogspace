import { describe, it, expect, beforeEach, vi } from 'vitest'

function mockReqRes(overrides = {}) {
  const req = { body: {}, headers: {}, ip: '127.0.0.1', ...overrides }
  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this },
    json(payload) { this.body = payload; return this }
  }
  const next = vi.fn()
  return { req, res, next }
}

describe('reCAPTCHA middleware — fails open only when genuinely unconfigured', () => {
  beforeEach(() => {
    delete process.env.RECAPTCHA_SECRET_KEY
    vi.resetModules()
  })

  it('skips verification (calls next) when RECAPTCHA_SECRET_KEY is not set', async () => {
    const { verifyRecaptcha } = await import('../../middleware/recaptcha.js')
    const { req, res, next } = mockReqRes()
    await verifyRecaptcha(0.5)(req, res, next)
    expect(next).toHaveBeenCalledOnce()
  })

  it('rejects with 400 when configured but no token is provided', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'fake-secret-for-test'
    const { verifyRecaptcha } = await import('../../middleware/recaptcha.js')
    const { req, res, next } = mockReqRes({ body: {} })
    await verifyRecaptcha(0.5)(req, res, next)
    expect(res.statusCode).toBe(400)
    expect(next).not.toHaveBeenCalled()
  })
})

describe('Cron secret check — must fail closed, not open', () => {
  it('the exact bug this test guards against: undefined !== undefined is false', () => {
    // This is the literal footgun that was in cronTriggerDigest before the
    // fix — if CRON_SECRET is never set, comparing it to a missing header
    // silently "passes" unless there's an explicit guard for the unset case.
    const providedKey = undefined
    const secretFromEnv = undefined
    expect(providedKey !== secretFromEnv).toBe(false) // i.e. the check would NOT trigger a 403
  })

  it('newsletterController refuses to run when CRON_SECRET is unset (fails closed)', async () => {
    delete process.env.CRON_SECRET
    vi.resetModules()
    // Mock the Subscriber/Blog models this controller imports, since we only
    // care about the fail-closed guard at the top of the function, not the
    // full digest-sending logic (that's covered separately in integration tests).
    vi.doMock('../../models/Subscriber.js', () => ({ default: {} }))
    vi.doMock('../../models/Blog.js', () => ({ default: {} }))

    const { req, res, next } = mockReqRes()
    const controller = await import('../../controllers/newsletterController.js')
    await controller.cronTriggerDigest(req, res, next)

    expect(res.statusCode).toBe(503) // refused, not a false-pass 200
  })
})
