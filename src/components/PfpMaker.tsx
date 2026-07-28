"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PFP_BACKGROUNDS,
  pfpBackgroundsByGroup,
} from "@/lib/assets";
import {
  DEFAULT_COSTUME_ID,
  PFP_COSTUMES,
  PFP_EXPRESSIONS,
  PFP_HATS,
  getCostume,
  getExpression,
  getHat,
} from "@/lib/pfpCharacters";
import {
  defaultSimplePfp,
  renderSimplePfp,
  type SimplePfpState,
} from "@/lib/pfpSimple";
import { downloadCanvas, sharePfpToX } from "@/lib/export";

type ExportSize = 512 | 1024 | 2048;
const PREVIEW = 512;

export function PfpMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<SimplePfpState>(defaultSimplePfp);
  const [exportSize, setExportSize] = useState<ExportSize>(1024);
  const [busy, setBusy] = useState(false);

  const costume = getCostume(state.characterId ?? DEFAULT_COSTUME_ID);
  // Expression only when user picks one — never auto from costume
  const expression = getExpression(state.expressionId);
  const hat = getHat(state.hatId);

  const redraw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await renderSimplePfp(state, canvas, PREVIEW);
  }, [state]);

  useEffect(() => {
    void redraw();
  }, [redraw]);

  /** Costumes only — never sets or clears expression / hat */
  const pickCostume = (id: string) => {
    setState((s) => {
      if (s.characterId === id) {
        if (id === DEFAULT_COSTUME_ID) return s;
        return { ...s, characterId: DEFAULT_COSTUME_ID };
      }
      return { ...s, characterId: id };
    });
  };

  /** Expressions only — start blank; tap to select, tap again to clear */
  const pickExpression = (id: string) => {
    setState((s) => ({
      ...s,
      characterId: s.characterId ?? DEFAULT_COSTUME_ID,
      expressionId: s.expressionId === id ? null : id,
    }));
  };

  /** Hats only — start blank; tap to select, tap again to clear */
  const pickHat = (id: string) => {
    setState((s) => ({
      ...s,
      hatId: s.hatId === id ? null : id,
    }));
  };

  const setBackground = (backgroundId: string) => {
    setState((s) => ({
      ...s,
      backgroundId,
      transparentBg: false,
    }));
  };

  const download = async (opts?: {
    size?: ExportSize;
    transparent?: boolean;
  }) => {
    setBusy(true);
    try {
      const size = opts?.size ?? exportSize;
      const transparent = opts?.transparent ?? state.transparentBg;
      const c = document.createElement("canvas");
      await renderSimplePfp(
        { ...state, transparentBg: transparent },
        c,
        size
      );
      downloadCanvas(
        c,
        `attention-pfp-${size}${transparent ? "-transparent" : ""}.png`
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.95fr)]">
      {/* ——— Live preview + backgrounds ——— */}
      <div className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-3xl border border-[#f5d547]/25 bg-gradient-to-b from-[#16161c] to-[#0a0a0e] p-3 shadow-2xl shadow-black/50 sm:p-4">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5d547]/80">
              Live preview
            </span>
            <span className="text-[11px] text-white/35">
              {[
                "Classic",
                expression ? expression.name : "no expression",
                costume && !costume.isBase ? costume.name : null,
                hat ? hat.name : null,
              ]
                .filter(Boolean)
                .join(" + ")}
            </span>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c10]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(245,213,71,0.1),transparent_60%)]" />
            <canvas
              ref={canvasRef}
              className="relative h-full w-full"
              width={PREVIEW}
              height={PREVIEW}
            />
          </div>
        </div>

        {/* Full background options (restored) */}
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#f5d547]/80">
              Stage and beach scenes
            </p>
            <button
              type="button"
              onClick={() =>
                setState((s) => ({ ...s, transparentBg: !s.transparentBg }))
              }
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                state.transparentBg
                  ? "bg-[#f5d547] text-black"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Transparent
            </button>
          </div>
          <p className="mb-2 text-[10px] text-white/40">
            Full background behind the mascot.
          </p>
          <div className="mb-3 grid grid-cols-5 gap-1 sm:grid-cols-6 md:grid-cols-7">
            {pfpBackgroundsByGroup("photo").map((bg) => {
              const selected =
                !state.transparentBg && state.backgroundId === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  title={bg.name}
                  onClick={() => setBackground(bg.id)}
                  className={`group relative overflow-hidden rounded-lg border transition ${
                    selected
                      ? "border-[#f5d547] ring-1 ring-[#f5d547]/40"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bg.image}
                      alt={bg.name}
                      className={`h-full w-full object-cover transition duration-500 group-hover:scale-110 ${
                        selected ? "pfp-bg-kenburns" : ""
                      }`}
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-0.5 pb-0.5 pt-3">
                      <span
                        className={`block truncate text-center text-[8px] font-semibold leading-tight ${
                          selected ? "text-[#f5d547]" : "text-white/90"
                        }`}
                      >
                        {bg.name}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#f5d547]/80">
              Color
            </span>
            {pfpBackgroundsByGroup("color").map((bg) => {
              const selected =
                !state.transparentBg && state.backgroundId === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  title={bg.name}
                  onClick={() => setBackground(bg.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
                    selected
                      ? "border-[#f5d547] bg-[#f5d547]/15 text-[#f5d547]"
                      : "border-white/15 bg-white/5 text-white/65 hover:border-white/30"
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-white/25"
                    style={{ background: bg.fill }}
                  />
                  {bg.name}
                </button>
              );
            })}
          </div>

          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#f5d547]/80">
            Graphic scenes
          </p>
          <div className="mb-2 flex flex-wrap gap-1">
            {pfpBackgroundsByGroup("scene").map((bg) => {
              const selected =
                !state.transparentBg && state.backgroundId === bg.id;
              const swatch = bg.fill2
                ? `linear-gradient(145deg, ${bg.fill} 0%, ${bg.fill2} 100%)`
                : bg.fill;
              return (
                <button
                  key={bg.id}
                  type="button"
                  title={bg.name}
                  onClick={() => setBackground(bg.id)}
                  className={`flex items-center gap-1 rounded-full border py-0.5 pl-0.5 pr-2 transition ${
                    selected
                      ? "border-[#f5d547] bg-[#f5d547]/10"
                      : "border-white/10 bg-black/30 hover:border-white/25"
                  }`}
                >
                  <span
                    className="h-5 w-5 shrink-0 rounded-full border border-white/10"
                    style={{ background: swatch }}
                  />
                  <span
                    className={`text-[9px] font-medium ${
                      selected ? "text-[#f5d547]" : "text-white/55"
                    }`}
                  >
                    {bg.name}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-white/35">
            {state.transparentBg
              ? "Transparent PNG - no background"
              : (PFP_BACKGROUNDS.find((b) => b.id === state.backgroundId)
                  ?.name ?? "Background")}
          </p>
        </div>

        {/* Download */}
        <div className="rounded-2xl border border-[#f5d547]/30 bg-[#121212]/95 p-3 sm:p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#f5d547]/80">
            Download
          </p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {([512, 1024, 2048] as ExportSize[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setExportSize(s)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  exportSize === s
                    ? "bg-[#f5d547] text-black"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {s}px
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void download({ transparent: false })}
              className="flex-1 rounded-full bg-[#f5d547] px-4 py-2.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(245,213,71,0.35)] transition hover:brightness-110 disabled:opacity-40"
            >
              {busy ? "Exporting..." : "Download PNG"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void download({ transparent: true })}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-40"
            >
              Transparent
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                void download({ transparent: false }).then(() =>
                  sharePfpToX()
                );
              }}
              className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-40 sm:w-auto"
            >
              Share on X
            </button>
          </div>
        </div>
      </div>

      {/* ——— Expressions first, then Costumes ——— */}
      <div className="flex max-h-[min(92vh,960px)] flex-col rounded-3xl border border-white/10 bg-[#121212]/95 p-3 sm:p-4">
        <div className="shrink-0">
          <h2 className="font-display text-lg uppercase tracking-wide text-white">
            Build your PFP
          </h2>
          <p className="mt-1 text-sm text-white/50">
            <span className="font-semibold text-[#f5d547]">Classic mascot</span>{" "}
            starts blank. Choose expression, costume, then a hat.
          </p>
        </div>

        <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-0.5">
          {/* 1 · Expressions — all faces visible (scroll whole panel if needed) */}
          <section>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#f5d547]/90">
                1. Expressions ({PFP_EXPRESSIONS.length})
              </h3>
              {expression ? (
                <button
                  type="button"
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      expressionId: null,
                    }))
                  }
                  className="text-[10px] font-semibold text-white/45 hover:text-white"
                >
                  Clear expression
                </button>
              ) : (
                <span className="text-[10px] text-white/35">Select a face</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {PFP_EXPRESSIONS.map((ex) => {
                const selected = state.expressionId === ex.id;
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => pickExpression(ex.id)}
                    className={`group relative flex flex-col items-center gap-1 rounded-2xl border p-1.5 transition ${
                      selected
                        ? "border-[#f5d547] bg-[#f5d547]/10"
                        : "border-white/10 bg-black/30 hover:border-white/25"
                    }`}
                  >
                    {selected && (
                      <span className="absolute right-1 top-1 z-10 grid h-4 w-4 place-items-center rounded-full bg-[#f5d547] text-[9px] font-bold text-black">
                        ✓
                      </span>
                    )}
                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#0c0c10]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ex.src}
                        alt={ex.name}
                        className="h-full w-full object-contain p-1"
                        loading="eager"
                      />
                    </div>
                    <span
                      className={`w-full truncate text-center text-[10px] font-medium ${
                        selected ? "text-[#f5d547]" : "text-white/55"
                      }`}
                    >
                      {ex.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2 · Costumes */}
          <section className="border-t border-white/10 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#f5d547]/90">
                2. Costumes ({PFP_COSTUMES.length})
              </h3>
              {costume && !costume.isBase && (
                <button
                  type="button"
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      characterId: DEFAULT_COSTUME_ID,
                    }))
                  }
                  className="text-[10px] font-semibold text-white/45 hover:text-white"
                >
                  Clear costume
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PFP_COSTUMES.map((c) => {
                const selected =
                  (state.characterId ?? DEFAULT_COSTUME_ID) === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickCostume(c.id)}
                    className={`group relative flex flex-col overflow-hidden rounded-2xl border p-1.5 text-left transition ${
                      selected
                        ? "border-[#f5d547] bg-[#f5d547]/10 shadow-[0_0_16px_rgba(245,213,71,0.15)]"
                        : "border-white/10 bg-black/30 hover:border-white/25"
                    }`}
                  >
                    {selected && (
                      <span className="absolute right-1.5 top-1.5 z-10 grid h-5 w-5 place-items-center rounded-full bg-[#f5d547] text-[10px] font-bold text-black">
                        ✓
                      </span>
                    )}
                    {c.isBase && (
                      <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-black/70 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#f5d547]">
                        Base
                      </span>
                    )}
                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#0c0c10]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.src}
                        alt={c.name}
                        className="h-full w-full object-contain p-1 transition group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <span
                      className={`mt-1 truncate px-0.5 text-center text-[11px] font-semibold ${
                        selected ? "text-[#f5d547]" : "text-white/65"
                      }`}
                    >
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3 · Hats (next to costumes in the build flow) */}
          <section className="border-t border-white/10 pt-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#f5d547]/90">
                3. Hats ({PFP_HATS.length})
              </h3>
              {hat ? (
                <button
                  type="button"
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      hatId: null,
                    }))
                  }
                  className="text-[10px] font-semibold text-white/45 hover:text-white"
                >
                  Clear hat
                </button>
              ) : (
                <span className="text-[10px] text-white/35">Optional</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {PFP_HATS.map((h) => {
                const selected = state.hatId === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => pickHat(h.id)}
                    className={`group relative flex flex-col items-center gap-1 rounded-2xl border p-1.5 transition ${
                      selected
                        ? "border-[#f5d547] bg-[#f5d547]/10"
                        : "border-white/10 bg-black/30 hover:border-white/25"
                    }`}
                  >
                    {selected && (
                      <span className="absolute right-1 top-1 z-10 grid h-4 w-4 place-items-center rounded-full bg-[#f5d547] text-[9px] font-bold text-black">
                        ✓
                      </span>
                    )}
                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#0c0c10]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={h.src}
                        alt={h.name}
                        className="h-full w-full object-contain p-1"
                        loading="eager"
                      />
                    </div>
                    <span
                      className={`w-full truncate text-center text-[10px] font-medium ${
                        selected ? "text-[#f5d547]" : "text-white/55"
                      }`}
                    >
                      {h.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-3 shrink-0 border-t border-white/10 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            Selection
          </p>
          <p className="mt-1 text-sm text-white/70">
            <span className="font-semibold text-[#f5d547]">Classic</span>
            {expression ? (
              <>
                {" — Face: "}
                <span className="text-white/85">{expression.name}</span>
              </>
            ) : (
              <span className="text-white/40"> — no expression yet</span>
            )}
            {costume && !costume.isBase ? (
              <>
                {" — "}
                <span className="text-white/85">{costume.name}</span>
              </>
            ) : null}
            {hat ? (
              <>
                {" — "}
                <span className="text-white/85">{hat.name}</span>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}
