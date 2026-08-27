// prisma/seed.js — Saint Laurens Sporting Goods
// Populates categories, brands, and all products with per-size stock.
//
// Run:                node prisma/seed.js
// Reset and reseed:   npx prisma migrate reset

const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Build shoe variant rows for a given product
// sizeType: "mens_uk" | "ladies_uk" | "clothing"
function shoeVariants(sku, sizeType, color = null, overridePrice = null) {
  const sizeMaps = {
    mens_uk:   ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"],
    ladies_uk: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8"],
    clothing:  ["XS", "S", "M", "L", "XL", "XXL"],
  };
  return sizeMaps[sizeType].map((size, i) => ({
    sku:         `${sku}-${size.replace(/\s/g, "")}`,
    size,
    color,
    stock:       rand(0, 15),
    priceInCents: overridePrice,
    sortOrder:   i,
  }));
}

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

const categoryTree = [
  {
    name: "Running",
    slug: "running",
    sortOrder: 1,
    children: [
      { name: "Men's Running Shoes",   slug: "mens-running-shoes",   sortOrder: 1 },
      { name: "Women's Running Shoes", slug: "womens-running-shoes", sortOrder: 2 },
    ],
  },
  {
    name: "Tennis",
    slug: "tennis",
    sortOrder: 2,
    children: [
      { name: "Men's Tennis Shoes",   slug: "mens-tennis-shoes",   sortOrder: 1 },
      { name: "Women's Tennis Shoes", slug: "womens-tennis-shoes", sortOrder: 2 },
      { name: "Tennis Rackets",       slug: "tennis-rackets",      sortOrder: 3 },
    ],
  },
  {
    name: "Football",
    slug: "football",
    sortOrder: 3,
    children: [
      { name: "Football Jerseys", slug: "football-jerseys", sortOrder: 1 },
    ],
  },
  {
    name: "Hockey",
    slug: "hockey",
    sortOrder: 4,
    children: [
      { name: "Hockey Sticks", slug: "hockey-sticks", sortOrder: 1 },
    ],
  },
  {
    name: "Netball",
    slug: "netball",
    sortOrder: 5,
    children: [],
  },
  {
    name: "Accessories",
    slug: "accessories",
    sortOrder: 6,
    children: [
      { name: "Socks",      slug: "socks",      sortOrder: 1 },
      { name: "Balls",      slug: "balls",      sortOrder: 2 },
    ],
  },
];

// ─── BRANDS ──────────────────────────────────────────────────────────────────

const brands = [
  { name: "Adidas",  slug: "adidas",  websiteUrl: "https://www.adidas.com/za" },
  { name: "Nike",    slug: "nike",    websiteUrl: "https://www.nike.com/za" },
  { name: "New Balance", slug: "new-balance", websiteUrl: "https://www.newbalance.com/za" },
  { name: "Puma",    slug: "puma",    websiteUrl: "https://www.puma.com/za" },
  { name: "Wilson",  slug: "wilson",  websiteUrl: "https://www.wilson.com" },
  { name: "Gryphon", slug: "gryphon", websiteUrl: "https://www.gryphonsport.com" },
  { name: "Gilbert", slug: "gilbert", websiteUrl: "https://www.gilbertrugby.com" },
];

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
// Defined as a function so it has access to the resolved category / brand IDs.

