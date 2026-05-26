// src/app/(customerFacing)/about/page.tsx
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-extrabold text-text-primary mb-2" style={{ fontSize: "clamp(24px,5vw,36px)" }}>
        About Brian Bands
      </h1>
      <p className="text-brand-blue font-semibold mb-8">Gqeberha's sports specialist since 1958</p>

      <div className="prose prose-sm max-w-none text-text-secondary space-y-5 leading-relaxed">
        <p>
          Brian Bands Sports has been the Eastern Cape's trusted sports retailer for over 67 years. Founded in 1958 in Gqeberha,
          we have built our reputation on genuine expert advice, authorised brand partnerships, and a genuine passion for sport.
        </p>
        <p>
          We stock a carefully curated range of running shoes, tennis equipment, football jerseys, hockey gear, netball equipment,
          and accessories from world-leading brands including Adidas, Nike, New Balance, Wilson, and Gryphon.
        </p>
        <p>
          Our staff are active athletes themselves — runners, tennis players, and coaches — which means the advice you get in-store
          or online is based on real experience, not just a product catalogue.
        </p>
        <h2 className="font-bold text-text-primary text-lg mt-8">Visit Us</h2>
        <p>
          We welcome walk-in customers for fitting appointments and expert shoe-fitting advice. Our Gqeberha store is open
          Monday–Friday 8am–5pm and Saturday 8am–1pm.
        </p>
        <p>
          <strong>Phone:</strong> <a href="tel:+27413635499" className="text-brand-blue hover:underline">041 363 5499</a><br />
          <strong>Email:</strong> <a href="mailto:admin@brianbands.co.za" className="text-brand-blue hover:underline">admin@brianbands.co.za</a>
        </p>
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/products"
          className="bg-brand-blue text-white font-semibold px-5 py-3 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors">
          Shop Online
        </Link>
        <Link href="/contact"
          className="border border-border-color text-text-secondary font-semibold px-5 py-3 rounded-sm text-sm hover:bg-light-grey transition-colors">
          Contact Us
        </Link>
      </div>
    </div>
  )
}
