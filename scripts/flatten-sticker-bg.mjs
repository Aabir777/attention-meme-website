import fs from "fs";
import path from "path";
import sharp from "sharp";

/**
 * Import stickerssss → public/stickers/official with solid pure white
 * backgrounds (checkerboard / mottled matte cleaned to #FFFFFF).
 */
const srcDir = "C:/Users/asiva/OneDrive/Desktop/stickerssss";
const outDir = path.join(process.cwd(), "public/stickers/official");

const NAME_HINTS = {
  angry: "Angry",
  "details matter": "Details Matter",
  "details-matter": "Details Matter",
  good_attention_sticker: "Good Attention",
  "good-attention-sticker": "Good Attention",
  pay_attention_sticker_mascot: "Pay Attention",
  "pay-attention-sticker-mascot": "Pay Attention",
  thinking: "Thinking",
};

function baseSlug(filename) {
  let s = filename.replace(/\.[^.]+$/, "");
  s = s.replace(/\s*\(\d+\)\s*/g, "");
  return s.trim();
}

function toId(slug) {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function prettyName(slug, id) {
  if (NAME_HINTS[slug] || NAME_HINTS[id]) return NAME_HINTS[slug] || NAME_HINTS[id];
  return id
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Edge flood-fill: checkerboard / near-white → pure solid white. */
async function flattenToWhite(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const ch = 4;
  const n = w * h;
  const visited = new Uint8Array(n);
  const queue = new Int32Array(n + 8);
  let qh = 0;
  let qt = 0;

  const isBg = (i) => {
    const o = i * ch;
    const a = data[o + 3];
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lum = (r + g + b) / 3;
    if (a < 24) return true;
    if (a < 250 && lum >= 200 && max - min <= 30) return true;
    return lum >= 228 && max - min <= 18;
  };

  const tryEnqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (visited[i] || !isBg(i)) return;
    visited[i] = 1;
    queue[qt++] = i;
  };

  for (let x = 0; x < w; x++) {
    tryEnqueue(x, 0);
    tryEnqueue(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryEnqueue(0, y);
    tryEnqueue(w - 1, y);
  }

  while (qh < qt) {
    const i = queue[qh++];
    const x = i % w;
    const y = (i / w) | 0;
    tryEnqueue(x + 1, y);
    tryEnqueue(x - 1, y);
    tryEnqueue(x, y + 1);
    tryEnqueue(x, y - 1);
  }

  let painted = 0;
  for (let i = 0; i < n; i++) {
    if (!visited[i]) continue;
    const o = i * ch;
    data[o] = 255;
    data[o + 1] = 255;
    data[o + 2] = 255;
    data[o + 3] = 255;
    painted++;
  }

  for (let i = 0; i < n; i++) {
    const o = i * ch;
    if (data[o + 3] === 0) {
      data[o] = 255;
      data[o + 1] = 255;
      data[o + 2] = 255;
      data[o + 3] = 255;
      painted++;
    }
  }

  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  return { w, h, painted, pct: ((painted / n) * 100).toFixed(1) };
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
    id.startsWith("screenshot-") ||
    id === "screenshot"
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

  const tmp = path.join(outDir, `_tmp_${finalId}.png`);
  await sharp(path.join(srcDir, file))
    .ensureAlpha()
    .resize({
      width: 1024,
      height: 1024,
      fit: "inside",
      withoutEnlargement: true,
    })
    .png()
    .toFile(tmp);

  const destName = `${finalId}.png`;
  const dest = path.join(outDir, destName);
  const stats = await flattenToWhite(tmp, dest);
  fs.unlinkSync(tmp);

  const name = prettyName(raw, finalId);
  entries.push({
    id: `off-${finalId}`,
    name,
    file: destName,
    src: `/stickers/official/${destName}`,
    filename: `attention-${finalId}.png`,
  });
  console.log(`${file}  =>  ${destName}  (${name})  bg cleaned ${stats.pct}%`);
}

fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(entries, null, 2)
);
console.log(`\nFlattened ${entries.length} stickers to solid white backgrounds.`);
