"use client"
// src/app/(customerFacing)/products/[slug]/_components/ProductActions.tsx
// Manages variant selection + add to cart — kept in one file so they share state.

import { useState } from "react"
import Image from "next/image"
import { AddToCartButton } from "@/app/(customerFacing)/_components/AddToCartButton"
import { formatCurrency } from "@/lib/formatters"

export type Variant = {
  id:           string
  size:         string | null
  color:        string | null
  stock:        number
  priceInCents: number | null
  isActive:     boolean
}

// ─── SIZE PICKER ──────────────────────────────────────────────────────────────

type SizePickerProps = {
  variants:       Variant[]
  selected:       Variant | null
  onSelect:       (v: Variant) => void
  basePrice:      number
}

export function SizePicker({ variants, selected, onSelect, basePrice }: SizePickerProps) {
  const hasSizes  = variants.some(v => v.size)
  const hasColors = variants.some(v => v.color)

  // Group by colour when multiple colours exist
  const colors = hasColors ? [...new Set(variants.map(v => v.color).filter(Boolean))] as string[] : []

  if (!hasSizes && !hasColors) return null // single-variant product, no picker needed

  return (
    <div className="space-y-4">
      {/* Colour picker */}
      {hasColors && colors.length > 1 && (
        <div>
          <p className="text-sm font-semibold text-text-primary mb-2">
            Colour: <span className="font-normal text-text-secondary">{selected?.color ?? "—"}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => {
              const isSelected = selected?.color === color
              const anyInStock = variants.some(v => v.color === color && v.stock > 0 && v.isActive)
              return (
                <button key={color}
                  onClick={() => {
                    const match = variants.find(v => v.color === color && v.isActive)
                    if (match) onSelect(match)
                  }}
                  disabled={!anyInStock}
                  className={`px-3 py-1.5 rounded-sm text-sm font-medium border transition-colors
                    ${isSelected ? "border-brand-blue bg-brand-blue-light text-brand-blue"
                    : anyInStock ? "border-border-color text-text-secondary hover:border-brand-blue"
                    : "border-border-color text-text-muted opacity-40 cursor-not-allowed line-through"}`}>
                  {color}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Size picker */}
      {hasSizes && (
        <div>
          <p className="text-sm font-semibold text-text-primary mb-2">
            Size: <span className="font-normal text-text-secondary">{selected?.size ?? "Select a size"}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {variants
              .filter(v => !hasColors || !selected?.color || v.color === selected.color)
              .filter(v => v.isActive)
              .map(v => {
                const isSelected = selected?.id === v.id
                const oos        = v.stock === 0
                return (
                  <button key={v.id}
                    onClick={() => !oos && onSelect(v)}
                    disabled={oos}
                    className={`w-16 h-10 rounded-sm text-sm font-semibold border transition-colors relative
                      ${isSelected ? "border-brand-blue bg-brand-blue text-white"
                      : oos ? "border-border-color text-text-muted opacity-40 cursor-not-allowed"
                      : "border-border-color text-text-secondary hover:border-brand-blue hover:text-brand-blue"}`}>
                    {v.size}
                    {oos && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-full border-t border-current opacity-40 absolute" />
                      </span>
                    )}
                  </button>
                )
              })}
          </div>

          {/* Low stock warning */}
          {selected && selected.stock > 0 && selected.stock <= 5 && (
            <p className="text-brand-gold text-xs font-semibold mt-2">
              Only {selected.stock} left in this size!
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── PRODUCT ACTIONS (size picker + add to cart together) ─────────────────────

type ProductActionsProps = {
  variants:  Variant[]
  basePrice: number
}

export function ProductActions({ variants, basePrice }: ProductActionsProps) {
  const hasSizes   = variants.some(v => v.size)
  const autoSelect = !hasSizes && variants.length === 1 ? variants[0] : null
  const [selected, setSelected] = useState<Variant | null>(autoSelect)

  const price      = selected?.priceInCents ?? basePrice
  const isOOS      = selected ? selected.stock === 0 : false
  const needsSize  = hasSizes && !selected

  return (
    <div className="space-y-4">
      {/* Selected variant price (if different from base) */}
      {selected && selected.priceInCents && selected.priceInCents !== basePrice && (
        <p className="text-sm text-text-muted">
          Price for this size: <strong className="text-text-primary">{formatCurrency(price / 100)}</strong>
        </p>
      )}

      <SizePicker variants={variants} selected={selected} onSelect={setSelected} basePrice={basePrice} />

      <AddToCartButton
        variantId={selected?.id ?? ""}
        disabled={needsSize}
        outOfStock={isOOS}
      />

      {needsSize && (
        <p className="text-text-muted text-xs text-center">Please select a size above</p>
      )}
    </div>
  )
}

// ─── IMAGE GALLERY ────────────────────────────────────────────────────────────

type ImageGalleryProps = {
  images: { url: string; altText: string | null }[]
  name:   string
}

export function ImageGallery({ images, name }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = images[activeIdx] ?? images[0]

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative bg-light-grey rounded-md overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
        {active ? (
          <Image src={active.url} alt={active.altText ?? name}
            fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">No image</div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActiveIdx(i)}
              className={`relative flex-shrink-0 rounded overflow-hidden border-2 transition-colors
                ${i === activeIdx ? "border-brand-blue" : "border-border-color hover:border-text-muted"}`}
              style={{ width: 64, height: 64 }}>
              <Image src={img.url} alt={img.altText ?? `${name} view ${i + 1}`}
                fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
