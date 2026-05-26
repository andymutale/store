import Link from "next/link"
import db from "@/lib/db"
import { PlusCircle, CheckCircle2, XCircle, Pencil } from "lucide-react"
import { PageHeader } from "../_components/PageHeader"
import { DeleteCategoryButton } from "./_components/CategoryMenuItems"

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    where:   { parentId: null },         // top-level only
    include: {
      children: {
        include: { _count: { select: { products: true } } },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  })

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageHeader>Categories</PageHeader>
        <Link href="/admin/categories/new"
          className="flex items-center gap-2 bg-brand-blue text-white font-semibold px-4 py-2 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors">
          <PlusCircle className="w-4 h-4" /> Add Category
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="text-text-muted text-sm py-8 text-center">No categories yet.</p>
      ) : (
        <div className="space-y-3">
          {categories.map(parent => (
            <div key={parent.id} className="bg-white border border-border-color rounded-md overflow-hidden">
              {/* Parent row */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border-color bg-light-grey">
                <span className="flex-1 font-semibold text-text-primary text-sm">{parent.name}</span>
                <span className="text-xs text-text-muted font-mono">{parent.slug}</span>
                <span className="text-xs text-text-muted">{parent._count.products} products</span>
                {parent.isActive
                  ? <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" />
                  : <XCircle      className="w-4 h-4 text-brand-red flex-shrink-0" />}
                <Link href={`/admin/categories/${parent.id}/edit`}
                  className="p-1 rounded hover:bg-border-color text-text-muted transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </Link>
                <DeleteCategoryButton
                  id={parent.id}
                  disabled={parent._count.products > 0 || parent.children.length > 0}
                />
              </div>

              {/* Child rows */}
              {parent.children.length > 0 && (
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border-color">
                    {parent.children.map(child => (
                      <tr key={child.id} className="hover:bg-off-white transition-colors">
                        <td className="px-4 py-2.5 w-6" />
                        <td className="px-4 py-2.5 text-text-secondary">↳ {child.name}</td>
                        <td className="px-4 py-2.5 text-text-muted font-mono text-xs">{child.slug}</td>
                        <td className="px-4 py-2.5 text-text-muted text-xs">{child._count.products} products</td>
                        <td className="px-4 py-2.5">
                          {child.isActive
                            ? <CheckCircle2 className="w-4 h-4 text-brand-green" />
                            : <XCircle      className="w-4 h-4 text-brand-red" />}
                        </td>
                        <td className="px-4 py-2.5">
                          <Link href={`/admin/categories/${child.id}/edit`}
                            className="p-1 rounded hover:bg-light-grey text-text-muted transition-colors inline-flex">
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                        <td className="px-4 py-2.5">
                          <DeleteCategoryButton id={child.id} disabled={child._count.products > 0} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
