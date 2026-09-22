"use client"
// src/app/admin/orders/_components/OrderStatusForm.tsx

import { useState, useTransition } from "react"
import { updateOrderStatus } from "../../_actions/orders"
import { useRouter } from "next/navigation"

const STATUSES = ["pending","confirmed","processing","shipped","delivered","cancelled","refunded"]

export function OrderStatusForm({ orderId, currentStatus, currentTracking }: {
  orderId:         string
  currentStatus:   string
  currentTracking: string | null | undefined
}) {
  const [status,   setStatus]   = useState(currentStatus)
  const [tracking, setTracking] = useState(currentTracking ?? "")
  const [isPending, start]      = useTransition()
  const router = useRouter()

  function save() {
    start(async () => {
      await updateOrderStatus(orderId, status, tracking || undefined)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-1.5 min-w-[160px]">
      <select value={status} onChange={e => setStatus(e.target.value)}
        className="input-base py-1 text-xs">
        {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
      </select>

      {(status === "shipped" || currentTracking) && (
        <input value={tracking} onChange={e => setTracking(e.target.value)}
          placeholder="Tracking number"
          className="input-base py-1 text-xs" />
      )}

      <button onClick={save} disabled={isPending}
        className="bg-brand-blue text-white text-xs font-semibold px-2 py-1 rounded-sm hover:bg-brand-blue-dark transition-colors disabled:opacity-50">
        {isPending ? "Saving…" : "Save"}
      </button>
    </div>
  )
}
