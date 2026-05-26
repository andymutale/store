// ─── FORMATTERS ───────────────────────────────────────────────────────────────
// Always pass prices in RAND CENTS. Divide by 100 before calling formatCurrency.
// e.g. formatCurrency(264000 / 100) → "R 2,640"

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-ZA", {
  currency: "ZAR",
  style: "currency",
  minimumFractionDigits: 0,
})

export function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount)
}

const NUMBER_FORMATTER = new Intl.NumberFormat("en-ZA")

export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number)
}

// Slugify a string for use in URLs
export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
