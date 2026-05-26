// tests/components/ProductCard.test.tsx
// @vitest-environment jsdom
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ProductCard } from "@/app/(customerFacing)/_components/ProductCard"

const BASE_PROPS = {
  slug:            "test-shoe",
  name:            "Adidas Boston 13",
  priceInCents:    264000,
  comparePriceInCents: null,
  shortDescription: "A great shoe",
  brand:           { name: "Adidas" },
  isFeatured:      false,
  isNew:           false,
  images:          [{ url: "/test-image.jpg", altText: "Test shoe" }],
  variants:        [{ stock: 10, isActive: true, priceInCents: null }],
}

describe("ProductCard", () => {
  it("renders the product name", () => {
    render(<ProductCard {...BASE_PROPS} />)
    expect(screen.getByText("Adidas Boston 13")).toBeInTheDocument()
  })

  it("renders the formatted price", () => {
    render(<ProductCard {...BASE_PROPS} />)
    expect(screen.getByText(/2.640|2,640/)).toBeInTheDocument()
  })

  it("renders the brand name", () => {
    render(<ProductCard {...BASE_PROPS} />)
    expect(screen.getByText("Adidas")).toBeInTheDocument()
  })

  it("links to the correct product URL", () => {
    render(<ProductCard {...BASE_PROPS} />)
    const links = screen.getAllByRole("link")
    expect(links.some(l => l.getAttribute("href") === "/products/test-shoe")).toBe(true)
  })

  it("shows NEW badge when isNew is true", () => {
    render(<ProductCard {...BASE_PROPS} isNew={true} />)
    expect(screen.getByText("NEW")).toBeInTheDocument()
  })

  it("does not show NEW badge when isNew is false", () => {
    render(<ProductCard {...BASE_PROPS} isNew={false} />)
    expect(screen.queryByText("NEW")).toBeNull()
  })

  it("shows Out of Stock when all variants have 0 stock", () => {
    render(<ProductCard {...BASE_PROPS} variants={[{ stock: 0, isActive: true, priceInCents: null }]} />)
    expect(screen.getAllByText(/out of stock/i).length).toBeGreaterThan(0)
  })

  it("shows Only N left when stock is low", () => {
    render(<ProductCard {...BASE_PROPS} variants={[{ stock: 3, isActive: true, priceInCents: null }]} />)
    expect(screen.getByText(/only 3 left/i)).toBeInTheDocument()
  })

  it("shows compare price when on sale", () => {
    render(<ProductCard {...BASE_PROPS} priceInCents={200000} comparePriceInCents={264000} />)
    // Should show both sale price and original crossed-out price
    const prices = screen.getAllByText(/\d/)
    expect(prices.length).toBeGreaterThan(1)
  })

  it("shows sale percentage badge when on sale", () => {
    render(<ProductCard {...BASE_PROPS} priceInCents={200000} comparePriceInCents={264000} />)
    expect(screen.getByText(/\d+%/)).toBeInTheDocument()
  })

  it("renders without a brand gracefully", () => {
    render(<ProductCard {...BASE_PROPS} brand={null} />)
    expect(screen.getByText("Adidas Boston 13")).toBeInTheDocument()
  })

  it("renders the short description", () => {
    render(<ProductCard {...BASE_PROPS} />)
    expect(screen.getByText("A great shoe")).toBeInTheDocument()
  })
})
