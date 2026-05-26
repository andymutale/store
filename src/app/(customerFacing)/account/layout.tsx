// src/app/(customerFacing)/account/layout.tsx
import Link from "next/link"
import { requireUser } from "@/lib/auth"
import { LayoutDashboard, ShoppingBag, MapPin, User } from "lucide-react"
import { AccountNavLink } from "./_components/AccountNavLink"

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  // Validates session in DB — redirects to /login if invalid
  const user = await requireUser()

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="font-extrabold text-text-primary text-2xl">My Account</h1>
        <p className="text-text-muted text-sm mt-0.5">{user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Sidebar nav */}
        <aside className="md:col-span-1">
          <nav className="bg-white border border-border-color rounded-md overflow-hidden">
            <AccountNavLink href="/account"         exact icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
            <AccountNavLink href="/account/orders"       icon={<ShoppingBag className="w-4 h-4" />}     label="My Orders" />
            <AccountNavLink href="/account/addresses"    icon={<MapPin className="w-4 h-4" />}           label="Addresses" />
            <AccountNavLink href="/account/profile"      icon={<User className="w-4 h-4" />}             label="Profile & Password" />
          </nav>
        </aside>

        {/* Page content */}
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  )
}
