// src/app/(customerFacing)/account/page.tsx
import Link from "next/link"
import { requireUser } from "@/lib/auth"
import db from "@/lib/db"
import { formatCurrency } from "@/lib/formatters"
import { ShoppingBag, MapPin, User, ArrowRight, Package } from "lucide-react"

const DATE_FMT = new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" })

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-50 text-yellow-700",
  confirmed:  "bg-blue-50 text-blue-700",
  processing: "bg-blue-50 text-blue-700",
  shipped:    "bg-purple-50 text-purple-700",
  delivered:  "bg-green-50 text-green-700",
  cancelled:  "bg-red-50 text-red-700",
  refunded:   "bg-gray-50 text-gray-600",
}

export default async function AccountDashboardPage() {
  const user = await requireUser()

  const [orders, addressCount] = await Promise.all([
    db.order.findMany({
      where:   { userId: user.id },
      include: { items: { select: { quantity: true } } },
      orderBy: { createdAt: "desc" },
      take:    5,
    }),
    db.address.count({ where: { userId: user.id } }),
  ])

  const totalSpent   = orders.reduce((n, o) => n + o.totalInCents, 0)
  const recentOrders = orders.slice(0, 3)

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div className="bg-brand-blue text-white rounded-md px-6 py-5">
        <p className="text-sm text-white/70 mb-0.5">Welcome back,</p>
        <h2 className="font-extrabold text-xl">{user.firstName ?? user.email.split("@")[0]} 👋</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Orders" value={String(orders.length)} />
        <StatCard label="Total spent" value={formatCurrency(totalSpent / 100)} />
        <StatCard label="Addresses" value={String(addressCount)} />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <QuickLink href="/account/orders"    icon={<ShoppingBag className="w-5 h-5" />} label="View all orders" />
        <QuickLink href="/account/addresses" icon={<MapPin className="w-5 h-5" />}      label="Manage addresses" />
        <QuickLink href="/account/profile"   icon={<User className="w-5 h-5" />}        label="Edit profile" />
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white border border-border-color rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-color">
            <h3 className="font-semibold text-text-primary text-sm">Recent Orders</h3>
            <Link href="/account/orders" className="text-xs text-brand-blue hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border-color">
            {recentOrders.map(order => (
              <Link key={order.id} href={`/account/orders/${order.orderNumber}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-off-white transition-colors group">
                <Package className="w-8 h-8 text-text-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-text-primary">{order.orderNumber}</p>
                  <p className="text-xs text-text-muted">
                    {DATE_FMT.format(order.createdAt)} · {order.items.reduce((n, i) => n + i.quantity, 0)} items
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-sm text-text-primary">{formatCurrency(order.totalInCents / 100)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}>
                    {order.status}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-blue transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentOrders.length === 0 && (
        <div className="bg-white border border-border-color rounded-md px-6 py-10 text-center">
          <ShoppingBag className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="font-semibold text-text-primary mb-1">No orders yet</p>
          <p className="text-text-muted text-sm mb-4">Your order history will appear here after your first purchase.</p>
          <Link href="/products"
            className="inline-flex items-center gap-2 bg-brand-blue text-white font-semibold px-5 py-2.5 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors">
            Shop Now
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-border-color rounded-md px-4 py-3 text-center">
      <p className="font-extrabold text-text-primary text-lg">{value}</p>
      <p className="text-text-muted text-xs mt-0.5">{label}</p>
    </div>
  )
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href}
      className="flex items-center gap-3 bg-white border border-border-color rounded-md px-4 py-3 text-sm font-medium text-text-secondary hover:bg-light-grey hover:text-text-primary transition-colors group">
      <span className="text-brand-blue">{icon}</span>
      {label}
      <ArrowRight className="w-3.5 h-3.5 ml-auto text-text-muted group-hover:text-brand-blue transition-colors" />
    </Link>
  )
}
