"use client"
// src/app/(customerFacing)/account/_components/AccountNavLink.tsx

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type Props = {
  href:  string
  label: string
  icon:  React.ReactNode
  exact?: boolean
}

export function AccountNavLink({ href, label, icon, exact }: Props) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/")

  return (
    <Link href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2",
        isActive
          ? "bg-brand-blue-light text-brand-blue border-brand-blue"
          : "text-text-secondary border-transparent hover:bg-light-grey hover:text-text-primary"
      )}>
      {icon}
      {label}
    </Link>
  )
}
