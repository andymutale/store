// src/middleware.ts
// ─── ROUTE PROTECTION ─────────────────────────────────────────────────────────
// /admin/*   — HTTP Basic Auth (single admin user via .env)
// /account/* — Session cookie check; redirect to /login if absent

import { NextRequest, NextResponse } from "next/server"
import { isValidPassword } from "@/lib/isValidPassword"
import { SESSION_COOKIE } from "@/lib/auth"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/admin")) {
    return handleAdminAuth(req)
  }

  if (pathname.startsWith("/account")) {
    return handleCustomerAuth(req)
  }
}

// ── Admin: HTTP Basic Auth ─────────────────────────────────────────────────

async function handleAdminAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader) return unauthorised()

  const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":")

  const valid =
    username === process.env.ADMIN_USERNAME &&
    (await isValidPassword(password, process.env.HASHED_ADMIN_PASSWORD as string))

  return valid ? NextResponse.next() : unauthorised()
}

function unauthorised() {
  return new NextResponse("Unauthorized", {
    status:  401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' },
  })
}

// ── Customer: Session cookie check ────────────────────────────────────────
// Full DB validation is done inside the /account layout (middleware can't use Prisma).
// Here we just confirm the cookie exists — a fast edge check.

function handleCustomerAuth(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value

  if (!token) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
}
