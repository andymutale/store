"use server"

import db from "@/lib/db"
import { z } from "zod"
import fs from "fs/promises"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { notFound } from "next/navigation"
import { slugify } from "@/lib/formatters"

// ─── VARIANT SCHEMA ──────────────────────────────────────────────────────────
// Variants arrive as a JSON string from the VariantsEditor hidden input.

const variantSchema = z.object({
  id:          z.string().optional(),       // existing DB id (for updates)
  sku:         z.string().min(1, "SKU required"),
  size:        z.string().optional(),
  color:       z.string().optional(),
  stock:       z.coerce.number().int().min(0).default(0),
  priceInCents: z.coerce.number().int().optional(),
  sortOrder:   z.coerce.number().int().default(0),
  isActive:    z.boolean().default(true),
})

// ─── PRODUCT SCHEMA ───────────────────────────────────────────────────────────

const productSchema = z.object({
  name:                  z.string().min(1, "Name is required"),
  slug:                  z.string().min(1).regex(/^[a-z0-9-]+$/),
  shortDescription:      z.string().optional(),
  description:           z.string().min(1, "Description is required"),
  priceInCents:          z.coerce.number().int().min(1, "Price is required"),
  comparePriceInCents:   z.coerce.number().int().optional(),
  categoryId:            z.string().min(1, "Category is required"),
  brandId:               z.string().optional(),
  gender:                z.string().optional(),
  sport:                 z.string().optional(),
  sizeSystem:            z.string().optional(),
  isAvailableForPurchase: z.coerce.boolean().default(false),
  isFeatured:            z.coerce.boolean().default(false),
  isNew:                 z.coerce.boolean().default(false),
  metaTitle:             z.string().optional(),
  metaDescription:       z.string().optional(),
  // variants arrive as JSON string
  variants:              z.string().min(1, "At least one variant is required"),
})

function revalidate() {
  revalidatePath("/admin/products")
  revalidatePath("/")
  revalidatePath("/products")
}

// ─── SAVE UPLOADED IMAGE ──────────────────────────────────────────────────────

async function saveImage(file: File): Promise<string> {
  await fs.mkdir("public/products", { recursive: true })
  const path = `/products/${crypto.randomUUID()}-${file.name}`
  await fs.writeFile(`public${path}`, Buffer.from(await file.arrayBuffer()))
  return path
}

// ─── ADD PRODUCT ─────────────────────────────────────────────────────────────

export async function addProduct(prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())

  // Normalise booleans from checkboxes
  raw.isAvailableForPurchase = formData.get("isAvailableForPurchase") === "on" ? "true" : "false"
  raw.isFeatured             = formData.get("isFeatured")             === "on" ? "true" : "false"
  raw.isNew                  = formData.get("isNew")                  === "on" ? "true" : "false"

  // Auto-generate slug from name if blank
  if (!raw.slug) raw.slug = slugify(raw.name as string)

  // Strip empty optional fields
  if (!raw.brandId)          delete raw.brandId
  if (!raw.comparePriceInCents) delete raw.comparePriceInCents
  if (!raw.metaTitle)        delete raw.metaTitle
  if (!raw.metaDescription)  delete raw.metaDescription

  const result = productSchema.safeParse(raw)
  if (!result.success) return result.error.formErrors.fieldErrors

  // Parse and validate variants
  let variants: z.infer<typeof variantSchema>[]
  try {
    const parsed = JSON.parse(result.data.variants)
    const vResult = z.array(variantSchema).safeParse(parsed)
    if (!vResult.success) return { variants: ["Invalid variant data"] }
    variants = vResult.data
  } catch {
    return { variants: ["Could not parse variants"] }
  }

  if (variants.length === 0) return { variants: ["Add at least one size/variant"] }

  // Handle image uploads
  const imageFiles = formData.getAll("images") as File[]
  const validImages = imageFiles.filter(f => f.size > 0)

  const { variants: _v, ...productData } = result.data

  await db.product.create({
    data: {
      ...productData,
      images: {
        create: await Promise.all(
          validImages.map(async (file, i) => ({
            url:       await saveImage(file),
            altText:   `${productData.name} image ${i + 1}`,
            sortOrder: i,
            isPrimary: i === 0,
          }))
        ),
      },
      variants: {
        create: variants.map((v, i) => ({
          sku:          v.sku,
          size:         v.size || null,
          color:        v.color || null,
          stock:        v.stock,
          priceInCents: v.priceInCents || null,
          sortOrder:    v.sortOrder ?? i,
          isActive:     v.isActive,
        })),
      },
    },
  })

  revalidate()
  redirect("/admin/products")
}

// ─── UPDATE PRODUCT ──────────────────────────────────────────────────────────

