import db from "@/lib/db"
import { formatCurrency, formatNumber } from "@/lib/formatters"
import { MoreVertical } from "lucide-react"
import { PageHeader } from "../_components/PageHeader"
import { DeleteUserItem } from "./_components/UserMenuItems"

export default async function AdminCustomersPage() {
  return (
    <>
      <PageHeader>Customers</PageHeader>
      <CustomersTable />
    </>
  )
}

async function CustomersTable() {
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      createdAt: true,
      orders: { 
        select: { 
          // ✅ FIXED: Selected the actual field from your schema
          totalInCents: true 
        } 
      },
    },
    orderBy: { createdAt: "desc" },
  })

  if (users.length === 0) {
    return <p className="text-text-muted text-sm py-8 text-center">No customers yet.</p>
  }

  return (
    <div className="bg-white border border-brand rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-light-grey text-text-muted text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Orders</th>
            <th className="px-4 py-3 text-left">Lifetime Value</th>
            <th className="px-4 py-3 w-10"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-off-white transition-colors">
              <td className="px-4 py-3 font-medium text-text-primary">{u.email}</td>
              <td className="px-4 py-3 text-text-secondary">{formatNumber(u.orders.length)}</td>
              <td className="px-4 py-3 text-text-secondary">
                {/* ✅ FIXED: Reducing u.orders using o.totalInCents */}
                {formatCurrency(u.orders.reduce((sum, o) => sum + o.totalInCents, 0) / 100)}
              </td>
              <td className="px-4 py-3">
                <details className="relative">
                  <summary className="list-none cursor-pointer p-1 rounded hover:bg-light-grey">
                    <MoreVertical className="w-4 h-4 text-text-muted" />
                  </summary>
                  <div className="absolute right-0 mt-1 w-36 bg-white border border-brand rounded-md shadow-md z-10 py-1">
                    <DeleteUserItem id={u.id} />
                  </div>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}