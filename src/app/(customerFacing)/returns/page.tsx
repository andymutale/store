// src/app/(customerFacing)/returns/page.tsx
import Link from "next/link"

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-extrabold text-text-primary mb-2" style={{ fontSize: "clamp(24px,5vw,36px)" }}>
        Returns &amp; Exchanges
      </h1>
      <p className="text-text-muted mb-10">We want you to love your purchase. If something isn't right, we'll make it right.</p>

      <div className="space-y-6">
        {[
          {
            title: "30-Day Return Policy",
            body: "You may return any unworn, unwashed item in its original packaging within 30 days of delivery for a full refund or exchange. Items must be in the same condition as received, with all tags attached.",
          },
          {
            title: "What we cannot accept",
            body: "We cannot accept returns on items that have been worn, washed, or damaged after delivery. Socks and compression garments are non-returnable for hygiene reasons.",
          },
          {
            title: "How to return",
            body: "Contact us at admin@brianbands.co.za or call 041 363 5499 with your order number. We will provide a return address and instructions. You are responsible for return shipping costs unless the item was faulty or incorrectly sent.",
          },
          {
            title: "Faulty or incorrect items",
            body: "If you received a faulty or incorrect item, contact us within 7 days of delivery and we will arrange collection and replacement or a full refund at no cost to you.",
          },
          {
            title: "Refunds",
            body: "Refunds are processed within 5–7 business days of receiving the returned item. The refund will be credited to the original payment method.",
          },
          {
            title: "Exchanges",
            body: "To exchange a size, return your item and place a new order. This is the fastest way to get the correct size, especially for high-demand products.",
          },
        ].map(section => (
          <div key={section.title} className="bg-white border border-border-color rounded-md p-5">
            <h2 className="font-bold text-text-primary mb-2">{section.title}</h2>
            <p className="text-text-secondary text-sm leading-relaxed">{section.body}</p>
          </div>
        ))}

        <div className="text-sm text-text-muted">
          Need help with a return?{" "}
          <Link href="/contact" className="text-brand-blue hover:underline">Contact us</Link> or call{" "}
          <a href="tel:+27413635499" className="text-brand-blue hover:underline">041 363 5499</a>.
        </div>
      </div>
    </div>
  )
}
