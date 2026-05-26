"use server"

import db from "@/lib/db"
import { revalidatePath } from "next/cache"
import { notFound } from "next/navigation"

// Delete user + all their orders (Cascade is set in Prisma schema)
export async function deleteUser(id: string) {
  const user = await db.user.delete({ where: { id } })
  if (!user) return notFound()
  revalidatePath("/admin/customers")
}

// Delete a single order record
export async function deleteOrder(id: string) {
  const order = await db.order.delete({ where: { id } })
  if (!order) return notFound()
  revalidatePath("/admin/orders")
}
