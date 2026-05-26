// src/app/(customerFacing)/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-extrabold text-text-primary mb-2" style={{ fontSize: "clamp(24px,5vw,36px)" }}>Privacy Policy</h1>
      <p className="text-text-muted text-sm mb-8">Last updated: January 2026</p>
      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        {[
          { title: "What we collect", body: "When you place an order we collect your name, email address, delivery address, and phone number. Payment details are processed securely by Stripe and are never stored by Brian Bands." },
          { title: "How we use your data", body: "We use your information to process and deliver your order, send order confirmation emails, and provide customer support. We do not sell or share your personal data with third parties for marketing purposes." },
          { title: "Cookies", body: "We use essential cookies to maintain your shopping cart session and keep you logged in. No tracking or advertising cookies are used." },
          { title: "Data retention", body: "Order records are retained for 7 years for accounting and tax purposes. Account data is retained until you request deletion." },
          { title: "Your rights", body: "You have the right to access, correct, or request deletion of your personal data at any time. Contact us at admin@brianbands.co.za to make a request." },
          { title: "Contact", body: "For any privacy-related queries, email admin@brianbands.co.za or call 041 363 5499." },
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
