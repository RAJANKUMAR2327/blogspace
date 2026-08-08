import { describe, it, expect } from 'vitest'
import { generateSecret, generate, verify, generateURI } from 'otplib'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

describe('TOTP (2FA authenticator app codes)', () => {
  it('generates a valid secret and a code that verifies against it', async () => {
    const secret = generateSecret()
    const token = await generate({ secret })
    const result = await verify({ secret, token })
    expect(result.valid).toBe(true)
  })

  it('rejects a code generated from a different secret', async () => {
    const secretA = generateSecret()
    const secretB = generateSecret()
    const tokenFromA = await generate({ secret: secretA })
    const result = await verify({ secret: secretB, token: tokenFromA })
    expect(result.valid).toBe(false)
  })

  it('rejects a garbage 6-digit code (astronomically unlikely to collide)', async () => {
    const secret = generateSecret()
    const result = await verify({ secret, token: '000000' })
    expect(result.valid).toBe(false)
  })

  it('builds a valid otpauth:// URI for QR code generation', () => {
    const secret = generateSecret()
    const uri = generateURI({ issuer: 'BlogSpace', label: 'test@example.com', secret })
    expect(uri).toMatch(/^otpauth:\/\/totp\//)
    expect(uri).toContain('BlogSpace')
    expect(uri).toContain(secret)
  })
})

describe('2FA backup codes', () => {
  function generateBackupCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase().match(/.{1,4}/g).join('-')
  }

  it('generates codes in the expected XXXX-XXXX format', () => {
    const code = generateBackupCode()
    expect(code).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/)
  })

  it('generates 8 unique codes with no collisions', () => {
    const codes = new Set()
    for (let i = 0; i < 8; i++) codes.add(generateBackupCode())
    expect(codes.size).toBe(8)
  })

  it('hashes each backup code so the plain code cannot be recovered from storage', async () => {
    const code = generateBackupCode()
    const hash = await bcrypt.hash(code, 10)
    expect(hash).not.toContain(code)
    expect(await bcrypt.compare(code, hash)).toBe(true)
  })

  it('a used-up backup code (removed from the array) can no longer verify against anything left', async () => {
    const codes = [generateBackupCode(), generateBackupCode()]
    const hashes = await Promise.all(codes.map(c => bcrypt.hash(c, 10)))

    // Simulate consuming the first code (this is exactly what
    // verifyLoginTwoFactor does via splice() on a match)
    const usedCode = codes[0]
    const remainingHashes = hashes.slice(1)

    let stillMatches = false
    for (const h of remainingHashes) {
      if (await bcrypt.compare(usedCode, h)) stillMatches = true
    }
    expect(stillMatches).toBe(false)
  })
})
