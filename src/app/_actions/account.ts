"use server"
// src/app/_actions/account.ts

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import db from "@/lib/db"
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth"

// ─── GUARD ────────────────────────────────────────────────────────────────────

async function authedUser() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName:  z.string().min(1, "Last name required"),
  phone:     z.string().optional(),
})

type ProfileErrors = Partial<Record<"firstName" | "lastName" | "phone", string[]>>

export async function updateProfile(
  prevState: ProfileErrors,
  formData:  FormData
): Promise<ProfileErrors> {
  const user   = await authedUser()
  const parsed = profileSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return parsed.error.formErrors.fieldErrors as ProfileErrors

  await db.user.update({ where: { id: user.id }, data: parsed.data })
  revalidatePath("/account/profile")
  return {}
}

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────

const pwSchema = z.object({
  current: z.string().min(1, "Current password required"),
  next:    z.string().min(8, "New password must be at least 8 characters"),
  confirm: z.string(),
}).refine(d => d.next === d.confirm, { message: "Passwords don't match", path: ["confirm"] })

type PwErrors = Partial<Record<"current" | "next" | "confirm" | "_form", string[]>>

export async function changePassword(
  prevState: PwErrors,
  formData:  FormData
): Promise<PwErrors> {
  const user   = await authedUser()
  const parsed = pwSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return parsed.error.formErrors.fieldErrors as PwErrors

  const dbUser = await db.user.findUnique({ where: { id: user.id } })
  if (!dbUser?.passwordHash) return { _form: ["No password set on this account."] }

  const valid = await verifyPassword(parsed.data.current, dbUser.passwordHash)
  if (!valid) return { current: ["Incorrect current password."] }

  await db.user.update({
    where: { id: user.id },
    data:  { passwordHash: await hashPassword(parsed.data.next) },
  })

  revalidatePath("/account/profile")
  return {}
}

// ─── ADDRESSES ────────────────────────────────────────────────────────────────

const addressSchema = z.object({
  label:     z.string().optional(),
  firstName: z.string().min(1, "First name required"),
  lastName:  z.string().min(1, "Last name required"),
  company:   z.string().optional(),
  line1:     z.string().min(1, "Street address required"),
  line2:     z.string().optional(),
  city:      z.string().min(1, "City required"),
  province:  z.string().min(2, "Province required"),
  postalCode: z.string().min(4, "Postal code required"),
  phone:     z.string().optional(),
  isDefault: z.coerce.boolean().default(false),
})

type AddrErrors = Partial<Record<string, string[]>>

export async function addAddress(
  prevState: AddrErrors,
  formData:  FormData
): Promise<AddrErrors> {
  const user = await authedUser()
  const raw  = Object.fromEntries(formData.entries())
  raw.isDefault = formData.get("isDefault") === "on" ? "true" : "false"

  const parsed = addressSchema.safeParse(raw)
  if (!parsed.success) return parsed.error.formErrors.fieldErrors

  // If this is the first address or marked default, clear other defaults
  if (parsed.data.isDefault) {
    await db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } })
  }

  const count = await db.address.count({ where: { userId: user.id } })
  await db.address.create({
    data: { ...parsed.data, userId: user.id, isDefault: count === 0 || parsed.data.isDefault },
  })

  revalidatePath("/account/addresses")
  redirect("/account/addresses")
}

export async function updateAddress(
  id:        string,
  prevState: AddrErrors,
  formData:  FormData
): Promise<AddrErrors> {
  const user   = await authedUser()
  const raw    = Object.fromEntries(formData.entries())
  raw.isDefault = formData.get("isDefault") === "on" ? "true" : "false"

  const parsed = addressSchema.safeParse(raw)
  if (!parsed.success) return parsed.error.formErrors.fieldErrors

  // Verify ownership
  const addr = await db.address.findUnique({ where: { id } })
  if (!addr || addr.userId !== user.id) redirect("/account/addresses")

  if (parsed.data.isDefault) {
    await db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } })
  }

  await db.address.update({ where: { id }, data: parsed.data })
  revalidatePath("/account/addresses")
  redirect("/account/addresses")
}

export async function deleteAddress(id: string) {
  const user = await authedUser()
  await db.address.deleteMany({ where: { id, userId: user.id } })
  revalidatePath("/account/addresses")
}

export async function setDefaultAddress(id: string) {
  const user = await authedUser()
  await db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } })
  await db.address.update({ where: { id }, data: { isDefault: true } })
  revalidatePath("/account/addresses")
}
