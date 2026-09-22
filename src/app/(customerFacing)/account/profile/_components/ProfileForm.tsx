"use client"
// src/app/(customerFacing)/account/profile/_components/ProfileForm.tsx

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { updateProfile } from "@/app/_actions/account"
import type { CurrentUser } from "@/lib/auth"

type Errors = Partial<Record<"firstName" | "lastName" | "phone", string[]>>

export function ProfileForm({ user }: { user: CurrentUser }) {
  const [errors, formAction] = useActionState(updateProfile, {} as Errors)

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" error={errors.firstName}>
          <input name="firstName" type="text" required defaultValue={user.firstName ?? ""}
            className="input-base" />
        </Field>
        <Field label="Last name" error={errors.lastName}>
          <input name="lastName" type="text" required defaultValue={user.lastName ?? ""}
            className="input-base" />
        </Field>
      </div>
      <Field label="Phone number" error={errors.phone}>
        <input name="phone" type="tel" defaultValue={user.phone ?? ""}
          placeholder="0XX XXX XXXX" className="input-base" />
      </Field>
      <SaveButton />
    </form>
  )
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="bg-brand-blue text-white font-semibold px-5 py-2.5 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors disabled:opacity-50">
      {pending ? "Saving…" : "Save changes"}
    </button>
  )
}

function Field({ label, error, children }: { label: string; error?: string[]; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-text-primary">{label}</label>
      {children}
      {error && <p className="text-brand-red text-xs">{error[0]}</p>}
    </div>
  )
}
