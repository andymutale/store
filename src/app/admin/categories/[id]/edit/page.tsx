import db from "@/lib/db"
import { notFound } from "next/navigation"
import { PageHeader } from "../../../_components/PageHeader"
import { CategoryForm } from "../../_components/CategoryForm"
import { updateCategory } from "../../../_actions/categories"

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [category, parents] = await Promise.all([
    db.category.findUnique({ where: { id } }),
    db.category.findMany({ where: { parentId: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ])
  if (!category) return notFound()

  const action = updateCategory.bind(null, id)

  return (
    <>
      <PageHeader>Edit Category</PageHeader>
      <CategoryForm category={category} parents={parents} action={action} />
    </>
  )
}
