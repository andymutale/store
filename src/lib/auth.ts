import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import db from '@/lib/db'

export { hashPassword, verifyPassword, needsRehash } from '@/lib/password'

export const SESSION_COOKIE = 'bb_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30

type CurrentUser = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: string
}

export type { CurrentUser }

export async function createSession(userId: string): Promise<void> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)

  await db.session.deleteMany({
    where: { userId, expiresAt: { lt: new Date() } },
  }).catch(() => {})

  await db.session.create({
    data: { userId, token, expiresAt },
  })

  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    maxAge: SESSION_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}

export async function deleteSession(): Promise<void> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value

  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => {})
  }

  store.delete(SESSION_COOKIE)
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
        },
      },
    },
  })

  if (!session) return null

  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {})
    return null
  }

  return session.user
}

export async function requireUser(redirectTo = '/login'): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) redirect(redirectTo)
  return user
}

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}
