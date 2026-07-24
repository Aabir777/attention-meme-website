/** Attention memecoin mascot & brand assets (public/mascot). */

export interface MascotPose {
  id: string;
  name: string;
  /** Path under /public */
  src: string;
  /** Transparent cutout for PFP (no white studio matte) */
  pfpSrc?: string;
  /** Use in PFP picker */
  pfp: boolean;
  /** Use as meme sticker */
  sticker: boolean;
  description?: string;
}

export const MASCOTS: MascotPose[] = [
  {
    id: "main",
    name: "Classic",
    src: "/mascot/main.png",
    /** BG-removed transparent mascot for clean PFP compositing */
    pfpSrc: "/mascot/main-pfp.png",
    pfp: true,
    sticker: true,
    description: "Signature Attention mascot",
  },
  {
    id: "sketch",
    name: "Sketch",
    src: "/mascot/sketch.png",
    pfpSrc: "/mascot/sketch-cutout.png",
    pfp: true,
    sticker: true,
    description: "Pencil concept art",
  },
];

export const BRAND = {
  name: "ATTENTION",
  ticker: "$attention",
  tagline: "THE FIRST ASSET",
  slogan: "Everything valuable begins with attention.",
  twitter: "https://x.com/attention_HQ",
  twitterHandle: "@attention_HQ",
  logoMark: "/mascot/logo-mark.png",
  /** Full rectangular brand banner */
  logoBanner: "/mascot/logo-banner.png",
  /** Optimized crop for header nav (readable + premium) */
  logoHeader: "/mascot/logo-header.png",
  /** Transparent-bg version that blends into the dark header */
  logoHeaderNav: "/mascot/logo-header-nav.png",
  wordmark: "/mascot/wordmark.png",
  hero: "/mascot/hero-glow.png",
  heroWide: "/mascot/hero-wide.png",
  heroBanner: "/mascot/hero-banner.png",
  manifesto: "/mascot/manifesto.png",
  primaryMascot: "/mascot/main.png",
  /**
   * Contract address — paste your live CA here, or set
   * NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local
   * Leave empty to show “Coming soon”.
   */
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim() || "",
  /** Optional explorer URL — `{address}` is replaced with the CA */
  explorerUrl: "https://solscan.io/token/{address}",
};

/** PFP background: solid colors, procedural scenes, or photo scenarios */
export type PfpBgGroup = "color" | "scene" | "photo";

export interface PfpBackground {
  id: string;
  name: string;
  group: PfpBgGroup;
  /** CSS fill for UI swatch / solid paint fallback */
  fill: string;
  /** Optional second color for gradients in the swatch */
  fill2?: string;
  /** Full-bleed photo path under /public (photo group) */
  image?: string;
}

export const PFP_BACKGROUNDS: PfpBackground[] = [
  // —— Colors (black & white only) ——
  { id: "void", name: "Black", group: "color", fill: "#0a0a0a" },
  { id: "white", name: "White", group: "color", fill: "#f5f5f5" },

  // —— Photo scenarios: stages + beach (mascot standing on floor/sand) ——
  {
    id: "photo-stage-concert",
    name: "Concert",
    group: "photo",
    fill: "#1a1025",
    fill2: "#f5d547",
    image: "/pfp-bg/stage-concert.jpg",
  },
  {
    id: "photo-stage-theater",
    name: "Theater",
    group: "photo",
    fill: "#7f1d1d",
    fill2: "#0a0a0a",
    image: "/pfp-bg/stage-theater.jpg",
  },
  {
    id: "photo-stage-studio",
    name: "Studio Stage",
    group: "photo",
    fill: "#0a0a0a",
    fill2: "#f5d547",
    image: "/pfp-bg/stage-studio.jpg",
  },
  {
    id: "photo-stage-festival",
    name: "Festival",
    group: "photo",
    fill: "#38bdf8",
    fill2: "#78350f",
    image: "/pfp-bg/stage-festival.jpg",
  },
  {
    id: "photo-stage-carpet",
    name: "Red Carpet",
    group: "photo",
    fill: "#7f1d1d",
    fill2: "#f5d547",
    image: "/pfp-bg/stage-carpet.jpg",
  },
  {
    id: "photo-beach-day",
    name: "Beach",
    group: "photo",
    fill: "#0ea5e9",
    fill2: "#fde68a",
    image: "/pfp-bg/beach-day.jpg",
  },
  {
    id: "photo-beach-sunset",
    name: "Beach Sunset",
    group: "photo",
    fill: "#fb923c",
    fill2: "#7c2d12",
    image: "/pfp-bg/beach-sunset.jpg",
  },

  // —— Procedural scenes ——
  {
    id: "spotlight",
    name: "Spotlight",
    group: "scene",
    fill: "#3a3a3a",
    fill2: "#0a0a0a",
  },
  {
    id: "amber",
    name: "Amber Glow",
    group: "scene",
    fill: "#f5d547",
    fill2: "#0a0a0a",
  },
  {
    id: "gold",
    name: "Gold Rush",
    group: "scene",
    fill: "#f5d547",
    fill2: "#b8860b",
  },
  {
    id: "target",
    name: "Target",
    group: "scene",
    fill: "#0f0f14",
    fill2: "#f5d547",
  },
  {
    id: "stage",
    name: "Stage",
    group: "scene",
    fill: "#1a1025",
    fill2: "#f5d547",
  },
  {
    id: "space",
    name: "Deep Space",
    group: "scene",
    fill: "#020617",
    fill2: "#4c1d95",
  },
  {
    id: "sunset",
    name: "Sunset",
    group: "scene",
    fill: "#fb923c",
    fill2: "#7c2d12",
  },
  {
    id: "neon",
    name: "Neon Grid",
    group: "scene",
    fill: "#0f0320",
    fill2: "#d946ef",
  },
  {
    id: "arena",
    name: "Arena",
    group: "scene",
    fill: "#292524",
    fill2: "#f5d547",
  },
  {
    id: "matrix",
    name: "Matrix",
    group: "scene",
    fill: "#022c22",
    fill2: "#4ade80",
  },
  {
    id: "paper",
    name: "Sketch Pad",
    group: "scene",
    fill: "#f5f0e6",
    fill2: "#d6d3d1",
  },
  {
    id: "checker",
    name: "Checker",
    group: "scene",
    fill: "#f5d547",
    fill2: "#0a0a0a",
  },
  {
    id: "radial-gold",
    name: "Gold Burst",
    group: "scene",
    fill: "#f5d547",
    fill2: "#0a0a0a",
  },
  {
    id: "horizon",
    name: "Horizon",
    group: "scene",
    fill: "#38bdf8",
    fill2: "#f5d547",
  },
];

export function pfpBackgroundsByGroup(group: PfpBgGroup): PfpBackground[] {
  return PFP_BACKGROUNDS.filter((b) => b.group === group);
}

export function getPfpBackground(id: string): PfpBackground | undefined {
  return PFP_BACKGROUNDS.find((b) => b.id === id);
}

export function getMascot(id: string): MascotPose | undefined {
  return MASCOTS.find((m) => m.id === id);
}

export function pfpMascots(): MascotPose[] {
  return MASCOTS.filter((m) => m.pfp);
}

export function stickerMascots(): MascotPose[] {
  return MASCOTS.filter((m) => m.sticker);
}
