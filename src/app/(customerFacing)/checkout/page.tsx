// src/app/(customerFacing)/checkout/page.tsx
import { redirect } from "next/navigation"
import { readCartSessionId, getCartItems, calcSubtotal, resolveUnitPrice } from "@/lib/cart"
import db from "@/lib/db"
import { CheckoutForm } from "./_components/CheckoutForm"

export const dynamic = "force-dynamic"

export default async function CheckoutPage() {
  // Redirect to cart if empty
  const sessionId = await readCartSessionId()
  if (!sessionId) redirect("/cart")

  const items = await getCartItems(sessionId)
  if (items.length === 0) redirect("/cart")

  // Load shipping zones + rates for the province selector
  const shippingZones = await db.shippingZone.findMany({
    where:   { isActive: true },
    include: { rates: { where: { isActive: true }, orderBy: { priceInCents: "asc" } } },
    orderBy: { name: "asc" },
  })

  // Shape cart for the client (serialisable — no Prisma model methods)
  const cartLines = items.map(item => ({
    id:              item.id,
    quantity:        item.quantity,
    productName:     item.product.name,
    brandName:       item.product.brand?.name ?? null,
    size:            item.variant.size,
    color:           item.variant.color,
    imageUrl:        item.product.images[0]?.url ?? null,
    imageAlt:        item.product.images[0]?.altText ?? item.product.name,
    unitPriceInCents: resolveUnitPrice(item),
    lineTotalInCents: resolveUnitPrice(item) * item.quantity,
  }))

  const subtotalInCents = calcSubtotal(items)

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-text-muted mb-6 flex gap-1">
        <span>Cart</span>
        <span>/</span>
        <span className="text-text-primary font-medium">Checkout</span>
      </nav>

      <CheckoutForm
        cartLines={cartLines}
        subtotalInCents={subtotalInCents}
        shippingZones={shippingZones.map(z => ({
          id:        z.id,
          name:      z.name,
          provinces: z.provinces.split(",").map(p => p.trim()),
          rates:     z.rates.map(r => ({
            id:             r.id,
            name:           r.name,
            priceInCents:   r.priceInCents,
            freeThreshold:  r.freeThreshold,
            estimatedDays:  r.estimatedDays,
          })),
        }))}
      />
    </div>
  )
}
