// src/app/admin/products/new/page.tsx
import db from "@/lib/db"
import { PageHeader } from "../../_components/PageHeader"
import { ProductForm } from "../_components/ProductForm"
import { addProduct } from "../../_actions/products"

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ])

  return (
    <>
      <PageHeader>New Product</PageHeader>
      <ProductForm categories={categories} brands={brands} action={addProduct} />
    </>
  )
}
