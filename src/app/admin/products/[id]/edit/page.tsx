// src/app/admin/products/[id]/edit/page.tsx
import db from "@/lib/db"
import { notFound } from "next/navigation"
import { PageHeader } from "../../../_components/PageHeader"
import { ProductForm } from "../../_components/ProductForm"
import { updateProduct } from "../../../_actions/products"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [product, categories, brands] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images:   { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
      },
    }),
    db.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ])

  if (!product) return notFound()

  // Reshape variants for VariantsEditor
  const variants = product.variants.map(v => ({
    id:           v.id,
    sku:          v.sku,
    size:         v.size ?? "",
    color:        v.color ?? "",
    stock:        v.stock,
    priceInCents: v.priceInCents?.toString() ?? "",
    sortOrder:    v.sortOrder,
    isActive:     v.isActive,
  }))

  const action = updateProduct.bind(null, id)

  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <ProductForm
        product={{ ...product, variants }}
        categories={categories}
        brands={brands}
        action={action}
      />
    </>
  )
}
