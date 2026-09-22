// src/app/(customerFacing)/cart/page.tsx
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, ArrowRight, Tag } from "lucide-react"
import { readCartSessionId, getCartItems, calcSubtotal, resolveUnitPrice } from "@/lib/cart"
import { formatCurrency } from "@/lib/formatters"
import { CartLineControls } from "./_components/CartLineControls"

export const dynamic = "force-dynamic"

export default async function CartPage() {
  const sessionId = await readCartSessionId()
  const items     = sessionId ? await getCartItems(sessionId) : []
  const subtotal  = calcSubtotal(items)

  if (items.length === 0) {
    return <EmptyCart />
  }

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-extrabold text-text-primary mb-6" style={{ fontSize: "clamp(22px,4vw,30px)" }}>
        Your Cart <span className="text-text-muted font-normal text-lg">({items.length} {items.length === 1 ? "item" : "items"})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Line items ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => {
            const image      = item.product.images[0]
            const unitPrice  = resolveUnitPrice(item)
            const lineTotal  = unitPrice * item.quantity
            const isLowStock = item.variant.stock <= 5 && item.variant.stock > 0

            return (
              <div key={item.id}
                className="bg-white border border-border-color rounded-md p-4 flex gap-4">

                {/* Thumbnail */}
                <Link href={`/products/${item.product.slug}`}
                  className="flex-shrink-0 relative w-20 h-20 sm:w-24 sm:h-24 rounded overflow-hidden bg-light-grey">
                  {image ? (
                    <Image src={image.url} alt={image.altText ?? item.product.name}
                      fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-light-grey" />
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`}
                    className="font-semibold text-text-primary text-sm hover:text-brand-blue transition-colors line-clamp-2 leading-snug">
                    {item.product.name}
                  </Link>

                  {item.product.brand && (
                    <p className="text-text-muted text-xs mt-0.5">{item.product.brand.name}</p>
                  )}

                  {/* Variant details */}
                  <div className="flex gap-3 mt-1">
                    {item.variant.size  && <span className="text-xs text-text-secondary bg-light-grey px-2 py-0.5 rounded">{item.variant.size}</span>}
                    {item.variant.color && <span className="text-xs text-text-secondary bg-light-grey px-2 py-0.5 rounded">{item.variant.color}</span>}
                  </div>

                  {isLowStock && (
                    <p className="text-brand-gold text-xs mt-1 font-medium">
                      Only {item.variant.stock} left!
                    </p>
                  )}

                  {/* Price + controls (mobile: stacked, desktop: side by side) */}
                  <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
                    <CartLineControls
                      cartItemId={item.id}
                      quantity={item.quantity}
                      maxStock={item.variant.stock}
                    />

                    <div className="text-right">
                      {item.quantity > 1 && (
                        <p className="text-xs text-text-muted">{formatCurrency(unitPrice / 100)} each</p>
                      )}
                      <p className="font-bold text-text-primary">{formatCurrency(lineTotal / 100)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Order summary ─────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border-color rounded-md p-5 sticky top-4">
            <h2 className="font-bold text-text-primary mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal ({items.reduce((n, i) => n + i.quantity, 0)} items)</span>
                <span>{formatCurrency(subtotal / 100)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-border-color pt-3 mb-4 flex justify-between font-bold text-text-primary">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal / 100)}</span>
            </div>

            {/* Trust line */}
            <p className="text-xs text-text-muted flex items-center gap-1.5 mb-4">
              <Tag className="w-3.5 h-3.5 flex-shrink-0" />
              Free delivery on orders over R800 in Gauteng & Eastern Cape
            </p>

            <Link href="/checkout"
              className="w-full bg-brand-blue text-white font-bold py-3.5 rounded-sm text-sm flex items-center justify-center gap-2 hover:bg-brand-blue-dark transition-colors button-hover">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <Link href="/products"
              className="block text-center text-brand-blue text-sm mt-3 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-16 text-center">
      <ShoppingCart className="w-16 h-16 text-light-grey mx-auto mb-4" />
      <h1 className="font-bold text-text-primary text-2xl mb-2">Your cart is empty</h1>
      <p className="text-text-muted mb-6">Looks like you haven't added anything yet.</p>
      <Link href="/products"
        className="inline-flex items-center gap-2 bg-brand-blue text-white font-semibold px-6 py-3 rounded-sm hover:bg-brand-blue-dark transition-colors">
        Shop Now <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
