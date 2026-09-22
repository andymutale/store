"use server"

import db from "@/lib/db"
import { revalidatePath } from "next/cache"
import { notFound } from "next/navigation"

const STATUSES = ["pending","confirmed","processing","shipped","delivered","cancelled","refunded"] as const

export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
  if (!STATUSES.includes(status as typeof STATUSES[number])) return

  await db.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(trackingNumber ? { trackingNumber } : {}),
      ...(status === "shipped"   ? { shippedAt:   new Date() } : {}),
      ...(status === "delivered" ? { deliveredAt: new Date() } : {}),
      ...(status === "cancelled" ? { cancelledAt: new Date() } : {}),
    },
  })

  revalidatePath("/admin/orders")
}

export async function deleteOrder(id: string) {
  const order = await db.order.delete({
    where: { id },
  })

  if (order == null) return notFound()

  revalidatePath("/admin/orders")
  return order
}