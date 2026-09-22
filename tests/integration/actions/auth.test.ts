// tests/integration/actions/auth.test.ts
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest"
import { cookies } from "next/headers"
import {
  clearDb, testDb, seedUser, setupCookieMock, getCookieValue, expectRedirect,
} from "../../test-utils"

// Import actions under test — must come after mocks in vitest.setup.ts
import { register, login, logout } from "@/app/_actions/auth"

beforeEach(async () => {
  await clearDb()
  setupCookieMock()
})

afterAll(async () => {
  await clearDb()
  await testDb.$disconnect()
})

// ─── REGISTER ────────────────────────────────────────────────────────────────

describe("register", () => {
  it("creates a new user and redirects to /account", async () => {
    const fd = formData({
      firstName: "Thabo", lastName: "Nkosi",
      email: "thabo@example.com", password: "password123", confirm: "password123",
    })
    await expectRedirect(() => register({}, fd), "/account")

    const user = await testDb.user.findUnique({ where: { email: "thabo@example.com" } })
    expect(user).not.toBeNull()
    expect(user!.firstName).toBe("Thabo")
    expect(user!.passwordHash).not.toBe("password123") // must be hashed
  })

  it("creates a session cookie on success", async () => {
    const fd = formData({
      firstName: "Thabo", lastName: "Nkosi",
      email: "thabo2@example.com", password: "password123", confirm: "password123",
    })
    await expectRedirect(() => register({}, fd), "/account")

    const token = getCookieValue("bb_session")
    expect(token).toBeDefined()
    expect(token!.length).toBe(64)
  })

  it("rejects mismatched passwords", async () => {
    const fd = formData({
      firstName: "Test", lastName: "User",
      email: "test@example.com", password: "password123", confirm: "different",
    })
    const errors = await register({}, fd) as Record<string, string[]>
    expect(errors.confirm).toBeDefined()
    expect(errors.confirm![0]).toMatch(/match/i)
  })

  it("rejects a password shorter than 8 characters", async () => {
    const fd = formData({
      firstName: "Test", lastName: "User",
      email: "test@example.com", password: "short", confirm: "short",
    })
    const errors = await register({}, fd) as Record<string, string[]>
    expect(errors.password).toBeDefined()
  })

  it("rejects a duplicate email that already has a password", async () => {
    await seedUser("existing@example.com", "oldpassword")
    const fd = formData({
      firstName: "New", lastName: "User",
      email: "existing@example.com", password: "newpassword", confirm: "newpassword",
    })
    const errors = await register({}, fd) as Record<string, string[]>
    expect(errors.email![0]).toMatch(/already exists/i)
  })

  it("upgrades a guest user (no passwordHash) to a full account", async () => {
    // Guest user created at checkout — has email but no password
    await testDb.user.create({ data: { email: "guest@example.com" } })

    const fd = formData({
      firstName: "Guest", lastName: "Upgraded",
      email: "guest@example.com", password: "newpassword", confirm: "newpassword",
    })
    await expectRedirect(() => register({}, fd), "/account")

    const user = await testDb.user.findUnique({ where: { email: "guest@example.com" } })
    expect(user!.passwordHash).not.toBeNull()
    expect(user!.firstName).toBe("Guest")
    // Should not create a duplicate
    const count = await testDb.user.count({ where: { email: "guest@example.com" } })
    expect(count).toBe(1)
  })
})

// ─── LOGIN ────────────────────────────────────────────────────────────────────

describe("login", () => {
  it("succeeds with correct credentials and redirects to /account", async () => {
    await seedUser("login@example.com", "mypassword")
    const fd = formData({ email: "login@example.com", password: "mypassword" })
    await expectRedirect(() => login({}, fd), "/account")
  })

  it("sets a session cookie on success", async () => {
    await seedUser("cookie@example.com", "mypassword")
    const fd = formData({ email: "cookie@example.com", password: "mypassword" })
    await expectRedirect(() => login({}, fd), "/account")
    expect(getCookieValue("bb_session")).toHaveLength(64)
  })

  it("respects the ?redirect param", async () => {
    await seedUser("redir@example.com", "mypassword")
    const fd = formData({ email: "redir@example.com", password: "mypassword", redirect: "/account/orders" })
    await expectRedirect(() => login({}, fd), "/account/orders")
  })

  it("returns the same error for wrong password and unknown email", async () => {
    await seedUser("real@example.com", "realpassword")

    const wrongPw = await login({}, formData({ email: "real@example.com", password: "wrongpassword" }))
    const noUser  = await login({}, formData({ email: "nobody@example.com", password: "anything" }))

    // Same error message — prevents email enumeration
    expect((wrongPw as any)._form[0]).toBe((noUser as any)._form[0])
  })

  it("rejects an invalid email format", async () => {
    const errors = await login({}, formData({ email: "notanemail", password: "password" }))
    expect((errors as any).email).toBeDefined()
  })
})

// ─── LOGOUT ──────────────────────────────────────────────────────────────────

describe("logout", () => {
  it("deletes the session from the database", async () => {
    const user = await seedUser("logout@example.com", "password")
    // Create a session manually
    const token = "a".repeat(64)
    await testDb.session.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 86400000) },
    })
    setupCookieMock({ bb_session: token })

    await expectRedirect(() => logout(), "/")

    const session = await testDb.session.findUnique({ where: { token } })
    expect(session).toBeNull()
  })
})

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formData(obj: Record<string, string>): FormData {
  const fd = new FormData()
  Object.entries(obj).forEach(([k, v]) => fd.append(k, v))
  return fd
}
