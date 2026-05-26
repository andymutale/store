// src/lib/cart.ts
// ─── CART SESSION HELPERS ─────────────────────────────────────────────────────
// The cart is stored in the DB (CartItem table) keyed on a random sessionId
// held in an httpOnly cookie. This works for guest users. When customer auth
// is added later, cart migration is: reassign all CartItems from sessionId
// to userId on login.
//
// These helpers are safe to call from Server Components, Server Actions,
// and Route Handlers — they use next/headers internally.

import { cookies } from "next/headers"
import db from "@/lib/db"

const COOKIE_NAME    = "bb_cart_session"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

// ── Get (or create) the cart sessionId from the cookie ───────────────────────
// Call this from Server Actions only — cookies().set() is not allowed in
// Server Components or middleware.
export async function getOrCreateCartSessionId(): Promise<string> {
  const store   = await cookies()
  const existing = store.get(COOKIE_NAME)?.value
  if (existing) return existing

  const newId = crypto.randomUUID()
  store.set(COOKIE_NAME, newId, {
    maxAge:   COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure:   process.env.NODE_ENV === "production",
    path:     "/",
  })
  return newId
}

// ── Read the sessionId without creating one ────────────────────────────────
// Safe to call from Server Components (read-only).
export async function readCartSessionId(): Promise<string | null> {
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value ?? null
}

// ── Fetch all cart items for a sessionId ──────────────────────────────────
export type CartLineItem = Awaited<ReturnType<typeof getCartItems>>[number]

export async function getCartItems(sessionId: string) {
  return db.cartItem.findMany({
    where: { sessionId },
    include: {
      product: {
        select: {
          id:          true,
          name:        true,
          slug:        true,
          priceInCents: true,
          brand:       { select: { name: true } },
          images:      { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
        },
      },
      variant: {
        select: {
          id:           true,
          sku:          true,
          size:         true,
          color:        true,
          stock:        true,
          priceInCents: true, // null → use product.priceInCents
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })
}

// ── Total number of items in the cart (sum of quantities) ─────────────────
export async function getCartCount(sessionId: string): Promise<number> {
  const agg = await db.cartItem.aggregate({
    where: { sessionId },
    _sum: { quantity: true },
  })
  return agg._sum.quantity ?? 0
}

// ── Resolve the effective unit price for a cart line ──────────────────────
// Variant price overrides product price when set.
export function resolveUnitPrice(item: CartLineItem): number {
  return item.variant.priceInCents ?? item.product.priceInCents
}

// ── Calculate cart subtotal ───────────────────────────────────────────────
export function calcSubtotal(items: CartLineItem[]): number {
  return items.reduce((sum, item) => sum + resolveUnitPrice(item) * item.quantity, 0)
}
