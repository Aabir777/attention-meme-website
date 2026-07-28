"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PfpMaker } from "./PfpMaker";
import { MemeMaker } from "./MemeMaker";

type Tab = "pfp" | "meme";

export function MakerApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  // Default to meme generator (main community tool, like Chog)
  const tab: Tab = tabParam === "pfp" ? "pfp" : "meme";

  const setTab = (next: Tab) => {
    router.replace(`/maker?tab=${next}`, { scroll: false });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5d547]">
            $attention creator tools
          </p>
          <h1 className="font-display text-3xl uppercase tracking-wide text-white sm:text-4xl">
            {tab === "meme" ? "Meme Generator" : "PFP Maker"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/55 sm:text-base">
            {tab === "meme"
              ? "Pick a scene template, edit captions, download a PNG. Built for CT."
              : "Classic mascot starts blank. Expression, costume, then hat — download a clean PFP."}
          </p>
        </div>

        <div className="inline-flex rounded-full border border-white/10 bg-black/40 p-1">
          <button
            type="button"
            onClick={() => setTab("meme")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === "meme"
                ? "bg-[#f5d547] text-black"
                : "text-white/70 hover:text-white"
            }`}
          >
            Meme Generator
          </button>
          <button
            type="button"
            onClick={() => setTab("pfp")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === "pfp"
                ? "bg-[#f5d547] text-black"
                : "text-white/70 hover:text-white"
            }`}
          >
            PFP Maker
          </button>
        </div>
      </div>

      {tab === "pfp" ? <PfpMaker /> : <MemeMaker />}
    </div>
  );
}
