import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import db from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { clearCartBySession } from '@/app/_actions/cart'
import OrderConfirmationEmail from '@/email/OrderConfirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function handleStripeWebhook(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    )
  } catch (error) {
    console.error('Stripe webhook verification failed', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
      break
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
      break
    default:
      break
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { orderId, sessionId } = paymentIntent.metadata
  if (!orderId) return

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      shippingAddress: true,
      user: { select: { email: true, firstName: true } },
    },
  })

  if (!order) return

  const result = await db.$transaction(async tx => {
    const markedPaid = await tx.order.updateMany({
      where: { id: orderId, paymentStatus: { not: 'paid' } },
      data: { status: 'confirmed', paymentStatus: 'paid' },
    })

    if (markedPaid.count === 0) return false

    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return true
  })

  if (!result) return
  if (sessionId) await clearCartBySession(sessionId)

  try {
    await resend.emails.send({
      from: `Saint Laurens Sporting Goods <${process.env.SENDER_EMAIL ?? 'orders@example.com'}>`,
      to: order.user.email,
      subject: `Order confirmed — ${order.orderNumber}`,
      react: OrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: order.user.firstName ?? order.user.email.split('@')[0],
        items: order.items.map(item => ({
          productName: item.productName,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          totalInCents: item.totalInCents,
        })),
        subtotalInCents: order.subtotalInCents,
        shippingInCents: order.shippingInCents,
        totalInCents: order.totalInCents,
        shippingMethod: order.shippingMethod,
        shippingAddress: order.shippingAddress
          ? {
              firstName: order.shippingAddress.firstName,
              lastName: order.shippingAddress.lastName,
              line1: order.shippingAddress.line1,
              line2: order.shippingAddress.line2,
              city: order.shippingAddress.city,
              province: order.shippingAddress.province,
              postalCode: order.shippingAddress.postalCode,
            }
          : null,
      }),
    })
  } catch (error) {
    console.error('Order confirmation email failed', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { orderId } = paymentIntent.metadata
  if (!orderId) return

  await db.order.updateMany({
    where: { id: orderId, paymentStatus: { not: 'paid' } },
    data: {
      status: 'cancelled',
      paymentStatus: 'unpaid',
      cancelledAt: new Date(),
      adminNote: `Stripe payment failed: ${paymentIntent.last_payment_error?.message ?? 'unknown'}`,
    },
  })
}
