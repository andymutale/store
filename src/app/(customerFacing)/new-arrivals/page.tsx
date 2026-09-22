// src/app/(customerFacing)/new-arrivals/page.tsx
import db from "@/lib/db"
import { ProductCard } from "../_components/ProductCard"

export const dynamic = "force-dynamic"

const productSelect = {
  slug: true, name: true, priceInCents: true, comparePriceInCents: true,
  shortDescription: true, isFeatured: true, isNew: true,
  brand:    { select: { name: true } },
  images:   { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
  variants: { select: { stock: true, isActive: true, priceInCents: true } },
} as const

export default async function NewArrivalsPage() {
  const products = await db.product.findMany({
    where:   { isAvailableForPurchase: true, isNew: true },
    select:  productSelect,
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-text-primary" style={{ fontSize: "clamp(22px,4vw,30px)" }}>
          New Arrivals
        </h1>
        <p className="text-text-muted text-sm mt-1">Fresh stock — just landed</p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-border-color rounded-md px-6 py-14 text-center">
          <p className="font-semibold text-text-primary mb-1">Nothing new at the moment</p>
          <p className="text-text-muted text-sm">New stock arrives weekly — check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map(p => <ProductCard key={p.slug} {...p} />)}
        </div>
      )}
    </div>
  )
}
