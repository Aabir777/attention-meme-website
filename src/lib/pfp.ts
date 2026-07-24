import {
  PFP_BACKGROUNDS,
  getMascot,
  getPfpBackground,
  pfpMascots,
  type MascotPose,
} from "./assets";
import {
  accessoryDataUrl,
  defaultLayerTransform,
  emptyEquipped,
  emptyTransforms,
  equippedInPaintOrder,
  randomEquipped,
  type EquippedMap,
  type LayerTransform,
  type LayerTransformMap,
  type PfpCategoryId,
} from "./pfpAccessories";
import { loadImage } from "./traits";

export interface PfpConfig {
  /** Empty string = no base mascot (background + gear only) */
  mascotId: string;
  backgroundId: string;
  /** Used when backgroundId is "custom" */
  customBgColor: string;
  transparentBg: boolean;
  showLogo: boolean;
  zoom: number;
  equipped: EquippedMap;
  /** Move/scale each equipped layer to fit the mascot */
  transforms: LayerTransformMap;
}

export function defaultPfpConfig(): PfpConfig {
  return {
    mascotId: "main",
    backgroundId: "photo-stage-concert",
    customBgColor: "#f5d547",
    transparentBg: false,
    showLogo: false,
    zoom: 1,
    equipped: emptyEquipped(),
    transforms: emptyTransforms(),
  };
}

export function randomPfpConfig(): PfpConfig {
  const mascots = pfpMascots().filter((m) => m.id === "main");
  const pool = mascots.length ? mascots : pfpMascots();
  // Prefer non-custom for random
  const bgs = PFP_BACKGROUNDS.filter((b) => b.id !== "custom").map((b) => b.id);
  return {
    mascotId: pool[Math.floor(Math.random() * pool.length)]?.id ?? "main",
    backgroundId: bgs[Math.floor(Math.random() * bgs.length)] ?? "spotlight",
    customBgColor: "#f5d547",
    transparentBg: false,
    showLogo: Math.random() > 0.7,
    zoom: 0.92 + Math.random() * 0.12,
    equipped: randomEquipped(),
    transforms: emptyTransforms(),
  };
}

export function setEquippedItem(
  config: PfpConfig,
  category: PfpCategoryId,
  itemId: string | null
): PfpConfig {
  const current = config.equipped[category];
  const next = current === itemId ? null : itemId;
  const transforms = { ...config.transforms };
  if (!next) {
    delete transforms[category];
  } else if (current !== next) {
    // New item: reset placement so user can nudge from default
    transforms[category] = defaultLayerTransform();
  }
  return {
    ...config,
    equipped: { ...config.equipped, [category]: next },
    transforms,
  };
}

export function clearCategory(
  config: PfpConfig,
  category: PfpCategoryId
): PfpConfig {
  const transforms = { ...config.transforms };
  delete transforms[category];
  return {
    ...config,
    equipped: { ...config.equipped, [category]: null },
    transforms,
  };
}

export function clearAllAccessories(config: PfpConfig): PfpConfig {
  return {
    ...config,
    equipped: emptyEquipped(),
    transforms: emptyTransforms(),
  };
}

export function updateLayerTransform(
  config: PfpConfig,
  category: PfpCategoryId,
  patch: Partial<LayerTransform>
): PfpConfig {
  if (!config.equipped[category]) return config;
  const prev = config.transforms[category] ?? defaultLayerTransform();
  const next: LayerTransform = {
    x: clamp(patch.x ?? prev.x, -0.45, 0.45),
    y: clamp(patch.y ?? prev.y, -0.45, 0.45),
    scale: clamp(patch.scale ?? prev.scale, 0.45, 1.8),
  };
  return {
    ...config,
    transforms: { ...config.transforms, [category]: next },
  };
}

