"use client"

import { useState, useTransition } from "react" // ✅ Added useTransition
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Image from "next/image"
import { Trash2, Star } from "lucide-react"
import { formatCurrency, slugify } from "@/lib/formatters"
import { VariantsEditor, type Variant } from "./VariantsEditor"
import { deleteProductImage, setPrimaryImage } from "../../_actions/products"

type Category = { id: string; name: string; parentId: string | null }
type Brand    = { id: string; name: string }
type ProductImage = { id: string; url: string; altText: string | null; isPrimary: boolean }

type Product = {
  id:                    string
  name:                  string
  slug:                  string
  shortDescription?:     string | null
  description:           string
  priceInCents:          number
  comparePriceInCents?:  number | null
  categoryId:            string
  brandId?:              string | null
  gender?:               string | null
  sport?:                string | null
  sizeSystem?:           string | null
  isAvailableForPurchase: boolean
  isFeatured:            boolean
  isNew:                 boolean
  metaTitle?:            string | null
  metaDescription?:      string | null
  images:                ProductImage[]
  variants:              Variant[]
}

type Props = {
  product?:    Product | null
  categories:  Category[]
  brands:      Brand[]
  action:      (prevState: unknown, formData: FormData) => Promise<unknown>
}

type Errors = Record<string, string[] | undefined>

const GENDER_OPTIONS = [
  { value: "",        label: "— Select gender —" },
  { value: "men",     label: "Men's" },
  { value: "women",   label: "Women's" },
  { value: "unisex",  label: "Unisex" },
  { value: "youth",   label: "Youth" },
]

const SPORT_OPTIONS = [
  { value: "",          label: "— Select sport —" },
  { value: "running",   label: "Running" },
  { value: "tennis",    label: "Tennis" },
  { value: "football",  label: "Football" },
  { value: "hockey",    label: "Hockey" },
  { value: "netball",   label: "Netball" },
  { value: "cricket",   label: "Cricket" },
  { value: "general",   label: "General / Other" },
]

const SIZE_SYSTEM_OPTIONS = [
  { value: "uk_shoe",  label: "UK Shoe sizes" },
  { value: "clothing", label: "Clothing sizes (XS–XXL)" },
  { value: "none",     label: "No sizes (single variant)" },
]

