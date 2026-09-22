"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { deleteCategory } from "../../_actions/categories"

export function DeleteCategoryButton({ id, disabled }: { id: string; disabled: boolean }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <button
      title={disabled ? "Has products or sub-categories" : "Delete category"}
      disabled={disabled || isPending}
      onClick={() =>
        startTransition(async () => {
          await deleteCategory(id)
          router.refresh()
        })
      }
      className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-brand-red transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
