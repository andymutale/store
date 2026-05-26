// src/app/admin/page.tsx
import db from "@/lib/db"
import { formatCurrency, formatNumber } from "@/lib/formatters"
import { PageHeader } from "./_components/PageHeader"

async function getSalesData() {
  const d = await db.order.aggregate({
    where: { paymentStatus: "paid" },
    _sum:  { totalInCents: true },
    _count: true,
  })
  return { revenue: (d._sum.totalInCents ?? 0) / 100, orders: d._count }
}

async function getUserData() {
  const [count, agg] = await Promise.all([
    db.user.count(),
    db.order.aggregate({ where: { paymentStatus: "paid" }, _sum: { totalInCents: true } }),
  ])
  const total = agg._sum.totalInCents ?? 0
  return { count, avgValue: count === 0 ? 0 : total / count / 100 }
}

async function getProductData() {
  const [active, inactive, lowStock] = await Promise.all([
    db.product.count({ where: { isAvailableForPurchase: true } }),
    db.product.count({ where: { isAvailableForPurchase: false } }),
    db.productVariant.count({ where: { stock: { lte: 5, gt: 0 }, isActive: true } }),
  ])
  return { active, inactive, lowStock }
}

export default async function AdminDashboard() {
  const [sales, users, products] = await Promise.all([getSalesData(), getUserData(), getProductData()])

  return (
    <>
      <PageHeader>Dashboard</PageHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Revenue"    value={formatCurrency(sales.revenue)}    sub={`from ${formatNumber(sales.orders)} paid orders`} />
        <StatCard title="Customers"        value={formatNumber(users.count)}        sub={`${formatCurrency(users.avgValue)} avg order value`} />
        <StatCard title="Active Products"  value={formatNumber(products.active)}    sub={`${formatNumber(products.inactive)} inactive`} />
        <StatCard title="Low Stock Sizes"  value={formatNumber(products.lowStock)}  sub="variants with ≤5 units" highlight={products.lowStock > 0} />
      </div>
    </>
  )
}

function StatCard({ title, value, sub, highlight }: { title: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`bg-white border rounded-md p-6 ${highlight ? "border-brand-gold" : "border-border-color"}`}
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <div className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-1">{title}</div>
      <div className={`font-extrabold mb-1 ${highlight ? "text-brand-gold" : "text-text-primary"}`}
        style={{ fontSize: "clamp(24px,4vw,32px)" }}>{value}</div>
      <div className="text-text-muted text-sm">{sub}</div>
    </div>
  )
}