export function ProductForm({ product, categories, brands, action }: Props) {
  const [errors, formAction] = useActionState(action, {} as Errors)
  const e = errors as Errors

  const [priceInCents, setPriceInCents] = useState<number | undefined>(product?.priceInCents)
  const [nameValue, setNameValue]       = useState(product?.name ?? "")
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)
  
  // ✅ Initialize transition hook for handling asynchronous server mutations
  const [isPending, startTransition] = useTransition()

  // Organise categories into parent → children for grouped select
  const topLevel = categories.filter(c => !c.parentId)
  const childrenOf = (id: string) => categories.filter(c => c.parentId === id)

  // ✅ Fixed parameter mapping and wrapped inside UI transition tracker
  function handleDeleteImage(imageId: string) {
    if (!product?.id) return

    startTransition(async () => {
      try {
        setDeletingImageId(imageId)
        await deleteProductImage(imageId)
      } catch (err) {
        console.error("Failed to remove image:", err)
      } finally {
        setDeletingImageId(null)
      }
    })
  }

  // ✅ Wrapped background data re-index modifications in structural state updates
  function handleSetPrimary(imageId: string) {
    if (!product?.id) return

    startTransition(async () => {
      try {
        await setPrimaryImage(imageId, product.id)
      } catch (err) {
        console.error("Failed to re-assign primary thumbnail index:", err)
      }
    })
  }

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">

      {/* ── SECTION: Basic info ─────────────────────────────────── */}
      <Section title="Basic information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Product name" error={e?.name} className="sm:col-span-2">
            <input name="name" type="text" required
              value={nameValue}
              onChange={e => setNameValue(e.target.value)}
              onBlur={e => {
                const slugEl = document.getElementById("slug") as HTMLInputElement
                if (slugEl && !slugEl.value) slugEl.value = slugify(e.target.value)
              }}
              className="input-base" />
          </Field>

          <Field label="Slug" hint="Auto-generated · used in the product URL" error={e?.slug}>
            <input id="slug" name="slug" type="text"
              defaultValue={product?.slug}
              pattern="[a-z0-9-]+"
              className="input-base font-mono text-sm" />
          </Field>

          <Field label="Category" error={e?.categoryId}>
            <select name="categoryId" defaultValue={product?.categoryId ?? ""}
              required className="input-base">
              <option value="">— Select category —</option>
              {topLevel.map(parent => (
                <optgroup key={parent.id} label={parent.name}>
                  {childrenOf(parent.id).map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                  {childrenOf(parent.id).length === 0 && (
                    <option value={parent.id}>{parent.name}</option>
                  )}
                </optgroup>
              ))}
            </select>
          </Field>

          <Field label="Brand">
            <select name="brandId" defaultValue={product?.brandId ?? ""}
              className="input-base">
              <option value="">— No brand —</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Gender">
            <select name="gender" defaultValue={product?.gender ?? ""}
              className="input-base">
              {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>

          <Field label="Sport">
            <select name="sport" defaultValue={product?.sport ?? ""}
              className="input-base">
              {SPORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>

          <Field label="Size system" hint="Controls which size preset buttons appear in the variant editor.">
            <select name="sizeSystem" defaultValue={product?.sizeSystem ?? "uk_shoe"}
              className="input-base">
              {SIZE_SYSTEM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      {/* ── SECTION: Pricing ────────────────────────────────────── */}
      <Section title="Pricing">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (Rand cents)" hint={`= ${formatCurrency((priceInCents ?? 0) / 100)}`} error={e?.priceInCents}>
            <input name="priceInCents" type="number" required min={1}
              value={priceInCents ?? ""}
              onChange={ev => setPriceInCents(Number(ev.target.value) || undefined)}
              className="input-base" />
          </Field>

          <Field label="Compare-at price (Rand cents)" hint='The "was" price shown crossed out. Leave blank if not on sale.'>
            <input name="comparePriceInCents" type="number" min={0}
              defaultValue={product?.comparePriceInCents ?? ""}
              className="input-base" />
          </Field>
        </div>
      </Section>

      {/* ── SECTION: Description ────────────────────────────────── */}
      <Section title="Description">
        <Field label="Short description" hint="1–2 sentences shown in product cards and meta description fallback.">
          <input name="shortDescription" type="text"
            defaultValue={product?.shortDescription ?? ""}
            className="input-base" />
        </Field>
        <Field label="Full description" error={e?.description}>
          <textarea name="description" required rows={6}
            defaultValue={product?.description}
            className="input-base resize-y" />
        </Field>
      </Section>

      {/* ── SECTION: Variants ───────────────────────────────────── */}
      <Section title="Sizes & stock" hint="Each row is one size (and optionally colour). Stock is tracked per row.">
        {e?.variants && <p className="text-brand-red text-xs mb-2">{e.variants[0]}</p>}
        <VariantsEditor
          initialVariants={product?.variants ?? []}
          skuPrefix={nameValue.toUpperCase().split(" ").slice(0, 3).join("-")}
        />
      </Section>

      {/* ── SECTION: Images ─────────────────────────────────────── */}
      <Section title="Images">
        {/* Existing images */}
        {(product?.images?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {product!.images.map(img => (
              <div key={img.id} className={`relative group border-2 rounded-md overflow-hidden ${img.isPrimary ? "border-brand-blue" : "border-border-color"}`}
                style={{ width: 100, height: 100 }}>
                <Image src={img.url} alt={img.altText ?? ""} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {!img.isPrimary && (
                    <button type="button" title="Set as primary"
                      disabled={isPending}
                      onClick={() => handleSetPrimary(img.id)}
                      className="p-1 bg-white/90 rounded text-brand-gold hover:bg-white disabled:opacity-50">
                      <Star className="w-3 h-3" />
                    </button>
                  )}
                  <button type="button" title="Delete image"
                    disabled={isPending || deletingImageId === img.id}
                    onClick={() => handleDeleteImage(img.id)}
                    className="p-1 bg-white/90 rounded text-brand-red hover:bg-white disabled:opacity-50">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                {img.isPrimary && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-white text-xs bg-brand-blue/80 py-0.5">Primary</span>
                )}
              </div>
            ))}
          </div>
        )}

        <Field label={product ? "Add more images" : "Product images"}
          hint="First image uploaded becomes the primary. Accepted: JPG, PNG, WEBP.">
          <input name="images" type="file" accept="image/*" multiple
            className="input-base py-2" />
        </Field>
      </Section>

      {/* ── SECTION: Flags ──────────────────────────────────────── */}
      <Section title="Visibility & flags">
        <div className="space-y-2">
          <CheckField name="isAvailableForPurchase" defaultChecked={product?.isAvailableForPurchase ?? false}
            label="Available for purchase" hint="Uncheck to hide from the storefront (e.g. coming soon, out of season)." />
          <CheckField name="isFeatured" defaultChecked={product?.isFeatured ?? false}
            label="Featured product" hint="Shown in the Featured section on the homepage." />
          <CheckField name="isNew" defaultChecked={product?.isNew ?? false}
            label="Mark as New" hint="Shows a 'New' badge on the product card." />
        </div>
      </Section>

      {/* ── SECTION: SEO ────────────────────────────────────────── */}
      <Section title="SEO (optional)">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Meta title" hint="Defaults to product name if blank. Max 60 characters.">
            <input name="metaTitle" type="text" maxLength={60}
              defaultValue={product?.metaTitle ?? ""}
              className="input-base" />
          </Field>
          <Field label="Meta description" hint="Defaults to short description if blank. Max 160 characters.">
            <textarea name="metaDescription" rows={2} maxLength={160}
              defaultValue={product?.metaDescription ?? ""}
              className="input-base resize-none" />
          </Field>
        </div>
      </Section>

      <SubmitButton />
    </form>
  )
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 pb-2 border-b border-border-color">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">{title}</h2>
        {hint && <p className="text-xs text-text-muted mt-0.5">{hint}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, hint, error, children, className }: {
  label: string; hint?: string; error?: string[]; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <label className="block text-sm font-semibold text-text-primary">{label}</label>
      {children}
      {hint  && <p className="text-text-muted text-xs">{hint}</p>}
      {error && <p className="text-brand-red text-xs">{error[0]}</p>}
    </div>
  )
}

function CheckField({ name, defaultChecked, label, hint }: {
  name: string; defaultChecked: boolean; label: string; hint?: string
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer select-none">
      <input name={name} type="checkbox" defaultChecked={defaultChecked}
        className="mt-0.5 w-4 h-4 accent-brand-blue flex-shrink-0" />
      <span>
        <span className="text-sm font-medium text-text-primary">{label}</span>
        {hint && <span className="block text-xs text-text-muted">{hint}</span>}
      </span>
    </label>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="bg-brand-blue text-white font-semibold px-8 py-2.5 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
      {pending ? "Saving…" : "Save Product"}
    </button>
  )
}