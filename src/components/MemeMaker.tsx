"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  CAPTION_PACKS,
  MEME_SCENES,
  randomCaption,
  randomScene,
  type CaptionPackId,
  type MemeScene,
} from "@/lib/memeScenes";

import {
  DEFAULT_FONT_SIZE,
  DEFAULT_MEME_FONT_ID,
  MAX_FONT_SIZE,
  MEME_FONTS,
  MIN_FONT_SIZE,
  canvasFont,
  ensureMemeFontsLoaded,
  getMemeFont,
} from "@/lib/memeFonts";
import {
  defaultShareText,
  downloadCanvas,
  shareToX,
} from "@/lib/export";
import { clearImageCache, loadImage, preloadImages } from "@/lib/traits";
import Link from "next/link";

type LayerKind = "sticker" | "text";

interface MemeLayer {
  id: string;
  kind: LayerKind;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  stickerId?: string;
  text?: string;
  fontSize?: number;
  fontId?: string;
  bold?: boolean;
  color?: string;
  stroke?: string;
  role?: "top" | "bottom" | "extra";
}

const CANVAS = 512;
const STICKER_BOX = 140;

type BgState =
  | { type: "color"; value: string }
  | { type: "image"; value: string; overlay?: number }
  | { type: "bars"; value: string };

function layersFromScene(
  scene: MemeScene,
  fontId = DEFAULT_MEME_FONT_ID,
  fontSize = DEFAULT_FONT_SIZE
): MemeLayer[] {
  const topY = scene.topY ?? 48;
  const bottomY = scene.bottomY ?? 428;
  const isLight =
    scene.background.type === "color" &&
    ["#ffffff", "#f5f5f5", "#e8e8e8"].includes(
      scene.background.value.toLowerCase()
    );
  const useBars = scene.id === "ct-raid";
  const showMascot = scene.showMascot !== false;

  const layers: MemeLayer[] = [
    {
      id: "text_top",
      kind: "text",
      role: "top",
      x: 256,
      y: topY,
      scale: 1,
      rotation: 0,
      text: scene.topText,
      fontSize,
      fontId,
      bold: true,
      color: scene.topColor ?? (isLight && !useBars ? "#000000" : "#ffffff"),
      stroke: useBars || !isLight ? "#000000" : "#ffffff",
    },
  ];

  if (showMascot) {
    layers.push({
      id: "mascot_main",
      kind: "sticker",
      stickerId: scene.mascotId,
      x: scene.mascot.x,
      y: scene.mascot.y,
      scale: scene.mascot.scale,
      rotation: scene.mascot.rotation ?? 0,
    });
  }

  layers.push({
    id: "text_bottom",
    kind: "text",
    role: "bottom",
    x: 256,
    y: bottomY,
    scale: 1,
    rotation: 0,
    text: scene.bottomText,
    fontSize,
    fontId,
    bold: false,
    color: scene.bottomColor ?? (isLight && !useBars ? "#000000" : "#f5d547"),
    stroke: "#000000",
  });

  return layers;
}

function layoutCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  preferredSize: number,
  maxWidth: number,
  fontId: string | undefined,
  bold: boolean,
  maxLines = 2
): { lines: string[]; size: number; lineHeight: number } {
  const clean = text.trim();
  if (!clean)
    return { lines: [], size: preferredSize, lineHeight: preferredSize };

  // Keep preferred size; only shrink if it won't fit
  let size = Math.min(Math.max(preferredSize, MIN_FONT_SIZE), MAX_FONT_SIZE);
  const minSize = MIN_FONT_SIZE;

  const setFont = (fontSize: number) => {
    ctx.font = canvasFont(fontSize, fontId, bold);
    try {
      (
        ctx as CanvasRenderingContext2D & { letterSpacing?: string }
      ).letterSpacing = `${Math.max(0.5, fontSize * 0.04)}px`;
    } catch {
      /* ignore */
    }
  };

  const wrap = (fontSize: number): string[] => {
    setFont(fontSize);
    const words = clean.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines.flatMap((ln) => {
      if (ctx.measureText(ln).width <= maxWidth) return [ln];
      const parts: string[] = [];
      let chunk = "";
      for (const ch of ln) {
        const t = chunk + ch;
        if (ctx.measureText(t).width > maxWidth && chunk) {
          parts.push(chunk);
          chunk = ch;
        } else {
          chunk = t;
        }
      }
      if (chunk) parts.push(chunk);
      return parts;
    });
  };

  let lines = wrap(size);
  while (
    size > minSize &&
    (lines.length > maxLines ||
      lines.some((ln) => {
        setFont(size);
        return ctx.measureText(ln).width > maxWidth;
      }))
  ) {
    size -= 1;
    lines = wrap(size);
  }

  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    const last = lines[maxLines - 1];
    if (last.length > 3) lines[maxLines - 1] = `${last.slice(0, -2)}...`;
  }

  // Extra air between lines so bottom text stays readable
  return { lines, size, lineHeight: size * 1.28 };
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  layer: MemeLayer,
  canvasSize: number
) {
  if (!layer.text?.trim()) return;

  const preferred = layer.fontSize ?? DEFAULT_FONT_SIZE;
  // Slightly lighter weight on bottom so fill stays clear
  const bold = layer.role === "bottom" ? false : layer.bold !== false;
  // Wider side padding so outline never clips / clogs
  const pad = 72;
  const maxWidth = (canvasSize - pad) / Math.max(layer.scale, 0.5);
  const { lines, size, lineHeight } = layoutCaption(
    ctx,
    layer.text,
    preferred,
    maxWidth,
    layer.fontId,
    bold,
    2
  );
  if (!lines.length) return;

  ctx.font = canvasFont(size, layer.fontId, bold);
  try {
    (
      ctx as CanvasRenderingContext2D & { letterSpacing?: string }
    ).letterSpacing = `${Math.max(0.5, size * 0.04)}px`;
  } catch {
    /* ignore */
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.miterLimit = 2;

  // Thin outline - thick strokes made bottom text look muddy
  const strokeW = Math.max(1.75, Math.min(3.2, size * 0.065));
  ctx.lineWidth = strokeW;
  ctx.strokeStyle = layer.stroke ?? "#000000";
  ctx.fillStyle = layer.color ?? "#ffffff";

  const blockH = (lines.length - 1) * lineHeight;
  let startY = -blockH / 2;
  if (layer.role === "bottom") startY = -blockH;
  else if (layer.role === "top") startY = 0;

  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineHeight;
    const ln = lines[i];
    ctx.strokeText(ln, 0, y);
    // Fill twice for crisp, clear letters over the outline
    ctx.fillText(ln, 0, y);
    ctx.fillText(ln, 0, y);
  }

  try {
    (
      ctx as CanvasRenderingContext2D & { letterSpacing?: string }
    ).letterSpacing = "0px";
  } catch {
    /* ignore */
  }
}

function bgFromScene(scene: MemeScene): BgState {
  if (scene.id === "ct-raid") return { type: "bars", value: "#ffffff" };
  if (scene.background.type === "image") {
    return {
      type: "image",
      value: scene.background.value,
      overlay: scene.background.overlay,
    };
  }
  return { type: "color", value: scene.background.value };
}

