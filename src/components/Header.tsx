"use client"
// src/components/Header.tsx

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, Search, Menu, X, User, LogOut, ChevronDown } from "lucide-react"
import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { logout } from "@/app/_actions/auth"
import type { CurrentUser } from "@/lib/auth"

type Props = { user: CurrentUser | null; cartBadge?: React.ReactNode }

// ── TOP UTILITY BAR ──────────────────────────────────────────────────────────

function TopUtilityBar({ user }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleLogout() {
    startTransition(async () => {
      await logout()
      router.push("/")
      router.refresh()
    })
  }

  return (
    <div className="w-full bg-brand-blue-dark text-white hidden md:block" style={{ height: 32 }}>
      <div className="max-w-content mx-auto flex justify-between items-center h-full px-6 text-xs">
        <div className="flex gap-5" style={{ opacity: 0.75 }}>
          <span>📍 Your City, Your Country</span>
          <span>☎ 000 000 0000</span>
          <span className="hidden lg:inline">admin@example.com</span>
        </div>

        <div className="flex gap-5 items-center" style={{ opacity: 0.85 }}>
          {user ? (
            <>
              <span className="text-white/70">Hi, {user.firstName ?? user.email.split("@")[0]}</span>
              <Link href="/account" className="hover:underline">My Account</Link>
              <button onClick={handleLogout} disabled={isPending}
                className="hover:underline flex items-center gap-1 disabled:opacity-50">
                <LogOut className="w-3 h-3" />
                {isPending ? "Signing out…" : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <Link href="/login"    className="hover:underline">Sign In</Link>
              <Link href="/register" className="hover:underline font-semibold">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── MAIN HEADER ───────────────────────────────────────────────────────────────

function MainHeader({ user, cartBadge }: Props) {
  const [searchOpen,     setSearchOpen]     = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const mobileLinks = [
    { label: "Home",         href: "/" },
    { label: "All Products", href: "/products" },
    { label: "Running",      href: "/category/running" },
    { label: "Tennis",       href: "/category/tennis" },
    { label: "Football",     href: "/category/football" },
    { label: "Hockey",       href: "/category/hockey" },
    ...(user
      ? [{ label: "My Account", href: "/account" }, { label: "My Orders", href: "/account/orders" }]
      : [{ label: "Sign In",  href: "/login" }, { label: "Register", href: "/register" }]),
    { label: "Cart", href: "/cart" },
  ]

  return (
    <>
      <div className="w-full bg-brand-blue text-white sticky top-0 z-50 py-2">
        <div className="max-w-content mx-auto flex items-center justify-between px-4 sm:px-6 gap-4">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="font-extrabold uppercase tracking-widest leading-none"
              style={{ fontSize: "clamp(14px,4vw,22px)" }}>
              SAINT LAURENS
            </div>
            <div className="italic text-brand-gold" style={{ fontSize: 11, opacity: 0.9 }}>
              sporting goods
            </div>
          </Link>

          {/* Search bar — desktop */}
          <form action="/products" method="GET"
            className="flex-1 max-w-2xl hidden lg:flex items-center rounded-sm border"
            style={{ height: 40, backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)" }}>
            <Search className="w-4 h-4 ml-3 flex-shrink-0" style={{ opacity: 0.5 }} />
            <input name="q" type="text" placeholder="Search products, brands…"
              className="flex-1 bg-transparent text-white px-3 outline-none text-sm placeholder:text-white/50" />
            <button type="submit"
              className="bg-white text-brand-blue font-semibold px-4 h-full text-xs rounded-r-sm hover:bg-off-white transition-colors">
              Search
            </button>
          </form>

          {/* Icon row */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Search — mobile */}
            <button onClick={() => setSearchOpen(true)}
              className="lg:hidden flex flex-col items-center p-2 rounded hover:bg-white/10 transition-colors"
              style={{ width: 44, height: 44 }}>
              <Search className="w-5 h-5" />
              <span style={{ fontSize: 9 }}>Search</span>
            </button>

            {/* Account icon */}
            <Link href={user ? "/account" : "/login"}
              className="hidden sm:flex flex-col items-center p-2 rounded hover:bg-white/10 transition-colors"
              style={{ width: 44, height: 44 }}>
              <User className="w-5 h-5" />
              <span style={{ fontSize: 9 }}>{user ? "Account" : "Sign In"}</span>
            </Link>

            {/* Cart */}
            <Link href="/cart"
              className="relative flex flex-col items-center p-2 rounded hover:bg-white/10 transition-colors"
              style={{ width: 44, height: 44 }}>
              <ShoppingCart className="w-5 h-5" />{cartBadge}
              <span style={{ fontSize: 9 }}>Cart</span>
            </Link>

            {/* Mobile menu */}
            <button onClick={() => setMobileMenuOpen(o => !o)}
              className="lg:hidden p-2 hover:bg-white/10 transition-colors rounded"
              style={{ width: 44, height: 44 }}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-brand-blue-dark text-white border-t border-white/10 z-40">
          <div className="px-4 py-3 space-y-0.5 max-w-content mx-auto">
            {mobileLinks.map(({ label, href }) => (
              <Link key={href} href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded hover:bg-white/10 text-sm font-medium transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Full-screen search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 px-4"
          style={{ backgroundColor: "rgba(10,20,35,0.9)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-2xl">
            <form action="/products" method="GET"
              className="flex items-center rounded border"
              style={{ height: 48, backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)" }}>
              <Search className="w-5 h-5 ml-4 flex-shrink-0" style={{ opacity: 0.5 }} />
              <input name="q" type="text" placeholder="Type to search…" autoFocus
                className="flex-1 bg-transparent text-white px-4 outline-none text-lg placeholder:text-white/40" />
              <button type="button" onClick={() => setSearchOpen(false)} className="mr-4 text-white/50 text-xl">✕</button>
            </form>
          </div>
          <button onClick={() => setSearchOpen(false)} className="absolute inset-0 -z-10" />
        </div>
      )}
    </>
  )
}

// ── CATEGORY NAV ─────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "Running",      href: "/category/running" },
  { label: "Tennis",       href: "/category/tennis" },
  { label: "Football",     href: "/category/football" },
  { label: "Hockey",       href: "/category/hockey" },
  { label: "Netball",      href: "/category/netball" },
  { label: "Accessories",  href: "/category/accessories" },
  { label: "Deals",        href: "/deals", highlight: true },
]

function CategoryNav() {
  const pathname = usePathname()

  return (
    <div className="w-full bg-brand-blue-dark text-white hidden lg:block"
      style={{ height: 44, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="max-w-content mx-auto flex items-center h-full px-6 gap-0">
        {NAV_LINKS.map(({ label, href, highlight }) => (
          <Link key={href} href={href}
            className={cn(
              "flex items-center h-full px-4 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-white/10 text-white border-b-2 border-brand-gold"
                : highlight
                  ? "text-brand-gold hover:text-white hover:bg-white/10"
                  : "text-white/80 hover:text-white hover:bg-white/10"
            )}>
            {label}
          </Link>
        ))}
        <div className="ml-auto italic text-white/40" style={{ fontSize: 11 }}>
          Sporting Goods
        </div>
      </div>
    </div>
  )
}

// ── EXPORT ────────────────────────────────────────────────────────────────────

export function Header({ user, cartBadge }: Props) {
  return (
    <header className="w-full">
      <TopUtilityBar user={user} />
      <MainHeader user={user} cartBadge={cartBadge} />
      <CategoryNav />
    </header>
  )
}
