"use client"
// src/app/(customerFacing)/account/addresses/_components/AddressActions.tsx

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteAddress, setDefaultAddress } from "@/app/_actions/account"

import Link from "next/link"
import { Pencil, Star, Trash2 } from "lucide-react"

export function AddressActions({ id, isDefault }: { id: string; isDefault: boolean }) {
  const [isPending, start] = useTransition()
  const router = useRouter()

  return (
    <div className="flex gap-1 flex-shrink-0">
      <Link href={`/account/addresses/${id}/edit`}
        className="p-1.5 rounded text-text-muted hover:text-brand-blue hover:bg-brand-blue-light transition-colors"
        title="Edit address">
        <Pencil className="w-4 h-4" />
      </Link>
      {!isDefault && (
        <button
          title="Set as default"
          disabled={isPending}
          onClick={() => start(async () => { await setDefaultAddress(id); router.refresh() })}
          className="p-1.5 rounded text-text-muted hover:text-brand-gold hover:bg-yellow-50 transition-colors disabled:opacity-40">
          <Star className="w-4 h-4" />
        </button>
      )}
      <button
        title="Delete address"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Delete this address?")) return
          start(async () => { await deleteAddress(id); router.refresh() })
        }}
        className="p-1.5 rounded text-text-muted hover:text-brand-red hover:bg-red-50 transition-colors disabled:opacity-40">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
