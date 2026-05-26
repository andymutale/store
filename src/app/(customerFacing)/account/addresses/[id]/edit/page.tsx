// src/app/(customerFacing)/account/addresses/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation"
import { requireUser } from "@/lib/auth"
import db from "@/lib/db"
import { updateAddress } from "@/app/_actions/account"
import { AddressForm } from "../../_components/AddressForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type Props = { params: Promise<{ id: string }> }

export default async function EditAddressPage({ params }: Props) {
  const { id } = await params
  const user    = await requireUser()

  const address = await db.address.findUnique({ where: { id } })

  // 404 or ownership check
  if (!address || address.userId !== user.id) return notFound()

  const action = updateAddress.bind(null, id)

  return (
    <div className="space-y-5">
      <Link href="/account/addresses"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to addresses
      </Link>

      <h2 className="font-bold text-text-primary">Edit Address</h2>

      <div className="bg-white border border-border-color rounded-md p-5">
        <AddressForm action={action} address={address} />
      </div>
    </div>
  )
}
