import {
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(nodeScrypt)

const VERSION = 'v1'
const N = 32_768
const R = 8
const P = 1
const KEY_LENGTH = 64
const SALT_LENGTH = 16
const MAX_MEMORY = 64 * 1024 * 1024

/**
 * Password hashing for server-side authentication.
 *
 * Stored format:
 * scrypt$v1$N$r$p$saltHex$hashHex
 *
 * The parameters are stored with the hash so future cost increases can be
 * introduced without changing the database schema again.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  const salt = randomBytes(SALT_LENGTH)
  const derived = (await scrypt(password, salt, KEY_LENGTH, {
    N,
    r: R,
    p: P,
    maxmem: MAX_MEMORY,
  })) as Buffer

  return `scrypt$${VERSION}$${N}$${R}$${P}$${salt.toString('hex')}$${derived.toString('hex')}`
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const parts = storedHash.split('$')
  if (parts.length !== 7 || parts[0] !== 'scrypt' || parts[1] !== VERSION) {
    return false
  }

  const [, , nRaw, rRaw, pRaw, saltHex, hashHex] = parts
  const n = Number(nRaw)
  const r = Number(rRaw)
  const p = Number(pRaw)

  if (
    !Number.isSafeInteger(n) ||
    !Number.isSafeInteger(r) ||
    !Number.isSafeInteger(p) ||
    n < 2 ||
    (n & (n - 1)) !== 0 ||
    r < 1 ||
    p < 1 ||
    !/^[0-9a-f]{32}$/i.test(saltHex) ||
    !/^[0-9a-f]{128}$/i.test(hashHex)
  ) {
    return false
  }

  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(hashHex, 'hex')

  try {
    const derived = (await scrypt(password, salt, expected.length, {
      N: n,
      r,
      p,
      maxmem: MAX_MEMORY,
    })) as Buffer

    return derived.length === expected.length && timingSafeEqual(derived, expected)
  } catch {
    return false
  }
}

/**
 * Returns true when a stored password uses the new KDF format.
 * This is useful during a rolling migration from the legacy SHA-512 scheme.
 */
export function isModernPasswordHash(storedHash: string): boolean {
  return storedHash.startsWith(`scrypt$${VERSION}$`)
}
