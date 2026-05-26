// tests/components/SizePicker.test.tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { SizePicker } from "@/app/(customerFacing)/products/[slug]/_components/ProductActions"

const VARIANTS = [
  { id: "v1", size: "UK 7",  color: null, stock: 5,  priceInCents: null, isActive: true },
  { id: "v2", size: "UK 8",  color: null, stock: 0,  priceInCents: null, isActive: true },
  { id: "v3", size: "UK 9",  color: null, stock: 10, priceInCents: null, isActive: true },
  { id: "v4", size: "UK 10", color: null, stock: 2,  priceInCents: null, isActive: true },
]

describe("SizePicker", () => {
  it("renders all available sizes", () => {
    render(<SizePicker variants={VARIANTS} selected={null} onSelect={vi.fn()} basePrice={100000} />)
    expect(screen.getByText("UK 7")).toBeInTheDocument()
    expect(screen.getByText("UK 8")).toBeInTheDocument()
    expect(screen.getByText("UK 9")).toBeInTheDocument()
    expect(screen.getByText("UK 10")).toBeInTheDocument()
  })

  it("calls onSelect with the correct variant when a size is clicked", () => {
    const onSelect = vi.fn()
    render(<SizePicker variants={VARIANTS} selected={null} onSelect={onSelect} basePrice={100000} />)
    fireEvent.click(screen.getByText("UK 9"))
    expect(onSelect).toHaveBeenCalledWith(VARIANTS[2])
  })

  it("disables out-of-stock sizes", () => {
    render(<SizePicker variants={VARIANTS} selected={null} onSelect={vi.fn()} basePrice={100000} />)
    const uk8 = screen.getByText("UK 8").closest("button")
    expect(uk8).toBeDisabled()
  })

  it("does not call onSelect when an out-of-stock size is clicked", () => {
    const onSelect = vi.fn()
    render(<SizePicker variants={VARIANTS} selected={null} onSelect={onSelect} basePrice={100000} />)
    fireEvent.click(screen.getByText("UK 8"))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it("shows a low-stock warning when selected variant has ≤5 stock", () => {
    render(<SizePicker variants={VARIANTS} selected={VARIANTS[3]} onSelect={vi.fn()} basePrice={100000} />)
    expect(screen.getByText(/only 2 left/i)).toBeInTheDocument()
  })

  it("does not show a low-stock warning when stock > 5", () => {
    render(<SizePicker variants={VARIANTS} selected={VARIANTS[2]} onSelect={vi.fn()} basePrice={100000} />)
    expect(screen.queryByText(/left/i)).toBeNull()
  })

  it("shows the selected size label", () => {
    render(<SizePicker variants={VARIANTS} selected={VARIANTS[0]} onSelect={vi.fn()} basePrice={100000} />)
    expect(screen.getByText("UK 7", { selector: ".text-text-secondary" })).toBeInTheDocument()
  })

  it("returns null when there are no size or color variants", () => {
    const noSizeVariants = [{ id: "v1", size: null, color: null, stock: 5, priceInCents: null, isActive: true }]
    const { container } = render(
      <SizePicker variants={noSizeVariants} selected={null} onSelect={vi.fn()} basePrice={100000} />
    )
    expect(container.firstChild).toBeNull()
  })
})
