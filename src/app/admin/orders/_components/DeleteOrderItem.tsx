"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteOrder } from "../../_actions/orders"

export function DeleteOrderItem({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await deleteOrder(id)
          router.refresh()
        })
      }
      className="w-full text-left px-4 py-2 text-sm text-brand-red hover:bg-red-50 disabled:opacity-50">
      Delete
    </button>
  )
}
