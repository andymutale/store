"use client"
// src/app/(customerFacing)/account/profile/_components/PasswordForm.tsx

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { changePassword } from "@/app/_actions/account"
import { CheckCircle2 } from "lucide-react"

type Errors = Partial<Record<"current" | "next" | "confirm" | "_form", string[]>>

export function PasswordForm() {
  const [errors, formAction] = useActionState(changePassword, {} as Errors)
  const saved = Object.keys(errors).length === 0 && (errors as { _success?: boolean })._success

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      {errors._form && (
        <div className="bg-red-50 border border-brand-red text-brand-red rounded-sm px-3 py-2 text-sm">
          {errors._form[0]}
        </div>
      )}

      <Field label="Current password" error={errors.current}>
        <input name="current" type="password" required autoComplete="current-password"
          placeholder="••••••••" className="input-base" />
      </Field>
      <Field label="New password" hint="Minimum 8 characters" error={errors.next}>
        <input name="next" type="password" required autoComplete="new-password"
          placeholder="••••••••" className="input-base" />
      </Field>
      <Field label="Confirm new password" error={errors.confirm}>
        <input name="confirm" type="password" required autoComplete="new-password"
          placeholder="••••••••" className="input-base" />
      </Field>

      <SaveButton label="Change password" />
    </form>
  )
}

// ─── SHARED ACROSS PROFILE FORMS ─────────────────────────────────────────────

export function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="bg-brand-blue text-white font-semibold px-5 py-2.5 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors disabled:opacity-50">
      {pending ? "Saving…" : label}
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
