"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { slugify } from "@/lib/formatters"

type Category = {
  id: string
  name: string
  slug: string
  description?: string | null
  parentId?: string | null
  sortOrder: number
  isActive: boolean
}

type Props = {
  category?: Category | null
  parents: { id: string; name: string }[] // top-level categories (for parent dropdown)
  action: (prevState: unknown, formData: FormData) => Promise<unknown>
}

export function CategoryForm({ category, parents, action }: Props) {
  const [errors, formAction] = useActionState(action, {})

  return (
    <form action={formAction} className="space-y-5 max-w-lg">

      <Field label="Name" error={(errors as Record<string, string[]>)?.name}>
        <input id="name" name="name" type="text" required
          defaultValue={category?.name}
          onBlur={e => {
            const slugInput = document.getElementById("slug") as HTMLInputElement
            if (slugInput && !slugInput.value) slugInput.value = slugify(e.target.value)
          }}
          className="input-base" />
      </Field>

      <Field label="Slug" hint="Auto-generated from name. Used in URLs — lowercase letters, numbers, hyphens only."
        error={(errors as Record<string, string[]>)?.slug}>
        <input id="slug" name="slug" type="text"
          defaultValue={category?.slug}
          pattern="[a-z0-9-]+"
          className="input-base font-mono text-sm" />
      </Field>

      <Field label="Parent category" hint="Leave blank to make this a top-level category.">
        <select name="parentId" defaultValue={category?.parentId ?? ""}
          className="input-base">
          <option value="">— Top level —</option>
          {parents
            .filter(p => p.id !== category?.id) // can't be own parent
            .map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
        </select>
      </Field>

      <Field label="Description" hint="Optional — shown on the category landing page.">
        <textarea name="description" rows={3}
          defaultValue={category?.description ?? ""}
          className="input-base resize-none" />
      </Field>

      <Field label="Sort order" hint="Lower numbers appear first. Use 10, 20, 30 to leave gaps for future categories.">
        <input name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0}
          className="input-base w-24" />
      </Field>

      <label className="flex items-center gap-2 text-sm font-medium text-text-primary cursor-pointer select-none">
        <input name="isActive" type="checkbox" defaultChecked={category?.isActive ?? true}
          className="w-4 h-4 accent-brand-blue" />
        Active (visible on storefront)
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
      {pending ? "Saving…" : "Save Category"}
    </button>
  )
}

function Field({ label, hint, error, children }: {
  label: string; hint?: string; error?: string | string[]; children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-text-primary">{label}</label>
      {children}
      {hint  && <p className="text-text-muted text-xs">{hint}</p>}
      {error && <p className="text-brand-red text-xs">{Array.isArray(error) ? error[0] : error}</p>}
    </div>
  )
}
