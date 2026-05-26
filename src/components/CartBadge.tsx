// src/components/CartBadge.tsx
// Server component — rendered in (customerFacing)/layout.tsx alongside <Header>.
// Reads the cart session cookie and queries the DB count server-side,
// so the badge is always accurate on page load without client-side fetch.

import { readCartSessionId, getCartCount } from "@/lib/cart"

export async function CartBadge() {
  const sessionId = await readCartSessionId()
  const count     = sessionId ? await getCartCount(sessionId) : 0

  if (count === 0) return null

  return (
    <span
      aria-label={`${count} items in cart`}
      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-brand-gold text-white
                 text-[10px] font-extrabold rounded-full flex items-center justify-center
                 px-1 leading-none pointer-events-none select-none">
      {count > 99 ? "99+" : count}
    </span>
  )
}
