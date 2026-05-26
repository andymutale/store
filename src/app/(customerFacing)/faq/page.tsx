"use client"
// src/app/(customerFacing)/faq/page.tsx

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const FAQS = [
  { q: "Do you offer free delivery?", a: "Yes — orders over R800 qualify for free economy delivery to most provinces (R1,000 threshold for remote areas). Free delivery is automatically applied at checkout." },
  { q: "How long does delivery take?", a: "Economy delivery takes 2–6 business days depending on your province. Express options (1–2 days) are available at checkout. See our Delivery page for full details." },
  { q: "Can I return shoes that don't fit?", a: "Yes — unworn shoes in original packaging can be returned within 30 days. Contact us at admin@brianbands.co.za with your order number to start a return." },
  { q: "Are your products genuine?", a: "Absolutely. Brian Bands is an authorised dealer for all brands we stock, including Adidas, Nike, New Balance, Wilson, and Gryphon. Every product is 100% genuine." },
  { q: "Do you offer in-store fitting?", a: "Yes — our Gqeberha store offers expert shoe fitting Monday–Friday 8am–5pm and Saturday 8am–1pm. Our staff are experienced athletes who can advise on the right fit for your foot type and training style." },
  { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards via Stripe. All payments are processed securely — we never store your card details." },
  { q: "Can I track my order?", a: "Yes — once your order is dispatched you will receive a tracking number by email. You can also view your order status in your account under My Orders." },
  { q: "What sizes do running shoes come in?", a: "Men's running shoes are stocked in UK 6–12. Ladies' running shoes are stocked in UK 3–8. Not all sizes are available for every style. The size picker on each product page shows which sizes are in stock." },
  { q: "Do you stock jerseys for kids?", a: "Currently our football jerseys are available in adult sizes (XS–XXL). Contact us if you need specific youth sizing and we can advise on availability." },
  { q: "How do I contact you?", a: "Call us on 041 363 5499 (Mon–Fri 8am–5pm, Sat 8am–1pm) or email admin@brianbands.co.za. We aim to respond to emails within one business day." },
]

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-extrabold text-text-primary mb-2" style={{ fontSize: "clamp(24px,5vw,36px)" }}>
        Frequently Asked Questions
      </h1>
      <p className="text-text-muted mb-10">Can't find your answer? <a href="mailto:admin@brianbands.co.za" className="text-brand-blue hover:underline">Email us</a> or call 041 363 5499.</p>

      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-white border border-border-color rounded-md overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-off-white transition-colors">
              <span className="font-semibold text-text-primary text-sm pr-4">{faq.q}</span>
              <ChevronDown className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-text-secondary leading-relaxed border-t border-border-color pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
