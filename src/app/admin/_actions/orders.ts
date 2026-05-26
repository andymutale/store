"use server"
// src/app/admin/_actions/orders.ts

import db from "@/lib/db"
import { revalidatePath } from "next/cache"

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
