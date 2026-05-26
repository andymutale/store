import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from "resend"
import db from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
const resend = new Resend(process.env.RESEND_API_KEY as string)

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
    const charge            = event.data.object as Stripe.Charge
    const productId         = charge.metadata.productId
    const email             = charge.billing_details.email
    const pricePaidInCents  = charge.amount

    // Verify the base product exists
    const product = await db.product.findUnique({ 
      where: { id: productId },
      include: { variants: { take: 1 } } // Fetch a fallback variant for the order record
    })
    if (!product || !email) return new NextResponse("Bad Request", { status: 400 })

    const variantId = product.variants[0]?.id
    if (!variantId) return new NextResponse("Product has no variants configured", { status: 400 })

    // ✅ Match the order pattern defined in your schema comments
    const orderNumber = `BB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`

    const coreUserFields = { email }
    
    // ✅ FIXED: Created fields that explicitly map to your schema parameters
    const orderCreationBlock = { 
      create: [{ 
        orderNumber,
        subtotalInCents: pricePaidInCents,
        totalInCents: pricePaidInCents,
        status: "confirmed",
        paymentStatus: "paid",
        paymentMethod: "stripe_card",
        stripePaymentIntentId: charge.payment_intent as string,
        // Nest the mandatory OrderItem snapshot relation record
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
      create: {
        ...coreUserFields,
        orders: orderCreationBlock,
      },
      update: {
        ...coreUserFields,
        orders: orderCreationBlock,
      },
      include: {
        orders: {
          // ✅ FIXED: Removed the invalid direct 'productId' lookup property filter
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    const order = userWithOrder.orders[0]

    if (!order) {
      return new NextResponse("Order creation failed inside billing system transaction", { status: 500 })
    }

    // Send the checkout transactional email via Resend
    await resend.emails.send({
      from:    `Support <${process.env.SENDER_EMAIL}>`,
      to:      email,
      subject: "Your Purchase — Brian Bands Sports",
      text:    `Thanks for your purchase!\n\nOrder Reference: ${order.orderNumber}\nProduct: ${product.name}\nPrice: ${(pricePaidInCents / 100).toFixed(2)}\n\nOur team is preparing your delivery tracking link inside our system now.`
    })
  }

  return new NextResponse(null, { status: 200 })
}