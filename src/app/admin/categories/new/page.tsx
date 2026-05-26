import db from "@/lib/db"
import { PageHeader } from "../../_components/PageHeader"
import { CategoryForm } from "../_components/CategoryForm"
import { addCategory } from "../../_actions/categories"

export default async function NewCategoryPage() {
  const parents = await db.category.findMany({
    where:   { parentId: null },
    select:  { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <>
      <PageHeader>New Category</PageHeader>
      <CategoryForm parents={parents} action={addCategory} />
    </>
  )
}
