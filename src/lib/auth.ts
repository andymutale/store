// src/lib/auth.ts
// ─── AUTH UTILITIES ───────────────────────────────────────────────────────────
// Salted SHA-512 for passwords, DB-backed sessions, httpOnly cookie transport.
// Call these from Server Actions and Server Components only.

import { cookies } from "next/headers"
import db from "@/lib/db"

export const SESSION_COOKIE = "bb_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type CurrentUser = {
  id:        string
  email:     string
  firstName: string | null
  lastName:  string | null
  phone:     string | null
  role:      string          // "customer" | "admin"
}

// ─── PASSWORD ─────────────────────────────────────────────────────────────────
// Stored format: "hexSalt:base64Hash"
// Each password gets a unique random salt so identical passwords hash differently.

export async function hashPassword(password: string): Promise<string> {
  const saltBytes = new Uint8Array(16)
  crypto.getRandomValues(saltBytes)
  const salt = Buffer.from(saltBytes).toString("hex") // 32 chars
  const hash = await sha512(salt + password)
  return `${salt}:${hash}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const colon = stored.indexOf(":")
  if (colon === -1) return false
  const salt = stored.slice(0, colon)
  const hash = stored.slice(colon + 1)
  return (await sha512(salt + password)) === hash
}

async function sha512(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(input))
  return Buffer.from(buf).toString("base64")
}

// ─── SESSION ──────────────────────────────────────────────────────────────────

// Create a new session + set the httpOnly session cookie.
// Call after successful login or register.
export async function createSession(userId: string): Promise<void> {
  const token     = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)

  // Prune expired sessions for this user (housekeeping, best-effort)
  await db.session.deleteMany({ where: { userId, expiresAt: { lt: new Date() } } }).catch(() => {})

  await db.session.create({ data: { userId, token, expiresAt } })

  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    maxAge:   SESSION_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure:   process.env.NODE_ENV === "production",
    path:     "/",
  })
}

// Delete the session from DB + clear the cookie. Call on logout.
export async function deleteSession(): Promise<void> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => {})
  }
  store.delete(SESSION_COOKIE)
}

// Validate the session cookie and return the user.
// Returns null when: no cookie, session expired, or user deleted.
// Safe to call from any Server Component or Action.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await db.session.findUnique({
    where:   { token },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true },
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

// Require a valid session — redirect to login if none.
// Use in account page layouts.
export async function requireUser(redirectTo = "/login"): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) {
    const { redirect } = await import("next/navigation")
    redirect(redirectTo)
  }
  return user
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function generateToken(): string {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return Array.from(arr, b => b.toString(16).padStart(2, "0")).join("") // 64 hex chars
}
