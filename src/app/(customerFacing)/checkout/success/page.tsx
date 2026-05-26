// src/app/(customerFacing)/checkout/success/page.tsx
import Link from "next/link"
import { CheckCircle2, Package, Mail, ArrowRight } from "lucide-react"
import db from "@/lib/db"
import { formatCurrency } from "@/lib/formatters"

export const dynamic = "force-dynamic"

type Props = {
  searchParams: Promise<{ order_number?: string; payment_intent?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order_number, payment_intent } = await searchParams

  // Fetch order details for confirmation display
  const order = order_number
    ? await db.order.findUnique({
        where:   { orderNumber: order_number },
        include: {
          items: {
            include: {
              product: { select: { name: true } },
              variant: { select: { size: true, color: true } },
            },
          },
          shippingAddress: true,
        },
      })
    : null

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle2 className="w-16 h-16 text-brand-green mx-auto mb-4" />
        <h1 className="font-extrabold text-text-primary text-2xl mb-2">Payment received!</h1>
        <p className="text-text-muted mb-6">
          Your order is being processed. You'll receive a confirmation email shortly.
        </p>
        <Link href="/products"
          className="inline-flex items-center gap-2 bg-brand-blue text-white font-semibold px-6 py-3 rounded-sm hover:bg-brand-blue-dark transition-colors">
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* Hero */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9 text-brand-green" />
        </div>
        <h1 className="font-extrabold text-text-primary mb-1" style={{ fontSize: "clamp(22px,4vw,28px)" }}>
          Thank you for your order!
        </h1>
        <p className="text-text-secondary">
          Order <strong>{order.orderNumber}</strong> has been received and is being processed.
        </p>
      </div>

      {/* Status strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <StatusCard icon={<Package className="w-5 h-5 text-brand-blue" />}
          label="Order status" value="Processing" />
        <StatusCard icon={<CheckCircle2 className="w-5 h-5 text-brand-green" />}
          label="Payment" value="Confirmed" />
        <StatusCard icon={<Mail className="w-5 h-5 text-brand-gold" />}
          label="Confirmation" value="Email sent" />
      </div>

      {/* Order summary card */}
      <div className="bg-white border border-border-color rounded-md overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-border-color bg-light-grey flex items-center justify-between">
          <h2 className="font-semibold text-text-primary text-sm">Order details</h2>
          <span className="text-xs text-text-muted">{order.orderNumber}</span>
        </div>

        <div className="p-5 space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-sm text-text-primary leading-snug">{item.productName}</p>
                <div className="flex gap-2 mt-0.5">
                  {item.size  && <span className="text-xs text-text-muted">{item.size}</span>}
                  {item.color && <span className="text-xs text-text-muted">· {item.color}</span>}
                  <span className="text-xs text-text-muted">× {item.quantity}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-text-primary flex-shrink-0">
                {formatCurrency(item.totalInCents / 100)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-border-color px-5 py-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotalInCents / 100)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Shipping</span>
            <span>{order.shippingInCents === 0 ? "FREE" : formatCurrency(order.shippingInCents / 100)}</span>
          </div>
          <div className="flex justify-between font-bold text-text-primary border-t border-border-color pt-2">
            <span>Total paid</span>
            <span>{formatCurrency(order.totalInCents / 100)}</span>
          </div>
        </div>

        {order.shippingAddress && (
          <div className="border-t border-border-color px-5 py-3">
            <p className="text-xs text-text-muted uppercase tracking-wide font-semibold mb-1">Delivering to</p>
            <p className="text-sm text-text-secondary">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
              {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
            </p>
          </div>
        )}
      </div>

      {/* Shipping notice */}
      {order.shippingMethod && (
        <div className="bg-brand-blue-light border border-brand-blue rounded-sm px-4 py-3 text-sm text-brand-blue-dark mb-6">
          <strong>Shipping:</strong> {order.shippingMethod}.
          You will receive tracking information via email once your order is dispatched.
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/products"
          className="flex-1 text-center bg-brand-blue text-white font-semibold py-3 rounded-sm hover:bg-brand-blue-dark transition-colors">
          Continue Shopping
        </Link>
        <Link href="/"
          className="flex-1 text-center border border-border-color text-text-secondary font-semibold py-3 rounded-sm hover:bg-light-grey transition-colors">
          Back to Home
        </Link>
      </div>

    </div>
  )
}

function StatusCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white border border-border-color rounded-md px-4 py-3 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  )
}
