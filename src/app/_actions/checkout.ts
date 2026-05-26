"use server"
// src/app/_actions/checkout.ts

import db from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { getOrCreateCartSessionId, getCartItems, calcSubtotal, resolveUnitPrice } from "@/lib/cart"
import { z } from "zod"

// ─── VALIDATION ───────────────────────────────────────────────────────────────

const addressSchema = z.object({
  firstName:    z.string().min(1, "First name required"),
  lastName:     z.string().min(1, "Last name required"),
  email:        z.string().email("Valid email required"),
  phone:        z.string().min(10, "Phone number required"),
  line1:        z.string().min(1, "Street address required"),
  line2:        z.string().optional(),
  city:         z.string().min(1, "City required"),
  province:     z.string().min(2, "Province required"),
  postalCode:   z.string().min(4, "Postal code required"),
  shippingRateId: z.string().min(1, "Select a shipping method"),
  customerNote: z.string().optional(),
})

// ─── RESULT TYPE ──────────────────────────────────────────────────────────────

export type CreateOrderResult =
  | { ok: true;  clientSecret: string; orderNumber: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
// 1. Validate address fields
// 2. Fetch cart + verify stock
// 3. Look up shipping rate
// 4. Build Order + OrderItems in DB (status: pending)
// 5. Create Stripe PaymentIntent (ZAR)
// 6. Return clientSecret to the client for Stripe Elements

export async function createOrder(formData: FormData): Promise<CreateOrderResult> {
  // 1. Parse + validate
  const raw = Object.fromEntries(formData.entries())
  const parsed = addressSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: "Please fix the errors below.", fieldErrors: parsed.error.formErrors.fieldErrors }
  }
  const data = parsed.data

  // 2. Cart
  const sessionId = await getOrCreateCartSessionId()
  const items = await getCartItems(sessionId)

  if (items.length === 0) {
    return { ok: false, error: "Your cart is empty." }
  }

  // Stock validation — catch issues between cart add and checkout
  for (const item of items) {
    if (item.variant.stock < item.quantity) {
      return {
        ok: false,
        error: `"${item.product.name} (${item.variant.size ?? ""})" only has ${item.variant.stock} units in stock. Please update your cart.`,
      }
    }
  }

  // 3. Shipping rate
  const shippingRate = await db.shippingRate.findUnique({
    where:   { id: data.shippingRateId },
    include: { zone: { select: { name: true } } },
  })
  if (!shippingRate) return { ok: false, error: "Invalid shipping selection." }

  // 4. Pricing
  const subtotalInCents  = calcSubtotal(items)
  const shippingInCents  = shippingRate.freeThreshold && subtotalInCents >= shippingRate.freeThreshold
    ? 0
    : shippingRate.priceInCents
  const totalInCents     = subtotalInCents + shippingInCents

  // 5. Order number
  const year  = new Date().getFullYear()
  const count = await db.order.count({ where: { orderNumber: { startsWith: `BB-${year}-` } } })
  const orderNumber = `BB-${year}-${String(count + 1).padStart(5, "0")}`

  // 6. Resolve user
  // We create a placeholder User record keyed on email (guest checkout).
  // When full auth is added, this merges with the real User on login.
  let user = await db.user.findUnique({ where: { email: data.email } })
  if (!user) {
    user = await db.user.create({
      data: {
        email:     data.email,
        firstName: data.firstName,
        lastName:  data.lastName,
        phone:     data.phone,
        role:      "customer",
      },
    })
  }

  // 7. Create shipping address row first so we can pass shippingAddressId
  //    to the order as a raw FK (required when userId is also a raw FK).
  const shippingAddress = await db.address.create({
    data: {
      userId:     user.id,
      firstName:  data.firstName,
      lastName:   data.lastName,
      line1:      data.line1,
      line2:      data.line2 || null,
      city:       data.city,
      province:   data.province,
      postalCode: data.postalCode,
      country:    "ZA",
      phone:      data.phone,
    },
  })

  // 8. Create Order in DB
  const order = await db.order.create({
    data: {
      orderNumber,
      userId:            user.id,
      subtotalInCents,
      shippingInCents,
      discountInCents:   0,
      totalInCents,
      status:            "pending",
      paymentStatus:     "unpaid",
      paymentMethod:     "stripe_card",
      shippingMethod:    `${shippingRate.zone.name} — ${shippingRate.name}`,
      customerNote:      data.customerNote || null,
      shippingAddressId: shippingAddress.id,

      // Line items with price snapshots
      items: {
        create: items.map(item => ({
          productId:        item.product.id,
          variantId:        item.variant.id,
          productName:      item.product.name,
          variantSku:       item.variant.sku,
          size:             item.variant.size,
          color:            item.variant.color,
          quantity:         item.quantity,
          unitPriceInCents: resolveUnitPrice(item),
          totalInCents:     resolveUnitPrice(item) * item.quantity,
        })),
      },
    },
  })

  // 9. Stripe PaymentIntent (ZAR)
  const paymentIntent = await stripe.paymentIntents.create({
    amount:   totalInCents,
    currency: "zar",
    metadata: {
      orderId:       order.id,
      orderNumber,
      sessionId,            // used by webhook to clear the cart
      customerEmail: data.email,
    },
    receipt_email: data.email,
    description:   `Brian Bands order ${orderNumber}`,
  })

  if (!paymentIntent.client_secret) {
    // Roll back the order and address if Stripe failed
    await db.order.delete({ where: { id: order.id } })
    await db.address.delete({ where: { id: shippingAddress.id } })
    return { ok: false, error: "Payment gateway error. Please try again." }
  }

  // Store the Stripe PaymentIntent ID on the order
  await db.order.update({
    where: { id: order.id },
    data:  { stripePaymentIntentId: paymentIntent.id },
  })

  return { ok: true, clientSecret: paymentIntent.client_secret, orderNumber }
}