"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  STICKER_CATEGORIES,
  STICKER_PACK,
  stickersByCategory,
  type DownloadableSticker,
} from "@/lib/stickerPack";
import { downloadFile, downloadFiles } from "@/lib/export";
import { assetUrl } from "@/lib/traits";

type Cat = "all" | "pack";

export function StickersGallery() {
  const [category, setCategory] = useState<Cat>("all");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const stickers = useMemo(
    () => stickersByCategory(category),
    [category]
  );

  const downloadOne = async (s: DownloadableSticker) => {
    setMessage(`Downloading ${s.name}…`);
    await downloadFile(s.src, s.filename);
    setMessage(`Saved ${s.filename}`);
    setTimeout(() => setMessage(null), 2000);
  };

  const downloadAll = async () => {
    setBusy(true);
    setMessage("Downloading pack… allow multiple downloads in your browser");
    try {
      await downloadFiles(
        stickers.map((s) => ({ src: s.src, filename: s.filename })),
        400
      );
      setMessage(`Downloaded ${stickers.length} stickers`);
    } finally {
      setBusy(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-24 sm:px-6">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5d547]">
            Official pack, $attention
          </p>
          <h1 className="font-display text-3xl uppercase tracking-wide text-white sm:text-5xl">
            Sticker pack
          </h1>
          <p className="mt-3 text-sm text-white/55 sm:text-base">
            Download the official Attention sticker pack. Use them in memes,
            Discord, Telegram, and CT raids, free for the community.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void downloadAll()}
            className="rounded-full bg-[#f5d547] px-6 py-3 text-sm font-bold text-black shadow-[0_0_24px_rgba(245,213,71,0.35)] transition hover:brightness-110 disabled:opacity-60"
          >
            {busy ? "Downloading…" : `Download all (${stickers.length})`}
          </button>
          <Link
            href="/maker?tab=meme"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Open meme generator
          </Link>
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl border border-[#f5d547]/25 bg-[#f5d547]/10 px-4 py-3 text-sm text-[#f5d547]">
          {message}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-1.5">
        {STICKER_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
              category === c.id
                ? "bg-[#f5d547] text-black"
                : "bg-white/5 text-white/65 hover:bg-white/10"
            }`}
          >
            {c.label}
            <span className="ml-1.5 opacity-60">
              {c.id === "all"
                ? STICKER_PACK.length
                : STICKER_PACK.filter((s) => s.category === c.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stickers.map((s) => (
          <article
            key={s.id}
            className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#111] shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-[#f5d547]/40 hover:shadow-[0_12px_40px_rgba(245,213,71,0.12)]"
          >
            <div className="relative aspect-square bg-[#141418]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(245,213,71,0.1),transparent_65%)]" />
              <Image
                src={assetUrl(s.src)}
                alt={s.name}
                fill
                unoptimized
                className="object-contain p-5 drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition duration-300 group-hover:scale-[1.04]"
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
              />
            </div>
            <div className="flex flex-1 flex-col border-t border-white/5 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg uppercase tracking-wide text-white">
                    {s.name}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-white/45">
                    {s.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#f5d547]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#f5d547]">
                  PNG
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/40"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => void downloadOne(s)}
                className="mt-4 w-full rounded-full border border-[#f5d547]/35 bg-[#f5d547]/10 py-2.5 text-sm font-bold text-[#f5d547] transition hover:bg-[#f5d547] hover:text-black"
              >
                Download PNG
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-14 rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 sm:p-8">
        <h3 className="font-display text-xl uppercase text-white">
          How to use stickers
        </h3>
        <ul className="mt-4 grid gap-3 text-sm text-white/55 sm:grid-cols-3">
          <li className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <span className="font-semibold text-[#f5d547]">1. Download</span>
            <p className="mt-1">
              Grab mascot poses or the full pack to your device.
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <span className="font-semibold text-[#f5d547]">2. Create</span>
            <p className="mt-1">
              Drop them into the{" "}
              <Link href="/maker?tab=meme" className="text-white underline-offset-2 hover:underline">
                meme generator
              </Link>
              , Telegram, or Discord sticker packs.
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <span className="font-semibold text-[#f5d547]">3. Spread</span>
            <p className="mt-1">
              Post on X with $attention. Help the timeline pay attention.
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
}
