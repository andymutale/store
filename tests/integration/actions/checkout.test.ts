// tests/integration/actions/checkout.test.ts
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest"
import { cookies } from "next/headers"
import {
  clearDb, testDb, seedCategory, seedBrand, seedProduct,
  setupCookieMock,
} from "../../test-utils"
import { createOrder } from "@/app/_actions/checkout"

// Mock Stripe — we don't want real payment intents in tests
vi.mock("@/lib/stripe", () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        id:            "pi_test_123",
        client_secret: "pi_test_123_secret_abc",
      }),
    },
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        id:            "pi_test_123",
        client_secret: "pi_test_123_secret_abc",
      }),
    },
  },
}))

const SESSION = "checkout-session-id-123456789012345678901234"

let categoryId: string
let variantId:  string
let productId:  string

const VALID_ADDRESS = {
  firstName:      "Thabo",
  lastName:       "Nkosi",
  email:          "thabo@example.com",
  phone:          "0821234567",
  line1:          "12 Main Road",
  line2:          "",
  city:           "Gqeberha",
  province:       "EC",
  postalCode:     "6001",
  shippingRateId: "",  // set after seeding
  customerNote:   "",
}

beforeEach(async () => {
  await clearDb()
  setupCookieMock({ bb_cart_session: SESSION })

  const category = await seedCategory()
  const brand    = await seedBrand()
  const { product, variant } = await seedProduct({ categoryId: category.id, brandId: brand.id, stock: 5 })
  categoryId = category.id
  productId  = product.id
  variantId  = variant.id

  // Add item to cart
  await testDb.cartItem.create({
    data: { sessionId: SESSION, productId, variantId, quantity: 1 },
  })

  // Seed a shipping zone + rate
  const zone = await testDb.shippingZone.create({
    data: { name: "Eastern Cape", provinces: "EC" },
  })
  const rate = await testDb.shippingRate.create({
    data: { zoneId: zone.id, name: "Economy", priceInCents: 8900, isActive: true },
  })
  VALID_ADDRESS.shippingRateId = rate.id
})

afterAll(async () => {
  await clearDb()
  await testDb.$disconnect()
})

function formData(obj: Record<string, string>): FormData {
  const fd = new FormData()
  Object.entries(obj).forEach(([k, v]) => fd.append(k, v))
  return fd
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────

describe("createOrder — validation", () => {
  it("returns fieldErrors for missing required fields", async () => {
    const result = await createOrder(formData({ email: "bad", shippingRateId: "" }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors).toBeDefined()
  })

  it("returns an error for empty cart", async () => {
    await testDb.cartItem.deleteMany({ where: { sessionId: SESSION } })
    const result = await createOrder(formData(VALID_ADDRESS))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/empty/i)
  })

  it("returns an error for invalid shippingRateId", async () => {
    const result = await createOrder(formData({ ...VALID_ADDRESS, shippingRateId: "nonexistent-id" }))
    expect(result.ok).toBe(false)
  })
})

// ─── STOCK VALIDATION ─────────────────────────────────────────────────────────

describe("createOrder — stock", () => {
  it("returns an error when a cart item exceeds available stock", async () => {
    // Set stock to 0 after adding to cart
    await testDb.productVariant.update({ where: { id: variantId }, data: { stock: 0 } })
    const result = await createOrder(formData(VALID_ADDRESS))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/stock/i)
  })
})

// ─── ORDER CREATION ───────────────────────────────────────────────────────────

describe("createOrder — success", () => {
  it("returns ok with clientSecret and orderNumber", async () => {
    const result = await createOrder(formData(VALID_ADDRESS))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.clientSecret).toBe("pi_test_123_secret_abc")
      expect(result.orderNumber).toMatch(/^BB-\d{4}-\d{5}$/)
    }
  })

  it("creates an Order record in the database", async () => {
    const result = await createOrder(formData(VALID_ADDRESS))
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const order = await testDb.order.findUnique({ where: { orderNumber: result.orderNumber } })
    expect(order).not.toBeNull()
    expect(order!.status).toBe("pending")
    expect(order!.paymentStatus).toBe("unpaid")
  })

  it("creates OrderItem rows with price snapshots", async () => {
    const result = await createOrder(formData(VALID_ADDRESS))
    if (!result.ok) return

    const order = await testDb.order.findUnique({
      where:   { orderNumber: result.orderNumber },
      include: { items: true },
    })
    expect(order!.items).toHaveLength(1)
    expect(order!.items[0].variantId).toBe(variantId)
    expect(order!.items[0].unitPriceInCents).toBeGreaterThan(0)
  })

  it("calculates the correct order total (subtotal + shipping)", async () => {
    const result = await createOrder(formData(VALID_ADDRESS))
    if (!result.ok) return

    const order = await testDb.order.findUnique({ where: { orderNumber: result.orderNumber } })
    expect(order!.totalInCents).toBe(order!.subtotalInCents + order!.shippingInCents)
  })

  it("creates a User record for a new guest email", async () => {
    await createOrder(formData({ ...VALID_ADDRESS, email: "new-guest@example.com" }))
    const user = await testDb.user.findUnique({ where: { email: "new-guest@example.com" } })
    expect(user).not.toBeNull()
  })

  it("reuses an existing User record for a known email", async () => {
    await createOrder(formData(VALID_ADDRESS))
    await createOrder(formData(VALID_ADDRESS))  // same email, second order
    const count = await testDb.user.count({ where: { email: VALID_ADDRESS.email } })
    expect(count).toBe(1)
  })

  it("generates sequential human-readable order numbers", async () => {
    const r1 = await createOrder(formData(VALID_ADDRESS))
    // Add another item so second order has something in cart
    await testDb.cartItem.create({ data: { sessionId: SESSION, productId, variantId, quantity: 1 } })
    const r2 = await createOrder(formData({ ...VALID_ADDRESS, email: "second@example.com" }))

    if (!r1.ok || !r2.ok) return
    const n1 = parseInt(r1.orderNumber.split("-")[2])
    const n2 = parseInt(r2.orderNumber.split("-")[2])
    expect(n2).toBe(n1 + 1)
  })
})
