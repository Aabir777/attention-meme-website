export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export function uid(prefix = "el"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Trigger a file download from a public URL or blob URL */
export async function downloadFile(src: string, filename: string) {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch {
    // Fallback: open in new tab
    const link = document.createElement("a");
    link.href = src;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener";
    link.click();
  }
}

/** Download multiple files with a short delay between each */
export async function downloadFiles(
  files: { src: string; filename: string }[],
  delayMs = 350
) {
  for (const file of files) {
    await downloadFile(file.src, file.filename);
    await new Promise((r) => setTimeout(r, delayMs));
  }
}

import { BRAND } from "./assets";

/** Site origin for share links — prefer live origin, then env brand URL */
export function shareSiteOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  if (BRAND.siteUrl) return BRAND.siteUrl;
  return "https://www.attention.space";
}

/**
 * Open X compose with text (user attaches the PNG manually).
 * Chog-style: short brag + @handle + maker link.
 */
export function shareToX(text: string, pageUrl?: string) {
  const params = new URLSearchParams();
  params.set("text", text);
  if (pageUrl) params.set("url", pageUrl);
  const intent = `https://twitter.com/intent/tweet?${params.toString()}`;
  window.open(intent, "_blank", "noopener,noreferrer");
}

/** Meme share — optional caption line + Chog-style credit */
export function defaultShareText(top?: string, bottom?: string) {
  const caption = [top, bottom].filter(Boolean).join(" - ");
  const maker = `${shareSiteOrigin()}/maker`;
  const handle = BRAND.twitterHandle || "@attention_HQ";
  if (caption) {
    return `Check out my Attention meme!\n${caption}\n\nCreated with ${handle}\n${maker}`;
  }
  return `Check out my Attention meme! Created with ${handle}\n${maker}`;
}

/** PFP share — mirrors Chog: “Check out my custom … Created with @…” */
export function pfpShareText() {
  const maker = `${shareSiteOrigin()}/maker?tab=pfp`;
  const handle = BRAND.twitterHandle || "@attention_HQ";
  return `Check out my custom Attention PFP! Created with ${handle}\n${maker}`;
}

/** Share PFP on X (download first so user can attach the PNG) */
export function sharePfpToX() {
  shareToX(pfpShareText());
}
