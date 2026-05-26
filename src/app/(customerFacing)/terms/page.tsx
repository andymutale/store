// src/app/(customerFacing)/terms/page.tsx
export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-extrabold text-text-primary mb-2" style={{ fontSize: "clamp(24px,5vw,36px)" }}>Terms of Sale</h1>
      <p className="text-text-muted text-sm mb-8">Last updated: January 2026</p>
      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        {[
          { title: "Orders", body: "By placing an order you confirm you are at least 18 years old and that all information provided is accurate. We reserve the right to cancel orders where stock errors or pricing mistakes have occurred." },
          { title: "Pricing", body: "All prices are in South African Rand (ZAR) and include VAT where applicable. Prices are subject to change without notice. The price charged is the price displayed at the time of purchase." },
          { title: "Payment", body: "Payment is processed securely via Stripe. We accept all major credit and debit cards. Payment is taken at the time of order." },
          { title: "Delivery", body: "We aim to dispatch orders within one business day. Delivery timeframes are estimates and may vary. Risk of loss passes to you upon delivery." },
          { title: "Returns", body: "Unworn items may be returned within 30 days of delivery. See our Returns policy for full details. Refunds are processed within 5–7 business days." },
          { title: "Warranty", body: "Products are covered by the manufacturer's warranty where applicable. Warranty claims must be directed to us and we will liaise with the brand on your behalf." },
          { title: "Limitation of liability", body: "Our liability to you is limited to the price paid for the product. We are not liable for indirect or consequential losses." },
          { title: "Governing law", body: "These terms are governed by the laws of South Africa. Any disputes shall be subject to the jurisdiction of the South African courts." },
          { title: "Contact", body: "Questions about these terms? Email admin@brianbands.co.za or call 041 363 5499." },
        ].map(s => (
          <div key={s.title} className="bg-white border border-border-color rounded-md p-5">
            <h2 className="font-bold text-text-primary mb-2">{s.title}</h2>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
