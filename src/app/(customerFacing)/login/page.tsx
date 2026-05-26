// src/app/(customerFacing)/login/page.tsx
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "./_components/LoginForm"

type Props = { searchParams: Promise<{ redirect?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  // Already logged in — send to account or requested destination
  const user = await getCurrentUser()
  const { redirect: redirectTo } = await searchParams
  if (user) redirect(redirectTo ?? "/account")

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="font-extrabold text-text-primary text-2xl mb-1">Sign in</h1>
          <p className="text-text-muted text-sm">Welcome back to Brian Bands</p>
        </div>

        <div className="bg-white border border-border-color rounded-md p-6 shadow-sm">
          <LoginForm redirectTo={redirectTo} />
        </div>

        <p className="text-center text-sm text-text-muted mt-4">
          Don't have an account?{" "}
          <Link href="/register" className="text-brand-blue font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
