import fs from "fs";

const files = [
  "src/app/page.tsx",
  "src/app/about/page.tsx",
  "src/components/ContractBar.tsx",
  "src/components/MakerApp.tsx",
  "src/components/StickersGallery.tsx",
  "src/components/MemeMaker.tsx",
  "src/components/PfpMaker.tsx",
  "src/components/AboutMascot3D.tsx",
  "src/components/tom/MascotStage.tsx",
  "src/lib/stickerPack.ts",
  "src/lib/export.ts",
];

const replacements = [
  [/512×512 — PNG/g, "512×512 PNG"],
  [/Emotion pack — /g, "Emotion pack: "],
  [/Mascot scale — /g, "Mascot scale: "],
  [/Font size — /g, "Font size: "],
  [/Scale — /g, "Scale: "],
  [/Rotate — /g, "Rotate: "],
  [/Zoom — /g, "Zoom: "],
  [/Free pack — \$attention/g, "Free pack, $attention"],
  [/\$attention — Creator tools/g, "$attention creator tools"],
  [/\{BRAND\.ticker\} — Official CA/g, "{BRAND.ticker} official CA"],
  [/On the moon — Drag to orbit/g, "On the moon. Drag to orbit."],
  [
    /Drag to rotate — Click mascot — Scroll zoom/g,
    "Drag to rotate. Click mascot. Scroll zoom.",
  ],
  [
    /Clear upload — restore template BG/g,
    "Clear upload. Restore template background.",
  ],
  [
    /1\. Pick a template — 2\. Write top \& bottom captions — 3\. Download PNG — /g,
    "1. Pick a template. 2. Write top and bottom captions. 3. Download PNG. ",
  ],
  [/\{BRAND\.tagline\} — \{BRAND\.ticker\}/g, "{BRAND.tagline}, {BRAND.ticker}"],
  [/\{BRAND\.ticker\} — \{BRAND\.tagline\}/g, "{BRAND.ticker}, {BRAND.tagline}"],
  [/\{BRAND\.ticker\} — the first asset/g, "{BRAND.ticker}, the first asset"],
  [/\{BRAND\.ticker\} — The first asset/g, "{BRAND.ticker}, the first asset"],
  [/ATTENTION — THE FIRST ASSET banner/g, "ATTENTION, THE FIRST ASSET banner"],
  [/\$attention — The First Asset/g, "$attention, The First Asset"],
  // leftover middots
  [/ · /g, ", "],
  [/·/g, ", "],
];

for (const p of files) {
  let s = fs.readFileSync(p, "utf8");
  const before = s;
  for (const [re, to] of replacements) s = s.replace(re, to);
  if (s !== before) {
    fs.writeFileSync(p, s);
    console.log("updated", p);
  } else {
    console.log("unchanged", p);
  }
}
