"use client"
// src/app/(customerFacing)/login/_components/LoginForm.tsx

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { login } from "@/app/_actions/auth"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

type Errors = Partial<Record<"email" | "password" | "_form", string[]>>

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [errors, formAction] = useActionState(login, {} as Errors)
  const [showPw, setShowPw]   = useState(false)

  return (
    <form action={formAction} className="space-y-4">
      {/* Hidden redirect field */}
      {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

      {/* Global error */}
      {errors._form && (
        <div className="bg-red-50 border border-brand-red text-brand-red rounded-sm px-3 py-2 text-sm">
          {errors._form[0]}
        </div>
      )}

      <Field label="Email address" error={errors.email}>
        <input name="email" type="email" required autoComplete="email"
          placeholder="you@example.com" className="input-base" />
      </Field>

      <Field label="Password" error={errors.password}>
        <div className="relative">
          <input name="password" type={showPw ? "text" : "password"} required
            autoComplete="current-password" placeholder="••••••••"
            className="input-base pr-10" />
          <button type="button" tabIndex={-1}
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </Field>

      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-xs text-brand-blue hover:underline">
          Forgot password?
        </Link>
      </div>

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="w-full bg-brand-blue text-white font-bold py-3 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
      {pending ? "Signing in…" : "Sign In"}
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
