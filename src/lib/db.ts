// ─── PRISMA CLIENT SINGLETON ──────────────────────────────────────────────────
// Reuses one PrismaClient instance across hot-reloads in dev.
// Without this, dev mode creates a new connection on every file save.

import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db

export default db
