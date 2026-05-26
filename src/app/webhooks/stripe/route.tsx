import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from "resend"
import db from "@/lib/db"
import PurchaseReceiptEmail from "@/email/PurchaseReceipt"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
const resend = new Resend(process.env.RESEND_API_KEY as string)

// ─────────────────────────────────────────────────────────────
// POST /webhooks/stripe
// Stripe calls this after every payment.
// We verify the signature, then on "charge.succeeded":
//  1. Upsert the user record
//  2. Create the order
//  3. Create a 24-hour download verification token
//  4. Send a receipt email with the download link
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch {
    return new NextResponse("Invalid signature", { status: 400 })
  }

  if (event.type === "charge.succeeded") {
    const charge         = event.data.object as Stripe.Charge
    const productId      = charge.metadata.productId
    const email          = charge.billing_details.email
    const pricePaidInCents = charge.amount

    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product || !email) return new NextResponse("Bad Request", { status: 400 })

    // Upsert user + create order in one query
    const userFields = {
      email,
      orders: { create: { productId, pricePaidInCents } },
    }
    const { orders: [order] } = await db.user.upsert({
      where:  { email },
      create: userFields,
      update: userFields,
      select: { orders: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, pricePaidInCents: true, createdAt: true } } },
    })

    // 24-hour download token
    const downloadVerification = await db.downloadVerification.create({
      data: { productId, orderId: order.id, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) },
    })

    // Receipt email
    await resend.emails.send({
      from:    `Support <${process.env.SENDER_EMAIL}>`,
      to:      email,
      subject: "Your Purchase — Brian Bands Sports",
      react:   (
        <PurchaseReceiptEmail
          order={order}
          product={product}
          downloadVerificationId={downloadVerification.id}
        />
      ),
    })
  }

  return new NextResponse(null, { status: 200 })
}
