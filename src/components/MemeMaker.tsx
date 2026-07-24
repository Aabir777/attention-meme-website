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
import { STICKERS, memePanelStickers, PACK_STICKERS } from "@/lib/stickers";
import { getMascot, stickerMascots } from "@/lib/assets";
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
  uid,
} from "@/lib/export";
import {
  assetUrl,
  clearImageCache,
  loadImage,
  preloadImages,
} from "@/lib/traits";
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
    if (last.length > 3) lines[maxLines - 1] = `${last.slice(0, -2)}…`;
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

  // Thin outline — thick strokes made bottom text look muddy
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
  const pack = STICKERS.find((s) => s.id === stickerId);
  if (pack) return pack.src;
  const mascot = getMascot(stickerId);
  return mascot?.src ?? null;
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
  const [panel, setPanel] = useState<
    "templates" | "mascot" | "stickers" | "edit" | "upload"
  >("templates");
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
  const mascotLayer = layers.find((l) => l.id === "mascot_main");
  const selected = layers.find((l) => l.id === selectedId) ?? null;
  const extraStickers = layers.filter(
    (l) => l.kind === "sticker" && l.role === "extra"
  );

  const applyScene = (scene: MemeScene) => {
    setSceneId(scene.id);
    setBg(bgFromScene(scene));
    setLayers(layersFromScene(scene, captionFontId, captionFontSize));
    setSelectedId(null);
  };

  const generateRandom = () => {
    const scene = randomScene();
    const caption = randomCaption(captionPack);
    const mascots = stickerMascots();
    const mascot = mascots[Math.floor(Math.random() * mascots.length)];
    applyScene({
      ...scene,
      mascotId: mascot.id,
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
    const scene =
      MEME_SCENES.find((s) => s.id === "classic-gold") ?? MEME_SCENES[0];
    setBg(bgFromScene(scene));
    setSceneId(scene.id);
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
    const srcs = [
      ...stickerMascots().map((m) => m.src),
      ...PACK_STICKERS.map((s) => s.src),
      ...MEME_SCENES.filter((s) => s.background.type === "image").map(
        (s) => s.background.value
      ),
    ];
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

  const setMascotPose = (mascotId: string) => {
    setLayers((prev) => {
      const has = prev.some((l) => l.id === "mascot_main");
      if (has) {
        return prev.map((l) =>
          l.id === "mascot_main" ? { ...l, stickerId: mascotId } : l
        );
      }
      return [
        ...prev,
        {
          id: "mascot_main",
          kind: "sticker",
          stickerId: mascotId,
          x: 256,
          y: 280,
          scale: 2,
          rotation: 0,
        },
      ];
    });
    setSelectedId("mascot_main");
  };

  /** Remove main mascot from the meme (user can add it back from Mascot tab) */
  const clearMascot = () => {
    setLayers((prev) => prev.filter((l) => l.id !== "mascot_main"));
    if (selectedId === "mascot_main") setSelectedId(null);
  };

  const addSticker = (stickerId: string) => {
    const layer: MemeLayer = {
      id: uid("sticker"),
      kind: "sticker",
      stickerId,
      role: "extra",
      x: 256 + (Math.random() * 40 - 20),
      y: 240 + (Math.random() * 40 - 20),
      scale: 1.1,
      rotation: 0,
    };
    setLayers((prev) => [...prev, layer]);
    setSelectedId(layer.id);
    // stay on stickers panel — don't jump to edit
  };

  const updateSelected = (patch: Partial<MemeLayer>) => {
    if (!selectedId) return;
    setLayers((prev) =>
      prev.map((l) => (l.id === selectedId ? { ...l, ...patch } : l))
    );
  };

  const nudgeSelectedScale = (delta: number) => {
    if (!selected || selected.kind !== "sticker") return;
    const next = Math.min(3.5, Math.max(0.15, +(selected.scale + delta).toFixed(2)));
    updateSelected({ scale: next });
  };

  const nudgeSelectedRotation = (delta: number) => {
    if (!selected || selected.kind !== "sticker") return;
    let next = selected.rotation + delta;
    // keep in -180..180
    while (next > 180) next -= 360;
    while (next < -180) next += 360;
    updateSelected({ rotation: Math.round(next) });
  };

  const removeLayer = (id: string) => {
    const layer = layersRef.current.find((l) => l.id === id);
    if (!layer) return;
    if (layer.id === "mascot_main") {
      clearMascot();
      return;
    }
    if (layer.role === "top" || layer.role === "bottom") {
      setLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, text: "" } : l))
      );
      return;
    }
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedId === id) setSelectedId(null);
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
    // Don't start drag when tapping the delete ×
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
            <span className="text-[11px] text-white/35">512×512 PNG</span>
          </div>

          {/* Canvas + delete × on selected sticker only */}
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

            {/* Red × — selected sticker OR mascot (easy remove / cancel) */}
            {selected?.kind === "sticker" &&
              (() => {
                const sidePct = Math.min(
                  42,
                  Math.max(16, ((STICKER_BOX * selected.scale) / CANVAS) * 100)
                );
                const left = (selected.x / CANVAS) * 100;
                const top = (selected.y / CANVAS) * 100;
                const isMascot = selected.id === "mascot_main";
                return (
                  <button
                    type="button"
                    data-sticker-delete
                    title={isMascot ? "Remove mascot" : "Remove sticker"}
                    aria-label={isMascot ? "Remove mascot" : "Remove sticker"}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLayer(selected.id);
                    }}
                    className="absolute z-20 grid h-7 w-7 place-items-center rounded-full bg-red-500 text-base font-bold leading-none text-white shadow-md shadow-black/50 transition hover:scale-110 hover:bg-red-400"
                    style={{
                      left: `calc(${left}% + ${sidePct / 2}%)`,
                      top: `calc(${top}% - ${sidePct / 2}%)`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    ×
                  </button>
                );
              })()}
          </div>

          {/* Selected sticker size + rotation — under canvas when a sticker is active */}
          {selected?.kind === "sticker" && (
            <div className="mt-3 rounded-2xl border border-[#f5d547]/25 bg-[#f5d547]/5 px-3 py-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#f5d547]">
                  Sticker
                  {selected.role === "extra"
                    ? ` · ${
                        STICKERS.find((d) => d.id === selected.stickerId)?.name ??
                        "Sticker"
                      }`
                    : " · Mascot"}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateSelected({
                      scale: selected.role === "extra" ? 1.1 : 2,
                      rotation: 0,
                    })
                  }
                  className="text-[10px] font-semibold text-white/45 hover:text-white"
                >
                  Reset
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  title="Smaller"
                  onClick={() => nudgeSelectedScale(-0.1)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-black/40 text-lg font-bold text-white hover:border-[#f5d547]/50 hover:bg-[#f5d547]/10"
                >
                  −
                </button>
                <label className="min-w-0 flex-1 flex flex-col gap-0.5 text-[10px] uppercase tracking-wider text-white/40">
                  <span className="tabular-nums text-white/55">
                    Size {selected.scale.toFixed(2)}×
                  </span>
                  <input
                    type="range"
                    min={0.15}
                    max={3.5}
                    step={0.05}
                    value={selected.scale}
                    onChange={(e) =>
                      updateSelected({ scale: Number(e.target.value) })
                    }
                    className="w-full accent-[#f5d547]"
                  />
                </label>
                <button
                  type="button"
                  title="Bigger"
                  onClick={() => nudgeSelectedScale(0.1)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-black/40 text-lg font-bold text-white hover:border-[#f5d547]/50 hover:bg-[#f5d547]/10"
                >
                  +
                </button>
                <button
                  type="button"
                  title={
                    selected.id === "mascot_main"
                      ? "Remove mascot"
                      : "Remove sticker"
                  }
                  onClick={() => removeLayer(selected.id)}
                  className="ml-auto rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold text-red-400 hover:bg-red-500/20"
                >
                  {selected.id === "mascot_main" ? "Remove mascot" : "Remove"}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  title="Rotate left"
                  onClick={() => nudgeSelectedRotation(-15)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-black/40 text-sm font-bold text-white hover:border-[#f5d547]/50 hover:bg-[#f5d547]/10"
                >
                  ↺
                </button>
                <label className="min-w-0 flex-1 flex flex-col gap-0.5 text-[10px] uppercase tracking-wider text-white/40">
                  <span className="tabular-nums text-white/55">
                    Rotate {selected.rotation}°
                  </span>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={selected.rotation}
                    onChange={(e) =>
                      updateSelected({ rotation: Number(e.target.value) })
                    }
                    className="w-full accent-[#f5d547]"
                  />
                </label>
                <button
                  type="button"
                  title="Rotate right"
                  onClick={() => nudgeSelectedRotation(15)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-black/40 text-sm font-bold text-white hover:border-[#f5d547]/50 hover:bg-[#f5d547]/10"
                >
                  ↻
                </button>
                <div className="flex gap-1">
                  {([-45, 0, 45, 90] as const).map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      title={`${deg}°`}
                      onClick={() => updateSelected({ rotation: deg })}
                      className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${
                        selected.rotation === deg
                          ? "border-[#f5d547] bg-[#f5d547]/15 text-[#f5d547]"
                          : "border-white/10 bg-black/30 text-white/65 hover:border-white/25"
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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
                −
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
          Pick a template, write captions, add stickers, then download.{" "}
          <Link
            href="/stickers"
            className="text-[#f5d547] underline-offset-2 hover:underline"
          >
            Free stickers
          </Link>
        </p>
      </div>

      {/* Side panel */}
      <div className="flex max-h-[min(92vh,900px)] flex-col gap-3 overflow-hidden rounded-3xl border border-white/10 bg-[#121212]/95 p-4">
        <div className="shrink-0">
          <h2 className="font-display text-lg uppercase tracking-wide text-white">
            Build your meme
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Templates, mascot, stickers. Download when ready.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-1 rounded-full bg-black/40 p-1">
          {(
            [
              ["templates", "Templates"],
              ["mascot", "Mascot"],
              ["stickers", "Stickers"],
              ["upload", "Upload"],
              ["edit", "Edit"],
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
                const thumb = getMascot(scene.mascotId)?.src;
                const isBars = scene.id === "ct-raid";
                const isFullScene = scene.showMascot === false;
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
                      className={`relative flex aspect-square w-full items-center justify-center overflow-hidden ${
                        isFullScene ? "p-0" : "p-3"
                      }`}
                      style={{
                        background: isBars
                          ? `linear-gradient(#000 0 14%, ${bgStyle} 14% 86%, #000 86% 100%)`
                          : bgStyle,
                        backgroundImage:
                          scene.background.type === "image"
                            ? isFullScene
                              ? `url(${scene.background.value})`
                              : `linear-gradient(rgba(0,0,0,0.3),rgba(0,0,0,0.3)), url(${scene.background.value})`
                            : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {thumb && !isFullScene && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt=""
                          className="max-h-[70%] max-w-[70%] object-contain"
                          draggable={false}
                        />
                      )}
                    </div>
                    <div className="border-t border-white/5 p-2">
                      <div
                        className={`text-xs font-bold ${
                          active ? "text-[#f5d547]" : "text-white"
                        }`}
                      >
                        {scene.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {panel === "mascot" && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs text-white/45">
                  Pick a pose, or cancel with × / None.
                </p>
                {mascotLayer && (
                  <button
                    type="button"
                    title="Remove mascot"
                    onClick={clearMascot}
                    className="rounded-full border border-red-500/35 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-500/20"
                  >
                    × Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* None / cancel mascot */}
                <button
                  type="button"
                  title="No mascot"
                  onClick={clearMascot}
                  className={`flex flex-col items-center rounded-2xl border p-2 transition ${
                    !mascotLayer
                      ? "border-[#f5d547] bg-[#f5d547]/10"
                      : "border-white/10 bg-black/30 hover:border-white/25"
                  }`}
                >
                  <div className="grid aspect-square w-full place-items-center rounded-xl bg-[#16161c] text-3xl font-bold text-white/35">
                    ×
                  </div>
                  <span
                    className={`mt-1 block text-center text-xs font-semibold ${
                      !mascotLayer ? "text-[#f5d547]" : "text-white/70"
                    }`}
                  >
                    None
                  </span>
                </button>

                {stickerMascots().map((m) => {
                  const active = mascotLayer?.stickerId === m.id;
                  return (
                    <div key={m.id} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          if (active) {
                            clearMascot();
                            return;
                          }
                          setMascotPose(m.id);
                        }}
                        className={`w-full rounded-2xl border p-2 transition ${
                          active
                            ? "border-[#f5d547] bg-[#f5d547]/10"
                            : "border-white/10 bg-black/30 hover:border-white/25"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.src}
                          alt={m.name}
                          className="aspect-square w-full rounded-xl bg-[#16161c] object-contain p-1"
                        />
                        <span
                          className={`mt-1 block text-center text-xs font-semibold ${
                            active ? "text-[#f5d547]" : "text-white/70"
                          }`}
                        >
                          {m.name}
                        </span>
                      </button>
                      {active && (
                        <button
                          type="button"
                          title="Remove mascot"
                          aria-label="Remove mascot"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearMascot();
                          }}
                          className="absolute -right-1.5 -top-1.5 z-10 grid h-7 w-7 place-items-center rounded-full bg-red-500 text-base font-bold leading-none text-white shadow-md shadow-black/50 transition hover:scale-110 hover:bg-red-400"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {panel === "stickers" && (
            <div>
              <p className="mb-2 text-xs text-white/45">
                Tap to add. Drag to move. Resize and rotate under the preview or below.
              </p>

              {selected?.kind === "sticker" && selected.role === "extra" && (
                <div className="mb-3 rounded-2xl border border-[#f5d547]/25 bg-[#f5d547]/5 p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#f5d547]">
                    Selected:{" "}
                    {STICKERS.find((d) => d.id === selected.stickerId)?.name ??
                      "Sticker"}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Minimize"
                      onClick={() => nudgeSelectedScale(-0.15)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-black/40 text-lg font-bold text-white hover:border-[#f5d547]/50"
                    >
                      −
                    </button>
                    <label className="min-w-0 flex-1 flex flex-col gap-0.5 text-[10px] uppercase text-white/40">
                      Size {selected.scale.toFixed(2)}×
                      <input
                        type="range"
                        min={0.15}
                        max={3.5}
                        step={0.05}
                        value={selected.scale}
                        onChange={(e) =>
                          updateSelected({ scale: Number(e.target.value) })
                        }
                        className="w-full accent-[#f5d547]"
                      />
                    </label>
                    <button
                      type="button"
                      title="Bigger"
                      onClick={() => nudgeSelectedScale(0.15)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-black/40 text-lg font-bold text-white hover:border-[#f5d547]/50"
                    >
                      +
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      title="Rotate left"
                      onClick={() => nudgeSelectedRotation(-15)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-black/40 text-sm font-bold text-white hover:border-[#f5d547]/50"
                    >
                      ↺
                    </button>
                    <label className="min-w-0 flex-1 flex flex-col gap-0.5 text-[10px] uppercase text-white/40">
                      Rotate {selected.rotation}°
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        step={1}
                        value={selected.rotation}
                        onChange={(e) =>
                          updateSelected({ rotation: Number(e.target.value) })
                        }
                        className="w-full accent-[#f5d547]"
                      />
                    </label>
                    <button
                      type="button"
                      title="Rotate right"
                      onClick={() => nudgeSelectedRotation(15)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-black/40 text-sm font-bold text-white hover:border-[#f5d547]/50"
                    >
                      ↻
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {([-90, -45, 0, 45, 90, 180] as const).map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => updateSelected({ rotation: deg })}
                        className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${
                          selected.rotation === deg
                            ? "border-[#f5d547] bg-[#f5d547]/15 text-[#f5d547]"
                            : "border-white/10 bg-black/30 text-white/70 hover:border-white/25"
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => updateSelected({ scale: 0.45 })}
                      className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-semibold text-white/70 hover:border-white/25"
                    >
                      Tiny
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelected({ scale: 1.1 })}
                      className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-semibold text-white/70 hover:border-white/25"
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLayer(selected.id)}
                      className="ml-auto rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-400 hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {memePanelStickers().map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    title={`Add ${s.name}`}
                    onClick={() => addSticker(s.id)}
                    className="group rounded-xl border border-white/10 bg-[#0c0c10] p-2 transition hover:border-[#f5d547]/55 hover:bg-[#f5d547]/8 active:scale-[0.97]"
                  >
                    <div className="aspect-square overflow-hidden rounded-lg bg-[#16161c]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={assetUrl(s.src)}
                        alt={s.name}
                        loading="lazy"
                        className="h-full w-full object-contain p-1.5 transition group-hover:scale-105"
                      />
                    </div>
                    <span className="mt-1.5 block truncate text-center text-[10px] font-medium text-white/55 group-hover:text-[#f5d547]">
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {panel === "upload" && (
            <div className="space-y-3">
              <p className="text-xs text-white/45">
                Upload a custom background. Captions and mascot stay on top.
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

          {panel === "edit" && (
            <div className="space-y-4">
              {mascotLayer && (
                <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wider text-white/40">
                  Mascot size: {mascotLayer.scale.toFixed(2)}
                  <input
                    type="range"
                    min={0.6}
                    max={3.2}
                    step={0.05}
                    value={mascotLayer.scale}
                    onChange={(e) =>
                      setLayers((prev) =>
                        prev.map((l) =>
                          l.id === "mascot_main"
                            ? { ...l, scale: Number(e.target.value) }
                            : l
                        )
                      )
                    }
                    className="w-full accent-[#f5d547]"
                  />
                </label>
              )}

              {selected && selected.kind === "sticker" && (
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                  <p className="mb-2 text-xs font-semibold text-white/70">
                    Selected sticker
                  </p>
                  <div className="mb-2 flex items-center gap-2">
                    <button
                      type="button"
                      title="Smaller"
                      onClick={() => nudgeSelectedScale(-0.1)}
                      className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-black/40 text-base font-bold text-white hover:border-[#f5d547]/50"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      title="Bigger"
                      onClick={() => nudgeSelectedScale(0.1)}
                      className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-black/40 text-base font-bold text-white hover:border-[#f5d547]/50"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelected({ scale: 0.45 })}
                      className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold text-white/65 hover:border-white/25"
                    >
                      Tiny
                    </button>
                  </div>
                  <label className="flex flex-col gap-1 text-[10px] uppercase text-white/40">
                    Size: {selected.scale.toFixed(2)}×
                    <input
                      type="range"
                      min={0.15}
                      max={3.5}
                      step={0.05}
                      value={selected.scale}
                      onChange={(e) =>
                        updateSelected({ scale: Number(e.target.value) })
                      }
                      className="w-full accent-[#f5d547]"
                    />
                  </label>
                  <label className="mt-2 flex flex-col gap-1 text-[10px] uppercase text-white/40">
                    Rotate: {selected.rotation}°
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={selected.rotation}
                      onChange={(e) =>
                        updateSelected({ rotation: Number(e.target.value) })
                      }
                      className="w-full accent-[#f5d547]"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeLayer(selected.id)}
                    className="mt-3 w-full rounded-xl border border-red-500/30 bg-red-500/10 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20"
                  >
                    {selected.id === "mascot_main"
                      ? "Remove mascot"
                      : "Remove sticker"}
                  </button>
                </div>
              )}

              {extraStickers.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">
                    Stickers on meme ({extraStickers.length})
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {extraStickers.map((s) => {
                      const name =
                        STICKERS.find((d) => d.id === s.stickerId)?.name ??
                        "Sticker";
                      return (
                        <li
                          key={s.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1.5"
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedId(s.id)}
                            className={`truncate text-left text-xs ${
                              selectedId === s.id
                                ? "font-semibold text-[#f5d547]"
                                : "text-white/70"
                            }`}
                          >
                            {name}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLayer(s.id)}
                            className="rounded-lg px-2 py-1 text-[10px] font-semibold text-red-400 hover:bg-red-500/15"
                          >
                            Remove
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {!selected && extraStickers.length === 0 && (
                <p className="text-xs text-white/45">
                  Drag the mascot or stickers on the canvas. Use captions under
                  the meme for text.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
