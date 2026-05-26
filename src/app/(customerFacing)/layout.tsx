// src/app/(customerFacing)/layout.tsx
import { Header }    from "@/components/Header"
import { Footer }    from "@/components/Footer"
import { CartBadge } from "@/components/CartBadge"
import { getCurrentUser } from "@/lib/auth"

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} cartBadge={<CartBadge />} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
