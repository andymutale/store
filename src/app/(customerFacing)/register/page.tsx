// src/app/(customerFacing)/register/page.tsx
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { RegisterForm } from "./_components/RegisterForm"

export default async function RegisterPage() {
  const user = await getCurrentUser()
  if (user) redirect("/account")

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="font-extrabold text-text-primary text-2xl mb-1">Create account</h1>
          <p className="text-text-muted text-sm">Join Brian Bands — track orders, save addresses</p>
        </div>

        <div className="bg-white border border-border-color rounded-md p-6 shadow-sm">
          <RegisterForm />
        </div>

        <p className="text-center text-sm text-text-muted mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-blue font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
