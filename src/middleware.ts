import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/password'
import { SESSION_COOKIE } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin')) return handleAdminAuth(req)
  if (pathname.startsWith('/account')) return handleCustomerAuth(req)

  return NextResponse.next()
}

async function handleAdminAuth(req: NextRequest) {
  const header = req.headers.get('authorization')
  if (!header?.startsWith('Basic ')) return unauthorized()

  let username = ''
  let password = ''

  try {
    const credentials = atob(header.slice(6))
    const separator = credentials.indexOf(':')
    if (separator < 0) return unauthorized()

    username = credentials.slice(0, separator)
    password = credentials.slice(separator + 1)
  } catch {
    return unauthorized()
  }

  const expectedHash = process.env.HASHED_ADMIN_PASSWORD
  if (!expectedHash || username !== process.env.ADMIN_USERNAME) return unauthorized()

  const valid = await verifyPassword(password, expectedHash)
  return valid ? NextResponse.next() : unauthorized()
}

function unauthorized() {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
  })
}

function handleCustomerAuth(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (token) return NextResponse.next()

  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
