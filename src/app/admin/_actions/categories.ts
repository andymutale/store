"use server"

import db from "@/lib/db"
import { z } from "zod"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { notFound } from "next/navigation"
import { slugify } from "@/lib/formatters"

const categorySchema = z.object({
  name:        z.string().min(1, "Name is required"),
  slug:        z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  parentId:    z.string().optional(),
  sortOrder:   z.coerce.number().int().default(0),
  isActive:    z.coerce.boolean().default(true),
})

function revalidate() {
  revalidatePath("/admin/categories")
  revalidatePath("/")
}

export async function addCategory(prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())

  // Checkbox sends "on" when checked, absent when not — normalise to boolean
  raw.isActive = formData.get("isActive") === "on" ? "true" : "false"

  // Auto-generate slug from name if blank
  if (!raw.slug) raw.slug = slugify(raw.name as string)

  // Empty parentId means top-level
  if (!raw.parentId) delete raw.parentId

  const result = categorySchema.safeParse(raw)
  if (!result.success) return result.error.formErrors.fieldErrors

  await db.category.create({ data: result.data })
  revalidate()
  redirect("/admin/categories")
}

export async function updateCategory(id: string, prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  raw.isActive = formData.get("isActive") === "on" ? "true" : "false"
  if (!raw.slug) raw.slug = slugify(raw.name as string)
  if (!raw.parentId) delete raw.parentId

  const result = categorySchema.safeParse(raw)
  if (!result.success) return result.error.formErrors.fieldErrors

  const existing = await db.category.findUnique({ where: { id } })
  if (!existing) return notFound()

  await db.category.update({ where: { id }, data: result.data })
  revalidate()
  redirect("/admin/categories")
}

export async function deleteCategory(id: string) {
  const category = await db.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true, children: true } } },
  })
  if (!category) return notFound()
  if (category._count.products > 0 || category._count.children > 0) {
    throw new Error("Cannot delete a category that has products or sub-categories.")
  }
  await db.category.delete({ where: { id } })
  revalidate()
}
