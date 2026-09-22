"use server"
// src/app/_actions/auth.ts

import { z } from "zod"
import { redirect } from "next/navigation"
import db from "@/lib/db"
import { hashPassword, verifyPassword, createSession, deleteSession } from "@/lib/auth"

// ─── REGISTER ─────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName:  z.string().min(1, "Last name required"),
  email:     z.string().email("Valid email required"),
  password:  z.string().min(8, "Password must be at least 8 characters"),
  confirm:   z.string(),
}).refine(d => d.password === d.confirm, {
  message: "Passwords don't match",
  path:    ["confirm"],
})

type RegisterErrors = Partial<Record<keyof z.infer<typeof registerSchema> | "_form", string[]>>

export async function register(
  prevState: RegisterErrors,
  formData:  FormData
): Promise<RegisterErrors> {
  const raw    = Object.fromEntries(formData.entries())
  const parsed = registerSchema.safeParse(raw)

  if (!parsed.success) {
    return parsed.error.formErrors.fieldErrors as RegisterErrors
  }

  const { firstName, lastName, email, password } = parsed.data

  // Check email not already taken
  const existing = await db.user.findUnique({ where: { email } })
  if (existing?.passwordHash) {
    // Account with password already exists
    return { email: ["An account with this email already exists. Sign in instead."] }
  }

  const passwordHash = await hashPassword(password)

  let user
  if (existing) {
    // Guest user record from checkout — upgrade to full account
    user = await db.user.update({
      where: { id: existing.id },
      data:  { firstName, lastName, passwordHash },
    })
  } else {
    user = await db.user.create({
      data: { email, firstName, lastName, passwordHash, role: "customer" },
    })
  }

  await createSession(user.id)
  redirect("/account")
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
  redirect: z.string().optional(),
})

type LoginErrors = Partial<Record<"email" | "password" | "_form", string[]>>

export async function login(
  prevState: LoginErrors,
  formData:  FormData
): Promise<LoginErrors> {
  const raw    = Object.fromEntries(formData.entries())
  const parsed = loginSchema.safeParse(raw)

  if (!parsed.success) {
    return parsed.error.formErrors.fieldErrors as LoginErrors
  }

  const { email, password } = parsed.data
  const redirectTo = (raw.redirect as string) || "/account"

  const user = await db.user.findUnique({ where: { email } })

  // Deliberate: same error for wrong email and wrong password (prevents enumeration)
  const invalid = { _form: ["Incorrect email or password."] }

  if (!user || !user.passwordHash) return invalid
  if (!(await verifyPassword(password, user.passwordHash))) return invalid

  await createSession(user.id)
  redirect(redirectTo)
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

export async function logout() {
  await deleteSession()
  redirect("/")
}
