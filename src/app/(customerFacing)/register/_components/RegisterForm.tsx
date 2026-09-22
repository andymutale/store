"use client"
// src/app/(customerFacing)/register/_components/RegisterForm.tsx

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { register } from "@/app/_actions/auth"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

type Errors = Partial<Record<"firstName" | "lastName" | "email" | "password" | "confirm" | "_form", string[]>>

export function RegisterForm() {
  const [errors, formAction] = useActionState(register, {} as Errors)
  const [showPw, setShowPw]   = useState(false)

  return (
    <form action={formAction} className="space-y-4">
      {errors._form && (
        <div className="bg-red-50 border border-brand-red text-brand-red rounded-sm px-3 py-2 text-sm">
          {errors._form[0]}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" error={errors.firstName}>
          <input name="firstName" type="text" required autoComplete="given-name"
            placeholder="Thabo" className="input-base" />
        </Field>
        <Field label="Last name" error={errors.lastName}>
          <input name="lastName" type="text" required autoComplete="family-name"
            placeholder="Nkosi" className="input-base" />
        </Field>
      </div>

      <Field label="Email address" error={errors.email}>
        <input name="email" type="email" required autoComplete="email"
          placeholder="you@example.com" className="input-base" />
      </Field>

      <Field label="Password" error={errors.password}
        hint="Minimum 8 characters">
        <div className="relative">
          <input name="password" type={showPw ? "text" : "password"} required
            autoComplete="new-password" placeholder="••••••••" className="input-base pr-10" />
          <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </Field>

      <Field label="Confirm password" error={errors.confirm}>
        <input name="confirm" type={showPw ? "text" : "password"} required
          autoComplete="new-password" placeholder="••••••••" className="input-base" />
      </Field>

      <p className="text-xs text-text-muted">
        By creating an account you agree to our{" "}
        <a href="/terms" className="text-brand-blue hover:underline">Terms</a> and{" "}
        <a href="/privacy" className="text-brand-blue hover:underline">Privacy Policy</a>.
      </p>

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="w-full bg-brand-blue text-white font-bold py-3 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors disabled:opacity-50">
      {pending ? "Creating account…" : "Create Account"}
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
