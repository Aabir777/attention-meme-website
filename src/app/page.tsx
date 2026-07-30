import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/assets";
import { TalkingMascot } from "@/components/TalkingMascot";
import { ContractBar } from "@/components/ContractBar";
import { AboutMascot3D } from "@/components/AboutMascot3D";

const BEFORE_LINES = [
  "Before conviction, there is attention.",
  "Before understanding, there is attention.",
  "Before action, there is attention.",
  "Before value, there is attention.",
];

const BELIEFS = [
  "Observe before acting.",
  "Signal over noise.",
  "Details matter.",
  "Curiosity compounds.",
  "Attention creates value.",
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* ——— HERO ——— */}
      <section className="relative min-h-[calc(100dvh-4.25rem)] bg-[#030306]">
        <div className="absolute inset-0 bg-[#030306]">
          <Image
            src={BRAND.hero}
            alt="Attention mascot"
            fill
            priority
            className="object-cover object-center scale-105 opacity-80"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030306] via-[#030306]/88 to-[#030306]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030306] via-transparent to-[#030306]/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(245,213,71,0.12),transparent_55%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100dvh-4.25rem)] max-w-7xl flex-col justify-center px-4 pb-20 pt-28 sm:px-6">
          <div className="max-w-2xl">
            <div className="anim-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-[#f5d547]/30 bg-[#f5d547]/[0.08] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f5d547] shadow-[0_0_24px_rgba(245,213,71,0.12)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f5d547]" />
              {BRAND.ticker}, the first asset
            </div>

            <h1 className="anim-fade-up anim-fade-up-delay-1 font-display text-5xl uppercase leading-[0.92] tracking-[0.04em] text-white sm:text-7xl">
              Attention
              <br />
              <span className="text-gold-gradient">{BRAND.tagline}</span>
            </h1>

            <p className="anim-fade-up anim-fade-up-delay-2 mt-7 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg">
              {BRAND.slogan}
            </p>

            <div className="anim-fade-up anim-fade-up-delay-3 mt-10 flex flex-wrap items-center gap-3">
              <a href="#talk" className="btn-gold">
                Talk to mascot
              </a>
              <Link href="/maker?tab=meme" className="btn-outline-gold">
                Meme generator
              </Link>
              <Link href="/stickers" className="btn-ghost">
                Free stickers
              </Link>
              <Link href="/maker?tab=pfp" className="btn-ghost">
                Build a PFP
              </Link>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30">
            Scroll
          </span>
          <span className="h-8 w-px bg-gradient-to-b from-[#f5d547]/50 to-transparent" />
        </div>
      </section>

      {/* CA under hero */}
      <ContractBar variant="full" />

      {/* ——— ABOUT (philosophy — continuous page) ——— */}
      <section
        id="about"
        className="relative scroll-mt-28 border-t border-white/[0.06]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,213,71,0.1),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_60%,rgba(245,213,71,0.05),transparent_45%)]" />

        {/* Philosophy intro + 3D */}
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <p className="section-label">Philosophy</p>
              <h2 className="font-display mt-4 text-4xl uppercase leading-[0.95] tracking-[0.05em] text-white sm:text-5xl lg:text-6xl">
                Attention
                <br />
                <span className="text-gold-gradient">The First Asset</span>
              </h2>

              <div className="mt-8 space-y-3 border-l-2 border-[#f5d547]/40 pl-5">
                <p className="text-lg font-medium text-white/90 sm:text-xl">
                  Most people look. Few notice.
                </p>
                <p className="text-base text-white/55 sm:text-lg">
                  That difference creates value.
                </p>
              </div>

              <p className="mt-8 max-w-md text-base leading-relaxed text-[#f5d547]/90 sm:text-lg">
                Everything valuable begins with attention.
              </p>
            </div>

            <div>
              <AboutMascot3D />
            </div>
          </div>
        </div>

        <div className="hairline mx-auto max-w-3xl opacity-70" />

        {/* Before lines */}
        <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
          <ul className="space-y-5">
            {BEFORE_LINES.map((line) => (
              <li
                key={line}
                className="flex gap-4 text-base leading-relaxed text-white/70 sm:text-lg"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5d547] shadow-[0_0_10px_rgba(245,213,71,0.7)]" />
                <span>
                  {line.split("attention").map((part, j, arr) =>
                    j < arr.length - 1 ? (
                      <span key={j}>
                        {part}
                        <span className="font-semibold text-[#f5d547]">
                          attention
                        </span>
                      </span>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* What we are not */}
        <div className="relative border-y border-white/[0.06] bg-black/30 py-14 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="section-label">What we are not</p>
            <div className="mt-8 space-y-4">
              <p className="font-display text-2xl uppercase tracking-[0.08em] text-white/40 line-through decoration-[#f5d547]/40 sm:text-3xl">
                An alpha group
              </p>
              <p className="font-display text-2xl uppercase tracking-[0.08em] text-white/40 line-through decoration-[#f5d547]/40 sm:text-3xl">
                A pump slogan
              </p>
            </div>
            <p className="mx-auto mt-10 max-w-md text-lg font-medium leading-relaxed text-white/85 sm:text-xl">
              It is a <span className="text-gold-gradient">philosophy.</span>
            </p>
          </div>
        </div>

        {/* We believe */}
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="section-label">We believe</p>
              <h2 className="font-display mt-3 text-3xl uppercase tracking-[0.06em] text-white sm:text-4xl">
                Signal over <span className="text-gold-gradient">noise</span>
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-white/50 sm:text-base">
                Five principles. One focus. The culture of people who notice.
              </p>
            </div>

            <ul className="space-y-3">
              {BELIEFS.map((belief, i) => (
                <li
                  key={belief}
                  className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-gradient-to-r from-[#14120c]/80 to-transparent px-5 py-4 transition hover:border-[#f5d547]/30 hover:from-[#1a160c]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f5d547]/35 bg-[#f5d547]/10 font-mono text-xs font-bold text-[#f5d547]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-white/80 group-hover:text-white sm:text-base">
                    {belief}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* One eye */}
        <div className="relative overflow-hidden border-t border-white/[0.06]">
          <div className="absolute inset-0">
            <Image
              src={BRAND.hero}
              alt=""
              fill
              className="object-cover opacity-25"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030306] via-[#030306]/90 to-[#030306]/75" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(245,213,71,0.1),transparent_50%)]" />
          </div>

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
            <div className="relative mx-auto aspect-square w-full max-w-[320px]">
              <div className="pointer-events-none absolute -inset-6 rounded-full bg-[#f5d547]/15 blur-2xl" />
              <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-[#f5d547]/25 bg-gradient-to-b from-[#12100a] to-[#08080e] shadow-[0_0_50px_rgba(245,213,71,0.12)]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(245,213,71,0.14),transparent_65%)]" />
                <Image
                  src={BRAND.primaryMascot}
                  alt="Attention mascot, one eye, full focus"
                  fill
                  className="object-contain object-bottom p-5 contrast-110 [mix-blend-mode:multiply] sm:p-6"
                  sizes="320px"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#08080e] to-transparent" />
              </div>
            </div>
            <div>
              <p className="section-label">The mascot</p>
              <h2 className="font-display mt-3 text-3xl uppercase leading-tight tracking-[0.05em] text-white sm:text-5xl">
                One eye for a{" "}
                <span className="text-gold-gradient">reason</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg">
                Focus. The reticle is not decoration. It is the point.{" "}
                <span className="text-white/85">
                  ATTENTION is a token and community for people who notice what
                  others miss.
                </span>
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#talk" className="btn-gold">
                  Talk to the mascot
                </a>
                <Link href="/maker?tab=meme" className="btn-outline-gold">
                  Make a meme
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Talking Tom interactive mascot */}
      <TalkingMascot />

      {/* ——— FEATURES ——— */}
      <section className="relative border-t border-white/[0.06] py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,213,71,0.06),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <p className="section-label">Community tools</p>
            <h2 className="font-display mt-3 text-3xl uppercase tracking-[0.06em] text-white sm:text-5xl">
              Create. Share.{" "}
              <span className="text-gold-gradient">Dominate</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-white/45">
              Premium tools for CT, built around the mascot that owns the feed.
            </p>
            <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-[#f5d547]/50 to-transparent" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Meme Generator",
                desc: "Full-scene templates and captions. Download a PNG ready for CT.",
                href: "/maker?tab=meme",
                img: "/mascot/pay-attention.png",
                tag: "Viral",
              },
              {
                title: "Sticker Pack",
                desc: "Free official mascot stickers & logo marks. Download one or grab the whole pack.",
                href: "/stickers",
                img: "/mascot/main.png",
                tag: "Free",
              },
              {
                title: "PFP Builder",
                desc: "Layer gear on the mascot, pick stage or beach scenes, drag to fit, export a clean PFP.",
                href: "/maker?tab=pfp",
                img: "/mascot/main.png",
                tag: "Identity",
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="premium-card group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#08080e]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_70%,rgba(245,213,71,0.14),transparent_65%)]" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(8,8,14,0.85)_100%)]" />
                  <Image
                    src={card.img}
                    alt={card.title}
                    fill
                    className="object-contain p-5 contrast-110 transition duration-500 ease-out [mix-blend-mode:multiply] group-hover:scale-105"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                  <span className="absolute right-3 top-3 rounded-full border border-[#f5d547]/25 bg-black/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#f5d547] backdrop-blur">
                    {card.tag}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl uppercase tracking-[0.06em] text-white transition group-hover:text-[#f5d547]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/45">
                    {card.desc}
                  </p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#f5d547]/70 transition group-hover:text-[#f5d547]">
                    Open
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ——— HOW TO BUY ——— */}
      <section
        id="how-to-buy"
        className="relative scroll-mt-28 border-t border-white/[0.06] py-20 sm:py-28"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,213,71,0.08),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(201,162,39,0.05),transparent_45%)]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center sm:mb-16">
            <p className="section-label">Get in</p>
            <h2 className="font-display mt-3 text-3xl uppercase tracking-[0.06em] text-white sm:text-5xl">
              How to Buy{" "}
              <span className="text-gold-gradient">$ATTENTION</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-white/45 sm:text-base">
              Four easy steps. One first asset. Pay Attention.
            </p>
            <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-[#f5d547]/50 to-transparent" />
          </div>

          <ol className="grid gap-4 sm:gap-5 md:grid-cols-2">
            {[
              {
                step: "01",
                icon: "◈",
                title: "Create a Wallet",
                body: "Grab the Robinhood Wallet app or MetaMask and set it up. Guard your seed phrase like it’s the last slice of attention.",
              },
              {
                step: "02",
                icon: "◎",
                title: "Get Some ETH",
                body: "Buy or bridge ETH (or the native token) to the Robinhood Chain. Once it’s in your wallet, you’re ready.",
              },
              {
                step: "03",
                icon: "⇄",
                title: "Swap for $ATTENTION",
                body: "Go to the official DEX on Robinhood Chain, paste the $ATTENTION contract address, and swap.",
              },
              {
                step: "04",
                icon: "★",
                title: "You Are Now Part of Attention!",
                body: "Approve the transaction and keep a little gas for the journey. Welcome to the first asset. Pay Attention.",
              },
            ].map((item) => (
              <li
                key={item.step}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#141418] to-[#0c0c10] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-[#f5d547]/35 hover:shadow-[0_12px_40px_rgba(245,213,71,0.1)] sm:p-6"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(245,213,71,0.12),transparent_70%)] opacity-60 transition group-hover:opacity-100" />

                <div className="relative flex items-start gap-4">
                  <div className="flex shrink-0 flex-col items-center gap-2">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#f5d547]/30 bg-[#f5d547]/10 text-lg text-[#f5d547] shadow-[0_0_20px_rgba(245,213,71,0.12)]">
                      {item.icon}
                    </span>
                    <span className="font-display text-[11px] tracking-[0.14em] text-[#f5d547]/70">
                      {item.step}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <h3 className="font-display text-lg uppercase tracking-wide text-white sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55 sm:text-[15px]">
                      {item.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:mt-12">
            <a
              href={BRAND.dexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              Buy on {BRAND.dexName}
            </a>
            <a href="#talk" className="btn-outline-gold">
              Talk to the mascot
            </a>
            <a
              href={BRAND.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold"
            >
              Join Telegram
            </a>
            <a
              href={BRAND.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Follow on X
            </a>
          </div>
          <p className="mx-auto mt-6 max-w-md text-center text-[11px] leading-relaxed text-white/35">
            Always verify the contract address from official {BRAND.twitterHandle}{" "}
            and Telegram channels. Scams paste fake CAs.
          </p>
        </div>
      </section>

      <footer className="relative border-t border-white/[0.06] py-10">
        <div className="hairline mb-8 w-full opacity-60" />
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 text-center sm:px-6">
          <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row sm:text-left">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.12em] text-white/70">
                {BRAND.name}
              </p>
              <p className="mt-1 text-xs text-white/35">
                {BRAND.tagline}, {BRAND.ticker} on {BRAND.chain}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              <a href="/#about" className="hover:text-[#f5d547]">
                About
              </a>
              <a href="/#how-to-buy" className="hover:text-[#f5d547]">
                How to buy
              </a>
              <Link href="/maker?tab=meme" className="hover:text-[#f5d547]">
                Memes
              </Link>
              <Link href="/maker?tab=pfp" className="hover:text-[#f5d547]">
                PFP
              </Link>
              <Link href="/stickers" className="hover:text-[#f5d547]">
                Stickers
              </Link>
              <a
                href={BRAND.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#f5d547]"
              >
                Telegram
              </a>
              <a
                href={BRAND.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#f5d547]"
              >
                Follow on X
              </a>
            </div>
            <p className="text-xs text-white/30">{BRAND.slogan}</p>
          </div>
          <ContractBar variant="compact" />
          <p className="max-w-2xl text-[10px] leading-relaxed text-white/28">
            {BRAND.ticker} is a community memecoin on {BRAND.chain}. Nothing on
            this site is financial advice. Crypto is volatile. Only risk what
            you can afford to lose. DYOR.
          </p>
        </div>
      </footer>
    </div>
  );
}
