// src/app/admin/brands/page.tsx
import Link from "next/link"
import db from "@/lib/db"
import { PlusCircle, CheckCircle2, XCircle, Pencil } from "lucide-react"
import { PageHeader } from "../_components/PageHeader"
import { DeleteBrandButton } from "./_components/BrandMenuItems"

export default async function AdminBrandsPage() {
  const brands = await db.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  })

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageHeader>Brands</PageHeader>
        <Link href="/admin/brands/new"
          className="flex items-center gap-2 bg-brand-blue text-white font-semibold px-4 py-2 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors">
          <PlusCircle className="w-4 h-4" /> Add Brand
        </Link>
      </div>

      {brands.length === 0 ? (
        <p className="text-text-muted text-sm py-8 text-center">No brands yet.</p>
      ) : (
        <div className="bg-white border border-border-color rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-light-grey text-text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Products</th>
                <th className="px-4 py-3 text-left">Active</th>
                <th className="px-4 py-3 w-20"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {brands.map(brand => (
                <tr key={brand.id} className="hover:bg-off-white transition-colors">
                  <td className="px-4 py-3 font-medium text-text-primary">{brand.name}</td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs">{brand.slug}</td>
                  <td className="px-4 py-3 text-text-secondary">{brand._count.products}</td>
                  <td className="px-4 py-3">
                    {brand.isActive
                      ? <CheckCircle2 className="w-4 h-4 text-brand-green" />
                      : <XCircle      className="w-4 h-4 text-brand-red" />}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <Link href={`/admin/brands/${brand.id}/edit`}
                      className="p-1 rounded hover:bg-light-grey text-text-muted transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <DeleteBrandButton id={brand.id} disabled={brand._count.products > 0} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
