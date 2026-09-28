import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import { Truck, RotateCcw, ShieldCheck, Star } from "lucide-react"
import db from "@/lib/db"
import { formatCurrency } from "@/lib/formatters"


const productSelect = {
  slug: true, name: true, priceInCents: true, comparePriceInCents: true,
  shortDescription: true, isFeatured: true, isNew: true,
  brand:    { select: { name: true } },
  images:   { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
} as const

async function getFeatured() {
  return db.product.findMany({
    where:   { isAvailableForPurchase: true, isFeatured: true },
    select:  productSelect,
    orderBy: { updatedAt: "desc" },
    take:    4,
  })
}

async function getNewest() {
  return db.product.findMany({
    where:   { isAvailableForPurchase: true, isNew: true },
    select:  productSelect,
    orderBy: { createdAt: "desc" },
    take:    8,
  })
}

// Sport tiles and brand tiles link to real categories/brands from prisma/seed.js.

const SPORT_TILES = [
  { label: "Running",  href: "/category/running",  img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80" },
  { label: "Tennis",   href: "/category/tennis",   img: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1000&q=80" },
  { label: "Football", href: "/category/football", img: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=80" },
  { label: "Hockey",   href: "/category/hockey",   img: "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=1000&q=80" },
]

const POPULAR_CATEGORIES = [
  { num: "01", label: "Men's",       sub: "Performance gear for men",     shop: "Shop men's",       href: "/products?gender=men" },
  { num: "02", label: "Women's",     sub: "Performance gear for women",   shop: "Shop women's",     href: "/products?gender=women" },
  { num: "03", label: "Accessories", sub: "Socks, balls & extras",        shop: "Shop accessories", href: "/category/accessories" },
  { num: "04", label: "Sale",        sub: "Save on selected styles",      shop: "Shop the sale",    href: "/deals" },
]

const BRAND_TILES = [
  { label: "adidas",      href: "/products?brand=adidas" },
  { label: "Nike",        href: "/products?brand=nike" },
  { label: "New Balance", href: "/products?brand=new-balance" },
  { label: "Puma",        href: "/products?brand=puma" },
]

const HUB_ARTICLES = [
  { tag: "Guides",   title: "How to choose the right training shoe", img: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80" },
  { tag: "Training", title: "Build a better weekly training routine", img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80" },
  { tag: "Advice",   title: "What to pack for match day",             img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80" },
]


export default function HomePage() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative h-[560px] md:h-[650px] lg:h-[720px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=2200&q=85"
          alt="Athlete running on a track"
          fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 h-full max-w-content mx-auto px-4 sm:px-6 flex items-end pb-12 md:pb-16 lg:pb-20">
          <div className="max-w-[650px] text-white">
            <p className="uppercase text-xs tracking-[0.2em] mb-5">Saint Laurens Sporting Goods</p>
            <h1 className="font-bold" style={{ fontSize: "clamp(42px,9vw,105px)", lineHeight: 0.9, letterSpacing: "-0.05em" }}>
              TIME TO<br />PLAY.
            </h1>
            <p className="mt-6 text-base md:text-lg max-w-[480px] leading-relaxed">
              Gear for the game, the training and everything in between.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/products"
                className="bg-white text-black rounded-full px-7 py-3.5 text-sm font-semibold hover:bg-brand-gold transition-colors">
                Shop Now
              </Link>
              <a href="#shop-by-sport"
                className="border border-white text-white rounded-full px-7 py-3.5 text-sm font-semibold hover:bg-white hover:text-black transition-colors">
                Shop Sports
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ──────────────────────────────────────── */}
      <section className="w-full bg-light-grey py-8 sm:py-10">
        <div className="max-w-content mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {[
            { icon: <Truck className="w-6 h-6 text-brand-blue" />,       label: "Nationwide delivery", sub: "3–5 business days" },
            { icon: <RotateCcw className="w-6 h-6 text-brand-blue" />,   label: "30-day returns",      sub: "Unworn items accepted" },
            { icon: <ShieldCheck className="w-6 h-6 text-brand-blue" />, label: "Authorised dealer",   sub: "All major brands" },
            { icon: <Star className="w-6 h-6 text-brand-blue" />,        label: "Expert advice",       sub: "From real athletes" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-1.5">
              {item.icon}
              <p className="font-bold text-text-primary text-sm">{item.label}</p>
              <p className="text-text-muted text-xs">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Shop by Sport ──────────────────────────────────── */}
      <section id="shop-by-sport" className="max-w-content mx-auto px-4 sm:px-6 py-16 md:py-20">
        <SectionHeader eyebrow="Find your game" title="Shop by sport" href="/products" linkLabel="View all sports" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {SPORT_TILES.map(tile => (
            <Link key={tile.href} href={tile.href} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-light-grey">
                <Image src={tile.img} alt={tile.label} fill
                  className="object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="text-white text-xl sm:text-2xl font-semibold">{tile.label}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── New in ─────────────────────────────────────────── */}
      <section className="bg-off-white py-16 md:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <SectionHeader eyebrow="Fresh arrivals" title="New in" href="/products?sort=newest" linkLabel="Shop all new" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Suspense fallback={<Tiles n={8} />}>
              <ProductTileRow fetcher={getNewest} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ── Featured ───────────────────────────────────────── */}
      <section className="max-w-content mx-auto px-4 sm:px-6 py-16 md:py-20">
        <SectionHeader eyebrow="Hand-picked" title="Featured" href="/products?featured=true" linkLabel="Shop all featured" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Suspense fallback={<Tiles n={4} />}>
            <ProductTileRow fetcher={getFeatured} />
          </Suspense>
        </div>
      </section>

      {/* ── Featured campaign ──────────────────────────────── */}
      <section className="max-w-content mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <div className="relative overflow-hidden min-h-[420px] md:min-h-[560px]">
          <Image
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2200&q=85"
            alt="Athlete training" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/35" />
          <div className="relative z-10 min-h-[420px] md:min-h-[560px] flex items-end p-6 md:p-12 lg:p-16">
            <div className="text-white max-w-[600px]">
              <p className="uppercase tracking-[0.18em] text-xs mb-4">Train harder</p>
              <h2 className="font-bold" style={{ fontSize: "clamp(34px,7vw,70px)", lineHeight: 0.9, letterSpacing: "-0.05em" }}>
                TIME TO<br />TRAIN.
              </h2>
              <p className="mt-5 text-base max-w-[450px]">Training essentials built for every session.</p>
              <Link href="/products"
                className="inline-flex mt-7 bg-brand-gold text-black rounded-full px-7 py-3.5 text-sm font-bold hover:opacity-90 transition-opacity">
                Shop Training
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular categories ─────────────────────────────── */}
      <section className="max-w-content mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-2">Explore</p>
          <h2 className="font-semibold" style={{ fontSize: "clamp(26px,5vw,40px)", letterSpacing: "-0.04em" }}>
            Popular categories
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-border-color">
          {POPULAR_CATEGORIES.map(cat => (
            <Link key={cat.href} href={cat.href}
              className="group p-6 md:p-10 border-r border-b border-border-color hover:bg-brand-blue-light transition-colors">
              <p className="text-xs text-text-muted">{cat.num}</p>
              <h3 className="mt-12 md:mt-20 text-xl sm:text-2xl font-semibold text-text-primary">{cat.label}</h3>
              <p className="mt-3 text-xs text-text-secondary">{cat.sub}</p>
              <span className="inline-block mt-8 text-xs underline">{cat.shop}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Brands ─────────────────────────────────────────── */}
      <section className="w-full bg-brand-blue text-white py-16 md:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-2">Shop the brands</p>
              <h2 className="font-semibold" style={{ fontSize: "clamp(26px,5vw,40px)", letterSpacing: "-0.04em" }}>
                Brands you know
              </h2>
            </div>
            <Link href="/products" className="hidden md:block text-sm underline underline-offset-4">
              View all brands
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-white/20">
            {BRAND_TILES.map(brand => (
              <Link key={brand.href} href={brand.href}
                className="h-[130px] md:h-[170px] border-r border-b border-white/20 flex items-center justify-center text-2xl md:text-3xl font-bold hover:bg-white hover:text-brand-blue transition-colors">
                {brand.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sporting hub ───────────────────────────────────── */}
      <section className="max-w-content mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-2">Inspiration</p>
          <h2 className="font-semibold" style={{ fontSize: "clamp(26px,5vw,40px)", letterSpacing: "-0.04em" }}>
            Sporting hub
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {HUB_ARTICLES.map(article => (
            <article key={article.title} className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-light-grey">
                <Image src={article.img} alt={article.title} fill
                  className="object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <p className="mt-5 text-xs uppercase tracking-[0.15em] text-text-muted">{article.tag}</p>
              <h3 className="mt-2 text-lg font-semibold text-text-primary">{article.title}</h3>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}


type TileProduct = {
  slug: string; name: string; priceInCents: number; comparePriceInCents: number | null
  shortDescription: string | null; isFeatured: boolean; isNew: boolean
  brand: { name: string } | null
  images: { url: string; altText: string | null }[]
}

async function ProductTileRow({ fetcher }: { fetcher: () => Promise<TileProduct[]> }) {
  const products = await fetcher()
  if (products.length === 0) {
    return <p className="col-span-full text-text-muted text-sm py-8 text-center">No products yet — check back soon.</p>
  }
  return products.map(p => <ProductTile key={p.slug} {...p} />)
}

function ProductTile({ slug, name, priceInCents, comparePriceInCents, shortDescription, brand, isNew, images }: TileProduct) {
  const image     = images[0]
  const isOnSale  = comparePriceInCents != null && comparePriceInCents > priceInCents

  return (
    <article>
      <Link href={`/products/${slug}`} className="block group">
        <div className="relative aspect-square bg-white overflow-hidden">
          {isNew && (
            <span className="absolute left-3 top-3 z-10 bg-brand-gold text-black text-[11px] font-bold px-2.5 py-1">
              NEW
            </span>
          )}
          {!isNew && isOnSale && (
            <span className="absolute left-3 top-3 z-10 bg-brand-red text-white text-[11px] font-bold px-2.5 py-1">
              SALE
            </span>
          )}
          {image ? (
            <Image src={image.url} alt={image.altText ?? name} fill
              className="object-cover group-hover:scale-[1.03] transition duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">No image</div>
          )}
        </div>
        <div className="pt-4">
          <p className="text-[13px] text-text-muted">{brand?.name ?? shortDescription ?? "Saint Laurens"}</p>
          <h3 className="mt-1 text-[15px] font-medium text-text-primary line-clamp-2">{name}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-sm font-semibold ${isOnSale ? "text-brand-red" : "text-text-primary"}`}>
              {formatCurrency(priceInCents / 100)}
            </span>
            {isOnSale && (
              <span className="text-text-muted text-xs line-through">
                {formatCurrency(comparePriceInCents! / 100)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}

function Tiles({ n }: { n: number }) {
  return Array.from({ length: n }).map((_, i) => (
    <div key={i} className="animate-pulse">
      <div className="aspect-square bg-light-grey" />
      <div className="pt-4 space-y-2">
        <div className="h-3 bg-light-grey rounded w-1/3" />
        <div className="h-4 bg-light-grey rounded w-3/4" />
        <div className="h-4 bg-light-grey rounded w-1/2" />
      </div>
    </div>
  ))
}

function SectionHeader({ eyebrow, title, href, linkLabel }: { eyebrow: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-2">{eyebrow}</p>
        <h2 className="font-semibold" style={{ fontSize: "clamp(26px,5vw,40px)", letterSpacing: "-0.04em" }}>
          {title}
        </h2>
      </div>
      {href && linkLabel && (
        <Link href={href} className="hidden md:block text-sm underline underline-offset-4">{linkLabel}</Link>
      )}
    </div>
  )
}
