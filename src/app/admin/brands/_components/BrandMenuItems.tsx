"use client"
// src/app/admin/brands/_components/BrandMenuItems.tsx

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { deleteBrand } from "../../_actions/brands"

export function DeleteBrandButton({ id, disabled }: { id: string; disabled: boolean }) {
  const [isPending, start] = useTransition()
  const router = useRouter()
  return (
    <button title={disabled ? "Has products" : "Delete brand"}
      disabled={disabled || isPending}
      onClick={() => start(async () => { await deleteBrand(id); router.refresh() })}
      className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-brand-red transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
