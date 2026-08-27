// src/app/(customerFacing)/delivery/page.tsx
import Link from "next/link"

const ZONES = [
  { zone: "Eastern Cape (local)", provinces: "Eastern Cape", economy: "R89 · 2–3 days", express: "R149 · Next day", free: "Free over R800" },
  { zone: "Gauteng",              provinces: "Gauteng",       economy: "R99 · 3–4 days", express: "R179 · 1–2 days", free: "Free over R800" },
  { zone: "Western Cape",         provinces: "Western Cape",  economy: "R99 · 3–4 days", express: "R179 · 1–2 days", free: "Free over R800" },
  { zone: "Rest of South Africa", provinces: "All other provinces", economy: "R119 · 4–6 days", express: "R229 · 2–3 days", free: "Free over R1,000" },
]

export default function DeliveryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-extrabold text-text-primary mb-2" style={{ fontSize: "clamp(24px,5vw,36px)" }}>
        Delivery Information
      </h1>
      <p className="text-text-muted mb-10">We deliver nationwide across South Africa via Dawn Wing, Fastway, and FedEx.</p>

      <div className="space-y-6">
        <section>
          <h2 className="font-bold text-text-primary text-lg mb-4">Shipping Rates</h2>
          <div className="bg-white border border-border-color rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-light-grey text-text-muted text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Zone</th>
                  <th className="px-4 py-3 text-left">Economy</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Express</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Free shipping</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {ZONES.map(z => (
                  <tr key={z.zone} className="hover:bg-off-white">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-text-primary">{z.zone}</p>
                      <p className="text-text-muted text-xs">{z.provinces}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{z.economy}</td>
                    <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{z.express}</td>
                    <td className="px-4 py-3 text-brand-green font-medium hidden md:table-cell">{z.free}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white border border-border-color rounded-md p-6 space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="font-bold text-text-primary text-lg mb-1">How it works</h2>
          <p>Orders placed before <strong>12:00 noon</strong> on a business day are dispatched the same day. Orders placed after noon or on weekends are dispatched the next business day.</p>
          <p>Once dispatched, you will receive a tracking number by email. Delivery times are estimates and may vary during peak periods.</p>
          <p>We do not deliver to P.O. Boxes. Please provide a physical street address at checkout.</p>
        </section>

        <div className="text-sm text-text-muted">
          Questions about your delivery? <Link href="/contact" className="text-brand-blue hover:underline">Contact us</Link> or call <a href="tel:+10000000000" className="text-brand-blue hover:underline">000 000 0000</a>.
        </div>
      </div>
    </div>
  )
}
