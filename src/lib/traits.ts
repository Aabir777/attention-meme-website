/** Shared image helpers for canvas rendering. */

const imageCache = new Map<string, HTMLImageElement>();
const imagePending = new Map<string, Promise<HTMLImageElement>>();

/** Bump when sticker assets are re-exported so browser + memory cache refresh. */
export const STICKER_ASSET_VERSION = "full-pack-v2";

/** Append cache-bust query for local /stickers paths. */
export function assetUrl(src: string): string {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return src;
  if (src.includes("/stickers/")) {
    const sep = src.includes("?") ? "&" : "?";
    return `${src}${sep}v=${STICKER_ASSET_VERSION}`;
  }
  return src;
}

/** Drop cached images (e.g. after asset reimport). */
export function clearImageCache(): void {
  imageCache.clear();
  imagePending.clear();
}

/** Load an image with in-memory cache (critical for smooth meme dragging). */
export function loadImage(src: string): Promise<HTMLImageElement> {
  const url = assetUrl(src);
  const cached = imageCache.get(url);
  if (cached?.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached);
  }
  const pending = imagePending.get(url);
  if (pending) return pending;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      imageCache.set(url, img);
      imagePending.delete(url);
      resolve(img);
    };
    img.onerror = (err) => {
      imagePending.delete(url);
      reject(err);
    };
    img.src = url;
  });
  imagePending.set(url, promise);
  return promise;
}

/** Preload a list of image URLs into the cache. */
export function preloadImages(srcs: string[]): Promise<void> {
  return Promise.all(srcs.map((s) => loadImage(s).catch(() => undefined))).then(
    () => undefined
  );
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