function hitRadius(layer: MemeLayer): number {
  if (layer.kind === "text") return 72;
  return Math.max(36, (STICKER_BOX * layer.scale) / 2);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function resolveStickerSrc(stickerId: string | undefined): string | null {
  if (!stickerId) return null;
  // Scene templates embed the mascot; layered stickers are disabled in this generator
  return null;
}

export function MemeMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<MemeLayer[]>([]);
  const dragRef = useRef<{
    id: string;
    ox: number;
    oy: number;
    pointerId: number;
  } | null>(null);
  const rafDragRef = useRef<number | null>(null);
  const redrawingRef = useRef(false);
  const needsRedrawRef = useRef(false);
  const bgRef = useRef<BgState>(bgFromScene(MEME_SCENES[0]));
  const sceneIdRef = useRef(MEME_SCENES[0].id);

  const [sceneId, setSceneId] = useState(MEME_SCENES[0].id);
  const [bg, setBg] = useState<BgState>(bgFromScene(MEME_SCENES[0]));
  const [layers, setLayers] = useState<MemeLayer[]>(() =>
    layersFromScene(MEME_SCENES[0])
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [panel, setPanel] = useState<"templates" | "upload">("templates");
  const [captionPack, setCaptionPack] = useState<CaptionPackId | "all">("all");
  const [captionFontId, setCaptionFontId] = useState(DEFAULT_MEME_FONT_ID);
  const [captionFontSize, setCaptionFontSize] = useState(DEFAULT_FONT_SIZE);
  /** Free-type size field (can be mid-edit before commit) */
  const [fontSizeInput, setFontSizeInput] = useState(String(DEFAULT_FONT_SIZE));
  const [uploadHint, setUploadHint] = useState<string | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  layersRef.current = layers;
  bgRef.current = bg;
  sceneIdRef.current = sceneId;

  const topLayer = layers.find((l) => l.role === "top");
  const bottomLayer = layers.find((l) => l.role === "bottom");
  const selected = layers.find((l) => l.id === selectedId) ?? null;

  const applyScene = (scene: MemeScene) => {
    setSceneId(scene.id);
    setBg(bgFromScene(scene));
    setLayers(layersFromScene(scene, captionFontId, captionFontSize));
    setSelectedId(null);
  };

  const generateRandom = () => {
    const scene = randomScene();
    const caption = randomCaption(captionPack);
    applyScene({
      ...scene,
      topText: caption.top,
      bottomText: caption.bottom,
    });
  };

  const onUploadBackground = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadHint("Please choose an image file (PNG, JPG, WebP).");
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setBg({ type: "image", value: url });
    setUploadHint(`Using: ${file.name}`);
    setSceneId("custom-upload");
  };

  const clearUpload = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setUploadHint(null);
    const scene = MEME_SCENES[0];
    setBg(bgFromScene(scene));
    setSceneId(scene.id);
    setLayers(layersFromScene(scene, captionFontId, captionFontSize));
  };

  const paint = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    if (canvas.width !== CANVAS || canvas.height !== CANVAS) {
      canvas.width = CANVAS;
      canvas.height = CANVAS;
    }

    const currentLayers = layersRef.current;
    const currentBg = bgRef.current;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, CANVAS, CANVAS);

    // Background
    if (currentBg.type === "image") {
      try {
        const img = await loadImage(currentBg.value);
        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        const scale = Math.max(CANVAS / iw, CANVAS / ih);
        const w = iw * scale;
        const h = ih * scale;
        ctx.drawImage(img, (CANVAS - w) / 2, (CANVAS - h) / 2, w, h);
        const overlay =
          typeof currentBg.overlay === "number" ? currentBg.overlay : 0.22;
        if (overlay > 0) {
          ctx.fillStyle = `rgba(0,0,0,${overlay})`;
          ctx.fillRect(0, 0, CANVAS, CANVAS);
        }
      } catch {
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, CANVAS, CANVAS);
      }
    } else if (currentBg.type === "bars") {
      ctx.fillStyle = currentBg.value;
      ctx.fillRect(0, 0, CANVAS, CANVAS);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, CANVAS, 72);
      ctx.fillRect(0, CANVAS - 72, CANVAS, 72);
    } else {
      ctx.fillStyle = currentBg.value;
      ctx.fillRect(0, 0, CANVAS, CANVAS);
    }

    // Soft blend glow for plain templates (mascot sits in a soft pool of light)
    const sid = sceneIdRef.current;
    if (sid.startsWith("plain-")) {
      const mascot = currentLayers.find((l) => l.id === "mascot_main");
      const cx = mascot?.x ?? 256;
      const cy = (mascot?.y ?? 280) + 20;
      const isLightBg =
        currentBg.type === "color" &&
        ["#f3f1ec", "#ebe4d4", "#f5f5f5", "#ffffff", "#e8e8e8"].includes(
          currentBg.value.toLowerCase()
        );
      const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 220);
      if (isLightBg) {
        grad.addColorStop(0, "rgba(255,255,255,0.55)");
        grad.addColorStop(0.45, "rgba(245,213,71,0.12)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
      } else if (sid === "plain-gold") {
        grad.addColorStop(0, "rgba(245,213,71,0.28)");
        grad.addColorStop(0.5, "rgba(245,213,71,0.08)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
      } else {
        grad.addColorStop(0, "rgba(245,213,71,0.16)");
        grad.addColorStop(0.4, "rgba(255,255,255,0.04)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS, CANVAS);

      // Soft vignette edges for plain blend look
      const vig = ctx.createRadialGradient(256, 256, 160, 256, 256, 360);
      if (isLightBg) {
        vig.addColorStop(0, "rgba(0,0,0,0)");
        vig.addColorStop(1, "rgba(0,0,0,0.08)");
      } else {
        vig.addColorStop(0, "rgba(0,0,0,0)");
        vig.addColorStop(1, "rgba(0,0,0,0.45)");
      }
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, CANVAS, CANVAS);
    }

    // Stickers first (mascot + extras), text on top like classic memes
    const stickers = currentLayers.filter((l) => l.kind === "sticker");
    const texts = currentLayers.filter((l) => l.kind === "text");

    for (const layer of stickers) {
      const src = resolveStickerSrc(layer.stickerId);
      if (!src) continue;
      try {
        const img = await loadImage(src);
        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        if (!iw || !ih) continue;

        ctx.save();
        ctx.translate(layer.x, layer.y);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.scale(layer.scale, layer.scale);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        const s = Math.min(STICKER_BOX / iw, STICKER_BOX / ih);
        const w = iw * s;
        const h = ih * s;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
      } catch {
        /* skip broken image */
      }
    }

    for (const layer of texts) {
      ctx.save();
      ctx.translate(layer.x, layer.y);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.scale, layer.scale);
      drawCaption(ctx, layer, CANVAS);
      ctx.restore();
    }
  }, []);

  const schedulePaint = useCallback(() => {
    if (redrawingRef.current) {
      needsRedrawRef.current = true;
      return;
    }
    redrawingRef.current = true;
    void (async () => {
      try {
        await paint();
      } finally {
        redrawingRef.current = false;
        if (needsRedrawRef.current) {
          needsRedrawRef.current = false;
          schedulePaint();
        }
      }
    })();
  }, [paint]);

  useEffect(() => {
    void ensureMemeFontsLoaded().then(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    clearImageCache();
    const srcs = MEME_SCENES.filter((s) => s.background.type === "image").map(
      (s) => s.background.value
    );
    void preloadImages(srcs).then(() => schedulePaint());
  }, [schedulePaint]);

  useEffect(() => {
    schedulePaint();
  }, [layers, bg, fontsReady, schedulePaint]);

  const setTopText = (text: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.role === "top" ? { ...l, text } : l))
    );
  };

  const setBottomText = (text: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.role === "bottom" ? { ...l, text } : l))
    );
  };

  const applyFontToCaptions = (fontId: string) => {
    setCaptionFontId(fontId);
    setLayers((prev) =>
      prev.map((l) => (l.kind === "text" ? { ...l, fontId } : l))
    );
  };

  const applySizeToCaptions = (px: number) => {
    const size = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(px)));
    setCaptionFontSize(size);
    setFontSizeInput(String(size));
    setLayers((prev) =>
      prev.map((l) => (l.kind === "text" ? { ...l, fontSize: size } : l))
    );
  };

  const commitFontSizeInput = () => {
    const n = Number(fontSizeInput);
    if (!Number.isFinite(n)) {
      setFontSizeInput(String(captionFontSize));
      return;
    }
    applySizeToCaptions(n);
  };



  const clientToCanvas = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const rect = stage.getBoundingClientRect();
    const rw = rect.width || 1;
    const rh = rect.height || 1;
    return {
      x: ((clientX - rect.left) / rw) * CANVAS,
      y: ((clientY - rect.top) / rh) * CANVAS,
    };
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Don't start drag when tapping the delete control
    if ((e.target as HTMLElement).closest("[data-sticker-delete]")) return;

    const { x, y } = clientToCanvas(e.clientX, e.clientY);
    const list = layersRef.current;

    // Prefer stickers over text for drag (text is usually edited via inputs)
    const ordered = [
      ...list.filter((l) => l.kind === "sticker").reverse(),
      ...list.filter((l) => l.kind === "text").reverse(),
    ];

    for (const l of ordered) {
      const dx = x - l.x;
      const dy = y - l.y;
      const r = hitRadius(l);
      if (dx * dx + dy * dy <= r * r) {
        setSelectedId(l.id);
        dragRef.current = {
          id: l.id,
          ox: dx,
          oy: dy,
          pointerId: e.pointerId,
        };
        setDraggingId(l.id);
        e.currentTarget.setPointerCapture(e.pointerId);
        e.preventDefault();
        return;
      }
    }
    setSelectedId(null);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const { x, y } = clientToCanvas(e.clientX, e.clientY);
    const nx = clamp(x - drag.ox, 0, CANVAS);
    const ny = clamp(y - drag.oy, 0, CANVAS);

    const next = layersRef.current.map((l) =>
      l.id === drag.id ? { ...l, x: nx, y: ny } : l
    );
    layersRef.current = next;

    if (rafDragRef.current == null) {
      rafDragRef.current = requestAnimationFrame(() => {
        rafDragRef.current = null;
        setLayers(layersRef.current);
      });
    }
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDraggingId(null);
    setLayers(layersRef.current);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const download = () => {
    // Final clean paint then download (no overlays on canvas)
    void paint().then(() => {
      const c = canvasRef.current;
      if (c) downloadCanvas(c, `attention-meme-${Date.now()}.png`);
    });
  };

  const shareMeme = () => {
    // Download PNG so user can attach it in the X compose dialog
    download();
    shareToX(defaultShareText(topLayer?.text, bottomLayer?.text));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]">
      {/* Canvas column */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#f5d547]/25 bg-[#0c0c0c] p-3 shadow-2xl shadow-black/60">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5d547]/80">
              Meme generator
            </span>
            <span className="text-[11px] text-white/35">512x512 PNG</span>
          </div>

          {/* Canvas preview */}
          <div
            ref={stageRef}
            className="relative aspect-square select-none overflow-hidden rounded-2xl bg-[#111]"
            style={{
              cursor: draggingId ? "grabbing" : "grab",
              touchAction: "none",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <canvas
              ref={canvasRef}
              className="pointer-events-none h-full w-full"
              width={CANVAS}
              height={CANVAS}
            />
          </div>
        </div>

        {/* Captions */}
        <div className="w-full max-w-lg space-y-3 rounded-2xl border border-white/10 bg-[#121212] p-4">
          <div>
            <h3 className="text-sm font-bold text-white">Captions</h3>
            <p className="mt-0.5 text-xs text-white/45">
              Type top and bottom text. Pick a font if you want.
            </p>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-white/70">
              Font
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {MEME_FONTS.map((f) => {
                const active = captionFontId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => applyFontToCaptions(f.id)}
                    className={`rounded-xl border px-2 py-2 text-left transition ${
                      active
                        ? "border-[#f5d547] bg-[#f5d547]/15 text-[#f5d547]"
                        : "border-white/10 bg-black/40 text-white/75 hover:border-white/25"
                    }`}
                  >
                    <span
                      className="block truncate text-sm leading-tight"
                      style={{ fontFamily: f.stack, fontWeight: f.weight }}
                    >
                      {f.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-white/70">
              Font size
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => applySizeToCaptions(captionFontSize - 1)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/40 text-lg font-semibold text-white/80 transition hover:border-white/25"
                aria-label="Decrease size"
              >
                -
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  inputMode="numeric"
                  min={MIN_FONT_SIZE}
                  max={MAX_FONT_SIZE}
                  value={fontSizeInput}
                  onChange={(e) => setFontSizeInput(e.target.value)}
                  onBlur={commitFontSizeInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2.5 text-center text-sm font-semibold tabular-nums text-white placeholder:text-white/35 focus:border-[#f5d547]/60 focus:outline-none focus:ring-1 focus:ring-[#f5d547]/30"
                  placeholder="22"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">
                  px
                </span>
              </div>
              <button
                type="button"
                onClick={() => applySizeToCaptions(captionFontSize + 1)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/40 text-lg font-semibold text-white/80 transition hover:border-white/25"
                aria-label="Increase size"
              >
                +
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-white/35">
              Type any size from {MIN_FONT_SIZE} to {MAX_FONT_SIZE}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] font-semibold text-white/40">
              Quick ideas:
            </span>
            {(
              [
                ["all", "All"],
                ...CAPTION_PACKS.map((p) => [p.id, p.name] as const),
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  const pack = id as CaptionPackId | "all";
                  setCaptionPack(pack);
                  const caption = randomCaption(pack);
                  setTopText(caption.top);
                  setBottomText(caption.bottom);
                }}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition ${
                  captionPack === id
                    ? "bg-[#f5d547] text-black"
                    : "bg-white/5 text-white/55 hover:bg-white/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-white/70">
              Top caption
            </span>
            <input
              value={topLayer?.text ?? ""}
              onChange={(e) => setTopText(e.target.value)}
              placeholder="Top text"
              maxLength={80}
              className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#f5d547]/60 focus:outline-none focus:ring-1 focus:ring-[#f5d547]/30"
              style={{
                fontFamily: getMemeFont(captionFontId).stack,
                fontWeight: getMemeFont(captionFontId).weight,
              }}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-white/70">
              Bottom caption
            </span>
            <input
              value={bottomLayer?.text ?? ""}
              onChange={(e) => setBottomText(e.target.value)}
              placeholder="Bottom text"
              maxLength={80}
              className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#f5d547]/60 focus:outline-none focus:ring-1 focus:ring-[#f5d547]/30"
              style={{
                fontFamily: getMemeFont(captionFontId).stack,
                fontWeight: getMemeFont(captionFontId).weight,
              }}
            />
          </label>
        </div>

        <div className="flex w-full max-w-lg flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={generateRandom}
            className="rounded-full border border-[#f5d547]/40 bg-[#f5d547]/10 px-5 py-2.5 text-sm font-bold text-[#f5d547] transition hover:bg-[#f5d547]/20"
          >
            Random meme
          </button>
          <button
            type="button"
            onClick={() => {
              const caption = randomCaption(captionPack);
              setTopText(caption.top);
              setBottomText(caption.bottom);
            }}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Random captions
          </button>
          <button
            type="button"
            onClick={download}
            className="rounded-full bg-[#f5d547] px-6 py-2.5 text-sm font-bold text-black shadow-[0_0_24px_rgba(245,213,71,0.4)] transition hover:brightness-110"
          >
            Download PNG
          </button>
          <button
            type="button"
            onClick={shareMeme}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Share on X
          </button>
        </div>
        <p className="max-w-lg text-center text-xs text-white/45">
          Pick a template, edit captions, download. Want stickers?{" "}
          <Link
            href="/stickers"
            className="text-[#f5d547] underline-offset-2 hover:underline"
          >
            Free sticker pack
          </Link>
        </p>
      </div>

      {/* Side panel - templates + optional custom background */}
      <div className="flex max-h-[min(92vh,900px)] flex-col gap-3 overflow-hidden rounded-3xl border border-white/10 bg-[#121212]/95 p-4">
        <div className="shrink-0">
          <h2 className="font-display text-lg uppercase tracking-wide text-white">
            Build your meme
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Choose a scene template, edit captions, download PNG.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-1 rounded-full bg-black/40 p-1">
          {(
            [
              ["templates", "Templates"],
              ["upload", "Upload"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setPanel(id)}
              className={`flex-1 rounded-full px-1.5 py-1.5 text-[11px] font-semibold transition sm:text-xs ${
                panel === id
                  ? "bg-[#f5d547] text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
          {panel === "templates" && (
            <div className="grid grid-cols-2 gap-2.5">
              {MEME_SCENES.map((scene) => {
                const active = sceneId === scene.id;
                const bgStyle =
                  scene.background.type === "color"
                    ? scene.background.value
                    : "#0a0a0a";
                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => applyScene(scene)}
                    className={`flex flex-col overflow-hidden rounded-2xl border text-left transition ${
                      active
                        ? "border-[#f5d547] bg-[#f5d547]/10"
                        : "border-white/10 bg-black/30 hover:border-white/25"
                    }`}
                  >
                    <div
                      className="relative flex aspect-square w-full items-center justify-center overflow-hidden p-0"
                      style={{
                        background: bgStyle,
                        backgroundImage:
                          scene.background.type === "image"
                            ? `url(${scene.background.value})`
                            : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="border-t border-white/5 p-2">
                      <div
                        className={`text-xs font-bold ${
                          active ? "text-[#f5d547]" : "text-white"
                        }`}
                      >
                        {scene.name}
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[10px] text-white/40">
                        {scene.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {panel === "upload" && (
            <div className="space-y-3">
              <p className="text-xs text-white/45">
                Optional custom background. Captions stay on top.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  onUploadBackground(e.target.files?.[0] ?? null)
                }
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-2xl border border-dashed border-[#f5d547]/40 bg-[#f5d547]/5 px-4 py-8 text-sm font-semibold text-[#f5d547] transition hover:bg-[#f5d547]/10"
              >
                Choose image
              </button>
              {uploadHint && (
                <p className="text-xs text-white/55">{uploadHint}</p>
              )}
              <button
                type="button"
                onClick={clearUpload}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
              >
                Clear upload
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
