// src/app/(customerFacing)/account/orders/[orderNumber]/page.tsx
import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth"
import db from "@/lib/db"
import { formatCurrency } from "@/lib/formatters"
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle } from "lucide-react"

const DATE_FMT     = new Intl.DateTimeFormat("en-ZA", { dateStyle: "long" })
const DATETIME_FMT = new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" })

type Props = { params: Promise<{ orderNumber: string }> }

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; colour: string }> = {
  pending:    { label: "Pending",    icon: <Clock className="w-4 h-4" />,        colour: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  confirmed:  { label: "Confirmed",  icon: <CheckCircle2 className="w-4 h-4" />, colour: "text-blue-600 bg-blue-50 border-blue-200" },
  processing: { label: "Processing", icon: <Package className="w-4 h-4" />,      colour: "text-blue-600 bg-blue-50 border-blue-200" },
  shipped:    { label: "Shipped",    icon: <Truck className="w-4 h-4" />,        colour: "text-purple-600 bg-purple-50 border-purple-200" },
  delivered:  { label: "Delivered",  icon: <CheckCircle2 className="w-4 h-4" />, colour: "text-green-600 bg-green-50 border-green-200" },
  cancelled:  { label: "Cancelled",  icon: <XCircle className="w-4 h-4" />,      colour: "text-red-600 bg-red-50 border-red-200" },
}

export default async function OrderDetailPage({ params }: Props) {
  const { orderNumber } = await params
  const user  = await requireUser()

  const order = await db.order.findUnique({
    where:   { orderNumber },
    include: {
      items:           true,
      shippingAddress: true,
    },
  })

  // Ownership check
  if (!order || order.userId !== user.id) return notFound()

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to orders
      </Link>

      {/* Header */}
      <div className="bg-white border border-border-color rounded-md px-5 py-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-extrabold text-text-primary text-lg">{order.orderNumber}</h2>
            <p className="text-text-muted text-sm">Placed {DATE_FMT.format(order.createdAt)}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${status.colour}`}>
            {status.icon} {status.label}
          </span>
        </div>

        {/* Tracking */}
        {order.trackingNumber && (
          <div className="mt-3 pt-3 border-t border-border-color">
            <p className="text-sm text-text-secondary">
              <span className="font-semibold">Tracking number:</span>{" "}
              {order.trackingUrl
                ? <a href={order.trackingUrl} target="_blank" rel="noopener" className="text-brand-blue hover:underline">{order.trackingNumber}</a>
                : order.trackingNumber}
            </p>
            {order.shippedAt && <p className="text-xs text-text-muted mt-0.5">Shipped {DATETIME_FMT.format(order.shippedAt)}</p>}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white border border-border-color rounded-md overflow-hidden">
        <p className="font-semibold text-text-primary text-sm px-5 py-3 border-b border-border-color">Items ordered</p>
        <div className="divide-y divide-border-color">
          {order.items.map(item => (
            <div key={item.id} className="flex items-start justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="font-medium text-sm text-text-primary">{item.productName}</p>
                <div className="flex gap-3 mt-0.5">
                  {item.size  && <span className="text-xs text-text-muted">{item.size}</span>}
                  {item.color && <span className="text-xs text-text-muted">· {item.color}</span>}
                  <span className="text-xs text-text-muted">× {item.quantity}</span>
                </div>
                <p className="text-xs text-text-muted font-mono mt-0.5">{item.variantSku}</p>
              </div>
              <p className="font-semibold text-sm text-text-primary flex-shrink-0">
                {formatCurrency(item.totalInCents / 100)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-border-color px-5 py-3 space-y-1.5 text-sm bg-light-grey">
          <div className="flex justify-between text-text-secondary">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotalInCents / 100)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Shipping</span>
            <span>{order.shippingInCents === 0 ? "FREE" : formatCurrency(order.shippingInCents / 100)}</span>
          </div>
          {order.discountInCents > 0 && (
            <div className="flex justify-between text-brand-green">
              <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span>−{formatCurrency(order.discountInCents / 100)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-text-primary border-t border-border-color pt-2">
            <span>Total</span>
            <span>{formatCurrency(order.totalInCents / 100)}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      {order.shippingAddress && (
        <div className="bg-white border border-border-color rounded-md px-5 py-4">
          <p className="font-semibold text-text-primary text-sm mb-2">Delivery address</p>
          <address className="not-italic text-sm text-text-secondary leading-relaxed">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? <>, {order.shippingAddress.line2}</> : null}<br />
            {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}<br />
            {order.shippingAddress.phone && <span>📞 {order.shippingAddress.phone}</span>}
          </address>
          {order.shippingMethod && (
            <p className="text-xs text-text-muted mt-2">Via {order.shippingMethod}</p>
          )}
        </div>
      )}

      {/* Help */}
      <p className="text-xs text-text-muted text-center">
        Questions about this order?{" "}
        <a href="mailto:admin@example.com" className="text-brand-blue hover:underline">
          Contact us
        </a>
        {" "}or call 000 000 0000.
      </p>
    </div>
  )
}
