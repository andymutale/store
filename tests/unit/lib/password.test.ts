import { describe, expect, it } from 'vitest'
import {
  hashPassword,
  isModernPasswordHash,
  needsRehash,
  verifyPassword,
} from '@/lib/password'

describe('password hashing', () => {
  it('creates a salted PBKDF2 hash', async () => {
    const first = await hashPassword('correct horse battery staple')
    const second = await hashPassword('correct horse battery staple')

    expect(first).not.toBe(second)
    expect(isModernPasswordHash(first)).toBe(true)
    expect(needsRehash(first)).toBe(false)
    expect(first.split('$')).toHaveLength(5)
  })

  it('verifies the correct password', async () => {
    const stored = await hashPassword('correct horse battery staple')
    await expect(verifyPassword('correct horse battery staple', stored)).resolves.toBe(true)
  })

  it('rejects an incorrect password', async () => {
    const stored = await hashPassword('correct horse battery staple')
    await expect(verifyPassword('wrong password', stored)).resolves.toBe(false)
  })

  it('accepts the legacy salted SHA-512 format', async () => {
    const salt = '00112233445566778899aabbccddeeff'
    const bytes = await crypto.subtle.digest(
      'SHA-512',
      new TextEncoder().encode(`${salt}legacy-password`),
    )
    const hash = `${salt}:${Buffer.from(bytes).toString('base64')}`

    await expect(verifyPassword('legacy-password', hash)).resolves.toBe(true)
    expect(needsRehash(hash)).toBe(true)
  })

  it('accepts the legacy unsalted SHA-512 format', async () => {
    const bytes = await crypto.subtle.digest('SHA-512', new TextEncoder().encode('legacy-password'))
    const hash = Buffer.from(bytes).toString('base64')

    await expect(verifyPassword('legacy-password', hash)).resolves.toBe(true)
    expect(needsRehash(hash)).toBe(true)
  })

  it('rejects malformed hashes safely', async () => {
    await expect(verifyPassword('anything', 'pbkdf2$broken')).resolves.toBe(false)
    await expect(verifyPassword('anything', '')).resolves.toBe(false)
  })
})
