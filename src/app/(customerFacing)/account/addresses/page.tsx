// src/app/(customerFacing)/account/addresses/page.tsx
import { requireUser } from "@/lib/auth"
import db from "@/lib/db"
import { Star } from "lucide-react"
import { AddressForm } from "./_components/AddressForm"
import { AddressActions } from "./_components/AddressActions"
import { addAddress } from "@/app/_actions/account"

const SA_PROVINCES: Record<string, string> = {
  EC: "Eastern Cape", FS: "Free State", GP: "Gauteng",
  KZN: "KwaZulu-Natal", LP: "Limpopo", MP: "Mpumalanga",
  NC: "Northern Cape", NW: "North West", WC: "Western Cape",
}

export default async function AddressesPage() {
  const user      = await requireUser()
  const addresses = await db.address.findMany({
    where:   { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  })

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-text-primary">Saved Addresses</h2>

      {/* Existing addresses */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id}
              className={`bg-white border rounded-md p-4 ${addr.isDefault ? "border-brand-blue" : "border-border-color"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue mb-1.5">
                      <Star className="w-3 h-3 fill-current" /> Default address
                    </span>
                  )}
                  {addr.label && <p className="text-xs text-text-muted mb-0.5 font-semibold uppercase tracking-wide">{addr.label}</p>}
                  <address className="not-italic text-sm text-text-secondary leading-relaxed">
                    <strong className="text-text-primary">{addr.firstName} {addr.lastName}</strong>
                    {addr.company && <><br />{addr.company}</>}
                    <br />{addr.line1}
                    {addr.line2 && <><br />{addr.line2}</>}
                    <br />{addr.city}, {SA_PROVINCES[addr.province] ?? addr.province} {addr.postalCode}
                    {addr.phone && <><br />📞 {addr.phone}</>}
                  </address>
                </div>
                <AddressActions id={addr.id} isDefault={addr.isDefault} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new address */}
      <div className="bg-white border border-border-color rounded-md p-5">
        <h3 className="font-semibold text-text-primary text-sm mb-4 pb-2 border-b border-border-color">
          {addresses.length === 0 ? "Add your first address" : "Add new address"}
        </h3>
        <AddressForm action={addAddress} />
      </div>
    </div>
  )
}
