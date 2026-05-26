// test-utils/index.ts
import { vi } from "vitest"
import { PrismaClient } from "@prisma/client"
import { cookies } from "next/headers"

// ─── TEST DATABASE ─────────────────────────────────────────────────────────
// Points to prisma/test.db (set in vitest.setup.ts via DATABASE_URL).
// Run `npx prisma migrate deploy` once before the test suite.

export const testDb = new PrismaClient()

/** Wipe all tables in safe dependency order. Call in beforeEach for isolation. */
export async function clearDb() {
  await testDb.orderItem.deleteMany()
  await testDb.order.deleteMany()
  await testDb.cartItem.deleteMany()
  await testDb.wishlistItem.deleteMany()
  await testDb.review.deleteMany()
  await testDb.session.deleteMany()
  await testDb.address.deleteMany()
  await testDb.productVariant.deleteMany()
  await testDb.productImage.deleteMany()
  await testDb.product.deleteMany()
  await testDb.brand.deleteMany()
  await testDb.category.deleteMany()
  await testDb.coupon.deleteMany()
  await testDb.shippingRate.deleteMany()
  await testDb.shippingZone.deleteMany()
  await testDb.user.deleteMany()
}

// ─── COOKIE MOCK HELPERS ───────────────────────────────────────────────────

type MockCookieStore = {
  get:    ReturnType<typeof vi.fn>
  set:    ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

let _mockCookies: MockCookieStore

/** Call in beforeEach — returns the mock store so tests can inspect it. */
export function setupCookieMock(initial: Record<string, string> = {}): MockCookieStore {
  const store = new Map(Object.entries(initial))
  _mockCookies = {
    get:    vi.fn((name: string) => store.has(name) ? { value: store.get(name) } : undefined),
    set:    vi.fn((name: string, value: string) => store.set(name, value)),
    delete: vi.fn((name: string) => store.delete(name)),
  }
  vi.mocked(cookies).mockResolvedValue(_mockCookies as any)
  return _mockCookies
}

/** Read a cookie value that was set during a test. */
export function getCookieValue(name: string): string | undefined {
  const call = _mockCookies.set.mock.calls.findLast((c: any[]) => c[0] === name)
  return call?.[1]
}

// ─── REDIRECT ASSERTION ────────────────────────────────────────────────────

/** Assert a Server Action redirected to a given URL. */
export async function expectRedirect(action: () => Promise<unknown>, expectedUrl: string) {
  await expect(action()).rejects.toThrow(`NEXT_REDIRECT:${expectedUrl}`)
}

// ─── SEED HELPERS ─────────────────────────────────────────────────────────

/** Create a minimal category for tests. */
export async function seedCategory(overrides: Partial<Parameters<typeof testDb.category.create>[0]["data"]> = {}) {
  return testDb.category.create({
    data: { name: "Running", slug: "running-test", ...overrides },
  })
}

/** Create a minimal brand for tests. */
export async function seedBrand(overrides: Partial<Parameters<typeof testDb.brand.create>[0]["data"]> = {}) {
  return testDb.brand.create({
    data: { name: "Adidas", slug: "adidas-test", ...overrides },
  })
}

/** Create a minimal product + one variant for tests. */
export async function seedProduct({
  categoryId,
  brandId,
  priceInCents = 100000,
  stock = 10,
}: {
  categoryId: string
  brandId?: string
  priceInCents?: number
  stock?: number
}) {
  const product = await testDb.product.create({
    data: {
      name:        "Test Shoe",
      slug:        `test-shoe-${Date.now()}`,
      description: "A test product",
      priceInCents,
      categoryId,
      brandId,
    },
  })
  const variant = await testDb.productVariant.create({
    data: {
      productId: product.id,
      sku:       `SKU-TEST-${Date.now()}`,
      size:      "UK 9",
      stock,
    },
  })
  return { product, variant }
}

/** Create a user with a hashed password. */
export async function seedUser(
  email = process.env.SENDER_EMAIL ?? "test@example.com",
  password = "password123"
) {
  const { hashPassword } = await import("@/lib/auth")
  return testDb.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      firstName:    "Test",
      lastName:     "User",
    },
  })
}