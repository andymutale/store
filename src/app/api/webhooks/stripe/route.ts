// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import db from "@/lib/db"
import { Resend } from "resend"
import { clearCartBySession } from "@/app/_actions/cart"
import OrderConfirmationEmail from "@/email/OrderConfirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const sig     = request.headers.get("stripe-signature")

  if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET as string)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "payment_intent.succeeded") {
    await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
  }
  if (event.type === "payment_intent.payment_failed") {
    await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { orderId, sessionId } = paymentIntent.metadata
  if (!orderId) return

  const order = await db.order.findUnique({
    where:   { id: orderId },
    include: {
      items:           true,
      shippingAddress: true,
      user:            { select: { email: true, firstName: true } },
    },
  })

  if (!order) return
  if (order.paymentStatus === "paid") return // idempotency guard

  // 1. Confirm order
  await db.order.update({
    where: { id: orderId },
    data:  { status: "confirmed", paymentStatus: "paid" },
  })

  // 2. Decrement variant stock
  for (const item of order.items) {
    await db.productVariant.update({
      where: { id: item.variantId },
      data:  { stock: { decrement: item.quantity } },
    })
  }

  // 3. Clear guest cart
  if (sessionId) await clearCartBySession(sessionId)

  // 4. Send confirmation email via Resend
  try {
    await resend.emails.send({
      from:    "Saint Laurens Sporting Goods <orders@example.com>",
      to:      order.user.email,
      subject: `Order confirmed — ${order.orderNumber}`,
      react:   OrderConfirmationEmail({
        orderNumber:    order.orderNumber,
        customerName:   order.user.firstName ?? order.user.email.split("@")[0],
        items:          order.items.map(i => ({
          productName:  i.productName,
          size:         i.size,
          color:        i.color,
          quantity:     i.quantity,
          totalInCents: i.totalInCents,
        })),
        subtotalInCents:  order.subtotalInCents,
        shippingInCents:  order.shippingInCents,
        totalInCents:     order.totalInCents,
        shippingMethod:   order.shippingMethod,
        shippingAddress:  order.shippingAddress
          ? {
              firstName:  order.shippingAddress.firstName,
              lastName:   order.shippingAddress.lastName,
              line1:      order.shippingAddress.line1,
              line2:      order.shippingAddress.line2,
              city:       order.shippingAddress.city,
              province:   order.shippingAddress.province,
              postalCode: order.shippingAddress.postalCode,
            }
          : null,
      }),
    })
  } catch (emailErr) {
    // Don't fail the webhook if email fails — order is already confirmed in DB
    console.error("Confirmation email failed:", emailErr)
  }

  console.log(`✅  Order ${order.orderNumber} confirmed`)
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { orderId } = paymentIntent.metadata
  if (!orderId) return

  await db.order.update({
    where: { id: orderId },
    data: {
      status:        "cancelled",
      paymentStatus: "unpaid",
      cancelledAt:   new Date(),
      adminNote:     `Stripe payment failed: ${paymentIntent.last_payment_error?.message ?? "unknown"}`,
    },
  })

  console.log(`❌  Payment failed for order ${orderId}`)
}
