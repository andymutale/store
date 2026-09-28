import { PageHeader } from "../../_components/PageHeader"
import { BrandForm } from "../_components/BrandForm"
import { addBrand } from "../../_actions/brands"

export default function NewBrandPage() {
  return (
    <>
      <PageHeader>New Brand</PageHeader>
      <BrandForm action={addBrand} />
    </>
  )
}
