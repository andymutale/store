"use server"
// src/app/_actions/cart.ts

import db from "@/lib/db"
import { getOrCreateCartSessionId, readCartSessionId } from "@/lib/cart"
import { revalidatePath } from "next/cache"

// ─── ADD TO CART ──────────────────────────────────────────────────────────────
// Called from the PDP AddToCartButton. Returns the new total item count.
export async function addToCart(variantId: string, quantity = 1): Promise<{ count: number }> {
  const sessionId = await getOrCreateCartSessionId()

  const variant = await db.productVariant.findUnique({
    where:  { id: variantId },
    select: { productId: true, stock: true, isActive: true },
  })

  if (!variant?.isActive) throw new Error("This size is no longer available.")

  // Check existing cart quantity + new quantity against stock
  const existing = await db.cartItem.findUnique({
    where: { sessionId_variantId: { sessionId, variantId } },
  })

  const newQty = (existing?.quantity ?? 0) + quantity
  if (newQty > variant.stock) throw new Error("Not enough stock available.")

  if (existing) {
    await db.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } })
  } else {
    await db.cartItem.create({
      data: { sessionId, productId: variant.productId, variantId, quantity },
    })
  }

  revalidatePath("/cart")

  // Return updated count so the button can show live feedback
  const agg = await db.cartItem.aggregate({ where: { sessionId }, _sum: { quantity: true } })
  return { count: agg._sum.quantity ?? 0 }
}

// ─── REMOVE FROM CART ─────────────────────────────────────────────────────────
export async function removeFromCart(cartItemId: string) {
  const sessionId = await readCartSessionId()
  if (!sessionId) return
  // Guard: only delete if the item belongs to this session
  await db.cartItem.deleteMany({ where: { id: cartItemId, sessionId } })
  revalidatePath("/cart")
}

// ─── UPDATE QUANTITY ──────────────────────────────────────────────────────────
export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const sessionId = await readCartSessionId()
  if (!sessionId) return

  if (quantity <= 0) {
    await db.cartItem.deleteMany({ where: { id: cartItemId, sessionId } })
  } else {
    // Re-validate stock before updating
    const item = await db.cartItem.findUnique({
      where:   { id: cartItemId },
      include: { variant: { select: { stock: true } } },
    })
    if (!item) return
    if (quantity > item.variant.stock) quantity = item.variant.stock

    await db.cartItem.update({ where: { id: cartItemId }, data: { quantity } })
  }
  revalidatePath("/cart")
}

// ─── CLEAR CART ───────────────────────────────────────────────────────────────
// Called by the webhook after a successful payment.
export async function clearCartBySession(sessionId: string) {
  await db.cartItem.deleteMany({ where: { sessionId } })
}
