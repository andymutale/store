// tests/unit/lib/cart.test.ts
import { describe, it, expect } from "vitest"
import { calcSubtotal, resolveUnitPrice } from "@/lib/cart"
import type { CartLineItem } from "@/lib/cart"

// Minimal CartLineItem shape for testing pure functions
function makeLine(
  productPrice: number,
  variantPrice: number | null,
  quantity: number
): CartLineItem {
  return {
    id:        "item-1",
    quantity,
    sessionId: "sess-1",
    userId:    null,
    productId: "prod-1",
    variantId: "var-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    product: {
      id:           "prod-1",
      name:         "Test Shoe",
      slug:         "test-shoe",
      priceInCents: productPrice,
      brand:        null,
      images:       [],
    },
    variant: {
      id:           "var-1",
      sku:          "SKU-001",
      size:         "UK 9",
      color:        null,
      stock:        10,
      priceInCents: variantPrice,
    },
  } as unknown as CartLineItem
}

describe("resolveUnitPrice", () => {
  it("uses variant price when set", () => {
    const line = makeLine(100000, 90000, 1)
    expect(resolveUnitPrice(line)).toBe(90000)
  })

  it("falls back to product price when variant price is null", () => {
    const line = makeLine(100000, null, 1)
    expect(resolveUnitPrice(line)).toBe(100000)
  })
})

describe("calcSubtotal", () => {
  it("sums line totals correctly", () => {
    const lines = [
      makeLine(100000, null,   2),  // 2 × R1,000 = R2,000
      makeLine(264000, null,   1),  // 1 × R2,640 = R2,640
    ]
    expect(calcSubtotal(lines)).toBe(464000)
  })

  it("uses variant price override in subtotal", () => {
    const lines = [makeLine(264000, 200000, 3)]  // 3 × R2,000 = R6,000
    expect(calcSubtotal(lines)).toBe(600000)
  })

  it("returns 0 for an empty cart", () => {
    expect(calcSubtotal([])).toBe(0)
  })

  it("handles a single item", () => {
    const lines = [makeLine(50000, null, 1)]
    expect(calcSubtotal(lines)).toBe(50000)
  })
})
