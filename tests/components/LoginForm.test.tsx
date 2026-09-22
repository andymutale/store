// tests/components/LoginForm.test.tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { LoginForm } from "@/app/(customerFacing)/login/_components/LoginForm"

// useActionState returns [state, formAction, isPending]
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>()
  return {
    ...actual,
    useActionState: vi.fn((_action: unknown, initial: unknown) => [initial, vi.fn(), false]),
  }
})

vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>()
  return { ...actual, useFormStatus: vi.fn(() => ({ pending: false })) }
})

describe("LoginForm", () => {
  it("renders email and password fields", () => {
    render(<LoginForm />)
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument()
  })

  it("renders a Sign In submit button", () => {
    render(<LoginForm />)
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("renders a link to the register page", () => {
    render(<LoginForm />)
    const link = screen.getByRole("link", { name: /create one/i })
    expect(link).toHaveAttribute("href", "/register")
  })

  it("renders a Forgot Password link", () => {
    render(<LoginForm />)
    expect(screen.getByRole("link", { name: /forgot password/i })).toBeInTheDocument()
  })
})
