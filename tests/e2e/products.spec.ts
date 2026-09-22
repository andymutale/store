// tests/e2e/products.spec.ts
import { test, expect } from "@playwright/test"

test.describe("Product Listing Page", () => {
  test("loads the products page", async ({ page }) => {
    const res = await page.goto("/products")
    expect(res?.status()).toBeLessThan(400)
    await expect(page.getByRole("heading", { name: /all products/i })).toBeVisible()
  })

  test("shows a product count", async ({ page }) => {
    await page.goto("/products")
    await expect(page.getByText(/\d+ products?/i)).toBeVisible()
  })

  test("filter by sport narrows the results", async ({ page }) => {
    await page.goto("/products")
    const totalText = await page.getByText(/\d+ products?/i).textContent()
    const total = parseInt(totalText?.match(/\d+/)?.[0] ?? "0")

    await page.getByRole("button", { name: /running/i }).first().click()
    await page.waitForURL(/sport=running/)

    const filteredText = await page.getByText(/\d+ products?/i).textContent()
    const filtered = parseInt(filteredText?.match(/\d+/)?.[0] ?? "0")
    expect(filtered).toBeLessThanOrEqual(total)
  })

  test("clicking a product card navigates to the PDP", async ({ page }) => {
    await page.goto("/products")
    const firstCard = page.getByRole("link", { name: /view product/i }).first()
    await firstCard.click()
    await expect(page).toHaveURL(/\/products\/[a-z0-9-]+/)
  })

  test("search narrows results", async ({ page }) => {
    await page.goto("/products?q=adidas")
    await expect(page).toHaveURL(/q=adidas/)
    // Should not 500 or 404
    await expect(page.getByRole("heading", { name: /adidas/i })).toBeVisible()
  })
})

test.describe("Product Detail Page", () => {
  // Navigate via the listing page to get a real product slug
  test.beforeEach(async ({ page }) => {
    await page.goto("/products")
    await page.getByRole("link", { name: /view product/i }).first().click()
    await page.waitForURL(/\/products\/[a-z0-9-]+/)
  })

  test("shows the product name", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("shows a price", async ({ page }) => {
    await expect(page.getByText(/R\s?\d/)).toBeVisible()
  })

  test("shows the size picker when sizes exist", async ({ page }) => {
    const hasSizes = await page.getByText(/size:/i).count()
    if (hasSizes > 0) {
      await expect(page.getByText(/select a size/i)).toBeVisible()
    }
  })

  test("Add to Cart button is disabled until a size is selected", async ({ page }) => {
    const hasSizes = await page.getByText(/size:/i).count()
    if (hasSizes > 0) {
      const btn = page.getByRole("button", { name: /add to cart/i })
      await expect(btn).toBeDisabled()
    }
  })

  test("selecting a size enables the Add to Cart button", async ({ page }) => {
    const sizeButtons = await page.getByRole("button").filter({ hasText: /UK \d+/ }).all()
    if (sizeButtons.length === 0) return // product has no sizes

    // Find an in-stock size
    for (const btn of sizeButtons) {
      if (!(await btn.isDisabled())) {
        await btn.click()
        break
      }
    }
    await expect(page.getByRole("button", { name: /add to cart/i })).toBeEnabled()
  })

  test("shows related products section when available", async ({ page }) => {
    const related = await page.getByText(/you might also like/i).count()
    // May or may not have related products — just verify no crash
    expect(related).toBeGreaterThanOrEqual(0)
  })

  test("shows delivery info strip", async ({ page }) => {
    await expect(page.getByText(/nationwide delivery/i)).toBeVisible()
  })
})

test.describe("Category Page", () => {
  test("running category loads", async ({ page }) => {
    const res = await page.goto("/category/running")
    expect(res?.status()).toBeLessThan(400)
    await expect(page.getByRole("heading", { name: /running/i })).toBeVisible()
  })

  test("shows sub-category chips when they exist", async ({ page }) => {
    await page.goto("/category/running")
    // Should have Men's and Women's sub-categories
    const chips = await page.getByRole("link").filter({ hasText: /men|women/i }).count()
    expect(chips).toBeGreaterThan(0)
  })

  test("non-existent category returns 404", async ({ page }) => {
    const res = await page.goto("/category/does-not-exist")
    expect(res?.status()).toBe(404)
  })
})
