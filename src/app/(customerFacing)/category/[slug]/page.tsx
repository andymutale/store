// src/app/(customerFacing)/category/[slug]/page.tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import db from "@/lib/db"
import { ProductCard } from "../../_components/ProductCard"

type Props = { params: Promise<{ slug: string }> }

const productSelect = {
  slug: true, name: true, priceInCents: true, comparePriceInCents: true,
  shortDescription: true, isFeatured: true, isNew: true,
  brand:    { select: { name: true } },
  images:   { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
  variants: { select: { stock: true, isActive: true, priceInCents: true } },
} as const

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params

  const category = await db.category.findUnique({
    where:   { slug },
    include: {
      parent:   { select: { name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true }, orderBy: { sortOrder: "asc" } },
    },
  })

  if (!category || !category.isActive) return notFound()

  // Include this category + all child categories
  const categoryIds = [category.id, ...category.children.map(c => c.id)]

  const products = await db.product.findMany({
    where:   { isAvailableForPurchase: true, categoryId: { in: categoryIds } },
    select:  productSelect,
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-6">

      {/* Breadcrumb */}
      <nav className="flex gap-1.5 text-xs text-text-muted mb-4 flex-wrap">
        <Link href="/"          className="hover:text-brand-blue">Home</Link> /
        {category.parent && (
          <><Link href={`/category/${category.parent.slug}`} className="hover:text-brand-blue">
            {category.parent.name}
          </Link> / </>
        )}
        <span className="text-text-secondary">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-extrabold text-text-primary" style={{ fontSize: "clamp(22px,4vw,30px)" }}>
          {category.name}
        </h1>
        {category.description && (
          <p className="text-text-secondary text-sm mt-1 max-w-xl">{category.description}</p>
        )}
        <p className="text-text-muted text-sm mt-1">{products.length} products</p>
      </div>

      {/* Sub-category chips */}
      {category.children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {category.children.map(child => (
            <Link key={child.id} href={`/category/${child.slug}`}
              className="text-sm px-4 py-1.5 rounded-full border border-border-color text-text-secondary bg-white hover:border-brand-blue hover:text-brand-blue transition-colors font-medium">
              {child.name}
            </Link>
          ))}
        </div>
      )}

      {/* Grid */}
      {products.length === 0 ? (
        <div className="bg-white border border-border-color rounded-md px-6 py-14 text-center">
          <p className="font-semibold text-text-primary mb-1">Nothing here yet</p>
          <p className="text-text-muted text-sm mb-4">New stock arrives regularly — check back soon.</p>
          <Link href="/products"
            className="inline-flex bg-brand-blue text-white font-semibold px-5 py-2.5 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors">
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map(p => <ProductCard key={p.slug} {...p} />)}
        </div>
      )}
    </div>
  )
}
