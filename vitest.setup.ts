// vitest.setup.ts
import { vi } from "vitest"
import "@testing-library/jest-dom"

// ─── NEXT.JS MODULE MOCKS ────────────────────────────────────────────────────
// These modules rely on the Next.js runtime and cannot run in Vitest directly.

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    // Mirror how Next.js throws internally so tests can catch it
    const err = new Error(`NEXT_REDIRECT:${url}`)
    ;(err as any).digest = `NEXT_REDIRECT;replace;${url};307;`
    throw err
  }),
  notFound: vi.fn(() => {
    const err = new Error("NEXT_NOT_FOUND")
    ;(err as any).digest = "NEXT_NOT_FOUND"
    throw err
  }),
  useRouter:   vi.fn(() => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag:  vi.fn(),
}))

// next/headers cookies — individual tests override this per-scenario
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

// ─── ENV ─────────────────────────────────────────────────────────────────────
process.env.DATABASE_URL              = "file:./prisma/test.db"
process.env.STRIPE_SECRET_KEY         = "sk_test_dummy"
process.env.STRIPE_WEBHOOK_SECRET     = "whsec_test_dummy"
process.env.RESEND_API_KEY            = "re_test_dummy"
process.env.NEXT_PUBLIC_SERVER_URL    = "http://localhost:3000"
process.env.ADMIN_USERNAME            = "admin"
process.env.HASHED_ADMIN_PASSWORD     = "dummy_hash"
