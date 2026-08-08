import { describe, it, expect, beforeAll } from 'vitest'
import jwt from 'jsonwebtoken'

beforeAll(() => {
  // Tests run in isolation from the real .env — use a throwaway secret
  process.env.JWT_SECRET = 'test-secret-for-unit-tests-only'
})

describe('JWT token behavior', () => {
  it('signs and verifies a valid access token', () => {
    const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET, { expiresIn: '15m' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    expect(decoded.id).toBe('user123')
  })

  it('rejects a token signed with the wrong secret', () => {
    const token = jwt.sign({ id: 'user123' }, 'wrong-secret', { expiresIn: '15m' })
    expect(() => jwt.verify(token, process.env.JWT_SECRET)).toThrow()
  })

  it('rejects an expired token', () => {
    const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET, { expiresIn: '-1s' })
    expect(() => jwt.verify(token, process.env.JWT_SECRET)).toThrow(/expired/i)
  })

  it('2FA challenge tokens carry a distinguishing purpose claim', () => {
    // This is the exact mechanism authController.js relies on to make sure a
    // 2FA temp token can't be reused as a real access token elsewhere.
    const token = jwt.sign({ id: 'user123', purpose: '2fa-challenge' }, process.env.JWT_SECRET, { expiresIn: '5m' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    expect(decoded.purpose).toBe('2fa-challenge')
  })
})
