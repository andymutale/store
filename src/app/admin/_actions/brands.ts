"use server"

import db from "@/lib/db"
import { z } from "zod"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { notFound } from "next/navigation"
import { slugify } from "@/lib/formatters"

const brandSchema = z.object({
  name:        z.string().min(1, "Name is required"),
  slug:        z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  websiteUrl:  z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isActive:    z.coerce.boolean().default(true),
})

function revalidate() {
  revalidatePath("/admin/brands")
  revalidatePath("/")
}

export async function addBrand(prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  raw.isActive = formData.get("isActive") === "on" ? "true" : "false"
  if (!raw.slug) raw.slug = slugify(raw.name as string)
  if (!raw.websiteUrl) delete raw.websiteUrl

  const result = brandSchema.safeParse(raw)
  if (!result.success) return result.error.formErrors.fieldErrors

  await db.brand.create({ data: result.data })
  revalidate()
  redirect("/admin/brands")
}

export async function updateBrand(id: string, prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  raw.isActive = formData.get("isActive") === "on" ? "true" : "false"
  if (!raw.slug) raw.slug = slugify(raw.name as string)
  if (!raw.websiteUrl) delete raw.websiteUrl

  const result = brandSchema.safeParse(raw)
  if (!result.success) return result.error.formErrors.fieldErrors

  const existing = await db.brand.findUnique({ where: { id } })
  if (!existing) return notFound()

  await db.brand.update({ where: { id }, data: result.data })
  revalidate()
  redirect("/admin/brands")
}

export async function deleteBrand(id: string) {
  const brand = await db.brand.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  })
  if (!brand) return notFound()
  if (brand._count.products > 0) {
    throw new Error("Cannot delete a brand that has products. Reassign the products first.")
  }
  await db.brand.delete({ where: { id } })
  revalidate()
}
