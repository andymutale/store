import { Nav, NavLink } from "./_components/Nav"

export const dynamic = "force-dynamic"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav>
        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink href="/admin/products">Products</NavLink>
        <NavLink href="/admin/categories">Categories</NavLink>
        <NavLink href="/admin/brands">Brands</NavLink>
        <NavLink href="/admin/customers">Customers</NavLink>
        <NavLink href="/admin/orders">Orders</NavLink>
      </Nav>
      <div className="max-w-content mx-auto px-4 sm:px-6 my-6">
        {children}
      </div>
    </>
  )
}
