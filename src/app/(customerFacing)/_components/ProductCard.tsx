// src/app/(customerFacing)/_components/ProductCard.tsx
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/formatters"

type ProductCardProps = {
  slug:               string
  name:               string
  priceInCents:       number
  comparePriceInCents?: number | null
  shortDescription?:  string | null
  brand?:             { name: string } | null
  isFeatured:         boolean
  isNew:              boolean
  images:             { url: string; altText: string | null }[]
  variants:           { stock: number; isActive: boolean; priceInCents: number | null }[]
}

export function ProductCard({
  slug, name, priceInCents, comparePriceInCents, shortDescription,
  brand, isFeatured, isNew, images, variants,
}: ProductCardProps) {
  const primaryImage  = images[0]
  const totalStock    = variants.reduce((n, v) => n + (v.isActive ? v.stock : 0), 0)
  const isOutOfStock  = totalStock === 0
  const isLowStock    = totalStock > 0 && totalStock <= 5
  const isOnSale      = comparePriceInCents != null && comparePriceInCents > priceInCents
  const salePercent   = isOnSale ? Math.round((1 - priceInCents / comparePriceInCents!) * 100) : 0

  return (
    <Link href={`/products/${slug}`}
      className="group bg-white border border-border-color rounded-md overflow-hidden card-hover flex flex-col"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

      {/* Image */}
      <div className="relative bg-light-grey" style={{ aspectRatio: "1 / 1" }}>
        {primaryImage ? (
          <Image src={primaryImage.url} alt={primaryImage.altText ?? name}
            fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">No image</div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew     && <Badge colour="bg-brand-blue"  label="NEW" />}
          {isFeatured && <Badge colour="bg-brand-gold"  label="★" />}
          {isOnSale  && <Badge colour="bg-brand-red"   label={`−${salePercent}%`} />}
        </div>

        {/* Stock status overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-white text-text-muted text-xs font-bold px-3 py-1 rounded-full border border-border-color">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {brand && (
          <p className="text-brand-blue text-xs font-semibold uppercase tracking-wide mb-0.5">{brand.name}</p>
        )}
        <h4 className="font-bold text-text-primary line-clamp-2 leading-snug flex-1"
          style={{ fontSize: "clamp(12px,2.5vw,13px)" }}>
          {name}
        </h4>

        {shortDescription && (
          <p className="text-text-muted text-xs line-clamp-1 mt-1">{shortDescription}</p>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className={`font-bold text-base ${isOnSale ? "text-brand-red" : "text-text-primary"}`}>
            {formatCurrency(priceInCents / 100)}
          </span>
          {isOnSale && (
            <span className="text-text-muted text-xs line-through">
              {formatCurrency(comparePriceInCents! / 100)}
            </span>
          )}
        </div>

        {/* Low stock warning */}
        {isLowStock && (
          <p className="text-brand-gold text-xs font-medium mt-1">Only {totalStock} left</p>
        )}

        <div className={`mt-2 w-full text-center py-2 rounded-sm text-xs font-semibold transition-colors
          ${isOutOfStock
            ? "bg-light-grey text-text-muted"
            : "bg-brand-blue text-white group-hover:bg-brand-blue-dark"}`}>
          {isOutOfStock ? "Out of Stock" : "View Product"}
        </div>
      </div>
    </Link>
  )
}

function Badge({ colour, label }: { colour: string; label: string }) {
  return (
    <span className={`${colour} text-white text-xs font-bold px-2 py-0.5 rounded-sm`}>
      {label}
    </span>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-border-color rounded-md overflow-hidden animate-pulse">
      <div className="bg-light-grey" style={{ aspectRatio: "1 / 1" }} />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-light-grey rounded w-1/3" />
        <div className="h-4 bg-light-grey rounded w-3/4" />
        <div className="h-3 bg-light-grey rounded w-2/3" />
        <div className="h-5 bg-light-grey rounded w-1/2 mt-2" />
        <div className="h-8 bg-light-grey rounded mt-2" />
      </div>
    </div>
  )
}
