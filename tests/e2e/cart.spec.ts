// tests/e2e/cart.spec.ts
import { test, expect, type Page } from "@playwright/test"

// Navigate to the first available product and add it to the cart
async function addFirstProductToCart(page: Page) {
  await page.goto("/products")
  await page.getByRole("link", { name: /view product/i }).first().click()
  await page.waitForURL(/\/products\/[a-z0-9-]+/)

  // Select a size if the picker is visible
  const sizeButtons = page.getByRole("button").filter({ hasText: /UK \d+/ })
  const count = await sizeButtons.count()
  if (count > 0) {
    for (let i = 0; i < count; i++) {
      const btn = sizeButtons.nth(i)
      if (!(await btn.isDisabled())) {
        await btn.click()
        break
      }
    }
  }

  await page.getByRole("button", { name: /add to cart/i }).click()
  await expect(page.getByRole("button", { name: /added/i })).toBeVisible()
}

test.describe("Cart", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart by visiting home (cookie persists across tests in same browser context)
    await page.goto("/")
  })

  test("empty cart shows the empty state message", async ({ page }) => {
    await page.goto("/cart")
    await expect(page.getByText(/your cart is empty/i)).toBeVisible()
    await expect(page.getByRole("link", { name: /shop now/i })).toBeVisible()
  })

  test("adding a product to cart shows the Added! state", async ({ page }) => {
    await addFirstProductToCart(page)
    await expect(page.getByRole("link", { name: /view cart/i })).toBeVisible()
  })

  test("cart page shows the added item", async ({ page }) => {
    await addFirstProductToCart(page)
    await page.goto("/cart")
    // Should have at least one item row
    await expect(page.getByRole("link").filter({ hasText: /UK \d+|one size/i }).or(
      page.locator(".font-bold").filter({ hasText: /R\s?\d/ })
    ).first()).toBeVisible()
  })

  test("cart shows subtotal", async ({ page }) => {
    await addFirstProductToCart(page)
    await page.goto("/cart")
    await expect(page.getByText(/R\s?\d/).first()).toBeVisible()
  })

  test("quantity increase button increments the count", async ({ page }) => {
    await addFirstProductToCart(page)
    await page.goto("/cart")

    const quantityEl = page.locator("span").filter({ hasText: /^1$/ }).first()
    await expect(quantityEl).toBeVisible()

    await page.getByLabel("Increase quantity").first().click()
    await expect(page.locator("span").filter({ hasText: /^2$/ }).first()).toBeVisible()
  })

  test("quantity decrease button decrements the count", async ({ page }) => {
    await addFirstProductToCart(page)
    await page.goto("/cart")

    // Increase first so we can decrease
    await page.getByLabel("Increase quantity").first().click()
    await expect(page.locator("span").filter({ hasText: /^2$/ }).first()).toBeVisible()

    await page.getByLabel("Decrease quantity").first().click()
    await expect(page.locator("span").filter({ hasText: /^1$/ }).first()).toBeVisible()
  })

  test("remove button deletes the item", async ({ page }) => {
    await addFirstProductToCart(page)
    await page.goto("/cart")

    await page.getByLabel("Remove item").first().click()
    await expect(page.getByText(/your cart is empty/i)).toBeVisible()
  })

  test("Proceed to Checkout button navigates to /checkout", async ({ page }) => {
    await addFirstProductToCart(page)
    await page.goto("/cart")
    await page.getByRole("link", { name: /proceed to checkout/i }).click()
    await expect(page).toHaveURL("/checkout")
  })

  test("empty cart redirects checkout to /cart", async ({ page }) => {
    await page.goto("/checkout")
    await expect(page).toHaveURL("/cart")
  })
})
