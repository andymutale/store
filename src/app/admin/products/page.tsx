import Link from "next/link"
import db from "@/lib/db"
import { formatCurrency } from "@/lib/formatters"
import { CheckCircle2, XCircle, PlusCircle, Pencil } from "lucide-react"
import { PageHeader } from "../_components/PageHeader"
import { ActiveToggleItem, DeleteItem } from "./_components/ProductMenuItems"

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: {
      category: { select: { name: true } },
      brand:    { select: { name: true } },
      variants: { select: { stock: true, isActive: true } },
      _count:   { select: { orderItems: true } },
    },
    orderBy: { name: "asc" },
  })

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageHeader>Products</PageHeader>
        <Link href="/admin/products/new"
          className="flex items-center gap-2 bg-brand-blue text-white font-semibold px-4 py-2 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors">
          <PlusCircle className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-text-muted text-sm py-8 text-center">No products yet.</p>
      ) : (
        <div className="bg-white border border-border-color rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-light-grey text-text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left w-8">On</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Brand</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 w-20"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {products.map(p => {
                const totalStock   = p.variants.reduce((n, v) => n + (v.isActive ? v.stock : 0), 0)
                const isLowStock   = totalStock > 0 && totalStock <= 5
                const isOutOfStock = totalStock === 0

                return (
                  <tr key={p.id} className="hover:bg-off-white transition-colors">
                    <td className="px-4 py-3">
                      {p.isAvailableForPurchase
                        ? <CheckCircle2 className="w-4 h-4 text-brand-green" />
                        : <XCircle      className="w-4 h-4 text-brand-red" />}
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary max-w-xs">
                      <span className="line-clamp-1">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{p.category.name}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{p.brand?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {formatCurrency(p.priceInCents / 100)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={
                        isOutOfStock ? "text-brand-red font-semibold"
                        : isLowStock ? "text-brand-gold font-semibold"
                        : "text-text-secondary"
                      }>
                        {totalStock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary">{p._count.orderItems}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={`/admin/products/${p.id}/edit`}
                          className="p-1 rounded hover:bg-light-grey text-text-muted">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <ActiveToggleItem id={p.id} isAvailableForPurchase={p.isAvailableForPurchase} />
                        <DeleteItem id={p.id} disabled={p._count.orderItems > 0} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
