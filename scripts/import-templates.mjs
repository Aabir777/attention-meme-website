import fs from "fs";
import path from "path";
import sharp from "sharp";

const srcDir = "C:/Users/asiva/OneDrive/Desktop/templates";
const outDir = path.join(process.cwd(), "public/templates");

const NAMES = {
  a1: { name: "This Is Fine", description: "Everything is fine energy", top: "THIS IS FINE", bottom: "PAY ATTENTION" },
  a2: { name: "Scene A2", description: "Attention scene pack", top: "WHEN YOU", bottom: "PAY ATTENTION" },
  a3: { name: "Scene A3", description: "Attention scene pack", top: "POV", bottom: "$attention" },
  a4: { name: "Scene A4", description: "Attention scene pack", top: "NOBODY", bottom: "ME WITH $attention" },
  a5: { name: "Yellow Suit", description: "Spy vibes behind the tree", top: "SILENTLY WATCHING", bottom: "YOUR BAG" },
  a6: { name: "Scene A6", description: "Attention scene pack", top: "DONT BLINK", bottom: "OR YOULL MISS IT" },
  a7: { name: "Scene A7", description: "Attention scene pack", top: "MOST PEOPLE LOOK", bottom: "FEW NOTICE" },
  a8: { name: "Scene A8", description: "Attention scene pack", top: "THE FIRST ASSET", bottom: "$attention" },
  a9: { name: "Scene A9", description: "Attention scene pack", top: "CHART LOOKING AT YOU", bottom: "PAY ATTENTION" },
  atn02: { name: "Speech Stage", description: "Suit and mic moment", top: "LADIES AND GENTS", bottom: "PAY ATTENTION" },
};

if (!fs.existsSync(srcDir)) {
  console.error("Missing", srcDir);
  process.exit(1);
}

if (fs.existsSync(outDir)) {
  for (const f of fs.readdirSync(outDir)) fs.unlinkSync(path.join(outDir, f));
} else {
  fs.mkdirSync(outDir, { recursive: true });
}

const files = fs
  .readdirSync(srcDir)
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }));

const entries = [];

for (const file of files) {
  let base = file.replace(/\.(jpe?g|png|webp)$/i, "");
  base = base.replace(/\.jpg$/i, "");
  const id = base.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const destName = `${id}.jpg`;
  const dest = path.join(outDir, destName);

  await sharp(path.join(srcDir, file))
    .rotate()
    .resize({ width: 1024, height: 1024, fit: "cover", position: "centre" })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(dest);

  const hint = NAMES[id] || {
    name: id.toUpperCase(),
    description: "Attention scene pack",
    top: "TOP TEXT",
    bottom: "BOTTOM TEXT",
  };

  entries.push({
    id: `tpl-${id}`,
    name: hint.name,
    description: hint.description,
    file: destName,
    src: `/templates/${destName}`,
    topText: hint.top,
    bottomText: hint.bottom,
  });
  console.log(`${file} => ${destName} (${hint.name})`);
}

fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(entries, null, 2));
console.log(`\nImported ${entries.length} templates.`);
