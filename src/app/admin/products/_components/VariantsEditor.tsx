"use client"

import { useState, useId } from "react"
import { PlusCircle, Trash2, ChevronDown } from "lucide-react"
import { slugify } from "@/lib/formatters"

export type Variant = {
  id?:          string   // DB id — present when editing existing variant
  sku:          string
  size:         string
  color:        string
  stock:        number
  priceInCents: string   // empty string = use product price
  sortOrder:    number
  isActive:     boolean
}

type SizePreset = {
  label:   string
  sizes:   string[]
  hint:    string
}

const SIZE_PRESETS: SizePreset[] = [
  { label: "Men's shoe sizes",   sizes: ["UK 6","UK 7","UK 8","UK 9","UK 10","UK 11","UK 12"], hint: "UK 6–12" },
  { label: "Ladies' shoe sizes", sizes: ["UK 3","UK 4","UK 5","UK 6","UK 7","UK 8"],           hint: "UK 3–8" },
  { label: "Clothing sizes",     sizes: ["XS","S","M","L","XL","XXL"],                          hint: "XS–XXL" },
  { label: "Hockey stick sizes", sizes: ["36.5\"", "37.5\""],                                   hint: "36.5 / 37.5" },
]

function generateSku(skuPrefix: string, size: string, index: number): string {
  const base = skuPrefix.trim()
    ? skuPrefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, "-")
    : `VAR`
  const sizeTag = size.replace(/[^A-Z0-9]/gi, "").toUpperCase() || String(index + 1)
  return `${base}-${sizeTag}`
}

type Props = {
  initialVariants?: Variant[]
  skuPrefix?:       string      // passed from the product name field via parent
}

export function VariantsEditor({ initialVariants = [], skuPrefix = "" }: Props) {
  const uid = useId()
  const [variants, setVariants] = useState<Variant[]>(initialVariants)
  const [showPresets, setShowPresets] = useState(false)

  function addBlank() {
    setVariants(prev => [
      ...prev,
      { sku: generateSku(skuPrefix, "", prev.length), size: "", color: "", stock: 0, priceInCents: "", sortOrder: prev.length, isActive: true },
    ])
  }

  function applyPreset(preset: SizePreset) {
    const existing = new Set(variants.map(v => v.size))
    const newRows: Variant[] = preset.sizes
      .filter(s => !existing.has(s))
      .map((size, i) => ({
        sku:          generateSku(skuPrefix, size, variants.length + i),
        size,
        color:        variants[0]?.color ?? "",  // inherit colour from first row
        stock:        0,
        priceInCents: "",
        sortOrder:    variants.length + i,
        isActive:     true,
      }))
    setVariants(prev => [...prev, ...newRows])
    setShowPresets(false)
  }

  function update(index: number, field: keyof Variant, value: string | number | boolean) {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  function remove(index: number) {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  const hasVariants = variants.length > 0

  return (
    <div className="space-y-3">
      {/* Hidden input serialises all variants for the server action */}
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />

      {/* Table */}
      {hasVariants && (
        <div className="border border-border-color rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-light-grey text-text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2 text-left">SKU</th>
                <th className="px-3 py-2 text-left">Size</th>
                <th className="px-3 py-2 text-left">Colour</th>
                <th className="px-3 py-2 text-right w-20">Stock</th>
                <th className="px-3 py-2 text-right w-28">Price override</th>
                <th className="px-3 py-2 text-center w-12">On</th>
                <th className="px-3 py-2 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {variants.map((v, i) => (
                <tr key={`${uid}-${i}`} className={v.isActive ? "" : "opacity-50"}>
                  <td className="px-3 py-1.5">
                    <input value={v.sku}
                      onChange={e => update(i, "sku", e.target.value)}
                      className="input-base py-1 text-xs font-mono w-full min-w-[120px]"
                      placeholder="SKU-001" />
                  </td>
                  <td className="px-3 py-1.5">
                    <input value={v.size}
                      onChange={e => update(i, "size", e.target.value)}
                      className="input-base py-1 text-xs w-full min-w-[70px]"
                      placeholder="UK 9" />
                  </td>
                  <td className="px-3 py-1.5">
                    <input value={v.color}
                      onChange={e => update(i, "color", e.target.value)}
                      className="input-base py-1 text-xs w-full min-w-[100px]"
                      placeholder="Cloud White" />
                  </td>
                  <td className="px-3 py-1.5">
                    <input type="number" min={0} value={v.stock}
                      onChange={e => update(i, "stock", Number(e.target.value))}
                      className="input-base py-1 text-xs text-right w-full" />
                  </td>
                  <td className="px-3 py-1.5">
                    <input type="number" min={0} value={v.priceInCents}
                      onChange={e => update(i, "priceInCents", e.target.value)}
                      placeholder="— inherit —"
                      className="input-base py-1 text-xs text-right w-full" />
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    <input type="checkbox" checked={v.isActive}
                      onChange={e => update(i, "isActive", e.target.checked)}
                      className="w-4 h-4 accent-brand-blue" />
                  </td>
                  <td className="px-3 py-1.5">
                    <button type="button" onClick={() => remove(i)}
                      className="p-1 text-text-muted hover:text-brand-red transition-colors rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!hasVariants && (
        <p className="text-sm text-text-muted bg-light-grey rounded-md px-4 py-3">
          No variants yet. Use a preset or add a row manually.
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {/* Preset dropdown */}
        <div className="relative">
          <button type="button"
            onClick={() => setShowPresets(s => !s)}
            className="flex items-center gap-1.5 text-sm border border-border-color bg-white px-3 py-1.5 rounded-sm hover:bg-light-grey transition-colors font-medium text-text-secondary">
            Add sizes by preset
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPresets ? "rotate-180" : ""}`} />
          </button>
          {showPresets && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-border-color rounded-md shadow-md z-20 w-52 py-1">
              {SIZE_PRESETS.map(preset => (
                <button key={preset.label} type="button"
                  onClick={() => applyPreset(preset)}
                  className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-light-grey transition-colors">
                  <span className="font-medium">{preset.label}</span>
                  <span className="text-text-muted text-xs block">{preset.hint}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" onClick={addBlank}
          className="flex items-center gap-1.5 text-sm border border-border-color bg-white px-3 py-1.5 rounded-sm hover:bg-light-grey transition-colors text-text-secondary">
          <PlusCircle className="w-3.5 h-3.5" /> Add row manually
        </button>
      </div>

      <p className="text-xs text-text-muted">
        Stock = 0 means out of stock. Price override is in Rand cents — leave blank to use the product base price.
      </p>
    </div>
  )
}
