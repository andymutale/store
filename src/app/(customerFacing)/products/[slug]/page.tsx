// src/app/(customerFacing)/products/[slug]/page.tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import db from "@/lib/db"
import { formatCurrency } from "@/lib/formatters"
import { Truck, RotateCcw, ShieldCheck } from "lucide-react"
import { ImageGallery, ProductActions } from "./_components/ProductActions"
import { ProductCard } from "../../_components/ProductCard"

type Props = { params: Promise<{ slug: string }> }

const productSelect = {
  slug: true, name: true, priceInCents: true, comparePriceInCents: true,
  shortDescription: true, isFeatured: true, isNew: true,
  brand:    { select: { name: true } },
  images:   { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
  variants: { select: { stock: true, isActive: true, priceInCents: true } },
} as const

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params

  const product = await db.product.findUnique({
    where:   { slug },
    include: {
      category: { select: { name: true, slug: true, parent: { select: { name: true, slug: true } } } },
      brand:    { select: { name: true, slug: true } },
      images:   { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  })

  if (!product || !product.isAvailableForPurchase) return notFound()

  // Parse specs JSON
  let specs: { label: string; value: string }[] = []
  try { if (product.specs) specs = JSON.parse(product.specs) } catch {}

  // Related products — same category, exclude self
  const related = await db.product.findMany({
    where:   { categoryId: product.categoryId, isAvailableForPurchase: true, NOT: { slug } },
    select:  productSelect,
    take:    4,
    orderBy: { createdAt: "desc" },
  })

  const isOnSale     = product.comparePriceInCents && product.comparePriceInCents > product.priceInCents
  const salePercent  = isOnSale ? Math.round((1 - product.priceInCents / product.comparePriceInCents!) * 100) : 0
  const totalStock   = product.variants.reduce((n, v) => n + v.stock, 0)

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-6">

      {/* Breadcrumb */}
      <nav className="flex gap-1.5 text-xs text-text-muted mb-5 flex-wrap">
        <Link href="/"          className="hover:text-brand-blue">Home</Link> /
        {product.category.parent && (
          <><Link href={`/category/${product.category.parent.slug}`} className="hover:text-brand-blue">
            {product.category.parent.name}
          </Link> / </>
        )}
        <Link href={`/category/${product.category.slug}`} className="hover:text-brand-blue">
          {product.category.name}
        </Link> /
        <span className="text-text-secondary line-clamp-1">{product.name}</span>
      </nav>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

        {/* Left — gallery */}
        <ImageGallery images={product.images} name={product.name} />

        {/* Right — info */}
        <div className="space-y-4">
          {product.brand && (
            <Link href={`/products?brand=${product.brand.slug}`}
              className="text-brand-blue text-sm font-bold uppercase tracking-wide hover:underline">
              {product.brand.name}
            </Link>
          )}

          <h1 className="font-extrabold text-text-primary leading-tight"
            style={{ fontSize: "clamp(20px,4vw,28px)" }}>
            {product.name}
          </h1>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {product.isNew    && <Badge colour="bg-brand-blue"  label="New" />}
            {isOnSale         && <Badge colour="bg-brand-red"   label={`${salePercent}% off`} />}
            {product.isFeatured && <Badge colour="bg-brand-gold" label="Featured" />}
            {totalStock === 0 && <Badge colour="bg-text-muted"  label="Out of stock" />}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className={`font-extrabold text-3xl ${isOnSale ? "text-brand-red" : "text-text-primary"}`}>
              {formatCurrency(product.priceInCents / 100)}
            </span>
            {isOnSale && (
              <span className="text-text-muted text-lg line-through">
                {formatCurrency(product.comparePriceInCents! / 100)}
              </span>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-text-secondary text-sm leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Size picker + add to cart */}
          <ProductActions
            variants={product.variants.map(v => ({
              id: v.id, size: (v as any).size, color: (v as any).color,
              stock: v.stock, priceInCents: v.priceInCents, isActive: (v as any).isActive,
            }))}
            basePrice={product.priceInCents}
          />

          {/* Delivery info strip */}
          <div className="bg-light-grey rounded-md p-4 space-y-2.5">
            {[
              { icon: <Truck className="w-4 h-4 text-brand-blue flex-shrink-0" />,     text: "Nationwide delivery — 3 to 5 business days" },
              { icon: <RotateCcw className="w-4 h-4 text-brand-blue flex-shrink-0" />, text: "30-day returns on unworn items in original packaging" },
              { icon: <ShieldCheck className="w-4 h-4 text-brand-blue flex-shrink-0" />, text: "Authorised dealer — 100% genuine products" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-text-secondary">
                {item.icon} {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description + Specs tabs */}
      <div className="bg-white border border-border-color rounded-md overflow-hidden mb-12">
        <div className="border-b border-border-color px-6 py-3">
          <h2 className="font-bold text-text-primary text-sm">Product Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border-color">
          {/* Description */}
          <div className="px-6 py-5">
            <h3 className="font-semibold text-text-primary text-sm mb-3">Description</h3>
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {/* Specs */}
          {specs.length > 0 && (
            <div className="px-6 py-5">
              <h3 className="font-semibold text-text-primary text-sm mb-3">Specifications</h3>
              <dl className="space-y-2">
                {specs.map((spec, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <dt className="text-text-muted w-32 flex-shrink-0">{spec.label}</dt>
                    <dd className="text-text-primary font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="font-bold text-text-primary mb-5"
            style={{ fontSize: "clamp(16px,4vw,20px)", borderLeft: "4px solid var(--brand-blue)", paddingLeft: 12 }}>
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {related.map(p => <ProductCard key={p.slug} {...p} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function Badge({ colour, label }: { colour: string; label: string }) {
  return <span className={`${colour} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>{label}</span>
}
