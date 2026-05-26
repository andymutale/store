import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from "resend"
import db from "@/lib/db"

export async function POST(req: NextRequest) {
  // 1. Initialize inside the handler (Lazy Initialization)
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const resendKey = process.env.RESEND_API_KEY
  
  if (!stripeKey || !resendKey) {
    return new NextResponse("Missing environment variables", { status: 500 })
  }

  const stripe = new Stripe(stripeKey)
  const resend = new Resend(resendKey)

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (err) {
    return new NextResponse("Invalid signature", { status: 400 })
  }

  if (event.type === "charge.succeeded") {
    const charge = event.data.object as Stripe.Charge
    const productId = charge.metadata.productId
    const email = charge.billing_details.email
    const pricePaidInCents = charge.amount

    if (!productId || !email) return new NextResponse("Bad Request", { status: 400 })

    const product = await db.product.findUnique({ 
      where: { id: productId },
      include: { variants: { take: 1 } }
    })
    
    if (!product) return new NextResponse("Product not found", { status: 400 })

    const variantId = product.variants[0]?.id
    if (!variantId) return new NextResponse("Variant configuration error", { status: 400 })

    const orderNumber = `BB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`

    const orderCreationBlock = { 
      create: [{ 
        orderNumber,
        subtotalInCents: pricePaidInCents,
        totalInCents: pricePaidInCents,
        status: "confirmed",
        paymentStatus: "paid",
        paymentMethod: "stripe_card",
        stripePaymentIntentId: charge.payment_intent as string,
        items: {
          create: [{
            productId: product.id,
            variantId: variantId,
            productName: product.name,
            variantSku: product.variants[0]?.sku || "DIGITAL-DEFAULT",
            quantity: 1,
            unitPriceInCents: pricePaidInCents,
            totalInCents: pricePaidInCents
          }]
        }
      }] 
    }

    const userWithOrder = await db.user.upsert({
      where: { email },
      create: { email, orders: orderCreationBlock },
      update: { orders: orderCreationBlock },
      include: { orders: { orderBy: { createdAt: "desc" }, take: 1 } },
    })

    const order = userWithOrder.orders[0]
    if (!order) return new NextResponse("Order persistence failed", { status: 500 })

    await resend.emails.send({
      from: `Support <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Your Purchase — Brian Bands Sports",
      text: `Thanks for your purchase! Order: ${order.orderNumber}`
    })
  }
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
   return new NextResponse("Demo mode: Webhook skipped", { status: 200 });
  }

  return new NextResponse(null, { status: 200 })
}