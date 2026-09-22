// tests/unit/lib/auth.test.ts
import { describe, it, expect } from "vitest"
import { hashPassword, verifyPassword } from "@/lib/auth"

describe("hashPassword / verifyPassword", () => {
  it("hashes a password and verifies it correctly", async () => {
    const hash = await hashPassword("mysecretpassword")
    expect(hash).toContain(":")           // format: salt:hash
    const valid = await verifyPassword("mysecretpassword", hash)
    expect(valid).toBe(true)
  })

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("correctpassword")
    const valid = await verifyPassword("wrongpassword", hash)
    expect(valid).toBe(false)
  })

  it("produces a different hash each time (unique salts)", async () => {
    const hash1 = await hashPassword("samepassword")
    const hash2 = await hashPassword("samepassword")
    expect(hash1).not.toBe(hash2)
    // But both should verify correctly
    expect(await verifyPassword("samepassword", hash1)).toBe(true)
    expect(await verifyPassword("samepassword", hash2)).toBe(true)
  })

  it("returns false for a malformed stored hash", async () => {
    const valid = await verifyPassword("anypassword", "notahash")
    expect(valid).toBe(false)
  })

  it("returns false for an empty password against a real hash", async () => {
    const hash = await hashPassword("realpassword")
    const valid = await verifyPassword("", hash)
    expect(valid).toBe(false)
  })

  it("handles long passwords", async () => {
    const long = "a".repeat(512)
    const hash = await hashPassword(long)
    expect(await verifyPassword(long, hash)).toBe(true)
    expect(await verifyPassword(long.slice(0, -1), hash)).toBe(false)
  })
})
