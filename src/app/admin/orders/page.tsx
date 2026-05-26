// src/app/admin/orders/page.tsx
import db from "@/lib/db"
import { formatCurrency } from "@/lib/formatters"
import { PageHeader } from "../_components/PageHeader"
import { OrderStatusForm } from "./_components/OrderStatusForm"

const DATE_FMT = new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" })

const STATUS_COLOURS: Record<string, string> = {
  pending:    "bg-yellow-50 text-yellow-700",
  confirmed:  "bg-blue-50 text-blue-700",
  processing: "bg-blue-50 text-blue-700",
  shipped:    "bg-purple-50 text-purple-700",
  delivered:  "bg-green-50 text-green-700",
  cancelled:  "bg-red-50 text-red-700",
  refunded:   "bg-gray-50 text-gray-500",
}

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    include: {
      user:  { select: { email: true, firstName: true, lastName: true } },
      items: { select: { quantity: true, productName: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <>
      <PageHeader>Orders</PageHeader>

      <div className="bg-white border border-border-color rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-light-grey text-text-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Items</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Date</th>
              <th className="px-4 py-3 text-left">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-off-white transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{order.orderNumber}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-text-primary text-xs">
                    {order.user.firstName} {order.user.lastName}
                  </p>
                  <p className="text-text-muted text-xs">{order.user.email}</p>
                </td>
                <td className="px-4 py-3 text-text-secondary text-xs hidden sm:table-cell max-w-xs">
                  <span className="line-clamp-2">
                    {order.items.map(i => `${i.productName} ×${i.quantity}`).join(", ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-text-primary">
                  {formatCurrency(order.totalInCents / 100)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold capitalize ${STATUS_COLOURS[order.status] ?? STATUS_COLOURS.pending}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted text-xs hidden lg:table-cell whitespace-nowrap">
                  {DATE_FMT.format(order.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusForm
                    orderId={order.id}
                    currentStatus={order.status}
                    currentTracking={order.trackingNumber}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <p className="text-text-muted text-sm text-center py-10">No orders yet.</p>
        )}
      </div>
    </>
  )
}