function buildProducts(catMap, brandMap) {
  const c = (slug) => {
    if (!catMap[slug]) throw new Error(`Category slug not found: "${slug}"`);
    return catMap[slug];
  };
  const b = (slug) => {
    if (!brandMap[slug]) throw new Error(`Brand slug not found: "${slug}"`);
    return brandMap[slug];
  };

  return [
    // ── RUNNING — MEN ────────────────────────────────────────────────────────
    {
      name:        "Adidas Adizero Boston 13 – Men",
      slug:        "adidas-adizero-boston-13-men",
      shortDescription: "Speed trainer with LIGHTSTRIKE PRO foam and ENERGYRODS 2.0",
      description: "Built for speed workouts and race day. LIGHTSTRIKE PRO foam delivers a propulsive, lightweight ride, while ENERGYRODS 2.0 stiffen the forefoot for a powerful toe-off. A versatile trainer that doubles as a race shoe for distances from 5K to the marathon.",
      priceInCents: 264000,
      comparePriceInCents: null,
      gender: "men",
      sport:  "running",
      sizeSystem: "uk_shoe",
      isFeatured: true,
      isNew: false,
      categoryId: c("mens-running-shoes"),
      brandId:    b("adidas"),
      images: [
        { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop", altText: "Adidas Adizero Boston 13 Men", isPrimary: true },
        { url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=600&fit=crop", altText: "Adidas Adizero Boston 13 Men – side", isPrimary: false },
      ],
      variants: shoeVariants("ADIZ-BOSTON-13-M", "mens_uk", "Cloud White / Core Black"),
    },
    {
      name:        "Adidas Adizero Adios Pro 4",
      slug:        "adidas-adizero-adios-pro-4",
      shortDescription: "Elite carbon-plate marathon racer",
      description: "The elite marathoner's weapon of choice. Stacked LIGHTSTRIKE PRO between carbon-fibre ENERGYRODS makes this the fastest shoe in the Adizero range. Used at every World Marathon Major. For competitive runners chasing a PB.",
      priceInCents: 440000,
      gender: "unisex",
      sport:  "running",
      sizeSystem: "mens_uk",
      isFeatured: true,
      isNew: true,
      categoryId: c("mens-running-shoes"),
      brandId:    b("adidas"),
      images: [
        { url: "https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=800&h=600&fit=crop", altText: "Adidas Adizero Adios Pro 4", isPrimary: true },
      ],
      variants: shoeVariants("ADIZ-ADIOS-PRO-4", "mens_uk", "Solar Orange / Core Black"),
    },
    {
      name:        "Nike Air Zoom Pegasus 42 Wide – Men",
      slug:        "nike-air-zoom-pegasus-42-wide-men",
      shortDescription: "Daily trainer with dual Zoom Air and ReactX foam, wide fit",
      description: "The Pegasus 42 Wide gives runners with broader feet the same legendary cushion. Dual Zoom Air units, ReactX foam, and a wider forefoot platform for natural toe splay on every run. The go-to shoe for long miles and easy days.",
      priceInCents: 290000,
      gender: "men",
      sport:  "running",
      sizeSystem: "uk_shoe",
      isFeatured: false,
      isNew: false,
      categoryId: c("mens-running-shoes"),
      brandId:    b("nike"),
      images: [
        { url: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&h=600&fit=crop", altText: "Nike Air Zoom Pegasus 42 Wide Men", isPrimary: true },
      ],
      variants: shoeVariants("NK-PEG-42-WIDE-M", "mens_uk", "Black / White"),
    },
    {
      name:        "New Balance 860 V15 – Men",
      slug:        "new-balance-860-v15-men",
      shortDescription: "Stability trainer with Fresh Foam X and medial post",
      description: "New Balance's flagship stability shoe with Fresh Foam X midsole and a medial post for overpronation support. The engineered mesh upper improves breathability while maintaining structure for long-distance runs.",
      priceInCents: 330000,
      gender: "men",
      sport:  "running",
      sizeSystem: "uk_shoe",
      isFeatured: false,
      isNew: false,
      categoryId: c("mens-running-shoes"),
      brandId:    b("new-balance"),
      images: [
        { url: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&h=600&fit=crop", altText: "New Balance 860 V15 Men", isPrimary: true },
      ],
      variants: shoeVariants("NB-860-V15-M", "mens_uk", "Navy / White"),
    },

    // ── RUNNING — WOMEN ──────────────────────────────────────────────────────
    {
      name:        "Adidas Adizero Boston 13 – Ladies",
      slug:        "adidas-adizero-boston-13-ladies",
      shortDescription: "Women's speed trainer with LIGHTSTRIKE PRO foam",
      description: "The women's Adizero Boston 13 in a women's-specific last with LIGHTSTRIKE PRO midsole and flexible knit upper. Ideal as both a daily trainer and a race shoe for 5K through half-marathon distances.",
      priceInCents: 231000,
      gender: "women",
      sport:  "running",
      sizeSystem: "uk_shoe",
      isFeatured: true,
      isNew: false,
      categoryId: c("womens-running-shoes"),
      brandId:    b("adidas"),
      images: [
        { url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=600&fit=crop", altText: "Adidas Adizero Boston 13 Ladies", isPrimary: true },
      ],
      variants: shoeVariants("ADIZ-BOSTON-13-W", "ladies_uk", "Cloud White / Almost Lime"),
    },

    // ── TENNIS SHOES — MEN ───────────────────────────────────────────────────
    {
      name:        "Adidas Adizero Ubersonic 5 – Men",
      slug:        "adidas-adizero-ubersonic-5-men",
      shortDescription: "Lightest Adidas tennis shoe — LIGHTSTRIKE + herringbone outsole",
      description: "Adidas's lightest tennis shoe. LIGHTSTRIKE cushioning, ADITUFF abrasion-resistant toe cap, and a herringbone outsole built for lightning-fast lateral cuts on clay and hard courts.",
      priceInCents: 210000,
      gender: "men",
      sport:  "tennis",
      sizeSystem: "uk_shoe",
      isFeatured: false,
      isNew: false,
      categoryId: c("mens-tennis-shoes"),
      brandId:    b("adidas"),
      images: [
        { url: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&h=600&fit=crop", altText: "Adidas Ubersonic 5 Men", isPrimary: true },
      ],
      variants: shoeVariants("ADIZ-UBERSONIC-5-M", "mens_uk", "Cloud White / Core Black"),
    },
    {
      name:        "Adidas Barricade 13 – Men",
      slug:        "adidas-barricade-13-men",
      shortDescription: "Hard-court durability with exoskeletal support",
      description: "Built to last from the baseline. The Barricade 13 surrounds your foot in a supportive exoskeleton with ADITUFF reinforcement and LIGHTSTRIKE cushioning for relentless hard-court grinding.",
      priceInCents: 264000,
      gender: "men",
      sport:  "tennis",
      sizeSystem: "uk_shoe",
      isFeatured: false,
      isNew: false,
      categoryId: c("mens-tennis-shoes"),
      brandId:    b("adidas"),
      images: [
        { url: "https://images.unsplash.com/photo-1562183241-b937e9102303?w=800&h=600&fit=crop", altText: "Adidas Barricade 13 Men", isPrimary: true },
      ],
      variants: shoeVariants("ADIZ-BARRICADE-13-M", "mens_uk", "Legend Ink / Cloud White"),
    },

    // ── TENNIS SHOES — WOMEN ─────────────────────────────────────────────────
    {
      name:        "Adidas Adizero Ubersonic 5 – Ladies",
      slug:        "adidas-adizero-ubersonic-5-ladies",
      shortDescription: "Women's lightweight clay and hard court tennis shoe",
      description: "Women's edition of the Ubersonic 5 with a narrower last and softer LIGHTSTRIKE foam. ADITUFF toe reinforcement handles aggressive court movement and sliding on clay.",
      priceInCents: 240000,
      gender: "women",
      sport:  "tennis",
      sizeSystem: "uk_shoe",
      isFeatured: false,
      isNew: false,
      categoryId: c("womens-tennis-shoes"),
      brandId:    b("adidas"),
      images: [
        { url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&h=600&fit=crop", altText: "Adidas Ubersonic 5 Ladies", isPrimary: true },
      ],
      variants: shoeVariants("ADIZ-UBERSONIC-5-W", "ladies_uk", "Cloud White / Pink Spark"),
    },
    {
      name:        "Adidas Barricade 13 – Ladies",
      slug:        "adidas-barricade-13-ladies",
      shortDescription: "Women's hard-court stability tennis shoe",
      description: "The women's Barricade 13 delivers the same hard-court durability in a women's-specific fit. Wide toe box, exoskeletal support, and LIGHTSTRIKE foam for long match comfort.",
      priceInCents: 245000,
      gender: "women",
      sport:  "tennis",
      sizeSystem: "uk_shoe",
      isFeatured: false,
      isNew: false,
      categoryId: c("womens-tennis-shoes"),
      brandId:    b("adidas"),
      images: [
        { url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=600&fit=crop", altText: "Adidas Barricade 13 Ladies", isPrimary: true },
      ],
      variants: shoeVariants("ADIZ-BARRICADE-13-W", "ladies_uk", "Cloud White / Lucid Fuchsia"),
    },

    // ── TENNIS RACKETS ───────────────────────────────────────────────────────
    {
      name:        "Wilson Ultra 100 V5.0 – Tennis Racket",
      slug:        "wilson-ultra-100-v5",
      shortDescription: "100 sq.in power-and-control racket for intermediate players",
      description: "FeelFlex technology delivers cleaner ball pocketing and a more comfortable strike. 100 sq.in head, 16×19 string pattern for a blend of power and control. Perfect for intermediate to advanced club players.",
      priceInCents: 490000,
      gender: "unisex",
      sport:  "tennis",
      sizeSystem: "none",
      isFeatured: false,
      isNew: false,
      categoryId: c("tennis-rackets"),
      brandId:    b("wilson"),
      images: [
        { url: "https://images.unsplash.com/photo-1617083934551-ac1f2f71b1e1?w=800&h=600&fit=crop", altText: "Wilson Ultra 100 V5.0", isPrimary: true },
      ],
      // No size — single variant
      variants: [{ sku: "WILSON-ULTRA-100-V5", size: null, color: null, stock: rand(2, 10), sortOrder: 0 }],
    },
    {
      name:        "Wilson Pro Staff 97 – Tennis Racket",
      slug:        "wilson-pro-staff-97",
      shortDescription: "Tour-level control, 97 sq.in, 18×20 string pattern",
      description: "The legendary Pro Staff refined for today's game. Braided graphite frame, 97 sq.in head, 18×20 dense string pattern for tour-level precision and control. Used by professionals worldwide.",
      priceInCents: 550000,
      gender: "unisex",
      sport:  "tennis",
      sizeSystem: "none",
      isFeatured: false,
      isNew: false,
      categoryId: c("tennis-rackets"),
      brandId:    b("wilson"),
      images: [
        { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", altText: "Wilson Pro Staff 97", isPrimary: true },
      ],
      variants: [{ sku: "WILSON-PRO-STAFF-97", size: null, color: null, stock: rand(2, 8), sortOrder: 0 }],
    },

    // ── FOOTBALL JERSEYS ─────────────────────────────────────────────────────
    {
      name:        "Adidas Bafana Bafana 26/27 – Home Jersey",
      slug:        "bafana-bafana-2627-home-jersey",
      shortDescription: "Official SA home jersey — AEROREADY, yellow & green",
      description: "Support Bafana Bafana in the official 2026/27 home jersey. Vibrant yellow and green colourway, AEROREADY moisture management, and heat-transfer badge. Officially licensed Adidas replica.",
      priceInCents: 160000,
      gender: "unisex",
      sport:  "football",
      sizeSystem: "clothing",
      isFeatured: true,
      isNew: true,
      categoryId: c("football-jerseys"),
      brandId:    b("adidas"),
      images: [
        { url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop", altText: "Bafana Bafana 26/27 Home Jersey", isPrimary: true },
      ],
      variants: shoeVariants("BAFANA-HOME-2627", "clothing", "Yellow / Green"),
    },
    {
      name:        "Adidas Bafana Bafana 26/27 – Away Jersey",
      slug:        "bafana-bafana-2627-away-jersey",
      shortDescription: "Official SA away jersey — AEROREADY, forest green",
      description: "The 2026/27 Bafana Bafana away kit in deep forest green with gold trim. AEROREADY fabric keeps you cool in the stands or on the pitch. Officially licensed Adidas replica.",
      priceInCents: 160000,
      gender: "unisex",
      sport:  "football",
      sizeSystem: "clothing",
      isFeatured: false,
      isNew: true,
      categoryId: c("football-jerseys"),
      brandId:    b("adidas"),
      images: [
        { url: "https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?w=800&h=600&fit=crop", altText: "Bafana Bafana 26/27 Away Jersey", isPrimary: true },
      ],
      variants: shoeVariants("BAFANA-AWAY-2627", "clothing", "Forest Green / Gold"),
    },
    {
      name:        "Adidas Argentina 26/27 – Home Jersey",
      slug:        "argentina-2627-home-jersey",
      shortDescription: "La Albiceleste 2026 home kit — sky blue & white stripes",
      description: "Wear the iconic sky-blue and white stripes of La Albiceleste. 2026 era home jersey with heat-sealed badge and AEROREADY technology. A must-have for any Argentina fan.",
      priceInCents: 160000,
      gender: "unisex",
      sport:  "football",
      sizeSystem: "clothing",
      isFeatured: false,
      isNew: true,
      categoryId: c("football-jerseys"),
      brandId:    b("adidas"),
      images: [
        { url: "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=800&h=600&fit=crop", altText: "Argentina 26/27 Home Jersey", isPrimary: true },
      ],
      variants: shoeVariants("ARG-HOME-2627", "clothing", "Light Blue / White"),
    },
    {
      name:        "Adidas Germany 26/27 – Home Jersey",
      slug:        "germany-2627-home-jersey",
      shortDescription: "Die Mannschaft 2026 home kit — classic white & black",
      description: "Classic white with bold black stripes — the timeless Germany home jersey. Lightweight AEROREADY fabric with an athletic slim fit. Four-time World Champions' colours.",
      priceInCents: 160000,
      gender: "unisex",
      sport:  "football",
      sizeSystem: "clothing",
      isFeatured: false,
      isNew: true,
      categoryId: c("football-jerseys"),
      brandId:    b("adidas"),
      images: [
        { url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop", altText: "Germany 26/27 Home Jersey", isPrimary: true },
      ],
      variants: shoeVariants("GER-HOME-2627", "clothing", "White / Black"),
    },
    {
      name:        "Adidas Spain 26/27 – Home Jersey",
      slug:        "spain-2627-home-jersey",
      shortDescription: "La Roja defending champions 2026 home kit — deep red",
      description: "La Roja's 2026/27 home kit in classic deep red. Defending world champions' jersey with heat-transfer RFEF badge and AEROREADY technology. Slim-fit cut for a modern silhouette.",
      priceInCents: 160000,
      gender: "unisex",
      sport:  "football",
      sizeSystem: "clothing",
      isFeatured: false,
      isNew: true,
      categoryId: c("football-jerseys"),
      brandId:    b("adidas"),
      images: [
        { url: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=600&fit=crop", altText: "Spain 26/27 Home Jersey", isPrimary: true },
      ],
      variants: shoeVariants("ESP-HOME-2627", "clothing", "Bold Red / White"),
    },
    {
      name:        "Puma Portugal 26/27 – Home Jersey",
      slug:        "portugal-2627-home-jersey",
      shortDescription: "A Seleção 2026 home kit — classic red & green, dryCELL",
      description: "Wear the colours of the Seleção. Puma's 2026/27 Portugal home jersey in classic red and green with dryCELL sweat-wicking technology and a tailored athletic fit.",
      priceInCents: 160000,
      gender: "unisex",
      sport:  "football",
      sizeSystem: "clothing",
      isFeatured: false,
      isNew: true,
      categoryId: c("football-jerseys"),
      brandId:    b("puma"),
      images: [
        { url: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=600&fit=crop", altText: "Portugal 26/27 Home Jersey", isPrimary: true },
      ],
      variants: shoeVariants("POR-HOME-2627", "clothing", "Flame Red / Pine Green"),
    },

    // ── HOCKEY ───────────────────────────────────────────────────────────────
    {
      name:        "Gryphon Tour Pro – Composite Hockey Stick",
      slug:        "gryphon-tour-pro-hockey-stick",
      shortDescription: "High carbon composite, low bow — drag flicks and aerials",
      description: "High carbon composite construction for power and accuracy. Low-bow profile suits drag flicks and aerial passes. Suitable from club to provincial level, the Tour Pro delivers consistent performance season after season.",
      priceInCents: 189900,
      gender: "unisex",
      sport:  "hockey",
      sizeSystem: "none",
      isFeatured: false,
      isNew: false,
      categoryId: c("hockey-sticks"),
      brandId:    b("gryphon"),
      images: [
        { url: "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=800&h=600&fit=crop", altText: "Gryphon Tour Pro Hockey Stick", isPrimary: true },
      ],
      variants: [
        { sku: "GRYP-TOUR-PRO-36",  size: "36.5\"", color: null, stock: rand(2, 8), sortOrder: 0 },
        { sku: "GRYP-TOUR-PRO-37",  size: "37.5\"", color: null, stock: rand(2, 8), sortOrder: 1 },
      ],
    },

    // ── NETBALL ──────────────────────────────────────────────────────────────
    {
      name:        "Gilbert Netball – Match Ball",
      slug:        "gilbert-netball-match-ball",
      shortDescription: "Official Gilbert match-grade netball — 6–7 psi",
      description: "Official Gilbert match-grade netball with hand-stitched panels, textured surface for superior grip, and rubber bladder for consistent air retention. Approved for training and competitive matches.",
      priceInCents: 59900,
      gender: "unisex",
      sport:  "netball",
      sizeSystem: "none",
      isFeatured: false,
      isNew: false,
      categoryId: c("balls"),
      brandId:    b("gilbert"),
      images: [
        { url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop", altText: "Gilbert Match Netball", isPrimary: true },
      ],
      variants: [{ sku: "GILBERT-NETBALL-SZ5", size: "Size 5", color: null, stock: rand(5, 20), sortOrder: 0 }],
    },

    // ── ACCESSORIES ──────────────────────────────────────────────────────────
    {
      name:        "Gryphon Shinliner – Compression Socks",
      slug:        "gryphon-shinliner-compression-socks",
      shortDescription: "Graduated compression hockey socks — S / M / L",
      description: "Graduated compression socks for hockey players. Targeted arch support and compression reduce fatigue and improve circulation during long matches and intensive training sessions.",
      priceInCents: 30000,
      gender: "unisex",
      sport:  "hockey",
      sizeSystem: "clothing",
      isFeatured: false,
      isNew: false,
      categoryId: c("socks"),
      brandId:    b("gryphon"),
      images: [
        { url: "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=800&h=600&fit=crop", altText: "Gryphon Shinliner Compression Socks", isPrimary: true },
      ],
      variants: [
        { sku: "GRYP-SHINLINER-S", size: "S (Shoe 3–5)",  color: null, stock: rand(5, 20), sortOrder: 0 },
        { sku: "GRYP-SHINLINER-M", size: "M (Shoe 6–8)",  color: null, stock: rand(5, 20), sortOrder: 1 },
        { sku: "GRYP-SHINLINER-L", size: "L (Shoe 9–11)", color: null, stock: rand(5, 20), sortOrder: 2 },
      ],
    },
  ];
}

// ─── SHIPPING ZONES ──────────────────────────────────────────────────────────

const shippingZones = [
  {
    name:      "Eastern Cape (local)",
    provinces: "EC",
    rates: [
      { name: "Economy (2–3 days)",  courier: "dawn_wing", priceInCents: 8900,  freeThreshold: 80000, estimatedDays: "2–3 days" },
      { name: "Express (next day)",  courier: "fedex",     priceInCents: 14900, freeThreshold: null,  estimatedDays: "Next day" },
    ],
  },
  {
    name:      "Gauteng",
    provinces: "GP",
    rates: [
      { name: "Economy (3–4 days)", courier: "dawn_wing", priceInCents: 9900,  freeThreshold: 80000, estimatedDays: "3–4 days" },
      { name: "Express (1–2 days)", courier: "fedex",     priceInCents: 17900, freeThreshold: null,  estimatedDays: "1–2 days" },
    ],
  },
  {
    name:      "Western Cape",
    provinces: "WC",
    rates: [
      { name: "Economy (3–4 days)", courier: "dawn_wing", priceInCents: 9900,  freeThreshold: 80000, estimatedDays: "3–4 days" },
      { name: "Express (1–2 days)", courier: "fedex",     priceInCents: 17900, freeThreshold: null,  estimatedDays: "1–2 days" },
    ],
  },
  {
    name:      "Rest of South Africa",
    provinces: "KZN,MP,LP,NW,FS,NC",
    rates: [
      { name: "Economy (4–6 days)", courier: "fastway",   priceInCents: 11900, freeThreshold: 100000, estimatedDays: "4–6 days" },
      { name: "Express (2–3 days)", courier: "fedex",     priceInCents: 22900, freeThreshold: null,   estimatedDays: "2–3 days" },
    ],
  },
];

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Seeding Saint Laurens Sporting Goods...\n");

  // ── Wipe existing data (in safe dependency order) ──────────────────────────
  await db.orderItem.deleteMany({});
  await db.order.deleteMany({});
  await db.cartItem.deleteMany({});
  await db.wishlistItem.deleteMany({});
  await db.review.deleteMany({});
  await db.productVariant.deleteMany({});
  await db.productImage.deleteMany({});
  await db.product.deleteMany({});
  await db.brand.deleteMany({});
  await db.category.deleteMany({});
  await db.shippingRate.deleteMany({});
  await db.shippingZone.deleteMany({});
  await db.coupon.deleteMany({});
  console.log("🗑️   Cleared existing data\n");

  // ── Categories ─────────────────────────────────────────────────────────────
  const catMap = {};
  for (const top of categoryTree) {
    const parent = await db.category.create({
      data: { name: top.name, slug: top.slug, sortOrder: top.sortOrder },
    });
    catMap[top.slug] = parent.id;
    for (const child of top.children) {
      const c = await db.category.create({
        data: { name: child.name, slug: child.slug, sortOrder: child.sortOrder, parentId: parent.id },
      });
      catMap[child.slug] = c.id;
    }
  }
  console.log(`✅  ${Object.keys(catMap).length} categories\n`);

  // ── Brands ─────────────────────────────────────────────────────────────────
  const brandMap = {};
  for (const br of brands) {
    const created = await db.brand.create({ data: br });
    brandMap[br.slug] = created.id;
  }
  console.log(`✅  ${brands.length} brands\n`);

  // ── Products + images + variants ───────────────────────────────────────────
  const products = buildProducts(catMap, brandMap);
  let productCount = 0;
  let variantCount = 0;

  for (const p of products) {
    const { images, variants, ...productData } = p;

    const product = await db.product.create({ data: productData });

    for (let i = 0; i < images.length; i++) {
      await db.productImage.create({
        data: { ...images[i], productId: product.id, sortOrder: i },
      });
    }

    for (const v of variants) {
      await db.productVariant.create({
        data: { ...v, productId: product.id },
      });
      variantCount++;
    }

    productCount++;
    const price = `R${(productData.priceInCents / 100).toFixed(2)}`;
    console.log(`   ✓ ${productData.name}  ${price}  (${variants.length} variants)`);
  }
  console.log(`\n✅  ${productCount} products, ${variantCount} variants\n`);

  // ── Shipping zones ─────────────────────────────────────────────────────────
  for (const zone of shippingZones) {
    const { rates, ...zoneData } = zone;
    const z = await db.shippingZone.create({ data: zoneData });
    for (const rate of rates) {
      await db.shippingRate.create({ data: { ...rate, zoneId: z.id } });
    }
  }
  console.log(`✅  ${shippingZones.length} shipping zones\n`);

  // ── Sample coupons ─────────────────────────────────────────────────────────
  await db.coupon.createMany({
    data: [
      { code: "WELCOME10",  type: "percentage", value: 10, description: "10% off your first order", maxUsesPerUser: 1, isActive: true },
      { code: "SAINTLAURENS", type: "fixed",     value: 5000, description: "R50 off any order", minOrderInCents: 50000, isActive: true },
    ],
  });
  console.log("✅  2 sample coupons\n");

  console.log("🎉  Seed complete!");
}

main()
  .catch((e) => { console.error("❌  Seed failed:", e); process.exit(1); })
  .finally(() => db.$disconnect());
