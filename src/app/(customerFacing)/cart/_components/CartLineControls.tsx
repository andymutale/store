"use client"
// src/app/(customerFacing)/cart/_components/CartLineControls.tsx

import { useTransition } from "react"
import { Minus, Plus, Trash2, Loader2 } from "lucide-react"
import { removeFromCart, updateCartQuantity } from "@/app/_actions/cart"
import { useRouter } from "next/navigation"

type Props = {
  cartItemId: string
  quantity:   number
  maxStock:   number
}

export function CartLineControls({ cartItemId, quantity, maxStock }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function update(newQty: number) {
    startTransition(async () => {
      await updateCartQuantity(cartItemId, newQty)
      router.refresh()
    })
  }

  function remove() {
    startTransition(async () => {
      await removeFromCart(cartItemId)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2">
      {/* Quantity stepper */}
      <div className="flex items-center border border-border-color rounded-sm overflow-hidden">
        <button
          onClick={() => update(quantity - 1)}
          disabled={isPending || quantity <= 1}
          aria-label="Decrease quantity"
          className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-light-grey transition-colors disabled:opacity-40">
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-text-primary border-x border-border-color">
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : quantity}
        </span>
        <button
          onClick={() => update(quantity + 1)}
          disabled={isPending || quantity >= maxStock}
          aria-label="Increase quantity"
          className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-light-grey transition-colors disabled:opacity-40">
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Remove */}
      <button
        onClick={remove}
        disabled={isPending}
        aria-label="Remove item"
        className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-brand-red hover:bg-red-50 rounded transition-colors disabled:opacity-40">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
