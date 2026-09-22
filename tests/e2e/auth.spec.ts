// tests/e2e/auth.spec.ts
import { test, expect, type Page } from "@playwright/test"

// Unique email per test run to avoid conflicts
const TEST_EMAIL = `e2e-test-${Date.now()}@example.com`
const TEST_PASSWORD = "testpassword123"

async function register(page: Page, email = TEST_EMAIL) {
  await page.goto("/register")
  await page.getByLabel("First name").fill("E2E")
  await page.getByLabel("Last name").fill("Test")
  await page.getByLabel("Email address").fill(email)
  await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD)
  await page.getByLabel("Confirm").fill(TEST_PASSWORD)
  await page.getByRole("button", { name: /create account/i }).click()
  await page.waitForURL("/account")
}

async function login(page: Page, email = TEST_EMAIL) {
  await page.goto("/login")
  await page.getByLabel("Email address").fill(email)
  await page.getByLabel("Password").fill(TEST_PASSWORD)
  await page.getByRole("button", { name: /sign in/i }).click()
  await page.waitForURL("/account")
}

test.describe("Registration", () => {
  test("creates an account and redirects to /account", async ({ page }) => {
    await register(page)
    await expect(page).toHaveURL("/account")
    await expect(page.getByText(/welcome back/i)).toBeVisible()
  })

  test("shows the user name in the top bar after register", async ({ page }) => {
    await register(page)
    await expect(page.getByText(/hi, e2e/i)).toBeVisible()
  })

  test("shows an error for mismatched passwords", async ({ page }) => {
    await page.goto("/register")
    await page.getByLabel("First name").fill("Test")
    await page.getByLabel("Last name").fill("User")
    await page.getByLabel("Email address").fill("mismatch@example.com")
    await page.getByLabel("Password", { exact: true }).fill("password123")
    await page.getByLabel("Confirm").fill("different123")
    await page.getByRole("button", { name: /create account/i }).click()
    await expect(page.getByText(/match/i)).toBeVisible()
    await expect(page).not.toHaveURL("/account")
  })

  test("shows an error for a duplicate email", async ({ page }) => {
    const dupeEmail = `dupe-${Date.now()}@example.com`
    await register(page, dupeEmail)
    await page.goto("/")
    await page.getByRole("button", { name: /sign out/i }).click()
    await page.waitForURL("/")

    // Try to register again with the same email
    await page.goto("/register")
    await page.getByLabel("First name").fill("Dupe")
    await page.getByLabel("Last name").fill("User")
    await page.getByLabel("Email address").fill(dupeEmail)
    await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD)
    await page.getByLabel("Confirm").fill(TEST_PASSWORD)
    await page.getByRole("button", { name: /create account/i }).click()
    await expect(page.getByText(/already exists/i)).toBeVisible()
  })
})

test.describe("Login", () => {
  test.beforeAll(async ({ browser }) => {
    // Register the test user once for all login tests
    const page = await browser.newPage()
    await register(page, TEST_EMAIL).catch(() => {})  // may already exist
    await page.close()
  })

  test("logs in with correct credentials", async ({ page }) => {
    await login(page)
    await expect(page).toHaveURL("/account")
  })

  test("shows the same error for wrong password and unknown email", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Email address").fill(TEST_EMAIL)
    await page.getByLabel("Password").fill("wrongpassword")
    await page.getByRole("button", { name: /sign in/i }).click()
    const wrongPwError = await page.getByText(/incorrect/i).textContent()

    await page.getByLabel("Email address").fill("nobody@example.com")
    await page.getByRole("button", { name: /sign in/i }).click()
    const noUserError = await page.getByText(/incorrect/i).textContent()

    expect(wrongPwError).toBe(noUserError)
  })

  test("redirects to /login when accessing /account unauthenticated", async ({ page }) => {
    await page.goto("/account")
    await expect(page).toHaveURL(/\/login\?redirect=%2Faccount/)
  })
})

test.describe("Account pages (authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    await register(page, `acct-${Date.now()}@example.com`)
  })

  test("account dashboard shows order history section", async ({ page }) => {
    await expect(page.getByText(/no orders yet|recent orders/i)).toBeVisible()
  })

  test("profile page loads and shows email", async ({ page }) => {
    await page.goto("/account/profile")
    await expect(page.getByText(/profile & password/i)).toBeVisible()
  })

  test("orders page loads", async ({ page }) => {
    await page.goto("/account/orders")
    await expect(page.getByText(/order history|no orders/i)).toBeVisible()
  })

  test("addresses page loads with add form", async ({ page }) => {
    await page.goto("/account/addresses")
    await expect(page.getByText(/saved addresses/i)).toBeVisible()
    await expect(page.getByLabel("Street address")).toBeVisible()
  })

  test("logout clears session and redirects to homepage", async ({ page }) => {
    await page.getByRole("button", { name: /sign out/i }).click()
    await page.waitForURL("/")
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible()

    // Verify /account is now protected again
    await page.goto("/account")
    await expect(page).toHaveURL(/\/login/)
  })
})
