"use client"
// src/app/(customerFacing)/_components/AddToCartButton.tsx

import { useState, useTransition } from "react"
import { ShoppingCart, Check, Loader2 } from "lucide-react"
import { addToCart } from "@/app/_actions/cart"
import Link from "next/link"

type Props = {
  variantId:   string
  disabled?:   boolean  // true when no size selected or out of stock
  outOfStock?: boolean
}

export function AddToCartButton({ variantId, disabled, outOfStock }: Props) {
  const [isPending, startTransition] = useTransition()
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    if (disabled || outOfStock || isPending || added) return
    setError(null)

    startTransition(async () => {
      try {
        await addToCart(variantId, 1)
        setAdded(true)
        // Reset "Added!" state after 2.5 s
        setTimeout(() => setAdded(false), 2500)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not add to cart.")
      }
    })
  }

  if (outOfStock) {
    return (
      <button disabled
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-sm font-semibold text-sm bg-light-grey text-text-muted cursor-not-allowed">
        Out of Stock
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={disabled || isPending || added}
        className={`
          w-full flex items-center justify-center gap-2 py-3.5 rounded-sm font-semibold text-sm
          transition-all duration-200 button-hover
          ${added
            ? "bg-brand-green text-white"
            : disabled
              ? "bg-light-grey text-text-muted cursor-not-allowed"
              : "bg-brand-blue text-white hover:bg-brand-blue-dark"}
        `}>
        {isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</>
        ) : added ? (
          <><Check className="w-4 h-4" /> Added to Cart!</>
        ) : (
          <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
        )}
      </button>

      {added && (
        <Link href="/cart"
          className="block w-full text-center py-2.5 rounded-sm border border-brand-blue text-brand-blue text-sm font-semibold hover:bg-brand-blue-light transition-colors">
          View Cart & Checkout →
        </Link>
      )}

      {error && (
        <p className="text-brand-red text-xs text-center">{error}</p>
      )}
    </div>
  )
}
