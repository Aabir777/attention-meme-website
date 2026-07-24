import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BRAND } from "@/lib/assets";
import { AboutMascot3D } from "@/components/AboutMascot3D";
import { ContractBar } from "@/components/ContractBar";

export const metadata: Metadata = {
  title: "About | ATTENTION, The First Asset",
  description:
    "Most people look. Few notice. ATTENTION is a philosophy. Observe before acting, signal over noise, attention creates value.",
};

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

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Soft atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,213,71,0.1),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_60%,rgba(245,213,71,0.05),transparent_45%)]" />

      {/* ——— HERO ——— */}
      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="section-label anim-fade-up">Philosophy</p>
            <h1 className="anim-fade-up anim-fade-up-delay-1 font-display mt-4 text-4xl uppercase leading-[0.95] tracking-[0.05em] text-white sm:text-6xl lg:text-7xl">
              Attention
              <br />
              <span className="text-gold-gradient">The First Asset</span>
            </h1>

            <div className="anim-fade-up anim-fade-up-delay-2 mt-8 space-y-3 border-l-2 border-[#f5d547]/40 pl-5">
              <p className="text-lg font-medium text-white/90 sm:text-xl">
                Most people look. Few notice.
              </p>
              <p className="text-base text-white/55 sm:text-lg">
                That difference creates value.
              </p>
            </div>

            <p className="anim-fade-up anim-fade-up-delay-3 mt-8 max-w-md text-base leading-relaxed text-[#f5d547]/90 sm:text-lg">
              Everything valuable begins with attention.
            </p>
          </div>

          {/* Live 3D mascot — bright stage */}
          <div className="anim-fade-up anim-fade-up-delay-2">
            <AboutMascot3D />
          </div>
        </div>
      </section>

      <div className="hairline mx-auto max-w-3xl opacity-70" />

      {/* ——— BEFORE ——— */}
      <section className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <ul className="space-y-5">
          {BEFORE_LINES.map((line, i) => (
            <li
              key={line}
              className="flex gap-4 text-base leading-relaxed text-white/70 sm:text-lg"
              style={{ animationDelay: `${i * 0.05}s` }}
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
      </section>

      {/* ——— NOT THIS ——— */}
      <section className="relative border-y border-white/[0.06] bg-black/30 py-16 sm:py-20">
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
            It is a{" "}
            <span className="text-gold-gradient">philosophy.</span>
          </p>
        </div>
      </section>

      {/* ——— WE BELIEVE ——— */}
      <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="section-label">We believe</p>
            <h2 className="font-display mt-3 text-3xl uppercase tracking-[0.06em] text-white sm:text-4xl">
              Signal over{" "}
              <span className="text-gold-gradient">noise</span>
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
                <span className="text-sm font-medium text-white/80 sm:text-base group-hover:text-white">
                  {belief}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ——— ONE EYE ——— */}
      <section className="relative overflow-hidden border-t border-white/[0.06]">
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

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
          <div className="relative mx-auto aspect-square w-full max-w-[320px]">
            <div className="pointer-events-none absolute -inset-6 rounded-full bg-[#f5d547]/15 blur-2xl" />
            <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-[#f5d547]/25 bg-gradient-to-b from-[#12100a] to-[#08080e] shadow-[0_0_50px_rgba(245,213,71,0.12)]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(245,213,71,0.14),transparent_65%)]" />
              <Image
                src={BRAND.primaryMascot}
                alt="Attention mascot, one eye, full focus"
                fill
                className="object-contain object-bottom p-5 sm:p-6 [mix-blend-mode:multiply] contrast-110"
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
          </div>
        </div>
      </section>

      {/* ——— CLOSING CTA + CA ——— */}
      <section className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24">
        <div className="hairline mx-auto mb-12 max-w-xs opacity-60" />
        <p className="font-display text-2xl uppercase tracking-[0.1em] text-white sm:text-3xl">
          Own your{" "}
          <span className="text-gold-gradient">attention.</span>
        </p>
        <p className="mx-auto mt-4 max-w-sm text-sm text-white/45">
          {BRAND.ticker}, {BRAND.tagline}
        </p>

        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-[#f5d547]/20 bg-black/40 px-4 py-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5d547]/80">
            Official contract
          </p>
          <ContractBar variant="compact" />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/#talk" className="btn-gold">
            Talk to the mascot
          </Link>
          <Link href="/maker?tab=meme" className="btn-outline-gold">
            Make a meme
          </Link>
          <Link href="/stickers" className="btn-ghost">
            Stickers
          </Link>
        </div>
      </section>
    </div>
  );
}
