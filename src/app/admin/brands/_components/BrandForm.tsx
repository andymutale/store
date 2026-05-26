"use client"
// src/app/admin/brands/_components/BrandForm.tsx

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { slugify } from "@/lib/formatters"

type Brand = {
  id: string; name: string; slug: string
  description?: string | null; websiteUrl?: string | null; isActive: boolean
}
type Errors = Record<string, string[] | undefined>

export function BrandForm({ brand, action }: { brand?: Brand | null; action: (p: unknown, f: FormData) => Promise<unknown> }) {
  const [errors, formAction] = useActionState(action, {} as Errors)
  const e = errors as Errors

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      <Field label="Brand name" error={e?.name}>
        <input name="name" type="text" required defaultValue={brand?.name}
          onBlur={ev => {
            const s = document.getElementById("slug") as HTMLInputElement
            if (s && !s.value) s.value = slugify(ev.target.value)
          }}
          className="input-base" />
      </Field>

      <Field label="Slug" hint="Lowercase letters, numbers, hyphens only." error={e?.slug}>
        <input id="slug" name="slug" type="text" defaultValue={brand?.slug}
          pattern="[a-z0-9-]+" className="input-base font-mono text-sm" />
      </Field>

      <Field label="Website URL" hint="Optional — e.g. https://www.adidas.com/za" error={e?.websiteUrl}>
        <input name="websiteUrl" type="url" defaultValue={brand?.websiteUrl ?? ""}
          className="input-base" />
      </Field>

      <Field label="Description" hint="Optional short blurb for the brand page.">
        <textarea name="description" rows={3} defaultValue={brand?.description ?? ""}
          className="input-base resize-none" />
      </Field>

      <label className="flex items-center gap-2 text-sm font-medium text-text-primary cursor-pointer select-none">
        <input name="isActive" type="checkbox" defaultChecked={brand?.isActive ?? true}
          className="w-4 h-4 accent-brand-blue" />
        Active
      </label>

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="bg-brand-blue text-white font-semibold px-6 py-2 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors disabled:opacity-50">
      {pending ? "Saving…" : "Save Brand"}
    </button>
  )
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string[]; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-text-primary">{label}</label>
      {children}
      {hint  && <p className="text-text-muted text-xs">{hint}</p>}
      {error && <p className="text-brand-red text-xs">{error[0]}</p>}
    </div>
  )
}
