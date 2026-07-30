import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/lib/assets";

export function Header() {
  return (
    <header className="header-glass fixed top-0 left-0 z-50 w-full">
      <div className="mx-auto flex h-[5.5rem] max-w-7xl items-center justify-between gap-3 px-4 sm:h-[5.75rem] sm:gap-4 sm:px-6">
        {/* Banner logo — black field stripped so it blends into header */}
        <Link
          href="/"
          className="group relative flex shrink-0 items-center"
          aria-label={`${BRAND.name}, ${BRAND.tagline}`}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-y-3 -left-4 right-0 rounded-2xl bg-[radial-gradient(ellipse_at_15%_50%,rgba(245,213,71,0.12),transparent_70%)] opacity-80 transition group-hover:opacity-100"
          />
          <Image
            src={`${BRAND.logoHeaderNav}?v=banner1`}
            alt={`${BRAND.name}, ${BRAND.tagline}`}
            width={1000}
            height={280}
            priority
            unoptimized
            className="relative h-12 w-auto max-w-[min(72vw,400px)] object-contain object-left drop-shadow-[0_1px_10px_rgba(0,0,0,0.35)] transition duration-300 group-hover:brightness-110 sm:h-[3.35rem] sm:max-w-[460px] md:h-14 md:max-w-[520px]"
          />
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          <Link href="/" className="nav-link hidden sm:inline">
            Home
          </Link>
          <a href="/#about" className="nav-link hidden sm:inline">
            About
          </a>
          {/* Always visible — core product on mobile */}
          <Link href="/maker?tab=meme" className="nav-link">
            Memes
          </Link>
          <Link href="/maker?tab=pfp" className="nav-link">
            PFP
          </Link>
          <Link href="/#talk" className="nav-link hidden lg:inline">
            Talk
          </Link>
          <Link
            href="/stickers"
            className="ml-1 rounded-full border border-[#f5d547]/40 bg-[#f5d547]/10 px-2.5 py-1.5 text-xs font-semibold text-[#f5d547] shadow-[0_0_20px_rgba(245,213,71,0.14)] transition duration-300 hover:border-[#f5d547]/60 hover:bg-[#f5d547]/18 hover:shadow-[0_0_28px_rgba(245,213,71,0.25)] sm:px-4 sm:text-sm"
          >
            Stickers
          </Link>
          <a
            href={BRAND.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-[#f5d547]/40 hover:bg-[#f5d547]/10 hover:text-[#f5d547]"
            aria-label="Join Telegram"
            title={BRAND.telegramLabel}
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="currentColor"
              aria-hidden
            >
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </a>
          <a
            href={BRAND.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-[#f5d547]/40 hover:bg-[#f5d547]/10 hover:text-[#f5d547]"
            aria-label={`${BRAND.twitterHandle} on X`}
            title={BRAND.twitterHandle}
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="currentColor"
              aria-hidden
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
            </svg>
          </a>
        </nav>
      </div>
      <div className="hairline w-full opacity-70" />
    </header>
  );
}