export async function updateProduct(id: string, prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  raw.isAvailableForPurchase = formData.get("isAvailableForPurchase") === "on" ? "true" : "false"
  raw.isFeatured             = formData.get("isFeatured")             === "on" ? "true" : "false"
  raw.isNew                  = formData.get("isNew")                  === "on" ? "true" : "false"
  if (!raw.slug) raw.slug = slugify(raw.name as string)
  if (!raw.brandId)             delete raw.brandId
  if (!raw.comparePriceInCents) delete raw.comparePriceInCents
  if (!raw.metaTitle)           delete raw.metaTitle
  if (!raw.metaDescription)     delete raw.metaDescription

  const result = productSchema.safeParse(raw)
  if (!result.success) return result.error.formErrors.fieldErrors

  let variants: z.infer<typeof variantSchema>[]
  try {
    const parsed = JSON.parse(result.data.variants)
    const vResult = z.array(variantSchema).safeParse(parsed)
    if (!vResult.success) return { variants: ["Invalid variant data"] }
    variants = vResult.data
  } catch {
    return { variants: ["Could not parse variants"] }
  }

  if (variants.length === 0) return { variants: ["Add at least one size/variant"] }

  const existing = await db.product.findUnique({ where: { id } })
  if (!existing) return notFound()

  const imageFiles = formData.getAll("images") as File[]
  const validImages = imageFiles.filter(f => f.size > 0)

  const { variants: _v, ...productData } = result.data

  // Sync variants: upsert existing (by id), create new ones (no id), delete removed ones
  const incomingIds  = variants.filter(v => v.id).map(v => v.id!)
  const existingVariants = await db.productVariant.findMany({ where: { productId: id } })
  const toDelete = existingVariants.filter(ev => !incomingIds.includes(ev.id))

  await db.$transaction([
    // Update product base fields
    db.product.update({ where: { id }, data: productData }),

    // Delete removed variants (only safe if no order items reference them)
    ...toDelete.map(v =>
      db.productVariant.delete({ where: { id: v.id } })
    ),

    // Upsert variants
    ...variants.map((v, i) =>
      v.id
        ? db.productVariant.update({
            where: { id: v.id },
            data: { sku: v.sku, size: v.size || null, color: v.color || null, stock: v.stock, priceInCents: v.priceInCents || null, sortOrder: v.sortOrder ?? i, isActive: v.isActive },
          })
        : db.productVariant.create({
            data: { productId: id, sku: v.sku, size: v.size || null, color: v.color || null, stock: v.stock, priceInCents: v.priceInCents || null, sortOrder: v.sortOrder ?? i, isActive: v.isActive },
          })
    ),
  ])

  // Add any new images
  if (validImages.length > 0) {
    const existingCount = await db.productImage.count({ where: { productId: id } })
    await db.productImage.createMany({
      data: await Promise.all(
        validImages.map(async (file, i) => ({
          productId: id,
          url:       await saveImage(file),
          altText:   `${productData.name} image`,
          sortOrder: existingCount + i,
          isPrimary: existingCount === 0 && i === 0,
        }))
      ),
    })
  }

  revalidate()
  redirect("/admin/products")
}

// ─── TOGGLE AVAILABILITY ──────────────────────────────────────────────────────

export async function toggleProductAvailability(id: string, isAvailableForPurchase: boolean) {
  await db.product.update({ where: { id }, data: { isAvailableForPurchase } })
  revalidate()
}

// ─── DELETE PRODUCT ───────────────────────────────────────────────────────────

export async function deleteProduct(id: string) {
  const product = await db.product.findUnique({
    where: { id },
    include: {
      images: true,
      _count: { select: { orderItems: true } },
    },
  })
  if (!product) return notFound()
  if (product._count.orderItems > 0) {
    throw new Error("Cannot delete a product that has order history.")
  }

  // Delete images from disk
  for (const img of product.images) {
    await fs.unlink(`public${img.url}`).catch(() => {})
  }

  await db.product.delete({ where: { id } })
  revalidate()
}

// ─── DELETE PRODUCT IMAGE ─────────────────────────────────────────────────────

export async function deleteProductImage(imageId: string, productId: string) {
  const image = await db.productImage.findUnique({ where: { id: imageId } })
  if (!image) return notFound()
  await fs.unlink(`public${image.url}`).catch(() => {})
  await db.productImage.delete({ where: { id: imageId } })
  revalidatePath(`/admin/products/${productId}/edit`)
}

export async function setPrimaryImage(imageId: string, productId: string) {
  await db.$transaction([
    db.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
    db.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ])
  revalidatePath(`/admin/products/${productId}/edit`)
}
