import { BRAND, stickerMascots } from "./assets";
import generated from "./stickers.generated.json";

export interface StickerDef {
  id: string;
  name: string;
  /** Image path or inline SVG data URL */
  src: string;
  kind: "image" | "svg";
  /** Group for meme maker sticker panel */
  group?: "pack" | "mascot" | "brand" | "deco";
}

export interface MemeTemplate {
  id: string;
  name: string;
  fill: string;
  /** Optional full-bleed background image */
  imageSrc?: string;
  overlaySvg?: string;
}

/**
 * Official Attention sticker pack
 * (from Desktop "sticker with bg removed").
 * Powers Stickers page + meme generator Stickers panel.
 */
export const PACK_STICKERS: StickerDef[] = generated.map((s) => ({
  id: s.id,
  name: s.name,
  src: s.src,
  kind: "image" as const,
  group: "pack" as const,
}));

/** Main-character mascot poses for the Meme Maker “Mascot” tab (not the sticker pack). */
const MASCOT_STICKERS: StickerDef[] = stickerMascots().map((m) => ({
  id: m.id,
  name: m.name,
  src: m.src,
  kind: "image" as const,
  group: "mascot" as const,
}));

/** All stickers usable on the meme canvas (lookup by id). */
export const STICKERS: StickerDef[] = [
  ...PACK_STICKERS,
  ...MASCOT_STICKERS,
];

/** Stickers shown in the meme generator Stickers panel. */
export function memePanelStickers(): StickerDef[] {
  return PACK_STICKERS;
}

export const MEME_TEMPLATES: MemeTemplate[] = [
  { id: "black", name: "Black", fill: "#0a0a0a" },
  { id: "gold", name: "Gold", fill: "#f5d547" },
  { id: "charcoal", name: "Charcoal", fill: "#1a1a1a" },
  { id: "white", name: "White", fill: "#f8fafc" },
  {
    id: "classic-bars",
    name: "Classic",
    fill: "#ffffff",
    overlaySvg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
      <rect width="512" height="70" fill="#000"/>
      <rect y="442" width="512" height="70" fill="#000"/>
    </svg>`,
  },
  {
    id: "hero-glow",
    name: "Glow Stage",
    fill: "#0a0a0a",
    imageSrc: BRAND.hero,
  },
  {
    id: "hero-wide",
    name: "Brand Stage",
    fill: "#0a0a0a",
    imageSrc: BRAND.heroWide,
  },
  {
    id: "spotlight",
    name: "Spotlight",
    fill: "#0a0a0a",
    overlaySvg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
      <defs>
        <radialGradient id="s" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#f5d547" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#0a0a0a" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="512" height="512" fill="url(#s)"/>
    </svg>`,
  },
];

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
