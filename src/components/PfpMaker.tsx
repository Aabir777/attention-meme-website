"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  PFP_BACKGROUNDS,
  getMascot,
  pfpBackgroundsByGroup,
  pfpMascots,
} from "@/lib/assets";
import {
  clearAllAccessories,
  clearCategory,
  defaultPfpConfig,
  getMascotLayout,
  randomPfpConfig,
  renderPfpToCanvas,
  resetLayerTransform,
  setEquippedItem,
  updateLayerTransform,
  type PfpConfig,
} from "@/lib/pfp";
import {
  PFP_CATEGORIES,
  accessoriesByCategory,
  accessoryDataUrl,
  defaultLayerTransform,
  getAccessory,
  type PfpCategoryId,
} from "@/lib/pfpAccessories";
import { downloadCanvas, sharePfpToX } from "@/lib/export";

type ExportSize = 512 | 1024 | 2048;
const PREVIEW = 512;

export function PfpMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const configRef = useRef<PfpConfig>(defaultPfpConfig());
  const dragRef = useRef<{
    category: PfpCategoryId;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    layoutW: number;
    layoutH: number;
    lastX: number;
    lastY: number;
  } | null>(null);

  const [config, setConfig] = useState<PfpConfig>(defaultPfpConfig);
  const [category, setCategory] = useState<PfpCategoryId>("headwear");
  /** Which equipped layer is being moved (defaults to current tab if equipped) */
  const [editLayer, setEditLayer] = useState<PfpCategoryId | null>("headwear");
  const [history, setHistory] = useState<PfpConfig[]>([defaultPfpConfig()]);
  const [histIndex, setHistIndex] = useState(0);
  const histIndexRef = useRef(0);
  const historyRef = useRef<PfpConfig[]>([defaultPfpConfig()]);
  const [exportSize, setExportSize] = useState<ExportSize>(1024);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  configRef.current = config;
  histIndexRef.current = histIndex;
  historyRef.current = history;

  const canUndo = histIndex > 0;
  const canRedo = histIndex < history.length - 1;

  const pushConfig = useCallback((next: PfpConfig | ((c: PfpConfig) => PfpConfig)) => {
    setConfig((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      // Skip no-op (e.g. re-tapping the same mascot)
      if (JSON.stringify(value) === JSON.stringify(prev)) return prev;
      const idx = histIndexRef.current;
      const trimmed = historyRef.current.slice(0, idx + 1);
      const updated = [...trimmed, value].slice(-40);
      const nextIdx = updated.length - 1;
      histIndexRef.current = nextIdx;
      historyRef.current = updated;
      setHistory(updated);
      setHistIndex(nextIdx);
      return value;
    });
  }, []);

  const undo = useCallback(() => {
    const i = histIndexRef.current - 1;
    if (i < 0) return;
    const snap = historyRef.current[i];
    if (!snap) return;
    histIndexRef.current = i;
    setHistIndex(i);
    setConfig(snap);
  }, []);

  const redo = useCallback(() => {
    const i = histIndexRef.current + 1;
    const snap = historyRef.current[i];
    if (!snap) return;
    histIndexRef.current = i;
    setHistIndex(i);
    setConfig(snap);
  }, []);

  const redraw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await renderPfpToCanvas(config, canvas, PREVIEW);
  }, [config]);

  useEffect(() => {
    void redraw();
  }, [redraw]);

  const items = useMemo(() => accessoriesByCategory(category), [category]);
  const mascots = pfpMascots();
  const activeId = config.equipped[category] ?? null;

  // Keep editLayer pointing at an equipped category when possible
  useEffect(() => {
    if (editLayer && config.equipped[editLayer]) return;
    if (config.equipped[category]) {
      setEditLayer(category);
      return;
    }
    const first = PFP_CATEGORIES.find((c) => config.equipped[c.id]);
    setEditLayer(first?.id ?? null);
  }, [config.equipped, category, editLayer]);

  const equippedList = useMemo(() => {
    return PFP_CATEGORIES.map((cat) => {
      const id = config.equipped[cat.id];
      const acc = getAccessory(id);
      return acc ? { cat, acc } : null;
    }).filter(Boolean) as {
      cat: (typeof PFP_CATEGORIES)[number];
      acc: NonNullable<ReturnType<typeof getAccessory>>;
    }[];
  }, [config.equipped]);

  const activeTransform =
    (editLayer && config.transforms[editLayer]) || defaultLayerTransform();
  const canMoveLayer = Boolean(editLayer && config.equipped[editLayer]);

  const clientToPreview = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const rect = stage.getBoundingClientRect();
    const rw = rect.width || 1;
    const rh = rect.height || 1;
    return {
      x: ((clientX - rect.left) / rw) * PREVIEW,
      y: ((clientY - rect.top) / rh) * PREVIEW,
    };
  };

  const getLayoutSize = useCallback(() => {
    const mascot = getMascot(configRef.current.mascotId);
    // Approximate square source for layout if image not measured
    return getMascotLayout(1024, 1024, PREVIEW, configRef.current.zoom);
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!canMoveLayer || !editLayer) return;
    const t =
      configRef.current.transforms[editLayer] ?? defaultLayerTransform();
    const layout = getLayoutSize();
    const pt = clientToPreview(e.clientX, e.clientY);
    dragRef.current = {
      category: editLayer,
      startX: pt.x,
      startY: pt.y,
      originX: t.x,
      originY: t.y,
      layoutW: layout.w,
      layoutH: layout.h,
      lastX: t.x,
      lastY: t.y,
    };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const pt = clientToPreview(e.clientX, e.clientY);
    const dx = (pt.x - drag.startX) / drag.layoutW;
    const dy = (pt.y - drag.startY) / drag.layoutH;
    const nextX = drag.originX + dx;
    const nextY = drag.originY + dy;
    drag.lastX = nextX;
    drag.lastY = nextY;
    // Live update without history spam
    setConfig((c) =>
      updateLayerTransform(c, drag.category, {
        x: nextX,
        y: nextY,
      })
    );
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setDragging(false);
    // Commit final position to history once (from drag ref so we never lose the last frame)
    pushConfig(
      updateLayerTransform(configRef.current, drag.category, {
        x: drag.lastX,
        y: drag.lastY,
      })
    );
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const download = async (opts?: {
    size?: ExportSize;
    transparent?: boolean;
  }) => {
    setBusy(true);
    try {
      const size = opts?.size ?? exportSize;
      const transparent = opts?.transparent ?? config.transparentBg;
      const c = document.createElement("canvas");
      await renderPfpToCanvas(
        { ...config, transparentBg: transparent },
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
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.95fr)]">
      {/* ——— Preview (left) ——— */}
      <div className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-3xl border border-[#f5d547]/25 bg-gradient-to-b from-[#16161c] to-[#0a0a0e] p-3 shadow-2xl shadow-black/50 sm:p-4">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5d547]/80">
              Live preview
            </span>
            <span className="text-[11px] text-white/35">
              {canMoveLayer
                ? "Drag gear to align"
                : "Equip an item, then drag it"}
            </span>
          </div>

          <div
            ref={stageRef}
            className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c10] touch-none select-none"
            style={{ cursor: canMoveLayer ? (dragging ? "grabbing" : "grab") : "default" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(245,213,71,0.12),transparent_60%)]" />
            <canvas
              ref={canvasRef}
              className="pointer-events-none relative h-full w-full"
              width={PREVIEW}
              height={PREVIEW}
            />
            {canMoveLayer && editLayer && (
              <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full border border-[#f5d547]/30 bg-black/70 px-3 py-1 text-[10px] font-semibold text-[#f5d547]">
                Moving: {getAccessory(config.equipped[editLayer])?.name ?? editLayer}
              </div>
            )}
          </div>

          {/* Zoom + view */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() =>
                pushConfig((c) => ({
                  ...c,
                  zoom: Math.max(0.65, +(c.zoom - 0.08).toFixed(2)),
                }))
              }
              className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-lg text-white hover:bg-white/10"
            >
              −
            </button>
            <span className="min-w-[4rem] text-center text-xs tabular-nums text-white/50">
              {Math.round(config.zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() =>
                pushConfig((c) => ({
                  ...c,
                  zoom: Math.min(1.4, +(c.zoom + 0.08).toFixed(2)),
                }))
              }
              className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-lg text-white hover:bg-white/10"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => pushConfig((c) => ({ ...c, zoom: 1 }))}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10"
            >
              Reset view
            </button>
          </div>

          {/* Move / scale gear — under preview so item picker stays full height */}
          {canMoveLayer && editLayer && (
            <div className="mt-3 rounded-2xl border border-[#f5d547]/25 bg-[#f5d547]/5 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#f5d547]">
                  Move: {getAccessory(config.equipped[editLayer])?.name}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    pushConfig(resetLayerTransform(config, editLayer))
                  }
                  className="text-[10px] font-semibold text-white/50 hover:text-white"
                >
                  Reset position
                </button>
              </div>
              <p className="mb-2 text-[11px] text-white/45">
                Drag on the preview, or nudge / scale below.
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <label className="min-w-[8rem] flex-1 flex flex-col gap-1 text-[10px] uppercase tracking-wider text-white/40">
                  Size: {activeTransform.scale.toFixed(2)}×
                  <input
                    type="range"
                    min={0.5}
                    max={1.6}
                    step={0.02}
                    value={activeTransform.scale}
                    onChange={(e) =>
                      pushConfig(
                        updateLayerTransform(config, editLayer, {
                          scale: Number(e.target.value),
                        })
                      )
                    }
                    className="w-full accent-[#f5d547]"
                  />
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Smaller"
                    onClick={() =>
                      pushConfig(
                        updateLayerTransform(config, editLayer, {
                          scale: activeTransform.scale - 0.06,
                        })
                      )
                    }
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/40 text-sm font-bold text-white hover:border-white/30"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    title="Bigger"
                    onClick={() =>
                      pushConfig(
                        updateLayerTransform(config, editLayer, {
                          scale: activeTransform.scale + 0.06,
                        })
                      )
                    }
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/40 text-sm font-bold text-white hover:border-white/30"
                  >
                    +
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span />
                  <button
                    type="button"
                    onClick={() =>
                      pushConfig(
                        updateLayerTransform(config, editLayer, {
                          y: activeTransform.y - 0.02,
                        })
                      )
                    }
                    className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-sm text-white/80 hover:border-white/25"
                    title="Up"
                  >
                    ↑
                  </button>
                  <span />
                  <button
                    type="button"
                    onClick={() =>
                      pushConfig(
                        updateLayerTransform(config, editLayer, {
                          x: activeTransform.x - 0.02,
                        })
                      )
                    }
                    className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-sm text-white/80 hover:border-white/25"
                    title="Left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      pushConfig(
                        updateLayerTransform(config, editLayer, {
                          y: activeTransform.y + 0.02,
                        })
                      )
                    }
                    className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-sm text-white/80 hover:border-white/25"
                    title="Down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      pushConfig(
                        updateLayerTransform(config, editLayer, {
                          x: activeTransform.x + 0.02,
                        })
                      )
                    }
                    className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-sm text-white/80 hover:border-white/25"
                    title="Right"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Full-bleed backgrounds: photos fill the canvas; mascot is cutout (no white box) */}
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#f5d547]/80">
              Stage & beach scenes
            </p>
            <button
              type="button"
              onClick={() =>
                pushConfig((c) => ({ ...c, transparentBg: !c.transparentBg }))
              }
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                config.transparentBg
                  ? "bg-[#f5d547] text-black"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Transparent
            </button>
          </div>
          <p className="mb-2 text-[10px] text-white/40">
            Full background behind the mascot (studio white removed).
          </p>
          {/* Compact photo scenario thumbnails */}
          <div className="mb-3 grid grid-cols-5 gap-1 sm:grid-cols-6 md:grid-cols-9">
            {pfpBackgroundsByGroup("photo").map((bg) => {
              const selected =
                !config.transparentBg && config.backgroundId === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  title={bg.name}
                  onClick={() =>
                    pushConfig((c) => ({
                      ...c,
                      backgroundId: bg.id,
                      transparentBg: false,
                    }))
                  }
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
                !config.transparentBg && config.backgroundId === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  title={bg.name}
                  onClick={() =>
                    pushConfig((c) => ({
                      ...c,
                      backgroundId: bg.id,
                      transparentBg: false,
                    }))
                  }
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
          <div className="mb-3 flex flex-wrap gap-1">
            {pfpBackgroundsByGroup("scene").map((bg) => {
              const selected =
                !config.transparentBg && config.backgroundId === bg.id;
              const swatch = bg.fill2
                ? `linear-gradient(145deg, ${bg.fill} 0%, ${bg.fill2} 100%)`
                : bg.fill;
              return (
                <button
                  key={bg.id}
                  type="button"
                  title={bg.name}
                  onClick={() =>
                    pushConfig((c) => ({
                      ...c,
                      backgroundId: bg.id,
                      transparentBg: false,
                    }))
                  }
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

          <p className="mb-3 text-[10px] text-white/35">
            {config.transparentBg
              ? "Transparent PNG — no background"
              : (PFP_BACKGROUNDS.find((b) => b.id === config.backgroundId)
                  ?.name ?? "Background")}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => pushConfig(randomPfpConfig())}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              Randomize
            </button>
            <button
              type="button"
              onClick={() => pushConfig(clearAllAccessories(config))}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              Clear gear
            </button>
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-30"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-30"
            >
              Redo
            </button>
          </div>
        </div>

        {/* Download */}
        <div className="sticky bottom-3 z-10 rounded-2xl border border-[#f5d547]/30 bg-[#121212]/95 p-3 shadow-xl backdrop-blur sm:static sm:shadow-none">
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
              className="flex-1 rounded-full bg-[#f5d547] px-4 py-2.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(245,213,71,0.35)] transition hover:brightness-110 disabled:opacity-50"
            >
              {busy ? "Exporting…" : "Download PNG"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void download({ transparent: true })}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              Transparent
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                void download({ transparent: false }).then(() => {
                  sharePfpToX();
                });
              }}
              className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50 sm:w-auto sm:flex-1"
            >
              Share on X
            </button>
          </div>
          <p className="mt-2 text-[10px] text-white/40">
            Share opens X with a Chog-style post — attach the downloaded PNG.
          </p>
        </div>
      </div>

      {/* ——— Customization panel (right) ——— */}
      <div className="flex max-h-[min(92vh,960px)] flex-col gap-3 overflow-hidden rounded-3xl border border-white/10 bg-[#121212]/95 p-3 sm:p-4">
        <div className="shrink-0">
          <h2 className="font-display text-lg uppercase tracking-wide text-white">
            Build your PFP
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Tap gear to equip, then drag it on the preview to fit the mascot. Tap again to unequip.
          </p>
        </div>

        {/* Base pose */}
        <section className="shrink-0">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#f5d547]/80">
              Base mascot
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Undo mascot / last change"
                onClick={undo}
                disabled={!canUndo}
                className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Undo
              </button>
              <button
                type="button"
                title="Redo"
                onClick={redo}
                disabled={!canRedo}
                className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Redo
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {/* None — clear base mascot */}
            <button
              type="button"
              title="No mascot"
              onClick={() => {
                if (!config.mascotId) return;
                pushConfig((c) => ({ ...c, mascotId: "" }));
              }}
              className={`flex flex-col items-center gap-0.5 rounded-xl border p-1.5 transition ${
                !config.mascotId
                  ? "border-[#f5d547] bg-[#f5d547]/10"
                  : "border-white/10 bg-black/30 hover:border-white/25"
              }`}
            >
              <div className="grid aspect-square w-full place-items-center rounded-lg bg-[#16161c] text-lg font-bold text-white/40">
                ×
              </div>
              <span
                className={`mt-0.5 block truncate text-center text-[10px] ${
                  !config.mascotId ? "text-[#f5d547]" : "text-white/55"
                }`}
              >
                None
              </span>
            </button>

            {mascots.map((m) => {
              const selected = config.mascotId === m.id;
              return (
                <div key={m.id} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (config.mascotId === m.id) {
                        // Tap selected again to clear
                        pushConfig((c) => ({ ...c, mascotId: "" }));
                        return;
                      }
                      pushConfig((c) => ({ ...c, mascotId: m.id }));
                    }}
                    className={`w-full rounded-xl border p-1.5 transition ${
                      selected
                        ? "border-[#f5d547] bg-[#f5d547]/10"
                        : "border-white/10 bg-black/30 hover:border-white/25"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.pfpSrc || m.src}
                      alt={m.name}
                      className="aspect-square w-full rounded-lg bg-[#16161c] object-contain p-0.5"
                    />
                    <span
                      className={`mt-0.5 block truncate text-center text-[10px] ${
                        selected ? "text-[#f5d547]" : "text-white/55"
                      }`}
                    >
                      {m.name}
                    </span>
                  </button>
                  {selected && (
                    <button
                      type="button"
                      title="Remove mascot"
                      aria-label="Remove mascot"
                      onClick={(e) => {
                        e.stopPropagation();
                        pushConfig((c) => ({ ...c, mascotId: "" }));
                      }}
                      className="absolute -right-1 -top-1 z-10 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-xs font-bold leading-none text-white shadow-md shadow-black/40 transition hover:bg-red-400"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-1 text-[10px] text-white/35">
            Tap × or None to clear the mascot. Undo restores the last one.
          </p>
        </section>

        {/* Category tabs */}
        <div className="shrink-0 overflow-x-auto">
          <div className="flex min-w-max gap-1 rounded-full bg-black/40 p-1">
            {PFP_CATEGORIES.map((cat) => {
              const on = category === cat.id;
              const has = Boolean(config.equipped[cat.id]);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    // If this layer has gear, select it for drag/move
                    if (config.equipped[cat.id]) {
                      setEditLayer(cat.id);
                    }
                  }}
                  className={`relative rounded-full px-3 py-1.5 text-[11px] font-semibold transition sm:text-xs ${
                    on
                      ? "bg-[#f5d547] text-black"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {cat.label}
                  {has && !on && (
                    <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#f5d547]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Item grid */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              {PFP_CATEGORIES.find((c) => c.id === category)?.label}
              {", "}
              {items.length} items
            </span>
            {activeId && (
              <button
                type="button"
                onClick={() => pushConfig(clearCategory(config, category))}
                className="text-[10px] font-semibold text-red-400 hover:text-red-300"
              >
                Clear this layer
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {/* None option */}
            <button
              type="button"
              onClick={() => pushConfig(clearCategory(config, category))}
              className={`flex flex-col items-center gap-1 rounded-2xl border p-2 transition ${
                !activeId
                  ? "border-[#f5d547] bg-[#f5d547]/10"
                  : "border-white/10 bg-black/30 hover:border-white/25"
              }`}
            >
              <div className="grid aspect-square w-full place-items-center rounded-xl bg-[#16161c] text-xs text-white/40">
                None
              </div>
              <span className="text-[10px] text-white/50">Clear</span>
            </button>

            {items.map((item) => {
              const selected = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    const next = setEquippedItem(config, category, item.id);
                    pushConfig(next);
                    // Selecting/equipping an item makes it the layer you can drag
                    if (next.equipped[category]) {
                      setEditLayer(category);
                    }
                  }}
                  className={`group relative flex flex-col items-center gap-1 rounded-2xl border p-2 transition hover:scale-[1.02] ${
                    selected
                      ? "border-[#f5d547] bg-[#f5d547]/10 shadow-[0_0_16px_rgba(245,213,71,0.15)]"
                      : "border-white/10 bg-black/30 hover:border-white/25"
                  }`}
                >
                  {selected && (
                    <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-[#f5d547] text-[10px] font-bold text-black">
                      ✓
                    </span>
                  )}
                  <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#16161c]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={accessoryDataUrl(item)}
                      alt={item.name}
                      className="h-full w-full object-contain p-1 transition group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <span
                    className={`truncate text-[10px] font-medium ${
                      selected ? "text-[#f5d547]" : "text-white/55"
                    }`}
                  >
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Equipped layers summary — tap name to move that piece on the preview */}
        <div className="shrink-0 border-t border-white/10 pt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              Equipped ({equippedList.length})
              {canMoveLayer && editLayer
                ? ` · moving ${getAccessory(config.equipped[editLayer])?.name ?? ""}`
                : ""}
            </p>
            <label className="flex cursor-pointer items-center gap-2 text-[10px] text-white/50">
              <input
                type="checkbox"
                checked={config.showLogo}
                onChange={(e) =>
                  pushConfig((c) => ({ ...c, showLogo: e.target.checked }))
                }
                className="accent-[#f5d547]"
              />
              Logo mark
            </label>
          </div>
          {equippedList.length === 0 ? (
            <p className="text-xs text-white/35">
              No accessories yet. Pick a tab and equip gear.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {equippedList.map(({ cat, acc }) => {
                const isEdit = editLayer === cat.id;
                return (
                  <div
                    key={acc.id}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${
                      isEdit
                        ? "border-[#f5d547] bg-[#f5d547] text-black"
                        : "border-[#f5d547]/25 bg-[#f5d547]/10 text-[#f5d547]"
                    }`}
                  >
                    <button
                      type="button"
                      title="Select to move on preview"
                      onClick={() => {
                        setEditLayer(cat.id);
                        setCategory(cat.id);
                      }}
                    >
                      {acc.name}
                    </button>
                    <button
                      type="button"
                      title={`Remove ${acc.name}`}
                      onClick={() => pushConfig(clearCategory(config, cat.id))}
                      className={`opacity-70 hover:opacity-100 ${
                        isEdit ? "text-black" : ""
                      }`}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
