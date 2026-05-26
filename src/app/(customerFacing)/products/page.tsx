// src/app/(customerFacing)/products/page.tsx
import { Suspense } from "react"
import db from "@/lib/db"
import { ProductCard, ProductCardSkeleton } from "../_components/ProductCard"
import { FilterSidebar } from "./_components/FilterSidebar"
import { SortSelect } from "./_components/SortSelect"

export const dynamic = "force-dynamic"

type SearchParams = {
  q?: string; sport?: string; gender?: string; brand?: string
  sort?: string; featured?: string
}
type Props = { searchParams: Promise<SearchParams> }

const productSelect = {
  slug: true, name: true, priceInCents: true, comparePriceInCents: true,
  shortDescription: true, isFeatured: true, isNew: true,
  brand:    { select: { name: true } },
  images:   { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
  variants: { select: { stock: true, isActive: true, priceInCents: true } },
} as const

export default async function ProductsPage({ searchParams }: Props) {
  const params   = await searchParams
  const { q, sport, gender, brand: brandSlug, sort = "newest", featured } = params

  // Resolve brand slug → id
  const brandRecord = brandSlug
    ? await db.brand.findUnique({ where: { slug: brandSlug }, select: { id: true } })
    : null

  const where = {
    isAvailableForPurchase: true,
    ...(q        ? { OR: [{ name: { contains: q } }, { shortDescription: { contains: q } }] } : {}),
    ...(sport    ? { sport } : {}),
    ...(gender   ? { gender } : {}),
    ...(brandRecord ? { brandId: brandRecord.id } : {}),
    ...(featured ? { isFeatured: true } : {}),
  }

  const orderBy =
    sort === "price_asc"  ? { priceInCents: "asc"  as const } :
    sort === "price_desc" ? { priceInCents: "desc" as const } :
    sort === "name_asc"   ? { name:         "asc"  as const } :
                            { createdAt:    "desc" as const }

  const [products, brands] = await Promise.all([
    db.product.findMany({ where, select: productSelect, orderBy }),
    db.brand.findMany({ where: { isActive: true }, select: { slug: true, name: true }, orderBy: { name: "asc" } }),
  ])

  const activeFilters = [sport, gender, brandSlug, q].filter(Boolean).length

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-6">

      {/* Page header */}
      <div className="flex items-baseline justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="font-extrabold text-text-primary" style={{ fontSize: "clamp(20px,4vw,28px)" }}>
            {q ? `Search: "${q}"` : featured ? "Featured Products" : "All Products"}
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {products.length} {products.length === 1 ? "product" : "products"}
            {activeFilters > 0 ? ` · ${activeFilters} filter${activeFilters > 1 ? "s" : ""} applied` : ""}
          </p>
        </div>

        {/* Sort — extracted to client component so onChange works */}
        <SortSelect
          currentSort={sort}
          q={q}
          sport={sport}
          gender={gender}
          brand={brandSlug}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Filter sidebar */}
        <aside className="md:col-span-1">
          <FilterSidebar
            brands={brands}
            currentSport={sport}
            currentGender={gender}
            currentBrand={brandSlug}
            currentSort={sort}
            currentQ={q}
          />
        </aside>

        {/* Product grid */}
        <div className="md:col-span-3">
          {products.length === 0 ? (
            <div className="bg-white border border-border-color rounded-md px-6 py-16 text-center">
              <p className="font-semibold text-text-primary mb-1">No products found</p>
              <p className="text-text-muted text-sm">Try clearing some filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {products.map(p => <ProductCard key={p.slug} {...p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}