// tests/e2e/homepage.spec.ts
import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test("loads without error", async ({ page }) => {
    const res = await page.goto("/")
    expect(res?.status()).toBeLessThan(400)
  })

  test("displays the hero section with a shop link", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("link", { name: /shop all products/i })).toBeVisible()
  })

  test("displays the category sport tiles", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Running")).toBeVisible()
    await expect(page.getByText("Tennis")).toBeVisible()
    await expect(page.getByText("Football")).toBeVisible()
  })

  test("trust bar shows delivery and returns information", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText(/nationwide delivery/i)).toBeVisible()
    await expect(page.getByText(/30-day returns/i)).toBeVisible()
  })

  test("clicking a sport tile navigates to the category page", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: /running/i }).first().click()
    await expect(page).toHaveURL(/\/category\/running/)
  })

  test("header shows Sign In link when not logged in", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible()
  })

  test("category nav is visible on desktop", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("link", { name: /all products/i })).toBeVisible()
  })
})
