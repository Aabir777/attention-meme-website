"use client";

import { useState } from "react";
import { BRAND } from "@/lib/assets";

type Props = {
  /** compact = footer / inline; full = homepage strip */
  variant?: "full" | "compact";
  className?: string;
};

function shorten(addr: string) {
  if (addr.length < 16) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Contract address bar with one-click copy.
 * Best placed under the hero (full) and in footers (compact).
 */
export function ContractBar({ variant = "full", className = "" }: Props) {
  const [copied, setCopied] = useState(false);
  const ca = BRAND.contractAddress?.trim() || "";
  const hasCa = ca.length > 8;
  const display = hasCa ? ca : "Coming soon";
  const short = hasCa ? shorten(ca) : "Coming soon";

  const copy = async () => {
    if (!hasCa) return;
    try {
      await navigator.clipboard.writeText(ca);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const explorer =
    hasCa && BRAND.explorerUrl
      ? BRAND.explorerUrl.replace("{address}", ca)
      : null;

  if (variant === "compact") {
    return (
      <div
        className={`flex flex-wrap items-center justify-center gap-2 ${className}`}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5d547]/80">
          CA
        </span>
        <button
          type="button"
          onClick={copy}
          disabled={!hasCa}
          title={hasCa ? ca : "Contract coming soon"}
          className="group inline-flex max-w-full items-center gap-2 rounded-full border border-[#f5d547]/25 bg-black/40 px-3 py-1.5 font-mono text-xs text-white/75 transition hover:border-[#f5d547]/50 hover:text-white disabled:cursor-default"
        >
          <span className="truncate">{short}</span>
          {hasCa && (
            <span className="shrink-0 rounded-full bg-[#f5d547]/15 px-2 py-0.5 text-[10px] font-bold text-[#f5d547]">
              {copied ? "Copied" : "Copy"}
            </span>
          )}
        </button>
        {explorer && (
          <a
            href={explorer}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-semibold uppercase tracking-wider text-white/40 transition hover:text-[#f5d547]"
          >
            Explorer ↗
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative z-20 border-y border-[#f5d547]/20 bg-gradient-to-r from-black/90 via-[#12100a]/95 to-black/90 backdrop-blur-md ${className}`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-stretch justify-between gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[#f5d547]/35 bg-[#f5d547]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5d547]">
            Contract
          </span>
          <span className="hidden text-xs text-white/40 sm:inline">
            {BRAND.ticker} official CA
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={copy}
            disabled={!hasCa}
            className="group flex min-w-0 max-w-full items-center gap-3 rounded-2xl border border-[#f5d547]/25 bg-black/55 px-3.5 py-2.5 transition hover:border-[#f5d547]/50 hover:bg-[#f5d547]/10 disabled:hover:bg-black/55 sm:px-4"
          >
            <code
              className="min-w-0 truncate font-mono text-xs text-white/85 sm:text-sm"
              title={hasCa ? ca : undefined}
            >
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{display}</span>
            </code>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                hasCa
                  ? "bg-[#f5d547] text-black group-hover:brightness-110"
                  : "bg-white/10 text-white/40"
              }`}
            >
              {hasCa ? (copied ? "Copied!" : "Copy") : "Soon"}
            </span>
          </button>

          {explorer && (
            <a
              href={explorer}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-2xl border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-xs font-semibold text-white/70 transition hover:border-[#f5d547]/40 hover:text-[#f5d547]"
            >
              Explorer ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
