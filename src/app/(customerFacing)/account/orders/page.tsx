// src/app/(customerFacing)/account/orders/page.tsx
import Link from "next/link"
import { requireUser } from "@/lib/auth"
import db from "@/lib/db"
import { formatCurrency } from "@/lib/formatters"
import { Package, ArrowRight } from "lucide-react"

const DATE_FMT = new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" })

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed:  "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped:    "bg-purple-50 text-purple-700 border-purple-200",
  delivered:  "bg-green-50 text-green-700 border-green-200",
  cancelled:  "bg-red-50 text-red-700 border-red-200",
  refunded:   "bg-gray-50 text-gray-600 border-gray-200",
}

export default async function AccountOrdersPage() {
  const user   = await requireUser()
  const orders = await db.order.findMany({
    where:   { userId: user.id },
    include: {
      items: { select: { quantity: true, productName: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-border-color rounded-md px-6 py-12 text-center">
        <Package className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="font-semibold text-text-primary mb-1">No orders yet</p>
        <p className="text-text-muted text-sm mb-4">Once you place an order it'll appear here.</p>
        <Link href="/products"
          className="inline-flex items-center gap-2 bg-brand-blue text-white font-semibold px-5 py-2.5 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors">
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-text-primary">Order History</h2>
      {orders.map(order => {
        const totalItems = order.items.reduce((n, i) => n + i.quantity, 0)
        const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending

        return (
          <Link key={order.id} href={`/account/orders/${order.orderNumber}`}
            className="block bg-white border border-border-color rounded-md px-5 py-4 hover:shadow-sm transition-shadow group">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-text-primary text-sm">{order.orderNumber}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusStyle}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {DATE_FMT.format(order.createdAt)} · {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
                <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                  {order.items.map(i => i.productName).join(", ")}
                </p>
              </div>
              <div className="text-right flex-shrink-0 flex items-center gap-2">
                <p className="font-bold text-text-primary">{formatCurrency(order.totalInCents / 100)}</p>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-blue transition-colors" />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
