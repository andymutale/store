// tests/integration/actions/cart.test.ts
import { describe, it, expect, beforeEach, afterAll } from "vitest"
import { cookies } from "next/headers"
import {
  clearDb, testDb, seedCategory, seedBrand, seedProduct,
  setupCookieMock, getCookieValue,
} from "../../test-utils"
import { addToCart, removeFromCart, updateCartQuantity } from "@/app/_actions/cart"

const SESSION = "test-session-id-1234567890123456789012345678901234"

beforeEach(async () => {
  await clearDb()
  setupCookieMock({ bb_cart_session: SESSION })
})

afterAll(async () => {
  await clearDb()
  await testDb.$disconnect()
})

async function setup() {
  const category = await seedCategory()
  const brand    = await seedBrand()
  return seedProduct({ categoryId: category.id, brandId: brand.id, stock: 10 })
}

// ─── ADD TO CART ─────────────────────────────────────────────────────────────

describe("addToCart", () => {
  it("creates a cart item for a new variant", async () => {
    const { variant } = await setup()
    const result = await addToCart(variant.id, 1)

    expect(result.count).toBe(1)
    const item = await testDb.cartItem.findFirst({ where: { sessionId: SESSION } })
    expect(item).not.toBeNull()
    expect(item!.variantId).toBe(variant.id)
    expect(item!.quantity).toBe(1)
  })

  it("increments quantity when the same variant is added again", async () => {
    const { variant } = await setup()
    await addToCart(variant.id, 1)
    await addToCart(variant.id, 2)

    const item = await testDb.cartItem.findFirst({ where: { sessionId: SESSION } })
    expect(item!.quantity).toBe(3)
  })

  it("returns the total cart item count", async () => {
    const { variant } = await setup()
    const r1 = await addToCart(variant.id, 3)
    expect(r1.count).toBe(3)
  })

  it("throws when quantity exceeds available stock", async () => {
    const { variant } = await setup()  // stock = 10
    await expect(addToCart(variant.id, 11)).rejects.toThrow(/stock/i)
  })

  it("throws when cumulative quantity exceeds stock", async () => {
    const { variant } = await setup()  // stock = 10
    await addToCart(variant.id, 8)
    await expect(addToCart(variant.id, 5)).rejects.toThrow(/stock/i)
  })

  it("throws for an inactive variant", async () => {
    const { variant } = await setup()
    await testDb.productVariant.update({ where: { id: variant.id }, data: { isActive: false } })
    await expect(addToCart(variant.id, 1)).rejects.toThrow(/available/i)
  })

  it("generates a new sessionId cookie when none exists", async () => {
    setupCookieMock({}) // no cookie
    const { variant } = await setup()
    await addToCart(variant.id, 1)
    const newSession = getCookieValue("bb_cart_session")
    expect(newSession).toBeDefined()
    expect(newSession!.length).toBeGreaterThan(10)
  })
})

// ─── REMOVE FROM CART ────────────────────────────────────────────────────────

describe("removeFromCart", () => {
  it("deletes the cart item", async () => {
    const { variant } = await setup()
    await addToCart(variant.id, 2)

    const item = await testDb.cartItem.findFirst({ where: { sessionId: SESSION } })
    await removeFromCart(item!.id)

    const after = await testDb.cartItem.findFirst({ where: { sessionId: SESSION } })
    expect(after).toBeNull()
  })

  it("does not remove an item belonging to a different session", async () => {
    const { variant } = await setup()
    // Create an item for a different session
    await testDb.cartItem.create({
      data: { sessionId: "other-session", productId: variant.id, variantId: variant.id, quantity: 1 },
    })
    const item = await testDb.cartItem.findFirst({ where: { sessionId: "other-session" } })

    // Try to remove it from our session — should be a no-op
    await removeFromCart(item!.id)

    const still = await testDb.cartItem.findUnique({ where: { id: item!.id } })
    expect(still).not.toBeNull()
  })
})

// ─── UPDATE CART QUANTITY ────────────────────────────────────────────────────

describe("updateCartQuantity", () => {
  it("updates the quantity", async () => {
    const { variant } = await setup()
    await addToCart(variant.id, 1)
    const item = await testDb.cartItem.findFirst({ where: { sessionId: SESSION } })

    await updateCartQuantity(item!.id, 4)

    const updated = await testDb.cartItem.findUnique({ where: { id: item!.id } })
    expect(updated!.quantity).toBe(4)
  })

  it("removes the item when quantity is set to 0", async () => {
    const { variant } = await setup()
    await addToCart(variant.id, 3)
    const item = await testDb.cartItem.findFirst({ where: { sessionId: SESSION } })

    await updateCartQuantity(item!.id, 0)

    const after = await testDb.cartItem.findUnique({ where: { id: item!.id } })
    expect(after).toBeNull()
  })

  it("caps quantity at available stock", async () => {
    const { variant } = await setup()  // stock = 10
    await addToCart(variant.id, 1)
    const item = await testDb.cartItem.findFirst({ where: { sessionId: SESSION } })

    await updateCartQuantity(item!.id, 999)

    const updated = await testDb.cartItem.findUnique({ where: { id: item!.id } })
    expect(updated!.quantity).toBeLessThanOrEqual(10)
  })
})
