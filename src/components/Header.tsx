"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Search, Menu, X, User, LogOut, ChevronDown } from "lucide-react"
import { useState, useTransition } from "react"
import { logout } from "@/app/_actions/auth"
import type { CurrentUser } from "@/lib/auth"

type Props = { user: CurrentUser | null; cartBadge?: React.ReactNode }

// ── SITE STRUCTURE ───────────────────────────────────────────────────────────
// Real routes only — kept in sync with prisma/seed.js categories & brands.

const SPORT_LINKS = [
  { label: "Running",     href: "/category/running" },
  { label: "Tennis",      href: "/category/tennis" },
  { label: "Football",    href: "/category/football" },
  { label: "Hockey",      href: "/category/hockey" },
  { label: "Netball",     href: "/category/netball" },
  { label: "Accessories", href: "/category/accessories" },
]

const BRAND_LINKS = [
  { label: "Adidas",      href: "/products?brand=adidas" },
  { label: "Nike",        href: "/products?brand=nike" },
  { label: "New Balance", href: "/products?brand=new-balance" },
  { label: "Puma",        href: "/products?brand=puma" },
  { label: "Wilson",      href: "/products?brand=wilson" },
  { label: "Gryphon",     href: "/products?brand=gryphon" },
]

// ── ANNOUNCEMENT BAR ──────────────────────────────────────────────────────────

function AnnouncementBar() {
  return (
    <div className="w-full bg-brand-blue text-white text-center text-xs tracking-wide py-2.5 px-4">
      Free delivery on orders over R800
    </div>
  )
}

// ── NAV DROPDOWN (desktop) ────────────────────────────────────────────────────

function NavDropdown({ label, items }: { label: string; items: { label: string; href: string }[] }) {
  return (
    <div className="relative group">
      <button className="flex items-center gap-1 py-2 hover:text-brand-blue transition-colors">
        {label} <ChevronDown className="w-3.5 h-3.5" />
      </button>
      <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
        <div className="bg-white border border-border-color rounded-md shadow-lg py-2 min-w-[190px]">
          {items.map(item => (
            <Link key={item.href} href={item.href}
              className="block px-4 py-2 text-sm text-text-primary hover:bg-off-white hover:text-brand-blue transition-colors">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── ACCOUNT MENU ──────────────────────────────────────────────────────────────

function AccountMenu({ user }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleLogout() {
    startTransition(async () => {
      await logout()
      router.push("/")
      router.refresh()
    })
  }

  if (!user) {
    return (
      <Link href="/login" aria-label="Sign in"
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-off-white transition-colors">
        <User className="w-[18px] h-[18px]" />
      </Link>
    )
  }

  return (
    <div className="relative group">
      <button aria-label="Account menu"
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-off-white transition-colors">
        <User className="w-[18px] h-[18px]" />
      </button>
      <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-50">
        <div className="bg-white border border-border-color rounded-md shadow-lg py-2 min-w-[200px] text-sm">
          <p className="px-4 py-1.5 text-text-muted text-xs">
            Hi, {user.firstName ?? user.email.split("@")[0]}
          </p>
          <Link href="/account" className="block px-4 py-2 hover:bg-off-white hover:text-brand-blue transition-colors">
            My Account
          </Link>
          <Link href="/account/orders" className="block px-4 py-2 hover:bg-off-white hover:text-brand-blue transition-colors">
            My Orders
          </Link>
          <button onClick={handleLogout} disabled={isPending}
            className="w-full text-left px-4 py-2 hover:bg-off-white hover:text-brand-red transition-colors flex items-center gap-2 disabled:opacity-50">
            <LogOut className="w-3.5 h-3.5" /> {isPending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MAIN HEADER ───────────────────────────────────────────────────────────────

export function Header({ user, cartBadge }: Props) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <AnnouncementBar />

      <header className="w-full border-b border-border-color bg-white sticky top-0 z-50">
        <div className="max-w-content mx-auto px-4 sm:px-6 h-[70px] sm:h-[76px] flex items-center justify-between gap-4 sm:gap-8">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-brand-blue leading-none">↑</span>
              <span className="text-lg sm:text-xl tracking-tight font-medium text-text-primary">
                Saint Laurens
              </span>
            </div>
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden lg:flex items-center gap-7 text-sm text-text-primary flex-1">
            <NavDropdown label="Shop by Sport" items={SPORT_LINKS} />
            <NavDropdown label="Brands" items={BRAND_LINKS} />
            <Link href="/products" className="hover:text-brand-blue transition-colors">All Products</Link>
            <Link href="/deals" className="font-semibold text-brand-red hover:opacity-70 transition-opacity ml-auto">
              Sale
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button onClick={() => setSearchOpen(true)} aria-label="Search"
              className="hidden md:flex items-center gap-2 border border-border-color rounded-full px-4 py-2 text-[13px] hover:border-brand-blue transition-colors">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <button onClick={() => setSearchOpen(true)} aria-label="Search"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-off-white transition-colors">
              <Search className="w-[18px] h-[18px]" />
            </button>

            <AccountMenu user={user} />

            <Link href="/cart" aria-label="Cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-off-white transition-colors">
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartBadge}
            </Link>

            <button onClick={() => setMobileMenuOpen(o => !o)} aria-label="Menu"
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-off-white transition-colors">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border-color bg-white">
            <div className="max-w-content mx-auto px-5 py-4 space-y-5 text-sm">

              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted mb-2">Shop by Sport</p>
                <div className="flex flex-wrap gap-2">
                  {SPORT_LINKS.map(l => (
                    <Link key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)}
                      className="border border-border-color rounded-full px-3 py-1.5 hover:border-brand-blue hover:text-brand-blue transition-colors">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted mb-2">Brands</p>
                <div className="flex flex-wrap gap-2">
                  {BRAND_LINKS.map(l => (
                    <Link key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)}
                      className="border border-border-color rounded-full px-3 py-1.5 hover:border-brand-blue hover:text-brand-blue transition-colors">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-0.5 pt-1 border-t border-border-color">
                <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="py-2 font-medium">
                  All Products
                </Link>
                <Link href="/deals" onClick={() => setMobileMenuOpen(false)} className="py-2 font-semibold text-brand-red">
                  Sale
                </Link>
                {user ? (
                  <>
                    <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="py-2">My Account</Link>
                    <Link href="/account/orders" onClick={() => setMobileMenuOpen(false)} className="py-2">My Orders</Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="py-2">Sign In</Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="py-2 font-semibold">Register</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Full-screen search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-28 sm:pt-32 px-4"
          style={{ backgroundColor: "rgba(251,250,247,0.97)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-2xl">
            <form action="/products" method="GET"
              className="flex items-center rounded-full border border-border-color bg-white"
              style={{ height: 52 }}>
              <Search className="w-5 h-5 ml-5 flex-shrink-0 text-text-muted" />
              <input name="q" type="text" placeholder="Search products, brands…" autoFocus
                className="flex-1 bg-transparent text-text-primary px-4 outline-none text-base placeholder:text-text-muted" />
              <button type="button" onClick={() => setSearchOpen(false)}
                className="mr-5 text-text-muted hover:text-text-primary text-xl">✕</button>
            </form>
          </div>
          <button aria-label="Close search" onClick={() => setSearchOpen(false)} className="absolute inset-0 -z-10" />
        </div>
      )}
    </>
  )
}
