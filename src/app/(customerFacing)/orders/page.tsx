// src/app/(customerFacing)/orders/page.tsx
// The old email-based order lookup is replaced by the account orders page.
import { redirect } from "next/navigation"

export default function OldOrdersPage() {
  redirect("/account/orders")
}
