/**
 * PFP compositor:
 *   background → main mascot → expression → costume → hat (top)
 */

import {
  DEFAULT_COSTUME_ID,
  MAIN_MASCOT_SRC,
  getCostume,
  getExpression,
  getHat,
} from "./pfpCharacters";
import { fillPfpBackground } from "./pfp";
import { loadImage } from "./traits";

export interface SimplePfpState {
  /** Costume id — classic = main only (no expression from costume) */
  characterId: string | null;
  /** Face plate — null until user picks in Expressions */
  expressionId: string | null;
  /** Hat — null until user picks in Hats */
  hatId: string | null;
  backgroundId: string;
  transparentBg: boolean;
}

export function defaultSimplePfp(): SimplePfpState {
  return {
    characterId: DEFAULT_COSTUME_ID,
    expressionId: null,
    hatId: null,
    backgroundId: "photo-stage-concert",
    transparentBg: false,
  };
}

export interface DrawRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Shared layout so main + costume + expression + hat stack 1:1 */
export function getLayerLayout(size: number, pad = 0.04): DrawRect {
  const box = size * (1 - pad * 2);
  const w = box;
  const h = box;
  const x = (size - w) / 2;
  const y = (size - h) / 2 + size * 0.01;
  return { x, y, w, h };
}

export async function renderSimplePfp(
  state: SimplePfpState,
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

  await fillPfpBackground(ctx, sizePx, {
    backgroundId: state.backgroundId,
    transparentBg: state.transparentBg,
  });

  const layout = getLayerLayout(sizePx);
  const costume = getCostume(state.characterId ?? DEFAULT_COSTUME_ID);

  // 1) Main mascot ALWAYS stays in the preview
  try {
    const main = await loadImage(MAIN_MASCOT_SRC);
    ctx.drawImage(main, layout.x, layout.y, layout.w, layout.h);
  } catch {
    /* ignore */
  }

  // 2) Expression face (blank until user picks one)
  const expression = getExpression(state.expressionId);
  if (expression) {
    try {
      const face = await loadImage(expression.src);
      ctx.drawImage(face, layout.x, layout.y, layout.w, layout.h);
    } catch {
      /* ignore */
    }
  }

  // 3) Costume on TOP of expression
  if (costume && !costume.isBase) {
    try {
      const body = await loadImage(costume.src);
      ctx.drawImage(body, layout.x, layout.y, layout.w, layout.h);
    } catch {
      /* ignore */
    }
  }

  // 4) Hat on TOP of everything (optional)
  const hat = getHat(state.hatId);
  if (hat) {
    try {
      const hatImg = await loadImage(hat.src);
      ctx.drawImage(hatImg, layout.x, layout.y, layout.w, layout.h);
    } catch {
      /* ignore */
    }
  }
}
