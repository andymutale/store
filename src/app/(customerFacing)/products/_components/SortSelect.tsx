"use client"
// src/app/(customerFacing)/products/_components/SortSelect.tsx

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest first" },
  { value: "price_asc",  label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name_asc",   label: "Name A–Z" },
]

type Props = {
  currentSort: string
  q?:          string
  sport?:      string
  gender?:     string
  brand?:      string
}

export function SortSelect({ currentSort, q, sport, gender, brand }: Props) {
  return (
    <form method="GET">
      {/* Preserve existing filters as hidden inputs */}
      {q      && <input type="hidden" name="q"      value={q} />}
      {sport  && <input type="hidden" name="sport"  value={sport} />}
      {gender && <input type="hidden" name="gender" value={gender} />}
      {brand  && <input type="hidden" name="brand"  value={brand} />}
      <select
        name="sort"
        defaultValue={currentSort}
        onChange={e => (e.currentTarget.form as HTMLFormElement)?.submit()}
        className="input-base text-xs w-auto py-1.5"
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </form>
  )
}