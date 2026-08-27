"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ComponentProps, ReactNode } from "react"

// Shares the same brand-blue as the customer-facing header
export function Nav({ children }: { children: ReactNode }) {
  return (
    <nav className="w-full bg-brand-blue text-white flex px-4 sticky top-0 z-40">
      <div className="flex items-center gap-0 max-w-content w-full mx-auto">
        <span className="font-extrabold uppercase tracking-widest mr-auto py-4 text-xs">
          SAINT LAURENS · Admin
        </span>
        {children}
      </div>
    </nav>
  )
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
  const pathname = usePathname()
  const isActive = pathname === props.href

  return (
    <Link
      {...props}
      className={cn(
        "px-4 py-4 text-sm font-semibold uppercase tracking-wide transition-colors whitespace-nowrap",
        isActive
          ? "bg-white/15 text-white border-b-2 border-brand-gold"
          : "text-white/80 hover:text-white hover:bg-white/10"
      )}
    />
  )
}
