// tests/unit/lib/formatters.test.ts
import { describe, it, expect } from "vitest"
import { formatCurrency, formatNumber, slugify } from "@/lib/formatters"

describe("formatCurrency", () => {
  it("formats rand cents to ZAR string", () => {
    expect(formatCurrency(100000)).toMatch(/R/)   // R 1 000 or R1,000
    expect(formatCurrency(100000)).toContain("1")
  })

  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toMatch(/R/)
  })

  it("handles large amounts", () => {
    const result = formatCurrency(440000)  // R4,400
    expect(result).toContain("4")
    expect(result).toContain("4")
  })

  it("does not include cents for whole rand amounts", () => {
    const result = formatCurrency(100000)  // R1,000 not R1,000.00
    expect(result).not.toContain(".00")
  })
})

describe("formatNumber", () => {
  it("formats integers with locale separators", () => {
    const result = formatNumber(1000)
    expect(result).toMatch(/1.000|1,000/)  // SA uses space or comma
  })

  it("handles zero", () => {
    expect(formatNumber(0)).toBe("0")
  })
})

describe("slugify", () => {
  it("lowercases input", () => {
    expect(slugify("Running Shoes")).toBe("running-shoes")
  })

  it("replaces spaces with hyphens", () => {
    expect(slugify("adidas boston 13")).toBe("adidas-boston-13")
  })

  it("removes special characters", () => {
    expect(slugify("be quiet!")).toBe("be-quiet")
  })

  it("collapses multiple spaces or hyphens", () => {
    expect(slugify("men's  running")).toBe("men-s-running")
  })

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  hello  ")).toBe("hello")
  })

  it("handles already-slugified input", () => {
    expect(slugify("adidas-boston-13")).toBe("adidas-boston-13")
  })
})
