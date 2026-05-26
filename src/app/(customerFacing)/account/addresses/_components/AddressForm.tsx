"use client"
// src/app/(customerFacing)/account/addresses/_components/AddressForm.tsx

import { useActionState } from "react"
import { useFormStatus } from "react-dom"

const SA_PROVINCES = [
  { code: "EC",  name: "Eastern Cape" },  { code: "FS",  name: "Free State" },
  { code: "GP",  name: "Gauteng" },       { code: "KZN", name: "KwaZulu-Natal" },
  { code: "LP",  name: "Limpopo" },       { code: "MP",  name: "Mpumalanga" },
  { code: "NC",  name: "Northern Cape" }, { code: "NW",  name: "North West" },
  { code: "WC",  name: "Western Cape" },
]

type Errors = Record<string, string[] | undefined>

export function AddressForm({
  action,
  address,
}: {
  action: (prev: Errors, fd: FormData) => Promise<Errors>
  address?: {
    label?: string | null; firstName: string; lastName: string; company?: string | null
    line1: string; line2?: string | null; city: string; province: string
    postalCode: string; phone?: string | null; isDefault: boolean
  }
}) {
  const [errors, formAction] = useActionState(action, {} as Errors)
  const e = errors

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" error={e.firstName}>
          <input name="firstName" required defaultValue={address?.firstName} className="input-base" />
        </Field>
        <Field label="Last name" error={e.lastName}>
          <input name="lastName" required defaultValue={address?.lastName} className="input-base" />
        </Field>
      </div>

      <Field label="Label (optional)" hint='e.g. "Home" or "Work"'>
        <input name="label" defaultValue={address?.label ?? ""} placeholder="Home" className="input-base" />
      </Field>

      <Field label="Company (optional)">
        <input name="company" defaultValue={address?.company ?? ""} className="input-base" />
      </Field>

      <Field label="Street address" error={e.line1}>
        <input name="line1" required defaultValue={address?.line1} placeholder="12 Main Road" className="input-base" />
      </Field>

      <Field label="Apartment, unit (optional)">
        <input name="line2" defaultValue={address?.line2 ?? ""} className="input-base" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="City" error={e.city}>
          <input name="city" required defaultValue={address?.city} placeholder="Gqeberha" className="input-base" />
        </Field>
        <Field label="Province" error={e.province}>
          <select name="province" required defaultValue={address?.province ?? ""} className="input-base">
            <option value="">— Select —</option>
            {SA_PROVINCES.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Postal code" error={e.postalCode}>
          <input name="postalCode" required defaultValue={address?.postalCode} placeholder="6001" className="input-base" />
        </Field>
        <Field label="Phone (optional)">
          <input name="phone" type="tel" defaultValue={address?.phone ?? ""} placeholder="0XX XXX XXXX" className="input-base" />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer select-none">
        <input name="isDefault" type="checkbox" defaultChecked={address?.isDefault ?? false}
          className="w-4 h-4 accent-brand-blue" />
        Set as default delivery address
      </label>

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="bg-brand-blue text-white font-semibold px-5 py-2.5 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors disabled:opacity-50">
      {pending ? "Saving…" : "Save Address"}
    </button>
  )
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string[]; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-text-primary">{label}</label>
      {children}
      {hint  && !error && <p className="text-text-muted text-xs">{hint}</p>}
      {error && <p className="text-brand-red text-xs">{error[0]}</p>}
    </div>
  )
}
