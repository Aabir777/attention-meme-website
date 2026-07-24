/** Official Attention sticker pack for the download page. */

import generated from "./stickers.generated.json";

export interface DownloadableSticker {
  id: string;
  name: string;
  description: string;
  src: string;
  filename: string;
  category: "pack";
  tags: string[];
}

/** Full official pack (from "sticker with bg removed"). */
export const STICKER_PACK: DownloadableSticker[] = generated.map((s) => ({
  id: s.id,
  name: s.name,
  description: s.description || `${s.name} sticker`,
  src: s.src,
  filename: s.filename,
  category: "pack" as const,
  tags: ["official", s.id.includes("pose") ? "pose" : "emoji"],
}));

export const STICKER_CATEGORIES = [
  { id: "all" as const, label: "All" },
  { id: "pack" as const, label: "Official" },
];

export function stickersByCategory(
  category: "all" | "pack" | "mascot" | "logo" | "brand"
): DownloadableSticker[] {
  if (category === "all" || category === "pack") return STICKER_PACK;
  return [];
}
