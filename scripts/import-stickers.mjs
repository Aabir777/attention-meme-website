/**
 * Import official pack from Desktop "FULL STICKERS PACK".
 * Keep real alpha; careful white-matte cutout only when needed.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const srcDir = "C:/Users/asiva/OneDrive/Desktop/FULL STICKERS PACK";
const outDir = path.join(process.cwd(), "public/stickers/official");
const genPath = path.join(process.cwd(), "src/lib/stickers.generated.json");

const NAME_HINTS = {
  bold_eye_symbol_with_reticle_design: "Bold Eye",
  "bold-eye-symbol-with-reticle-design": "Bold Eye",
  angry: "Angry",
  thinking: "Thinking",
  pay_attention_sticker_mascot: "Pay Attention",
  "pay-attention-sticker-mascot": "Pay Attention",
  "what is attention": "What Is Attention",
  "what-is-attention": "What Is Attention",
};

function baseSlug(filename) {
  let s = filename.replace(/\.[^.]+$/, "");
  s = s.replace(/\s*\(\d+\)\s*/g, "");
  s = s.replace(/^Copy of\s+/i, "");
  return s.trim();
}

function toId(slug) {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function prettyName(slug, id) {
  if (NAME_HINTS[slug] || NAME_HINTS[id]) return NAME_HINTS[slug] || NAME_HINTS[id];
  return id
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function removeWhiteMatteOnly(data, w, h) {
  const ch = 4;
  const n = w * h;
  const visited = new Uint8Array(n);
  const queue = new Int32Array(n + 8);
  let qh = 0;
  let qt = 0;

  const isWhiteMatte = (i) => {
    const o = i * ch;
    const a = data[o + 3];
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lum = (r + g + b) / 3;
    if (a < 16) return true;
    return lum >= 238 && max - min <= 14;
  };

  const enq = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (visited[i] || !isWhiteMatte(i)) return;
    visited[i] = 1;
    queue[qt++] = i;
  };

  for (let x = 0; x < w; x++) {
    enq(x, 0);
    enq(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    enq(0, y);
    enq(w - 1, y);
  }

  while (qh < qt) {
    const i = queue[qh++];
    const x = i % w;
    const y = (i / w) | 0;
    enq(x + 1, y);
    enq(x - 1, y);
    enq(x, y + 1);
    enq(x, y - 1);
  }

  let rem = 0;
  for (let i = 0; i < n; i++) {
    if (!visited[i]) continue;
    const o = i * ch;
    data[o] = 0;
    data[o + 1] = 0;
    data[o + 2] = 0;
    data[o + 3] = 0;
    rem++;
  }
  return rem;
}

function cropToContent(data, w, h) {
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] < 12) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return { data, w, h };

  const pad = Math.max(6, Math.round(Math.min(w, h) * 0.02));
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const cw = maxX - minX + 1;
  const chh = maxY - minY + 1;
  const cropped = Buffer.alloc(cw * chh * 4);
  for (let y = 0; y < chh; y++) {
    for (let x = 0; x < cw; x++) {
      const si = ((minY + y) * w + (minX + x)) * 4;
      const di = (y * cw + x) * 4;
      cropped[di] = data[si];
      cropped[di + 1] = data[si + 1];
      cropped[di + 2] = data[si + 2];
      cropped[di + 3] = data[si + 3];
    }
  }
  return { data: cropped, w: cw, h: chh };
}

async function processSticker(inputPath, outputPath) {
  let { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let w = info.width;
  let h = info.height;
  const n = w * h;

  let transparent = 0;
  for (let i = 0; i < n; i++) {
    if (data[i * 4 + 3] < 8) transparent++;
  }
  const hasRealAlpha = transparent / n > 0.08;

  let mode = "alpha";
  if (!hasRealAlpha) {
    const rem = removeWhiteMatteOnly(data, w, h);
    mode = `cutout-${((rem / n) * 100).toFixed(0)}%`;
  }

  const cropped = cropToContent(data, w, h);
  data = cropped.data;
  w = cropped.w;
  h = cropped.h;

  const maxSide = 1024;
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const fw = Math.max(1, Math.round(w * scale));
  const fh = Math.max(1, Math.round(h * scale));

  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .resize(fw, fh, {
      fit: "fill",
      kernel: "lanczos3",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, force: true })
    .toFile(outputPath);

  return { w: fw, h: fh, mode };
}

if (!fs.existsSync(srcDir)) {
  console.error("Source folder not found:", srcDir);
  process.exit(1);
}

if (fs.existsSync(outDir)) {
  for (const f of fs.readdirSync(outDir)) {
    fs.unlinkSync(path.join(outDir, f));
  }
} else {
  fs.mkdirSync(outDir, { recursive: true });
}

const files = fs
  .readdirSync(srcDir)
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

const used = new Set();
const entries = [];
let poseN = 1;

for (const file of files) {
  const raw = baseSlug(file);
  let id = toId(raw);

  if (
    /^[0-9a-f]{8}-[0-9a-f-]{20,}$/i.test(id) ||
    id.startsWith("chatgpt-image") ||
    id.startsWith("copy-of-") ||
    id.startsWith("screenshot-")
  ) {
    id = `pose-${String(poseN).padStart(2, "0")}`;
    poseN += 1;
  }

  let finalId = id;
  let n = 2;
  while (used.has(finalId)) {
    finalId = `${id}-${n}`;
    n += 1;
  }
  used.add(finalId);

  const destName = `${finalId}.png`;
  const stats = await processSticker(
    path.join(srcDir, file),
    path.join(outDir, destName)
  );
  const name = prettyName(raw, finalId);

  entries.push({
    id: `off-${finalId}`,
    name,
    file: destName,
    src: `/stickers/official/${destName}`,
    filename: `attention-${finalId}.png`,
    description: `${name} sticker`,
  });

  console.log(`${file}  =>  ${destName}  (${name})  ${stats.w}x${stats.h}  [${stats.mode}]`);
}

entries.sort((a, b) => {
  const named = (e) => (e.id.includes("pose") ? 1 : 0);
  const d = named(a) - named(b);
  if (d !== 0) return d;
  return a.name.localeCompare(b.name, undefined, { numeric: true });
});

fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(entries, null, 2));
fs.writeFileSync(genPath, JSON.stringify(entries, null, 2));
console.log(`\nReplaced pack with ${entries.length} stickers from FULL STICKERS PACK.`);
