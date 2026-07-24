/** Meme-style fonts for the meme generator canvas + UI. */

export interface MemeFont {
  id: string;
  label: string;
  /** CSS font-family stack for canvas + previews */
  stack: string;
  /** Bold / heavy weight when bold is on */
  weight: string;
  /** Regular weight when bold is off */
  regularWeight: string;
  /** Google Fonts family to load (optional — system fonts skip this) */
  google?: string;
}

export const MEME_FONTS: MemeFont[] = [
  {
    id: "impact",
    label: "Impact",
    stack: 'Impact, "Arial Black", Haettenschweiler, sans-serif',
    weight: "900",
    regularWeight: "400",
  },
  {
    id: "arial-black",
    label: "Arial Black",
    stack: '"Arial Black", "Helvetica Black", Gadget, sans-serif',
    weight: "900",
    regularWeight: "400",
  },
  {
    id: "comic",
    label: "Comic Sans",
    stack: '"Comic Sans MS", "Comic Sans", cursive',
    weight: "700",
    regularWeight: "400",
  },
  {
    id: "anton",
    label: "Anton",
    stack: '"Anton", Impact, sans-serif',
    weight: "400",
    regularWeight: "400",
    google: "Anton",
  },
  {
    id: "bangers",
    label: "Bangers",
    stack: '"Bangers", Impact, cursive',
    weight: "400",
    regularWeight: "400",
    google: "Bangers",
  },
  {
    id: "oswald",
    label: "Oswald",
    stack: '"Oswald", "Arial Narrow", sans-serif',
    weight: "700",
    regularWeight: "400",
    google: "Oswald:wght@400;700",
  },
];

export const DEFAULT_MEME_FONT_ID = "impact";

/** Aesthetic size presets for the caption size selector */
export const FONT_SIZE_PRESETS = [
  { id: "xs", label: "XS", px: 16 },
  { id: "s", label: "S", px: 20 },
  { id: "m", label: "M", px: 24 },
  { id: "l", label: "L", px: 28 },
  { id: "xl", label: "XL", px: 32 },
  { id: "xxl", label: "XXL", px: 36 },
] as const;

export const DEFAULT_FONT_SIZE = 22;
export const MIN_FONT_SIZE = 14;
export const MAX_FONT_SIZE = 40;

export function getMemeFont(id: string | undefined): MemeFont {
  return MEME_FONTS.find((f) => f.id === id) ?? MEME_FONTS[0];
}

export function nearestSizePreset(px: number): (typeof FONT_SIZE_PRESETS)[number]["id"] {
  let bestId: (typeof FONT_SIZE_PRESETS)[number]["id"] = FONT_SIZE_PRESETS[0].id;
  let bestDist = Math.abs(px - FONT_SIZE_PRESETS[0].px);
  for (const p of FONT_SIZE_PRESETS) {
    const d = Math.abs(px - p.px);
    if (d < bestDist) {
      bestId = p.id;
      bestDist = d;
    }
  }
  return bestId;
}

/** Ensure Google meme fonts are available for canvas measure/draw. */
export async function ensureMemeFontsLoaded(): Promise<void> {
  if (typeof document === "undefined") return;

  const google = MEME_FONTS.filter((f) => f.google).map((f) => f.google!);
  if (google.length) {
    const id = "meme-fonts-link";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?${google
        .map((g) => `family=${g.replace(/ /g, "+")}`)
        .join("&")}&display=swap`;
      document.head.appendChild(link);
    }
  }

  if (document.fonts?.load) {
    await Promise.all(
      MEME_FONTS.flatMap((f) => [
        document.fonts
          .load(`${f.weight} 32px ${f.stack}`)
          .catch(() => undefined),
        document.fonts
          .load(`${f.regularWeight} 32px ${f.stack}`)
          .catch(() => undefined),
      ])
    );
  }
}

export function canvasFont(
  size: number,
  fontId: string | undefined,
  bold = true
): string {
  const f = getMemeFont(fontId);
  const weight = bold ? f.weight : f.regularWeight;
  return `${weight} ${size}px ${f.stack}`;
}