export function resetLayerTransform(
  config: PfpConfig,
  category: PfpCategoryId
): PfpConfig {
  if (!config.equipped[category]) return config;
  return {
    ...config,
    transforms: {
      ...config.transforms,
      [category]: defaultLayerTransform(),
    },
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export interface DrawRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function getMascotLayout(
  iw: number,
  ih: number,
  size: number,
  zoom = 1
): DrawRect {
  const pad = 0.04;
  const box = size * (1 - pad * 2);
  const scale = Math.min(box / iw, box / ih) * zoom;
  const w = iw * scale;
  const h = ih * scale;
  const x = (size - w) / 2;
  const y = (size - h) / 2 + size * 0.015;
  return { x, y, w, h };
}

function paintBackground(
  ctx: CanvasRenderingContext2D,
  bgId: string,
  size: number,
  transparent: boolean,
  customColor = "#f5d547"
) {
  if (transparent) {
    ctx.clearRect(0, 0, size, size);
    return;
  }

  const id = bgId || "spotlight";
  const cx = size * 0.5;
  const cy = size * 0.5;

  const solid = (color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
  };

  const linear = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    stops: [number, string][]
  ) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const [t, c] of stops) g.addColorStop(t, c);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  };

  const radial = (
    x: number,
    y: number,
    r0: number,
    r1: number,
    stops: [number, string][]
  ) => {
    const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
    for (const [t, c] of stops) g.addColorStop(t, c);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  };

  switch (id) {
    case "custom":
      solid(customColor || "#f5d547");
      break;
    case "void":
      solid("#0a0a0a");
      break;
    case "charcoal":
      solid("#1a1a1a");
      break;
    case "slate":
      solid("#1e293b");
      break;
    case "navy":
      solid("#0f172a");
      break;
    case "white":
      solid("#f5f5f5");
      break;
    case "cream":
      solid("#faf3e0");
      break;
    case "gold-solid":
      solid("#f5d547");
      break;
    case "amber-solid":
      solid("#f59e0b");
      break;
    case "orange":
      solid("#ea580c");
      break;
    case "red":
      solid("#dc2626");
      break;
    case "pink":
      solid("#ec4899");
      break;
    case "purple":
      solid("#7c3aed");
      break;
    case "blue":
      solid("#2563eb");
      break;
    case "cyan":
      solid("#06b6d4");
      break;
    case "green":
      solid("#16a34a");
      break;
    case "mint":
      solid("#6ee7b7");
      break;

    case "gold":
      linear(0, 0, size, size, [
        [0, "#f5d547"],
        [1, "#b8860b"],
      ]);
      break;
    case "spotlight":
      radial(cx, size * 0.4, size * 0.05, size * 0.7, [
        [0, "#4a4a4a"],
        [1, "#0a0a0a"],
      ]);
      break;
    case "amber":
      radial(cx, cy, size * 0.05, size * 0.65, [
        [0, "rgba(245,213,71,0.45)"],
        [1, "#0a0a0a"],
      ]);
      break;
    case "radial-gold":
      radial(cx, cy, size * 0.02, size * 0.72, [
        [0, "#fff4b0"],
        [0.35, "#f5d547"],
        [0.7, "#b8860b"],
        [1, "#1a1200"],
      ]);
      break;
    case "target": {
      solid("#0f0f14");
      ctx.strokeStyle = "rgba(245, 213, 71, 0.4)";
      for (const r of [0.42, 0.32, 0.22, 0.12]) {
        ctx.lineWidth = Math.max(1.5, size * 0.006);
        ctx.beginPath();
        ctx.arc(cx, cy, size * r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(245, 213, 71, 0.55)";
      ctx.lineWidth = Math.max(2, size * 0.008);
      ctx.beginPath();
      ctx.moveTo(cx, size * 0.08);
      ctx.lineTo(cx, size * 0.92);
      ctx.moveTo(size * 0.08, cy);
      ctx.lineTo(size * 0.92, cy);
      ctx.stroke();
      break;
    }
    case "stage": {
      linear(0, 0, 0, size, [
        [0, "#1a1025"],
        [0.55, "#2d1b4e"],
        [1, "#0a0612"],
      ]);
      // curtains
      ctx.fillStyle = "rgba(127, 29, 29, 0.55)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(size * 0.12, size * 0.35, 0, size);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.quadraticCurveTo(size * 0.88, size * 0.35, size, size);
      ctx.closePath();
      ctx.fill();
      // footlights
      radial(cx, size * 0.95, 0, size * 0.55, [
        [0, "rgba(245,213,71,0.35)"],
        [1, "rgba(245,213,71,0)"],
      ]);
      break;
    }
    case "space": {
      linear(0, 0, size, size, [
        [0, "#020617"],
        [0.5, "#1e1b4b"],
        [1, "#0f172a"],
      ]);
      // stars
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (let i = 0; i < 48; i++) {
        const sx = ((i * 97) % 100) / 100;
        const sy = ((i * 53) % 100) / 100;
        const r = 0.6 + (i % 3) * 0.5;
        ctx.beginPath();
        ctx.arc(sx * size, sy * size, r * (size / 512), 0, Math.PI * 2);
        ctx.fill();
      }
      radial(cx, cy, 0, size * 0.45, [
        [0, "rgba(124,58,237,0.25)"],
        [1, "rgba(124,58,237,0)"],
      ]);
      break;
    }
    case "sunset":
      linear(0, 0, 0, size, [
        [0, "#7c2d12"],
        [0.35, "#ea580c"],
        [0.65, "#fb923c"],
        [0.85, "#fde68a"],
        [1, "#1c1917"],
      ]);
      break;
    case "neon": {
      solid("#0f0320");
      // neon grid floor
      ctx.strokeStyle = "rgba(217, 70, 239, 0.35)";
      ctx.lineWidth = Math.max(1, size * 0.003);
      for (let i = 0; i < 10; i++) {
        const y = size * (0.55 + i * 0.05);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
      }
      for (let i = -4; i <= 12; i++) {
        ctx.beginPath();
        ctx.moveTo(size * 0.5, size * 0.5);
        ctx.lineTo(size * (i / 8), size);
        ctx.stroke();
      }
      radial(cx, size * 0.35, 0, size * 0.4, [
        [0, "rgba(34,211,238,0.25)"],
        [1, "rgba(34,211,238,0)"],
      ]);
      break;
    }
    case "forest": {
      linear(0, 0, 0, size, [
        [0, "#14532d"],
        [0.5, "#166534"],
        [1, "#052e16"],
      ]);
      ctx.fillStyle = "rgba(5, 46, 22, 0.55)";
      for (let i = 0; i < 7; i++) {
        const tx = (i / 6) * size;
        ctx.beginPath();
        ctx.moveTo(tx, size * 0.35);
        ctx.lineTo(tx - size * 0.08, size * 0.75);
        ctx.lineTo(tx + size * 0.08, size * 0.75);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case "ocean": {
      linear(0, 0, 0, size, [
        [0, "#0c4a6e"],
        [0.45, "#0e7490"],
        [1, "#164e63"],
      ]);
      ctx.strokeStyle = "rgba(165, 243, 252, 0.25)";
      ctx.lineWidth = Math.max(2, size * 0.006);
      for (let i = 0; i < 5; i++) {
        const y = size * (0.55 + i * 0.08);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(
          size * 0.25,
          y - size * 0.03,
          size * 0.75,
          y + size * 0.03,
          size,
          y
        );
        ctx.stroke();
      }
      break;
    }
    case "arena": {
      solid("#1c1917");
      // oval ring
      ctx.strokeStyle = "rgba(245, 213, 71, 0.55)";
      ctx.lineWidth = Math.max(4, size * 0.014);
      ctx.beginPath();
      ctx.ellipse(cx, size * 0.72, size * 0.42, size * 0.18, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(245, 213, 71, 0.25)";
      ctx.lineWidth = Math.max(2, size * 0.006);
      ctx.beginPath();
      ctx.ellipse(cx, size * 0.72, size * 0.32, size * 0.12, 0, 0, Math.PI * 2);
      ctx.stroke();
      radial(cx, size * 0.3, 0, size * 0.5, [
        [0, "rgba(245,213,71,0.12)"],
        [1, "rgba(0,0,0,0)"],
      ]);
      break;
    }
    case "matrix": {
      solid("#022c22");
      ctx.fillStyle = "rgba(74, 222, 128, 0.35)";
      ctx.font = `${Math.max(8, size * 0.028)}px monospace`;
      const glyphs = "01ATTN$¥#";
      for (let col = 0; col < 14; col++) {
        for (let row = 0; row < 18; row++) {
          if ((col + row) % 3 === 0) continue;
          const ch = glyphs[(col * 7 + row * 3) % glyphs.length];
          ctx.globalAlpha = 0.15 + ((col + row) % 5) * 0.08;
          ctx.fillText(
            ch,
            (col / 14) * size + size * 0.01,
            (row / 18) * size + size * 0.04
          );
        }
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "paper": {
      solid("#f5f0e6");
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 1;
      const step = size / 16;
      for (let i = 1; i < 16; i++) {
        ctx.beginPath();
        ctx.moveTo(i * step, 0);
        ctx.lineTo(i * step, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * step);
        ctx.lineTo(size, i * step);
        ctx.stroke();
      }
      break;
    }
    case "checker": {
      const n = 8;
      const cell = size / n;
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          ctx.fillStyle = (x + y) % 2 === 0 ? "#f5d547" : "#0a0a0a";
          ctx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5);
        }
      }
      break;
    }
    case "horizon": {
      linear(0, 0, 0, size, [
        [0, "#0c4a6e"],
        [0.4, "#38bdf8"],
        [0.55, "#fde68a"],
        [0.7, "#f5d547"],
        [1, "#78350f"],
      ]);
      break;
    }
    default: {
      const bg = PFP_BACKGROUNDS.find((b) => b.id === id);
      solid(bg?.fill ?? "#0a0a0a");
    }
  }

  // Soft foot glow under mascot (skip light/paper-like BGs)
  if (
    !["white", "cream", "paper", "mint", "gold-solid", "checker"].includes(id)
  ) {
    const glow = ctx.createRadialGradient(
      size * 0.5,
      size * 0.62,
      size * 0.05,
      size * 0.5,
      size * 0.62,
      size * 0.4
    );
    glow.addColorStop(0, "rgba(245,213,71,0.12)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);
  }
}

function drawAccessoryInLayout(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  layout: DrawRect,
  t: LayerTransform
) {
  const sw = layout.w * t.scale;
  const sh = layout.h * t.scale;
  const ox = t.x * layout.w;
  const oy = t.y * layout.h;
  const dx = layout.x + (layout.w - sw) / 2 + ox;
  const dy = layout.y + (layout.h - sh) / 2 + oy;
  ctx.drawImage(img, dx, dy, sw, sh);
}

/** Draw a photo full-bleed (cover) across the canvas */
async function paintPhotoBackground(
  ctx: CanvasRenderingContext2D,
  src: string,
  size: number
): Promise<boolean> {
  try {
    const img = await loadImage(src);
    const iw = img.naturalWidth || img.width || 1;
    const ih = img.naturalHeight || img.height || 1;
    const scale = Math.max(size / iw, size / ih);
    const w = iw * scale;
    const h = ih * scale;
    const x = (size - w) / 2;
    const y = (size - h) / 2;
    ctx.drawImage(img, x, y, w, h);
    // Soft vignette so mascot pops
    const vig = ctx.createRadialGradient(
      size * 0.5,
      size * 0.48,
      size * 0.22,
      size * 0.5,
      size * 0.5,
      size * 0.72
    );
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.28)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, size, size);
    return true;
  } catch {
    return false;
  }
}

export async function renderPfpToCanvas(
  config: PfpConfig,
  canvas: HTMLCanvasElement,
  sizePx = 512
): Promise<void> {
  canvas.width = sizePx;
  canvas.height = sizePx;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const bgMeta = getPfpBackground(config.backgroundId);

  if (config.transparentBg) {
    ctx.clearRect(0, 0, sizePx, sizePx);
  } else if (bgMeta?.image) {
    const ok = await paintPhotoBackground(ctx, bgMeta.image, sizePx);
    if (!ok) {
      paintBackground(
        ctx,
        config.backgroundId,
        sizePx,
        false,
        config.customBgColor ?? "#f5d547"
      );
    }
  } else {
    paintBackground(
      ctx,
      config.backgroundId,
      sizePx,
      false,
      config.customBgColor ?? "#f5d547"
    );
  }

  const mascot: MascotPose | undefined = config.mascotId
    ? getMascot(config.mascotId)
    : undefined;
  let layout: DrawRect | null = null;

  if (mascot) {
    try {
      // Prefer transparent cutout so BG fills the white studio area
      const src = mascot.pfpSrc || mascot.src;
      const img = await loadImage(src);
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      layout = getMascotLayout(iw, ih, sizePx, config.zoom);
      ctx.drawImage(img, layout.x, layout.y, layout.w, layout.h);
    } catch {
      /* ignore */
    }
  }

  if (!layout) {
    // Still use layout box for accessories when mascot is cleared
    layout = getMascotLayout(512, 512, sizePx, config.zoom);
  }

  const layers = equippedInPaintOrder(config.equipped);
  for (const acc of layers) {
    try {
      const img = await loadImage(accessoryDataUrl(acc));
      const t =
        config.transforms[acc.category] ?? defaultLayerTransform();
      drawAccessoryInLayout(ctx, img, layout, t);
    } catch {
      /* ignore */
    }
  }

  if (config.showLogo) {
    try {
      const logo = await loadImage("/mascot/logo-mark.png");
      const logoSize = sizePx * 0.14;
      ctx.drawImage(
        logo,
        sizePx - logoSize - sizePx * 0.04,
        sizePx * 0.04,
        logoSize,
        logoSize
      );
    } catch {
      /* ignore */
    }
  }
}

export async function exportPfpBlob(
  config: PfpConfig,
  sizePx: number,
  transparent: boolean
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  await renderPfpToCanvas(
    { ...config, transparentBg: transparent },
    canvas,
    sizePx
  );
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png");
  });
}
