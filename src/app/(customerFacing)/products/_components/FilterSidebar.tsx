"use client"
// src/app/(customerFacing)/products/_components/FilterSidebar.tsx

import { useRouter, usePathname } from "next/navigation"
import { X } from "lucide-react"

const SPORTS = [
  { value: "running",  label: "Running" },
  { value: "tennis",   label: "Tennis" },
  { value: "football", label: "Football" },
  { value: "hockey",   label: "Hockey" },
  { value: "netball",  label: "Netball" },
  { value: "general",  label: "Other" },
]

const GENDERS = [
  { value: "men",    label: "Men's" },
  { value: "women",  label: "Women's" },
  { value: "unisex", label: "Unisex" },
  { value: "youth",  label: "Youth" },
]

type Props = {
  brands:        { slug: string; name: string }[]
  currentSport?: string
  currentGender?: string
  currentBrand?: string
  currentSort?:  string
  currentQ?:     string
}

export function FilterSidebar({ brands, currentSport, currentGender, currentBrand, currentQ, currentSort }: Props) {
  const router   = useRouter()
  const pathname = usePathname()

  function buildUrl(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged = { q: currentQ, sport: currentSport, gender: currentGender, brand: currentBrand, sort: currentSort, ...patch }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    return `${pathname}?${params.toString()}`
  }

  function toggle(key: string, value: string, current?: string) {
    router.push(buildUrl({ [key]: current === value ? undefined : value }))
  }

  const hasFilters = !!(currentSport || currentGender || currentBrand || currentQ)

  return (
    <div className="bg-white border border-border-color rounded-md overflow-hidden sticky top-4">

      {/* Clear all */}
      {hasFilters && (
        <div className="px-4 py-2.5 border-b border-border-color">
          <button onClick={() => router.push(pathname)}
            className="flex items-center gap-1.5 text-xs text-brand-red font-medium hover:underline">
            <X className="w-3 h-3" /> Clear all filters
          </button>
        </div>
      )}

      {/* Sport */}
      <FilterGroup title="Sport">
        {SPORTS.map(s => (
          <Chip key={s.value} label={s.label} active={currentSport === s.value}
            onClick={() => toggle("sport", s.value, currentSport)} />
        ))}
      </FilterGroup>

      {/* Gender */}
      <FilterGroup title="Gender">
        {GENDERS.map(g => (
          <Chip key={g.value} label={g.label} active={currentGender === g.value}
            onClick={() => toggle("gender", g.value, currentGender)} />
        ))}
      </FilterGroup>

      {/* Brand */}
      <FilterGroup title="Brand">
        {brands.map(b => (
          <Chip key={b.slug} label={b.name} active={currentBrand === b.slug}
            onClick={() => toggle("brand", b.slug, currentBrand)} />
        ))}
      </FilterGroup>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-border-color last:border-0">
      <p className="text-xs font-bold text-text-primary uppercase tracking-wide mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-full border transition-colors font-medium
        ${active
          ? "bg-brand-blue text-white border-brand-blue"
          : "bg-white text-text-secondary border-border-color hover:border-brand-blue hover:text-brand-blue"}`}>
      {label}
    </button>
  )
}
