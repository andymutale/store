"use server"

import db from "@/lib/db"
import { z } from "zod"
import fs from "fs/promises"
import { redirect, notFound } from "next/navigation"
import { revalidatePath } from "next/cache"
import { slugify } from "@/lib/formatters"

// ─── SCHEMAS ────────────────────────────────────────────────────────────────

const variantSchema = z.object({
  id:           z.string().optional(),
  sku:          z.string().min(1, "SKU required"),
  size:         z.string().optional(),
  color:        z.string().optional(),
  stock:        z.coerce.number().int().min(0).default(0),
  priceInCents: z.coerce.number().int().optional(),
  sortOrder:    z.coerce.number().int().default(0),
  isActive:     z.boolean().default(true),
})

const productSchema = z.object({
  name:                   z.string().min(1, "Name is required"),
  slug:                   z.string().min(1).regex(/^[a-z0-9-]+$/),
  description:            z.string().min(1, "Description is required"),
  priceInCents:           z.coerce.number().int().min(1, "Price is required"),
  comparePriceInCents:    z.coerce.number().int().optional(),
  categoryId:             z.string().min(1, "Category is required"),
  brandId:                z.string().optional(),
  gender:                 z.string().optional(),
  sport:                  z.string().optional(),
  sizeSystem:             z.string().optional(),
  isAvailableForPurchase: z.coerce.boolean().default(false),
  isFeatured:             z.coerce.boolean().default(false),
  isNew:                  z.coerce.boolean().default(false),
  metaTitle:              z.string().optional(),
  metaDescription:        z.string().optional(),
  variants:               z.string().min(1, "At least one variant is required"),
})

// ─── HELPERS ────────────────────────────────────────────────────────────────

function revalidate() {
  revalidatePath("/admin/products")
  revalidatePath("/")
  revalidatePath("/products")
}

async function saveImage(file: File): Promise<string> {
  await fs.mkdir("public/products", { recursive: true })
  const path = `/products/${crypto.randomUUID()}-${file.name}`
  await fs.writeFile(`public${path}`, Buffer.from(await file.arrayBuffer()))
  return path
}

function normalizeFormData(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())

  raw.isAvailableForPurchase = String(formData.get("isAvailableForPurchase") === "on")
  raw.isFeatured             = String(formData.get("isFeatured") === "on")
  raw.isNew                  = String(formData.get("isNew") === "on")

  if (!raw.slug) raw.slug = slugify(raw.name as string)

  const optionals = ["brandId", "comparePriceInCents", "metaTitle", "metaDescription"]
  optionals.forEach(field => { if (!raw[field]) delete raw[field] })

  return raw
}

// ─── ACTIONS ────────────────────────────────────────────────────────────────

export async function addProduct(prevState: unknown, formData: FormData) {
  const result = productSchema.safeParse(normalizeFormData(formData))
  if (!result.success) return result.error.formErrors.fieldErrors

  let variants: z.infer<typeof variantSchema>[]
  try {
    variants = z.array(variantSchema).parse(JSON.parse(result.data.variants))
  } catch {
    return { variants: ["Invalid variant data"] }
  }
  if (variants.length === 0) return { variants: ["Add at least one size/variant"] }

  const validImages = (formData.getAll("images") as File[]).filter(f => f.size > 0)
  const { variants: _v, ...productData } = result.data

  await db.product.create({
    data: {
      ...productData,
      images: {
        create: await Promise.all(validImages.map(async (file, i) => ({
          url:       await saveImage(file),
          altText:   `${productData.name} image ${i + 1}`,
          sortOrder: i,
          isPrimary: i === 0,
        }))),
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

export async function updateProduct(id: string, prevState: unknown, formData: FormData) {
  const result = productSchema.safeParse(normalizeFormData(formData))
  if (!result.success) return result.error.formErrors.fieldErrors

  let variants: z.infer<typeof variantSchema>[]
  try {
    variants = z.array(variantSchema).parse(JSON.parse(result.data.variants))
  } catch {
    return { variants: ["Invalid variant data"] }
  }
  if (variants.length === 0) return { variants: ["Add at least one size/variant"] }

  const existing = await db.product.findUnique({ where: { id } })
  if (!existing) return notFound()

  const validImages = (formData.getAll("images") as File[]).filter(f => f.size > 0)
  const { variants: _v, ...productData } = result.data

  const incomingIds = variants.filter(v => v.id).map(v => v.id!)
  const existingVariants = await db.productVariant.findMany({ where: { productId: id } })
  const toDeleteIds = existingVariants.filter(ev => !incomingIds.includes(ev.id)).map(v => v.id)

  await db.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: productData })

    if (toDeleteIds.length > 0) {
      await tx.productVariant.deleteMany({ where: { id: { in: toDeleteIds } } })
    }

    for (const [i, v] of variants.entries()) {
      const variantData = {
        sku: v.sku,
        size: v.size || null,
        color: v.color || null,
        stock: v.stock,
        priceInCents: v.priceInCents || null,
        sortOrder: v.sortOrder ?? i,
        isActive: v.isActive,
      }

      if (v.id) {
        await tx.productVariant.update({ where: { id: v.id }, data: variantData })
      } else {
        await tx.productVariant.create({ data: { productId: id, ...variantData } })
      }
    }
  })

  if (validImages.length > 0) {
    const existingCount = await db.productImage.count({ where: { productId: id } })
    await db.productImage.createMany({
      data: await Promise.all(validImages.map(async (file, i) => ({
        productId: id,
        url:       await saveImage(file),
        altText:   `${productData.name} image`,
        sortOrder: existingCount + i,
        isPrimary: existingCount === 0 && i === 0,
      }))),
    })
  }

  revalidate()
  redirect("/admin/products")
}

export async function toggleProductAvailability(id: string, isAvailableForPurchase: boolean) {
  await db.product.update({ where: { id }, data: { isAvailableForPurchase } })
  revalidate()
}

export async function deleteProduct(id: string) {
  const product = await db.product.findUnique({
    where: { id },
    include: { images: true, _count: { select: { OrderItem: true } } },
  })
  
  if (!product) return notFound()
  if (product._count.OrderItem > 0) throw new Error("Cannot delete a product with order history.")

  for (const img of product.images) {
    await fs.unlink(`public${img.url}`).catch(() => {})
  }

  await db.product.delete({ where: { id } })
  revalidate()
}

// ─── IMAGE ACTIONS ──────────────────────────────────────────────────────────

// ✅ IMPLEMENTED BEST PRACTICE: Performs defensive disk unlinking prior to database deletion
export async function deleteProductImage(id: string) {
  const image = await db.productImage.findUnique({ where: { id } })
  if (!image) return notFound()

  // Remove physical file safely from storage directory
  await fs.unlink(`public${image.url}`).catch((err) => {
    console.warn(`File system unlinking skipped or failed for: ${image.url}`, err.message)
  })

  // Delete matching row from database
  await db.productImage.delete({ where: { id } })
  
  revalidate()
}

export async function setPrimaryImage(imageId: string, productId: string) {
  await db.productImage.updateMany({
    where: { productId },
    data: { isPrimary: false },
  })
  await db.productImage.update({
    where: { id: imageId },
    data: { isPrimary: true },
  })
  revalidate()
}