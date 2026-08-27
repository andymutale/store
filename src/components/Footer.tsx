import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-[#fbfaf7] text-black antialiased select-none min-h-[900px]">
      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-12 lg:px-20 pt-10 sm:pt-12 lg:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-10 items-start">
          {/* Brand */}
          <div className="max-w-[320px]">
            <div className="flex items-center gap-3 text-[30px] leading-none tracking-tight">
              <span className="font-bold text-[28px] translate-y-[-1px]">↑</span>
              <span className="font-normal">Saint Laurens</span>
            </div>

            <p className="mt-5 text-[14px] leading-snug text-black">
              © {new Date().getFullYear()} Saint Laurens Sporting Goods, Inc.
              <br />
              All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-10 gap-y-8 lg:pt-1">
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.22em] mb-5">
                Features
              </h3>
              <ul className="space-y-2.5 text-[14px] leading-snug">
                <li><Link href="#" className="hover:opacity-70">Cross-Sell</Link></li>
                <li><Link href="#" className="hover:opacity-70">Upsell</Link></li>
                <li><Link href="#" className="hover:opacity-70">M&amp;A Expansion</Link></li>
                <li><Link href="#" className="hover:opacity-70">Churn Detection</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] uppercase tracking-[0.22em] mb-5">
                Company
              </h3>
              <ul className="space-y-2.5 text-[14px] leading-snug">
                <li><Link href="#" className="hover:opacity-70">About</Link></li>
                <li><Link href="#" className="hover:opacity-70">How It Works</Link></li>
                <li><Link href="#" className="hover:opacity-70">FAQ</Link></li>
                <li><Link href="#" className="hover:opacity-70">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] uppercase tracking-[0.22em] mb-5">
                Legal
              </h3>
              <ul className="space-y-2.5 text-[14px] leading-snug">
                <li><Link href="#" className="hover:opacity-70">MSA</Link></li>
                <li><Link href="#" className="hover:opacity-70">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:opacity-70">Trust Center</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] uppercase tracking-[0.22em] mb-5">
                Socials
              </h3>
              <ul className="space-y-2.5 text-[14px] leading-snug">
                <li>
                  <Link href="#" className="inline-flex items-center gap-2 hover:opacity-70">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-black text-white text-[9px] leading-none font-bold">
                      in
                    </span>
                    LinkedIn
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Illustration */}
      {/* Illustration layer */}
<div className="pointer-events-none absolute inset-x-0 bottom-0 top-[110px] sm:top-[90px]">
  <div className="absolute bottom-0 right-0 w-[125%] sm:w-[115%] md:w-[105%] lg:w-[98%] xl:w-[92%] h-[82%] sm:h-[88%] md:h-[92%] lg:h-[96%]">
    <Image
      src="/Gemini_Generated_Image_bk9068bk9068bk90.png"
      alt="Cricket field watercolor backdrop illustration"
      fill
      priority
      sizes="100vw"
      className="object-contain object-bottom"
    />
  </div>

      </div>
    </footer>
  )
}