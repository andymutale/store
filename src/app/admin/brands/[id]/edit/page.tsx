// src/app/admin/brands/[id]/edit/page.tsx
import db from "@/lib/db"
import { notFound } from "next/navigation"
import { PageHeader } from "../../../_components/PageHeader"
import { BrandForm } from "../../_components/BrandForm"
import { updateBrand } from "../../../_actions/brands"

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const brand = await db.brand.findUnique({ where: { id } })
  if (!brand) return notFound()

  const action = updateBrand.bind(null, id)
  return (
    <>
      <PageHeader>Edit Brand</PageHeader>
      <BrandForm brand={brand} action={action} />
    </>
  )
}
