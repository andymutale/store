// src/app/(customerFacing)/page.tsx
import Link from "next/link"
import { Suspense } from "react"
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Star } from "lucide-react"
import db from "@/lib/db"
import { ProductCard, ProductCardSkeleton } from "./_components/ProductCard"

// ─── DATA ────────────────────────────────────────────────────────────────────

const productSelect = {
  slug: true, name: true, priceInCents: true, comparePriceInCents: true,
  shortDescription: true, isFeatured: true, isNew: true,
  brand:    { select: { name: true } },
  images:   { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
  variants: { select: { stock: true, isActive: true, priceInCents: true } },
} as const

async function getFeatured() {
  return db.product.findMany({
    where:   { isAvailableForPurchase: true, isFeatured: true },
    select:  productSelect,
    orderBy: { updatedAt: "desc" },
    take:    5,
  })
}

async function getNewest() {
  return db.product.findMany({
    where:   { isAvailableForPurchase: true, isNew: true },
    select:  productSelect,
    orderBy: { createdAt: "desc" },
    take:    5,
  })
}

// ─── SPORT CATEGORIES ────────────────────────────────────────────────────────

const SPORT_TILES = [
  { label: "Running",   href: "/category/running",   img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop" },
  { label: "Tennis",    href: "/category/tennis",    img: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&h=400&fit=crop" },
  { label: "Football",  href: "/category/football",  img: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=400&fit=crop" },
  { label: "Hockey",    href: "/category/hockey",    img: "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=600&h=400&fit=crop" },
]

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ── Hero banner grid ───────────────────────────────── */}
      <section className="max-w-content mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4" style={{ gridAutoRows: "minmax(250px,auto)" }}>

          {/* Main hero */}
          <div className="sm:col-span-2 relative rounded-md overflow-hidden group cursor-pointer"
            style={{
              backgroundImage: "url(https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=700&fit=crop)",
              backgroundSize: "cover", backgroundPosition: "center", minHeight: 280,
            }}>
            <div className="absolute inset-0 transition-opacity duration-300"
              style={{ background: "linear-gradient(90deg,rgba(0,0,0,0.7) 0%,transparent 100%)" }} />
            <div className="absolute bottom-0 left-0 p-5 sm:p-10 text-white">
              <p className="text-brand-gold uppercase font-semibold mb-2" style={{ fontSize: 11, letterSpacing: "0.12em" }}>
                New Season 2026
              </p>
              <h2 className="font-extrabold text-white mb-3" style={{ fontSize: "clamp(22px,5vw,40px)", lineHeight: 1.15 }}>
                Run Faster.<br />Play Harder.
              </h2>
              <p className="text-white/70 text-sm mb-5 max-w-xs">
                Adidas, Nike, New Balance &amp; more — in-store and online from Gqeberha.
              </p>
              <Link href="/products"
                className="inline-flex items-center bg-brand-blue text-white font-bold px-5 gap-2 rounded-sm button-hover hover:bg-brand-blue-dark transition-colors"
                style={{ height: 44, fontSize: 14 }}>
                Shop All Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute bottom-5 right-5 border-2 border-brand-gold text-brand-gold rounded-full flex items-center justify-center text-center font-bold"
              style={{ width: 52, height: 52, fontSize: 9 }}>
              Est.<br />1958
            </div>
          </div>

          {/* Two mini tiles */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {[
              { label: "New Arrivals", sub: "Fresh stock weekly", href: "/products?sort=newest", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=320&fit=crop" },
              { label: "Deals",        sub: "Up to 40% off",       href: "/deals",               img: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500&h=320&fit=crop" },
            ].map(tile => (
              <Link key={tile.href} href={tile.href}
                className="flex-1 relative rounded-md overflow-hidden group block"
                style={{ backgroundImage: `url(${tile.img})`, backgroundSize: "cover", backgroundPosition: "center", minHeight: 140 }}>
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                  <h3 className="font-bold" style={{ fontSize: "clamp(15px,3vw,18px)" }}>{tile.label}</h3>
                  <p className="text-white/70 text-xs mt-0.5">{tile.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquee ticker ─────────────────────────────────── */}
      <section className="w-full bg-brand-blue text-white overflow-hidden hidden sm:block" style={{ height: 36 }}>
        <div className="flex items-center h-full" style={{ fontSize: 12 }}>
          <div className="flex gap-8 whitespace-nowrap animate-scroll">
            {[
              "🚚 Free delivery on orders over R800",
              "👟 Adidas · Nike · New Balance · Wilson · Gryphon",
              "✓ Authorised dealer for all brands",
              "📍 In-store fitting advice — Gqeberha",
              "↩ 30-day returns on unworn items",
              "🏆 Trusted since 1958",
              "🚚 Free delivery on orders over R800",
              "👟 Adidas · Nike · New Balance · Wilson · Gryphon",
              "✓ Authorised dealer for all brands",
              "📍 In-store fitting advice — Gqeberha",
              "↩ 30-day returns on unworn items",
              "🏆 Trusted since 1958",
            ].map((item, i) => <span key={i}>{item} &nbsp;·</span>)}
          </div>
        </div>
      </section>

      {/* ── Shop by Sport ─────────────────────────────────── */}
      <section className="max-w-content mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <SectionHeader title="Shop by Sport" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {SPORT_TILES.map(tile => (
            <Link key={tile.href} href={tile.href}
              className="relative rounded-md overflow-hidden group block"
              style={{ backgroundImage: `url(${tile.img})`, backgroundSize: "cover", backgroundPosition: "center", aspectRatio: "4/3" }}>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-300" />
              <div className="absolute inset-0 flex items-end p-4">
                <div>
                  <p className="font-extrabold text-white" style={{ fontSize: "clamp(15px,3vw,20px)" }}>{tile.label}</p>
                  <p className="text-white/70 text-xs group-hover:text-brand-gold transition-colors mt-0.5">Shop now →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured products ─────────────────────────────── */}
      <section className="max-w-content mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
        <SectionHeader title="Featured Products" href="/products?featured=true" linkLabel="See all →" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Suspense fallback={<Skeletons n={5} />}>
            <ProductRow fetcher={getFeatured} />
          </Suspense>
        </div>
      </section>

      {/* ── New arrivals ───────────────────────────────────── */}
      <section className="max-w-content mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
        <SectionHeader title="Just Arrived" href="/products?sort=newest" linkLabel="See all →" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Suspense fallback={<Skeletons n={5} />}>
            <ProductRow fetcher={getNewest} />
          </Suspense>
        </div>
      </section>

      {/* ── Trust bar ──────────────────────────────────────── */}
      <section className="w-full bg-light-grey py-10 sm:py-16">
        <div className="max-w-content mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {[
            { icon: <Truck className="w-7 h-7 text-brand-blue" />,     label: "Nationwide delivery",    sub: "3–5 business days" },
            { icon: <RotateCcw className="w-7 h-7 text-brand-blue" />, label: "30-day returns",         sub: "Unworn items accepted" },
            { icon: <ShieldCheck className="w-7 h-7 text-brand-blue" />, label: "Authorised dealer",   sub: "All major brands" },
            { icon: <Star className="w-7 h-7 text-brand-blue" />,       label: "Est. 1958",            sub: "67 years of expertise" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2">
              {item.icon}
              <p className="font-bold text-text-primary text-sm">{item.label}</p>
              <p className="text-text-muted text-xs">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About strip ────────────────────────────────────── */}
      <section className="w-full bg-text-primary text-white py-12 sm:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-bold mb-2" style={{ fontSize: "clamp(24px,5vw,32px)", lineHeight: 1.2 }}>
              Good Price &amp; Good Advice
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed max-w-md">
              Gqeberha&rsquo;s specialist sports store since 1958. Expert fitting advice, authorised dealer
              stock, and nationwide delivery from the Eastern Cape.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full sm:w-auto">
            <Link href="/contact"
              className="border-2 border-white text-white px-6 py-3 font-semibold rounded-sm hover:bg-white hover:text-text-primary transition-colors text-sm text-center">
              Contact Us
            </Link>
            <Link href="/products"
              className="bg-brand-blue text-white px-6 py-3 font-semibold rounded-sm button-hover hover:bg-brand-blue-dark transition-colors text-sm text-center">
              Shop Online
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function ProductRow({ fetcher }: {
  fetcher: () => Promise<{
    slug: string; name: string; priceInCents: number; comparePriceInCents: number | null
    shortDescription: string | null; isFeatured: boolean; isNew: boolean
    brand: { name: string } | null
    images: { url: string; altText: string | null }[]
    variants: { stock: number; isActive: boolean; priceInCents: number | null }[]
  }[]>
}) {
  const products = await fetcher()
  if (products.length === 0) {
    return <p className="col-span-full text-text-muted text-sm py-8 text-center">No products yet — check back soon.</p>
  }
  return products.map(p => <ProductCard key={p.slug} {...p} />)
}

function Skeletons({ n }: { n: number }) {
  return Array.from({ length: n }).map((_, i) => <ProductCardSkeleton key={i} />)
}

function SectionHeader({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex justify-between items-center mb-5">
      <h2 className="font-bold flex items-center"
        style={{ fontSize: "clamp(16px,4vw,20px)", borderLeft: "4px solid var(--brand-blue)", paddingLeft: 12 }}>
        {title}
      </h2>
      {href && linkLabel && (
        <Link href={href} className="text-brand-blue font-semibold text-sm hover:underline">{linkLabel}</Link>
      )}
    </div>
  )
}
