import { describe, expect, it } from 'vitest'
import {
  hashPassword,
  isModernPasswordHash,
  verifyPassword,
} from '../../src/lib/password'

describe('password KDF', () => {
  it('creates a salted scrypt hash', async () => {
    const first = await hashPassword('correct horse battery staple')
    const second = await hashPassword('correct horse battery staple')

    expect(first).not.toBe(second)
    expect(isModernPasswordHash(first)).toBe(true)
    expect(first.split('$')).toHaveLength(7)
  })

  it('verifies the correct password', async () => {
    const stored = await hashPassword('correct horse battery staple')

    await expect(
      verifyPassword('correct horse battery staple', stored),
    ).resolves.toBe(true)
  })

  it('rejects an incorrect password', async () => {
    const stored = await hashPassword('correct horse battery staple')

    await expect(verifyPassword('wrong password', stored)).resolves.toBe(false)
  })

  it('rejects malformed hashes safely', async () => {
    await expect(verifyPassword('anything', 'sha512$broken')).resolves.toBe(false)
    await expect(verifyPassword('anything', '')).resolves.toBe(false)
  })
})
