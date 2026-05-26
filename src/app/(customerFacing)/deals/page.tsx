// src/app/(customerFacing)/deals/page.tsx
import db from "@/lib/db"
import { ProductCard } from "../_components/ProductCard"
import { Tag } from "lucide-react"

export const dynamic = "force-dynamic"

const productSelect = {
  slug: true, name: true, priceInCents: true, comparePriceInCents: true,
  shortDescription: true, isFeatured: true, isNew: true,
  brand:    { select: { name: true } },
  images:   { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
  variants: { select: { stock: true, isActive: true, priceInCents: true } },
} as const

export default async function DealsPage() {
  const products = await db.product.findMany({
    where: {
      isAvailableForPurchase: true,
      comparePriceInCents:    { not: null },
    },
    select:  productSelect,
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="bg-brand-red text-white rounded-md px-6 py-6 mb-8 flex items-center gap-4">
        <Tag className="w-10 h-10 flex-shrink-0" />
        <div>
          <h1 className="font-extrabold text-2xl">Current Deals</h1>
          <p className="text-white/80 text-sm mt-0.5">Discounted stock — while sizes last</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-border-color rounded-md px-6 py-14 text-center">
          <p className="font-semibold text-text-primary mb-1">No deals at the moment</p>
          <p className="text-text-muted text-sm">Check back soon — we add new deals regularly.</p>
        </div>
      ) : (
        <>
          <p className="text-text-muted text-sm mb-4">{products.length} items on sale</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map(p => <ProductCard key={p.slug} {...p} />)}
          </div>
        </>
      )}
    </div>
  )
}
