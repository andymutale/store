"use client"
// src/app/admin/products/_components/ProductMenuItems.tsx

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Power, Trash2 } from "lucide-react"
import { toggleProductAvailability, deleteProduct } from "../../_actions/products"

export function ActiveToggleItem({ id, isAvailableForPurchase }: { id: string; isAvailableForPurchase: boolean }) {
  const [isPending, start] = useTransition()
  const router = useRouter()
  return (
    <button
      title={isAvailableForPurchase ? "Deactivate" : "Activate"}
      disabled={isPending}
      onClick={() => start(async () => { await toggleProductAvailability(id, !isAvailableForPurchase); router.refresh() })}
      className={`p-1 rounded transition-colors disabled:opacity-50 ${isAvailableForPurchase ? "text-brand-green hover:bg-green-50" : "text-text-muted hover:bg-light-grey"}`}>
      <Power className="w-3.5 h-3.5" />
    </button>
  )
}

export function DeleteItem({ id, disabled }: { id: string; disabled: boolean }) {
  const [isPending, start] = useTransition()
  const router = useRouter()
  return (
    <button
      title={disabled ? "Has order history — cannot delete" : "Delete product"}
      disabled={disabled || isPending}
      onClick={() => start(async () => { await deleteProduct(id); router.refresh() })}
      className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-brand-red transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
