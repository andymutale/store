const PASSWORD_VERSION = 'v1'
const DIGEST = 'SHA-256'
const ITERATIONS = 310_000
const KEY_LENGTH_BITS = 256
const SALT_LENGTH = 16

const encoder = new TextEncoder()

function hexToBytes(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length / 2)
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

function bytesToBase64(bytes: Uint8Array): string {
  let value = ''
  for (const byte of bytes) value += String.fromCharCode(byte)
  return btoa(value)
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false

  let difference = 0
  for (let i = 0; i < a.length; i += 1) {
    difference |= a[i] ^ b[i]
  }
  return difference === 0
}

async function deriveKey(password: string, salt: Uint8Array, iterations = ITERATIONS) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  return new Uint8Array(
    await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: DIGEST,
      },
      key,
      KEY_LENGTH_BITS,
    ),
  )
}

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  const salt = new Uint8Array(SALT_LENGTH)
  crypto.getRandomValues(salt)
  const derived = await deriveKey(password, salt)

  return `pbkdf2$${PASSWORD_VERSION}$${ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(derived)}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith('pbkdf2$')) {
    return verifyPbkdf2(password, storedHash)
  }

  return verifyLegacySha512(password, storedHash)
}

export function needsRehash(storedHash: string): boolean {
  if (!storedHash.startsWith(`pbkdf2$${PASSWORD_VERSION}$`)) return true

  const [, , iterationsRaw] = storedHash.split('$')
  return Number(iterationsRaw) !== ITERATIONS
}

async function verifyPbkdf2(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split('$')
  if (parts.length !== 5 || parts[0] !== 'pbkdf2' || parts[1] !== PASSWORD_VERSION) {
    return false
  }

  const iterations = Number(parts[2])
  const saltHex = parts[3]
  const hashHex = parts[4]

  if (
    !Number.isSafeInteger(iterations) ||
    iterations < 100_000 ||
    !/^[0-9a-f]{32}$/i.test(saltHex) ||
    !/^[0-9a-f]{64}$/i.test(hashHex)
  ) {
    return false
  }

  try {
    const derived = await deriveKey(password, hexToBytes(saltHex), iterations)
    return constantTimeEqual(derived, hexToBytes(hashHex))
  } catch {
    return false
  }
}

async function verifyLegacySha512(password: string, storedHash: string): Promise<boolean> {
  const colon = storedHash.indexOf(':')
  const input = colon >= 0
    ? `${storedHash.slice(0, colon)}${password}`
    : password

  if (!/^[A-Za-z0-9+/=]+$/.test(storedHash.slice(colon + 1))) return false

  const digest = await crypto.subtle.digest('SHA-512', encoder.encode(input))
  const encoded = bytesToBase64(new Uint8Array(digest))

  if (colon >= 0) {
    return encoded === storedHash.slice(colon + 1)
  }

  return encoded === storedHash
}

export function isModernPasswordHash(storedHash: string): boolean {
  return storedHash.startsWith(`pbkdf2$${PASSWORD_VERSION}$`)
}
