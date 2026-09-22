// tests/integration/actions/account.test.ts
import { describe, it, expect, beforeEach, afterAll } from "vitest"
import {
  clearDb, testDb, seedUser, setupCookieMock,
} from "../../test-utils"
import { updateProfile, changePassword, addAddress, deleteAddress, setDefaultAddress } from "@/app/_actions/account"
import { hashPassword, verifyPassword } from "@/lib/auth"

let userId: string
const SESSION_TOKEN = "a".repeat(64)

beforeEach(async () => {
  await clearDb()
  const user = await seedUser("account@example.com", "password123")
  userId = user.id

  // Create a real session so getCurrentUser() resolves
  await testDb.session.create({
    data: {
      userId,
      token:     SESSION_TOKEN,
      expiresAt: new Date(Date.now() + 86400000),
    },
  })
  setupCookieMock({ bb_session: SESSION_TOKEN })
})

afterAll(async () => {
  await clearDb()
  await testDb.$disconnect()
})

function formData(obj: Record<string, string | undefined>): FormData {
  const fd = new FormData()
  Object.entries(obj).forEach(([k, v]) => { if (v !== undefined) fd.append(k, v) })
  return fd
}

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────

describe("updateProfile", () => {
  it("updates first and last name", async () => {
    const errors = await updateProfile({}, formData({ firstName: "NewName", lastName: "NewSurname" }))
    expect(errors).toEqual({})
    const user = await testDb.user.findUnique({ where: { id: userId } })
    expect(user!.firstName).toBe("NewName")
    expect(user!.lastName).toBe("NewSurname")
  })

  it("returns errors for empty required fields", async () => {
    const errors = await updateProfile({}, formData({ firstName: "", lastName: "Smith" }))
    expect((errors as any).firstName).toBeDefined()
  })

  it("saves an optional phone number", async () => {
    await updateProfile({}, formData({ firstName: "Test", lastName: "User", phone: "0821234567" }))
    const user = await testDb.user.findUnique({ where: { id: userId } })
    expect(user!.phone).toBe("0821234567")
  })
})

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────

describe("changePassword", () => {
  it("updates the password hash when current password is correct", async () => {
    const errors = await changePassword({}, formData({
      current: "password123",
      next:    "newpassword456",
      confirm: "newpassword456",
    }))
    expect(errors).toEqual({})

    const user = await testDb.user.findUnique({ where: { id: userId } })
    expect(await verifyPassword("newpassword456", user!.passwordHash!)).toBe(true)
    expect(await verifyPassword("password123",   user!.passwordHash!)).toBe(false)
  })

  it("rejects an incorrect current password", async () => {
    const errors = await changePassword({}, formData({
      current: "wrongpassword",
      next:    "newpassword456",
      confirm: "newpassword456",
    }))
    expect((errors as any).current).toBeDefined()
    expect((errors as any).current[0]).toMatch(/incorrect/i)
  })

  it("rejects mismatched new passwords", async () => {
    const errors = await changePassword({}, formData({
      current: "password123",
      next:    "newpassword456",
      confirm: "different456",
    }))
    expect((errors as any).confirm).toBeDefined()
  })

  it("rejects a new password shorter than 8 characters", async () => {
    const errors = await changePassword({}, formData({
      current: "password123",
      next:    "short",
      confirm: "short",
    }))
    expect((errors as any).next).toBeDefined()
  })
})

// ─── ADDRESSES ────────────────────────────────────────────────────────────────

const VALID_ADDR = {
  firstName: "Thabo", lastName: "Nkosi",
  line1: "12 Main Road", city: "Cape Town",
  province: "EC", postalCode: "6001",
}

describe("addAddress", () => {
  it("creates an address linked to the current user", async () => {
    await addAddress({}, formData(VALID_ADDR)).catch(() => {})  // may redirect
    const addr = await testDb.address.findFirst({ where: { userId } })
    expect(addr).not.toBeNull()
    expect(addr!.city).toBe("Cape Town")
  })

  it("sets first address as default automatically", async () => {
    await addAddress({}, formData(VALID_ADDR)).catch(() => {})
    const addr = await testDb.address.findFirst({ where: { userId } })
    expect(addr!.isDefault).toBe(true)
  })

  it("returns validation errors for missing required fields", async () => {
    const errors = await addAddress({}, formData({ firstName: "Test" }))
    expect(Object.keys(errors).length).toBeGreaterThan(0)
  })
})

describe("deleteAddress", () => {
  it("removes the address", async () => {
    await addAddress({}, formData(VALID_ADDR)).catch(() => {})
    const addr = await testDb.address.findFirst({ where: { userId } })
    await deleteAddress(addr!.id)
    const after = await testDb.address.findUnique({ where: { id: addr!.id } })
    expect(after).toBeNull()
  })
})

describe("setDefaultAddress", () => {
  it("marks the selected address as default and clears others", async () => {
    // Create two addresses
    const a1 = await testDb.address.create({ data: { ...VALID_ADDR, userId, country: "ZA", isDefault: true } })
    const a2 = await testDb.address.create({ data: { ...VALID_ADDR, userId, country: "ZA", isDefault: false } })

    await setDefaultAddress(a2.id)

    const updated1 = await testDb.address.findUnique({ where: { id: a1.id } })
    const updated2 = await testDb.address.findUnique({ where: { id: a2.id } })
    expect(updated1!.isDefault).toBe(false)
    expect(updated2!.isDefault).toBe(true)
  })
})
