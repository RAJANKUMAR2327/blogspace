import { describe, it, expect } from 'vitest'
import bcrypt from 'bcryptjs'

describe('Password hashing', () => {
  it('produces a hash that verifies against the original password', async () => {
    const hash = await bcrypt.hash('correct-horse-battery-staple', 12)
    expect(await bcrypt.compare('correct-horse-battery-staple', hash)).toBe(true)
  })

  it('rejects an incorrect password against the hash', async () => {
    const hash = await bcrypt.hash('correct-horse-battery-staple', 12)
    expect(await bcrypt.compare('wrong-password', hash)).toBe(false)
  })

  it('never stores the password in plain text in the hash output', async () => {
    const password = 'super-secret-123'
    const hash = await bcrypt.hash(password, 12)
    expect(hash).not.toContain(password)
  })

  it('produces a different hash each time even for the same password (unique salt)', async () => {
    const hash1 = await bcrypt.hash('same-password', 12)
    const hash2 = await bcrypt.hash('same-password', 12)
    expect(hash1).not.toBe(hash2)
    // but both still verify correctly
    expect(await bcrypt.compare('same-password', hash1)).toBe(true)
    expect(await bcrypt.compare('same-password', hash2)).toBe(true)
  })
})
