// src/app/(customerFacing)/contact/page.tsx
export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-extrabold text-text-primary mb-2" style={{ fontSize: "clamp(24px,5vw,36px)" }}>
        Contact Us
      </h1>
      <p className="text-text-muted mb-10">We're here to help — reach us by phone, email, or visit us in store.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {[
          { label: "Phone",    value: "041 363 5499",            href: "tel:+27413635499",             icon: "📞" },
          { label: "Email",    value: "admin@brianbands.co.za",  href: "mailto:admin@brianbands.co.za", icon: "✉️" },
          { label: "Hours",    value: "Mon–Fri 8am–5pm · Sat 8am–1pm", href: null, icon: "🕐" },
          { label: "Location", value: "Gqeberha, Eastern Cape, South Africa", href: null, icon: "📍" },
        ].map(item => (
          <div key={item.label} className="bg-white border border-border-color rounded-md p-5 flex gap-4">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-1">{item.label}</p>
              {item.href
                ? <a href={item.href} className="text-brand-blue font-semibold hover:underline text-sm">{item.value}</a>
                : <p className="text-text-secondary text-sm">{item.value}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border-color rounded-md p-6">
        <h2 className="font-bold text-text-primary mb-4">Send us a message</h2>
        <form className="space-y-4" action="mailto:admin@brianbands.co.za" method="GET">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-text-primary">First name</label>
              <input name="firstName" type="text" className="input-base" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-text-primary">Last name</label>
              <input name="lastName" type="text" className="input-base" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-text-primary">Email</label>
            <input name="email" type="email" className="input-base" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-text-primary">Message</label>
            <textarea name="body" rows={5} className="input-base resize-none"
              placeholder="How can we help?" />
          </div>
          <button type="submit"
            className="bg-brand-blue text-white font-bold px-6 py-3 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors">
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}
