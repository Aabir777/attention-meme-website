/**
 * Attention PFP accessories — SVG overlays (512×512).
 *
 * Tuned for the main cyclops mascot (egg body, one big eye, gold reticle, smile):
 *   center X 256
 *   tuft top ~70–100 | head crown ~120
 *   single eye center ~228 | reticle ~r 78–92
 *   smile arc ~295–310
 *   arms ~150 / 362 mid | feet ~430–460
 *   body oval sides ~165 / 347
 */

export type PfpCategoryId =
  | "headwear"
  | "costume"
  | "eyes"
  | "mouth"
  | "face"
  | "accessories";

export interface PfpAccessory {
  id: string;
  name: string;
  category: PfpCategoryId;
  svg: string;
}

export interface PfpCategory {
  id: PfpCategoryId;
  label: string;
  zIndex: number;
}

export const PFP_CATEGORIES: PfpCategory[] = [
  { id: "costume", label: "Costume", zIndex: 20 },
  { id: "face", label: "Face", zIndex: 30 },
  { id: "eyes", label: "Eyes", zIndex: 40 },
  { id: "mouth", label: "Mouth", zIndex: 50 },
  { id: "headwear", label: "Headwear", zIndex: 60 },
  { id: "accessories", label: "Accessories", zIndex: 70 },
];

const G = "#f5d547";
const GD = "#c9a227";
const K = "#0a0a0a";
const W = "#f8fafc";
const R = "#ef4444";
const P = "#f472b6";
const S = "#cbd5e1";
const CY = "#22d3ee";
const PU = "#a78bfa";
const GR = "#22c55e";
const OR = "#f97316";

function svgUrl(inner: string): string {
  const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${inner}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(full)}`;
}

export const PFP_ACCESSORIES: PfpAccessory[] = [
  // ═══════════════════════════════════════════
  // HEADWEAR — sits on the black tuft / crown
  // ═══════════════════════════════════════════
  {
    id: "hw-cap",
    name: "Cap",
    category: "headwear",
    svg: `
      <ellipse cx="256" cy="112" rx="88" ry="22" fill="${K}"/>
      <path d="M175 116 Q256 62 337 116 L332 138 Q256 102 180 138 Z" fill="${G}"/>
      <ellipse cx="256" cy="120" rx="70" ry="14" fill="${GD}"/>
      <path d="M330 114 Q398 130 404 152 Q354 144 330 132 Z" fill="${K}"/>
      <text x="256" y="118" text-anchor="middle" font-size="18" font-weight="800" fill="${K}" font-family="Arial,sans-serif">A</text>
    `,
  },
  {
    id: "hw-beanie",
    name: "Beanie",
    category: "headwear",
    svg: `
      <path d="M168 145 Q162 78 256 68 Q350 78 344 145 Q300 128 256 124 Q212 128 168 145 Z" fill="#1e3a5f"/>
      <path d="M175 140 Q182 95 256 88 Q330 95 337 140" fill="none" stroke="${G}" stroke-width="3" opacity="0.55"/>
      <circle cx="256" cy="72" r="12" fill="${G}"/>
      <circle cx="256" cy="72" r="5" fill="${GD}"/>
    `,
  },
  {
    id: "hw-helmet",
    name: "Space Helm",
    category: "headwear",
    svg: `
      <path d="M160 188 Q155 88 256 78 Q357 88 352 188 L338 205 Q256 155 174 205 Z" fill="${S}" stroke="${K}" stroke-width="3"/>
      <ellipse cx="256" cy="145" rx="72" ry="38" fill="#0ea5e9" opacity="0.35"/>
      <path d="M248 78 L264 78 L272 48 L240 48 Z" fill="${G}"/>
      <circle cx="256" cy="48" r="6" fill="${R}"/>
    `,
  },
  {
    id: "hw-hood",
    name: "Hood",
    category: "headwear",
    svg: `
      <path d="M150 210 Q142 90 256 80 Q370 90 362 210 Q316 158 256 152 Q196 158 150 210 Z" fill="${K}" opacity="0.95"/>
      <path d="M165 205 Q172 115 256 102 Q340 115 347 205" fill="none" stroke="${G}" stroke-width="2.5" opacity="0.4"/>
      <path d="M185 218 Q256 175 327 218" fill="none" stroke="${GD}" stroke-width="2" opacity="0.35"/>
    `,
  },
  {
    id: "hw-crown",
    name: "Gold Crown",
    category: "headwear",
    svg: `
      <path d="M168 130 L188 72 L218 118 L256 58 L294 118 L324 72 L344 130 Z" fill="${G}" stroke="${GD}" stroke-width="3"/>
      <rect x="168" y="128" width="176" height="18" rx="4" fill="${GD}"/>
      <circle cx="188" cy="90" r="6" fill="${R}"/>
      <circle cx="256" cy="72" r="7" fill="${CY}"/>
      <circle cx="324" cy="90" r="6" fill="${PU}"/>
    `,
  },
  {
    id: "hw-pirate",
    name: "Pirate Hat",
    category: "headwear",
    svg: `
      <path d="M152 155 Q168 92 256 84 Q344 92 360 155 Q312 132 256 126 Q200 132 152 155 Z" fill="${K}"/>
      <path d="M172 148 Q256 188 340 148 Q298 124 256 120 Q214 124 172 148 Z" fill="${K}"/>
      <path d="M228 112 L256 136 L284 112" fill="none" stroke="${G}" stroke-width="5"/>
      <circle cx="256" cy="128" r="7" fill="${G}"/>
    `,
  },
  {
    id: "hw-halo",
    name: "Halo",
    category: "headwear",
    svg: `
      <ellipse cx="256" cy="70" rx="70" ry="15" fill="none" stroke="${G}" stroke-width="10"/>
      <ellipse cx="256" cy="70" rx="70" ry="15" fill="none" stroke="${W}" stroke-width="2.5" opacity="0.5"/>
    `,
  },
  {
    id: "hw-tophat",
    name: "Top Hat",
    category: "headwear",
    svg: `
      <ellipse cx="256" cy="128" rx="95" ry="18" fill="${K}"/>
      <rect x="205" y="48" width="102" height="82" rx="6" fill="${K}"/>
      <rect x="205" y="100" width="102" height="14" fill="${G}"/>
    `,
  },
  {
    id: "hw-party",
    name: "Party Hat",
    category: "headwear",
    svg: `
      <path d="M210 135 L256 45 L302 135 Z" fill="${G}"/>
      <path d="M220 120 L256 55 L292 120 Z" fill="${R}" opacity="0.35"/>
      <circle cx="256" cy="48" r="10" fill="${P}"/>
      <circle cx="230" cy="100" r="4" fill="${W}"/>
      <circle cx="275" cy="95" r="4" fill="${CY}"/>
      <circle cx="256" cy="85" r="4" fill="${W}"/>
    `,
  },
  {
    id: "hw-propeller",
    name: "Propeller",
    category: "headwear",
    svg: `
      <ellipse cx="256" cy="118" rx="78" ry="18" fill="#1e40af"/>
      <path d="M185 120 Q256 78 327 120 L320 138 Q256 108 192 138 Z" fill="#2563eb"/>
      <circle cx="256" cy="72" r="10" fill="${K}"/>
      <ellipse cx="210" cy="72" rx="42" ry="10" fill="${G}" opacity="0.9"/>
      <ellipse cx="302" cy="72" rx="42" ry="10" fill="${G}" opacity="0.9"/>
    `,
  },
  {
    id: "hw-wizard",
    name: "Wizard Hat",
    category: "headwear",
    svg: `
      <ellipse cx="256" cy="138" rx="92" ry="16" fill="#312e81"/>
      <path d="M200 135 Q210 40 256 28 Q275 70 312 135 Z" fill="#4338ca"/>
      <path d="M220 100 L245 88 L255 110 L268 85 L290 100" fill="none" stroke="${G}" stroke-width="2.5"/>
      <circle cx="256" cy="70" r="6" fill="${G}"/>
    `,
  },
  {
    id: "hw-horns",
    name: "Devil Horns",
    category: "headwear",
    svg: `
      <path d="M175 130 Q155 55 195 95 Q200 125 190 140 Z" fill="${R}"/>
      <path d="M337 130 Q357 55 317 95 Q312 125 322 140 Z" fill="${R}"/>
      <path d="M180 100 Q175 75 190 95" fill="#fca5a5" opacity="0.5"/>
      <path d="M332 100 Q337 75 322 95" fill="#fca5a5" opacity="0.5"/>
    `,
  },

  // ═══════════════════════════════════════════
  // COSTUME — wraps the egg body (not human torso)
  // ═══════════════════════════════════════════
  {
    id: "cos-astronaut",
    name: "Astro Suit",
    category: "costume",
    svg: `
      <!-- suit ring around body -->
      <ellipse cx="256" cy="270" rx="128" ry="145" fill="none" stroke="${S}" stroke-width="14" opacity="0.9"/>
      <ellipse cx="256" cy="270" rx="112" ry="128" fill="none" stroke="${W}" stroke-width="2.5" opacity="0.28"/>
      <!-- chest panel -->
      <rect x="210" y="340" width="92" height="70" rx="12" fill="${S}" opacity="0.85"/>
      <circle cx="228" cy="368" r="7" fill="${G}"/>
      <circle cx="256" cy="368" r="7" fill="${GR}"/>
      <circle cx="284" cy="368" r="7" fill="${R}"/>
      <!-- shoulder pads over arms -->
      <ellipse cx="155" cy="300" rx="28" ry="36" fill="${S}" opacity="0.75"/>
      <ellipse cx="357" cy="300" rx="28" ry="36" fill="${S}" opacity="0.75"/>
    `,
  },
  {
    id: "cos-ninja",
    name: "Ninja Wrap",
    category: "costume",
    svg: `
      <!-- head wrap band under tuft, open for eye -->
      <path d="M162 175 Q170 130 256 122 Q342 130 350 175 L340 250 Q256 220 172 250 Z" fill="${K}"/>
      <rect x="170" y="200" width="172" height="28" fill="${K}"/>
      <!-- leave center open for the big eye -->
      <ellipse cx="256" cy="228" rx="58" ry="48" fill="${K}" opacity="0"/>
      <path d="M170 214 H215 M297 214 H342" stroke="${W}" stroke-width="3" opacity="0.15"/>
      <!-- sash -->
      <path d="M350 220 Q400 245 390 295 Q355 255 338 250" fill="${K}"/>
      <path d="M175 355 Q256 390 337 355" fill="none" stroke="${G}" stroke-width="8" opacity="0.7"/>
    `,
  },
  {
    id: "cos-samurai",
    name: "Samurai",
    category: "costume",
    svg: `
      <path d="M158 175 Q168 100 256 90 Q344 100 354 175 L335 195 Q256 150 177 195 Z" fill="${K}"/>
      <path d="M175 170 L195 115 L228 155 L256 100 L284 155 L317 115 L337 170" fill="${G}" opacity="0.92"/>
      <!-- armor plates on lower body -->
      <path d="M175 345 Q168 420 178 460 L334 460 Q344 420 337 345 Q300 372 256 365 Q212 372 175 345 Z" fill="#7f1d1d" opacity="0.9"/>
      <path d="M185 375 H327 M185 405 H327 M185 435 H327" stroke="${G}" stroke-width="2.5" opacity="0.7"/>
    `,
  },
  {
    id: "cos-pirate",
    name: "Pirate Coat",
    category: "costume",
    svg: `
      <path d="M165 330 Q155 410 168 465 L344 465 Q357 410 347 330 Q300 365 256 358 Q212 365 165 330 Z" fill="#1c1917"/>
      <path d="M190 340 Q256 380 322 340" fill="none" stroke="${G}" stroke-width="3" opacity="0.5"/>
      <path d="M200 400 L220 360 L240 400 Z" fill="${G}" opacity="0.35"/>
      <path d="M272 400 L292 360 L312 400 Z" fill="${G}" opacity="0.35"/>
      <!-- bandana -->
      <path d="M168 155 Q180 105 256 98 Q332 105 344 155 Q300 135 256 130 Q212 135 168 155 Z" fill="${R}"/>
      <path d="M344 145 Q385 160 378 200 Q350 165 340 160" fill="${R}"/>
    `,
  },
  {
    id: "cos-doctor",
    name: "Doctor",
    category: "costume",
    svg: `
      <path d="M165 325 Q155 405 168 460 L344 460 Q357 405 347 325 Q300 358 256 350 Q212 358 165 325 Z" fill="${W}"/>
      <path d="M210 340 V430 M302 340 V430" stroke="${S}" stroke-width="2" opacity="0.5"/>
      <!-- head mirror -->
      <circle cx="256" cy="100" r="24" fill="${W}" stroke="${S}" stroke-width="3"/>
      <path d="M256 88 V112 M242 100 H270" stroke="${R}" stroke-width="5" stroke-linecap="round"/>
    `,
  },
  {
    id: "cos-chef",
    name: "Chef",
    category: "costume",
    svg: `
      <ellipse cx="256" cy="108" rx="66" ry="40" fill="${W}"/>
      <ellipse cx="222" cy="94" rx="26" ry="24" fill="${W}"/>
      <ellipse cx="290" cy="94" rx="26" ry="24" fill="${W}"/>
      <ellipse cx="256" cy="82" rx="30" ry="26" fill="${W}"/>
      <rect x="214" y="132" width="84" height="16" rx="4" fill="${W}"/>
      <path d="M170 335 Q162 410 172 455 L340 455 Q350 410 342 335 Q300 360 256 354 Q212 360 170 335 Z" fill="${W}"/>
      <path d="M230 370 H282 M256 360 V400" stroke="${K}" stroke-width="4" stroke-linecap="round" opacity="0.25"/>
    `,
  },
  {
    id: "cos-detective",
    name: "Detective",
    category: "costume",
    svg: `
      <ellipse cx="256" cy="128" rx="95" ry="18" fill="${K}"/>
      <path d="M185 128 Q200 82 256 76 Q312 82 327 128 Z" fill="#292524"/>
      <path d="M165 325 Q155 405 168 460 L344 460 Q357 405 347 325 Q300 358 256 350 Q212 358 165 325 Z" fill="#44403c"/>
      <circle cx="256" cy="390" r="16" fill="none" stroke="${G}" stroke-width="3.5"/>
      <path d="M256 406 V430" stroke="${G}" stroke-width="3"/>
    `,
  },
  {
    id: "cos-superhero",
    name: "Hero Suit",
    category: "costume",
    svg: `
      <!-- chest emblem on egg body -->
      <path d="M200 300 Q256 275 312 300 Q300 370 256 385 Q212 370 200 300 Z" fill="${G}" opacity="0.92"/>
      <path d="M218 315 Q256 298 294 315 Q285 358 256 368 Q227 358 218 315 Z" fill="${K}"/>
      <text x="256" y="348" text-anchor="middle" font-size="28" font-weight="900" fill="${G}" font-family="Arial,sans-serif">A</text>
      <!-- belt -->
      <rect x="185" y="390" width="142" height="18" rx="4" fill="${K}"/>
      <rect x="240" y="388" width="32" height="22" rx="3" fill="${G}"/>
    `,
  },
  {
    id: "cos-tuxedo",
    name: "Tuxedo",
    category: "costume",
    svg: `
      <path d="M168 320 Q158 410 170 465 L342 465 Q354 410 344 320 Q300 360 256 352 Q212 360 168 320 Z" fill="${K}"/>
      <path d="M230 325 L256 400 L282 325 Z" fill="${W}"/>
      <path d="M240 330 L256 380 L272 330" fill="${K}"/>
      <rect x="248" y="355" width="16" height="10" rx="2" fill="${G}"/>
      <!-- bowtie -->
      <path d="M220 305 L256 318 L292 305 L256 330 Z" fill="${G}"/>
      <circle cx="256" cy="318" r="6" fill="${GD}"/>
    `,
  },
  {
    id: "cos-hoodie",
    name: "Gold Hoodie",
    category: "costume",
    svg: `
      <path d="M165 300 Q155 400 170 465 L342 465 Q357 400 347 300 Q300 345 256 338 Q212 345 165 300 Z" fill="${G}" opacity="0.88"/>
      <path d="M200 320 Q256 360 312 320" fill="none" stroke="${K}" stroke-width="3" opacity="0.25"/>
      <path d="M230 380 Q256 400 282 380" fill="none" stroke="${K}" stroke-width="2.5" opacity="0.2"/>
      <circle cx="256" cy="400" r="8" fill="${K}" opacity="0.35"/>
    `,
  },
  {
    id: "cos-armor",
    name: "Knight Armor",
    category: "costume",
    svg: `
      <ellipse cx="256" cy="280" rx="120" ry="130" fill="none" stroke="${S}" stroke-width="16" opacity="0.85"/>
      <path d="M200 250 L256 300 L312 250 L300 340 L256 360 L212 340 Z" fill="${S}" opacity="0.55"/>
      <path d="M220 270 L256 310 L292 270" fill="none" stroke="${G}" stroke-width="3"/>
      <ellipse cx="155" cy="295" rx="24" ry="32" fill="${S}" opacity="0.7"/>
      <ellipse cx="357" cy="295" rx="24" ry="32" fill="${S}" opacity="0.7"/>
    `,
  },
  {
    id: "cos-raincoat",
    name: "Raincoat",
    category: "costume",
    svg: `
      <path d="M160 280 Q150 400 165 470 L347 470 Q362 400 352 280 Q300 330 256 320 Q212 330 160 280 Z" fill="#eab308" opacity="0.9"/>
      <path d="M200 300 V440 M312 300 V440" stroke="${K}" stroke-width="2" opacity="0.15"/>
      <circle cx="256" cy="360" r="10" fill="${K}" opacity="0.3"/>
      <path d="M175 175 Q185 115 256 108 Q327 115 337 175 Q300 155 256 150 Q212 155 175 175 Z" fill="#eab308"/>
    `,
  },
  {
    id: "cos-target",
    name: "Target Suit",
    category: "costume",
    svg: `
      <!-- brand body rings echoing the eye reticle -->
      <ellipse cx="256" cy="310" rx="95" ry="105" fill="none" stroke="${G}" stroke-width="8" opacity="0.75"/>
      <ellipse cx="256" cy="310" rx="70" ry="78" fill="none" stroke="${G}" stroke-width="4" opacity="0.45"/>
      <circle cx="256" cy="310" r="14" fill="${G}" opacity="0.7"/>
      <path d="M256 205 V240 M256 380 V415 M161 310 H196 M316 310 H351" stroke="${G}" stroke-width="5" stroke-linecap="round" opacity="0.55"/>
    `,
  },
  {
    id: "cos-scarf",
    name: "Gold Scarf",
    category: "costume",
    svg: `
      <path d="M175 300 Q200 270 256 275 Q312 270 337 300 Q320 340 256 335 Q192 340 175 300 Z" fill="${G}"/>
      <path d="M320 310 Q370 360 355 430 L320 420 Q330 360 300 325" fill="${G}"/>
      <path d="M190 305 Q256 295 322 305" fill="none" stroke="${GD}" stroke-width="3" opacity="0.5"/>
    `,
  },

  // ═══════════════════════════════════════════
  // EYES — single cyclops eye overlays (center ~256,228)
  // ═══════════════════════════════════════════
  {
    id: "ey-shades",
    name: "Cool Shades",
    category: "eyes",
    svg: `
      <!-- one big lens over the single eye -->
      <ellipse cx="256" cy="228" rx="82" ry="58" fill="${K}"/>
      <ellipse cx="256" cy="228" rx="72" ry="48" fill="#111"/>
      <ellipse cx="235" cy="212" rx="24" ry="14" fill="${W}" opacity="0.22"/>
      <path d="M174 228 Q145 218 135 242" fill="none" stroke="${K}" stroke-width="7" stroke-linecap="round"/>
      <path d="M338 228 Q367 218 377 242" fill="none" stroke="${K}" stroke-width="7" stroke-linecap="round"/>
      <path d="M180 228 H332" stroke="${G}" stroke-width="2" opacity="0.4"/>
    `,
  },
  {
    id: "ey-gold-shades",
    name: "Gold Shades",
    category: "eyes",
    svg: `
      <ellipse cx="256" cy="228" rx="82" ry="58" fill="${GD}"/>
      <ellipse cx="256" cy="228" rx="70" ry="46" fill="${G}" opacity="0.85"/>
      <ellipse cx="235" cy="212" rx="22" ry="12" fill="${W}" opacity="0.35"/>
      <path d="M174 228 Q145 218 135 242" fill="none" stroke="${GD}" stroke-width="7"/>
      <path d="M338 228 Q367 218 377 242" fill="none" stroke="${GD}" stroke-width="7"/>
    `,
  },
  {
    id: "ey-laser",
    name: "Laser Eye",
    category: "eyes",
    svg: `
      <circle cx="256" cy="228" r="55" fill="none" stroke="${R}" stroke-width="8"/>
      <circle cx="256" cy="228" r="28" fill="${R}" opacity="0.9"/>
      <circle cx="256" cy="228" r="12" fill="#fecaca"/>
      <path d="M290 255 L420 370" stroke="${R}" stroke-width="12" stroke-linecap="round" opacity="0.9"/>
      <path d="M290 255 L420 370" stroke="#fecaca" stroke-width="4" stroke-linecap="round"/>
    `,
  },
  {
    id: "ey-heart",
    name: "Heart Eye",
    category: "eyes",
    svg: `
      <path d="M210 205 C210 180 240 170 256 198 C272 170 302 180 302 205 C302 245 256 280 256 280 C256 280 210 245 210 205 Z" fill="${R}"/>
      <path d="M228 210 C234 198 246 198 256 214 C266 198 278 198 284 210" fill="${P}" opacity="0.45"/>
    `,
  },
  {
    id: "ey-angry",
    name: "Angry Brow",
    category: "eyes",
    svg: `
      <!-- single angry brow over the one eye -->
      <path d="M175 175 Q256 210 337 175" fill="none" stroke="${K}" stroke-width="14" stroke-linecap="round"/>
      <path d="M175 175 Q256 210 337 175" fill="none" stroke="${G}" stroke-width="5" stroke-linecap="round" opacity="0.4"/>
      <path d="M190 185 L250 205" stroke="${K}" stroke-width="6" stroke-linecap="round"/>
      <path d="M322 185 L262 205" stroke="${K}" stroke-width="6" stroke-linecap="round"/>
    `,
  },
  {
    id: "ey-sleepy",
    name: "Sleepy",
    category: "eyes",
    svg: `
      <path d="M195 230 Q256 258 317 230" fill="none" stroke="${K}" stroke-width="12" stroke-linecap="round"/>
      <path d="M195 230 Q256 248 317 230" fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round"/>
      <path d="M310 195 Q335 172 358 188" fill="none" stroke="${G}" stroke-width="3.5" opacity="0.8"/>
      <circle cx="350" cy="180" r="3.5" fill="${G}" opacity="0.75"/>
      <circle cx="365" cy="170" r="2.5" fill="${G}" opacity="0.5"/>
    `,
  },
  {
    id: "ey-vr",
    name: "VR Lens",
    category: "eyes",
    svg: `
      <rect x="168" y="192" width="176" height="72" rx="22" fill="${K}" stroke="${G}" stroke-width="4"/>
      <ellipse cx="256" cy="228" rx="58" ry="28" fill="${CY}" opacity="0.45"/>
      <circle cx="256" cy="228" r="16" fill="${W}" opacity="0.3"/>
      <path d="M200 228 H312" stroke="${PU}" stroke-width="2" opacity="0.5"/>
    `,
  },
  {
    id: "ey-monocle",
    name: "Monocle",
    category: "eyes",
    svg: `
      <circle cx="256" cy="228" r="58" fill="none" stroke="${G}" stroke-width="8"/>
      <circle cx="256" cy="228" r="48" fill="${W}" opacity="0.1"/>
      <path d="M314 228 Q360 255 350 320" fill="none" stroke="${G}" stroke-width="3.5"/>
      <circle cx="348" cy="325" r="5" fill="${G}"/>
    `,
  },
  {
    id: "ey-reticle",
    name: "Target Lock",
    category: "eyes",
    svg: `
      <!-- boost the brand reticle look -->
      <circle cx="256" cy="228" r="90" fill="none" stroke="${G}" stroke-width="6" opacity="0.95"/>
      <circle cx="256" cy="228" r="68" fill="none" stroke="${G}" stroke-width="3" opacity="0.6"/>
      <path d="M256 125 V160 M256 296 V331 M153 228 H188 M324 228 H359" stroke="${G}" stroke-width="6" stroke-linecap="round"/>
      <path d="M195 170 L215 190 M317 170 L297 190 M195 286 L215 266 M317 286 L297 266" stroke="${G}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="256" cy="228" r="8" fill="${R}" opacity="0.85"/>
    `,
  },
  {
    id: "ey-pixel",
    name: "Pixel Eye",
    category: "eyes",
    svg: `
      <rect x="200" y="185" width="112" height="86" fill="${K}"/>
      <rect x="210" y="195" width="92" height="66" fill="${W}"/>
      <rect x="245" y="215" width="36" height="36" fill="${K}"/>
      <rect x="252" y="222" width="12" height="12" fill="${W}"/>
    `,
  },
  {
    id: "ey-star",
    name: "Star Pupil",
    category: "eyes",
    svg: `
      <circle cx="256" cy="228" r="52" fill="${K}" opacity="0.35"/>
      <path d="M256 178 L268 215 L308 215 L276 238 L288 278 L256 252 L224 278 L236 238 L204 215 L244 215 Z" fill="${G}"/>
    `,
  },
  {
    id: "ey-dollar",
    name: "Money Eye",
    category: "eyes",
    svg: `
      <ellipse cx="256" cy="228" rx="70" ry="52" fill="${G}" opacity="0.9"/>
      <ellipse cx="256" cy="228" rx="58" ry="40" fill="${GD}" opacity="0.5"/>
      <text x="256" y="242" text-anchor="middle" font-size="52" font-weight="900" fill="${K}" font-family="Arial,sans-serif">$</text>
    `,
  },
  {
    id: "ey-x",
    name: "X Eyes",
    category: "eyes",
    svg: `
      <path d="M210 190 L302 266 M302 190 L210 266" stroke="${K}" stroke-width="14" stroke-linecap="round"/>
      <path d="M210 190 L302 266 M302 190 L210 266" stroke="${G}" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
    `,
  },
  {
    id: "ey-rainbow",
    name: "Rainbow",
    category: "eyes",
    svg: `
      <circle cx="256" cy="228" r="60" fill="none" stroke="#ef4444" stroke-width="8"/>
      <circle cx="256" cy="228" r="50" fill="none" stroke="#f97316" stroke-width="8"/>
      <circle cx="256" cy="228" r="40" fill="none" stroke="#f5d547" stroke-width="8"/>
      <circle cx="256" cy="228" r="30" fill="none" stroke="#22c55e" stroke-width="8"/>
      <circle cx="256" cy="228" r="20" fill="none" stroke="#3b82f6" stroke-width="8"/>
      <circle cx="256" cy="228" r="10" fill="#a78bfa"/>
    `,
  },
  {
    id: "ey-wink",
    name: "Wink",
    category: "eyes",
    svg: `
      <path d="M195 228 Q256 255 317 228" fill="none" stroke="${K}" stroke-width="11" stroke-linecap="round"/>
      <path d="M210 200 Q256 185 302 200" fill="none" stroke="${G}" stroke-width="4" opacity="0.5"/>
    `,
  },

  // ═══════════════════════════════════════════
  // MOUTH — props near the gold smile ~y 300
  // ═══════════════════════════════════════════
  {
    id: "mo-cig",
    name: "Cigarette",
    category: "mouth",
    svg: `
      <rect x="292" y="308" width="72" height="9" rx="2" fill="${W}"/>
      <rect x="352" y="308" width="12" height="9" fill="${OR}"/>
      <path d="M364 305 Q382 278 376 252" fill="none" stroke="${S}" stroke-width="3" opacity="0.55"/>
      <circle cx="374" cy="250" r="5" fill="${S}" opacity="0.35"/>
    `,
  },
  {
    id: "mo-cigar",
    name: "Cigar",
    category: "mouth",
    svg: `
      <rect x="286" y="305" width="82" height="13" rx="4" fill="#78350f"/>
      <rect x="352" y="305" width="16" height="13" fill="${OR}"/>
      <path d="M368 303 Q396 268 390 238" fill="none" stroke="${S}" stroke-width="4" opacity="0.45"/>
    `,
  },
  {
    id: "mo-pipe",
    name: "Pipe",
    category: "mouth",
    svg: `
      <path d="M282 310 Q324 310 346 327 L362 360 Q336 364 324 344 Q302 317 282 312" fill="#44403c" stroke="${K}" stroke-width="2"/>
      <ellipse cx="354" cy="354" rx="15" ry="11" fill="#292524"/>
      <path d="M356 340 Q372 310 366 287" fill="none" stroke="${S}" stroke-width="3" opacity="0.45"/>
    `,
  },
  {
    id: "mo-lollipop",
    name: "Lollipop",
    category: "mouth",
    svg: `
      <circle cx="350" cy="295" r="28" fill="${P}"/>
      <circle cx="350" cy="295" r="28" fill="none" stroke="${W}" stroke-width="3" opacity="0.4"/>
      <path d="M350 323 L338 375" stroke="${W}" stroke-width="5" stroke-linecap="round"/>
      <path d="M338 285 Q350 295 362 285" fill="none" stroke="${W}" stroke-width="2" opacity="0.5"/>
    `,
  },
  {
    id: "mo-bubble",
    name: "Bubblegum",
    category: "mouth",
    svg: `
      <circle cx="300" cy="280" r="42" fill="${P}" opacity="0.9"/>
      <ellipse cx="285" cy="265" rx="12" ry="8" fill="${W}" opacity="0.35"/>
      <path d="M270 310 Q256 305 250 300" fill="none" stroke="${P}" stroke-width="6"/>
    `,
  },
  {
    id: "mo-grill",
    name: "Gold Grill",
    category: "mouth",
    svg: `
      <rect x="210" y="295" width="92" height="22" rx="6" fill="${G}" stroke="${GD}" stroke-width="2"/>
      <path d="M225 295 V317 M245 295 V317 M267 295 V317 M287 295 V317" stroke="${GD}" stroke-width="2"/>
    `,
  },
  {
    id: "mo-tongue",
    name: "Tongue Out",
    category: "mouth",
    svg: `
      <ellipse cx="275" cy="318" rx="22" ry="28" fill="${P}"/>
      <path d="M275 300 V335" stroke="#db2777" stroke-width="3" opacity="0.5"/>
    `,
  },
  {
    id: "mo-whistle",
    name: "Whistle",
    category: "mouth",
    svg: `
      <ellipse cx="310" cy="308" rx="28" ry="14" fill="${S}" stroke="${K}" stroke-width="2"/>
      <rect x="330" y="302" width="36" height="12" rx="3" fill="${G}"/>
      <circle cx="300" cy="308" r="5" fill="${K}" opacity="0.4"/>
    `,
  },

  // ═══════════════════════════════════════════
  // FACE — marks around the egg face
  // ═══════════════════════════════════════════
  {
    id: "fa-beard",
    name: "Beard",
    category: "face",
    svg: `
      <path d="M185 278 Q168 345 190 400 Q230 438 256 442 Q282 438 322 400 Q344 345 327 278 Q298 315 256 318 Q214 315 185 278 Z" fill="#292524" opacity="0.94"/>
    `,
  },
  {
    id: "fa-mustache",
    name: "Mustache",
    category: "face",
    svg: `
      <path d="M200 280 Q232 268 256 285 Q280 268 312 280 Q288 302 256 296 Q224 302 200 280 Z" fill="${K}"/>
    `,
  },
  {
    id: "fa-freckles",
    name: "Freckles",
    category: "face",
    svg: `
      <circle cx="195" cy="258" r="3.5" fill="#c4a574"/>
      <circle cx="210" cy="272" r="3" fill="#c4a574"/>
      <circle cx="185" cy="275" r="2.5" fill="#c4a574"/>
      <circle cx="317" cy="258" r="3.5" fill="#c4a574"/>
      <circle cx="302" cy="272" r="3" fill="#c4a574"/>
      <circle cx="327" cy="275" r="2.5" fill="#c4a574"/>
    `,
  },
  {
    id: "fa-blush",
    name: "Blush",
    category: "face",
    svg: `
      <ellipse cx="188" cy="265" rx="32" ry="15" fill="${P}" opacity="0.45"/>
      <ellipse cx="324" cy="265" rx="32" ry="15" fill="${P}" opacity="0.45"/>
    `,
  },
  {
    id: "fa-paint",
    name: "War Paint",
    category: "face",
    svg: `
      <path d="M175 175 Q256 200 337 175 Q322 260 256 275 Q190 260 175 175" fill="${G}" opacity="0.2"/>
      <path d="M198 198 L230 245" stroke="${G}" stroke-width="5" stroke-linecap="round"/>
      <path d="M314 198 L282 245" stroke="${G}" stroke-width="5" stroke-linecap="round"/>
    `,
  },
  {
    id: "fa-scar",
    name: "Scar",
    category: "face",
    svg: `
      <path d="M300 165 L338 230" stroke="#7f1d1d" stroke-width="4" stroke-linecap="round"/>
      <path d="M295 185 L320 178" stroke="#7f1d1d" stroke-width="2"/>
      <path d="M308 208 L333 200" stroke="#7f1d1d" stroke-width="2"/>
    `,
  },
  {
    id: "fa-target",
    name: "Cheek Targets",
    category: "face",
    svg: `
      <circle cx="175" cy="270" r="18" fill="none" stroke="${G}" stroke-width="3" opacity="0.85"/>
      <circle cx="175" cy="270" r="6" fill="${G}" opacity="0.7"/>
      <circle cx="337" cy="270" r="18" fill="none" stroke="${G}" stroke-width="3" opacity="0.85"/>
      <circle cx="337" cy="270" r="6" fill="${G}" opacity="0.7"/>
    `,
  },
  {
    id: "fa-stubble",
    name: "Stubble",
    category: "face",
    svg: `
      <g fill="${K}" opacity="0.55">
        <circle cx="210" cy="300" r="1.8"/><circle cx="225" cy="308" r="1.5"/>
        <circle cx="240" cy="315" r="1.8"/><circle cx="256" cy="318" r="1.5"/>
        <circle cx="272" cy="315" r="1.8"/><circle cx="287" cy="308" r="1.5"/>
        <circle cx="302" cy="300" r="1.8"/><circle cx="218" cy="320" r="1.4"/>
        <circle cx="245" cy="328" r="1.5"/><circle cx="268" cy="328" r="1.4"/>
        <circle cx="295" cy="320" r="1.5"/><circle cx="232" cy="295" r="1.3"/>
        <circle cx="280" cy="295" r="1.3"/>
      </g>
    `,
  },
  {
    id: "fa-bandit",
    name: "Bandit Mask",
    category: "face",
    svg: `
      <path d="M165 200 Q175 175 256 170 Q337 175 347 200 L340 255 Q256 240 172 255 Z" fill="${K}" opacity="0.92"/>
      <ellipse cx="256" cy="228" rx="55" ry="42" fill="transparent"/>
      <!-- cutout hint: darker around, open center handled by not covering eye fully -->
      <ellipse cx="256" cy="228" rx="50" ry="40" fill="${K}" opacity="0"/>
    `,
  },
  {
    id: "fa-gold-dust",
    name: "Gold Dust",
    category: "face",
    svg: `
      <g fill="${G}">
        <circle cx="190" cy="200" r="3" opacity="0.7"/>
        <circle cx="205" cy="185" r="2" opacity="0.5"/>
        <circle cx="320" cy="195" r="3" opacity="0.7"/>
        <circle cx="335" cy="210" r="2" opacity="0.5"/>
        <circle cx="180" cy="250" r="2.5" opacity="0.6"/>
        <circle cx="340" cy="255" r="2.5" opacity="0.6"/>
        <circle cx="200" cy="320" r="2" opacity="0.45"/>
        <circle cx="315" cy="325" r="2" opacity="0.45"/>
        <circle cx="256" cy="160" r="2.5" opacity="0.55"/>
      </g>
    `,
  },

  // ═══════════════════════════════════════════
  // ACCESSORIES — chains, gear, flair
  // ═══════════════════════════════════════════
  {
    id: "ac-gold-chain",
    name: "Gold Chain",
    category: "accessories",
    svg: `
      <path d="M180 325 Q256 415 332 325" fill="none" stroke="${G}" stroke-width="11" stroke-linecap="round"/>
      <path d="M180 325 Q256 415 332 325" fill="none" stroke="${GD}" stroke-width="4"/>
      <circle cx="256" cy="395" r="16" fill="${G}" stroke="${GD}" stroke-width="3"/>
      <circle cx="256" cy="395" r="7" fill="${GD}"/>
    `,
  },
  {
    id: "ac-diamond-chain",
    name: "Diamond Chain",
    category: "accessories",
    svg: `
      <path d="M184 330 Q256 408 328 330" fill="none" stroke="${S}" stroke-width="8"/>
      <path d="M240 388 L256 362 L272 388 L256 418 Z" fill="#67e8f9" stroke="${W}" stroke-width="2"/>
    `,
  },
  {
    id: "ac-attn-chain",
    name: "$ATTN Medallion",
    category: "accessories",
    svg: `
      <path d="M182 328 Q256 412 330 328" fill="none" stroke="${G}" stroke-width="9" stroke-linecap="round"/>
      <circle cx="256" cy="400" r="28" fill="${K}" stroke="${G}" stroke-width="4"/>
      <circle cx="256" cy="400" r="18" fill="none" stroke="${G}" stroke-width="2.5"/>
      <text x="256" y="407" text-anchor="middle" font-size="16" font-weight="900" fill="${G}" font-family="Arial,sans-serif">A</text>
    `,
  },
  {
    id: "ac-earrings",
    name: "Earrings",
    category: "accessories",
    svg: `
      <circle cx="148" cy="245" r="7" fill="${G}"/>
      <circle cx="148" cy="268" r="10" fill="none" stroke="${G}" stroke-width="3"/>
      <circle cx="364" cy="245" r="7" fill="${G}"/>
      <circle cx="364" cy="268" r="10" fill="none" stroke="${G}" stroke-width="3"/>
    `,
  },
  {
    id: "ac-headphones",
    name: "Headphones",
    category: "accessories",
    svg: `
      <path d="M150 210 Q150 100 256 90 Q362 100 362 210" fill="none" stroke="${K}" stroke-width="12"/>
      <path d="M150 210 Q150 100 256 90 Q362 100 362 210" fill="none" stroke="${G}" stroke-width="3.5"/>
      <rect x="124" y="198" width="42" height="58" rx="12" fill="${K}" stroke="${G}" stroke-width="3"/>
      <rect x="346" y="198" width="42" height="58" rx="12" fill="${K}" stroke="${G}" stroke-width="3"/>
    `,
  },
  {
    id: "ac-backpack",
    name: "Backpack",
    category: "accessories",
    svg: `
      <rect x="95" y="270" width="50" height="105" rx="12" fill="#1e3a5f" stroke="${G}" stroke-width="3"/>
      <rect x="367" y="270" width="50" height="105" rx="12" fill="#1e3a5f" stroke="${G}" stroke-width="3"/>
      <rect x="105" y="292" width="30" height="22" rx="4" fill="${G}" opacity="0.4"/>
      <rect x="377" y="292" width="30" height="22" rx="4" fill="${G}" opacity="0.4"/>
    `,
  },
  {
    id: "ac-watch",
    name: "Watch",
    category: "accessories",
    svg: `
      <rect x="118" y="360" width="26" height="40" rx="5" fill="${K}" stroke="${G}" stroke-width="3"/>
      <circle cx="131" cy="380" r="9" fill="${G}" opacity="0.9"/>
      <circle cx="131" cy="380" r="2.5" fill="${K}"/>
    `,
  },
  {
    id: "ac-cape",
    name: "Cape",
    category: "accessories",
    svg: `
      <path d="M160 290 Q92 400 118 495 L208 465 Q182 385 195 308" fill="#7f1d1d" opacity="0.92"/>
      <path d="M352 290 Q420 400 394 495 L304 465 Q330 385 317 308" fill="#7f1d1d" opacity="0.92"/>
    `,
  },
  {
    id: "ac-gold-cape",
    name: "Gold Cape",
    category: "accessories",
    svg: `
      <path d="M160 290 Q92 400 118 495 L208 465 Q182 385 195 308" fill="${G}" opacity="0.88"/>
      <path d="M352 290 Q420 400 394 495 L304 465 Q330 385 317 308" fill="${G}" opacity="0.88"/>
    `,
  },
  {
    id: "ac-bowtie",
    name: "Bowtie",
    category: "accessories",
    svg: `
      <path d="M215 318 L256 332 L297 318 L256 348 Z" fill="${G}"/>
      <circle cx="256" cy="332" r="7" fill="${GD}"/>
    `,
  },
  {
    id: "ac-wings",
    name: "Angel Wings",
    category: "accessories",
    svg: `
      <path d="M155 250 Q80 200 70 280 Q90 340 150 320 Q120 280 155 250" fill="${W}" opacity="0.9"/>
      <path d="M357 250 Q432 200 442 280 Q422 340 362 320 Q392 280 357 250" fill="${W}" opacity="0.9"/>
      <path d="M140 270 Q100 250 95 290" fill="none" stroke="${S}" stroke-width="2" opacity="0.5"/>
      <path d="M372 270 Q412 250 417 290" fill="none" stroke="${S}" stroke-width="2" opacity="0.5"/>
    `,
  },
  {
    id: "ac-rings",
    name: "Orbit Rings",
    category: "accessories",
    svg: `
      <ellipse cx="256" cy="270" rx="165" ry="55" fill="none" stroke="${G}" stroke-width="4" opacity="0.55" transform="rotate(-18 256 270)"/>
      <ellipse cx="256" cy="270" rx="165" ry="55" fill="none" stroke="${G}" stroke-width="3" opacity="0.35" transform="rotate(22 256 270)"/>
    `,
  },
  {
    id: "ac-floating-a",
    name: "Float A",
    category: "accessories",
    svg: `
      <circle cx="400" cy="140" r="28" fill="${K}" stroke="${G}" stroke-width="3"/>
      <text x="400" y="150" text-anchor="middle" font-size="26" font-weight="900" fill="${G}" font-family="Arial,sans-serif">A</text>
      <circle cx="110" cy="160" r="18" fill="${G}" opacity="0.7"/>
    `,
  },
  {
    id: "ac-mic",
    name: "Mic",
    category: "accessories",
    svg: `
      <rect x="355" y="300" width="18" height="70" rx="4" fill="${S}"/>
      <ellipse cx="364" cy="290" rx="22" ry="28" fill="${K}" stroke="${G}" stroke-width="3"/>
      <path d="M364 370 L364 400 L380 410" fill="none" stroke="${S}" stroke-width="4" stroke-linecap="round"/>
    `,
  },
];

export function accessoriesByCategory(cat: PfpCategoryId): PfpAccessory[] {
  return PFP_ACCESSORIES.filter((a) => a.category === cat);
}

export function getAccessory(id: string | null | undefined): PfpAccessory | undefined {
  if (!id) return undefined;
  return PFP_ACCESSORIES.find((a) => a.id === id);
}

export function accessoryDataUrl(acc: PfpAccessory): string {
  return svgUrl(acc.svg);
}

export type EquippedMap = Partial<Record<PfpCategoryId, string | null>>;

/** Per-layer nudge: x/y as fraction of mascot box, scale as multiplier */
export interface LayerTransform {
  x: number;
  y: number;
  scale: number;
}

export type LayerTransformMap = Partial<Record<PfpCategoryId, LayerTransform>>;

export function defaultLayerTransform(): LayerTransform {
  return { x: 0, y: 0, scale: 1 };
}

export function emptyEquipped(): EquippedMap {
  return {
    headwear: null,
    costume: null,
    eyes: null,
    mouth: null,
    face: null,
    accessories: null,
  };
}

export function emptyTransforms(): LayerTransformMap {
  return {};
}

export function randomEquipped(): EquippedMap {
  const eq = emptyEquipped();
  for (const cat of PFP_CATEGORIES) {
    if (Math.random() > 0.45) {
      const items = accessoriesByCategory(cat.id);
      if (items.length) {
        eq[cat.id] = items[Math.floor(Math.random() * items.length)].id;
      }
    }
  }
  return eq;
}

export function equippedInPaintOrder(eq: EquippedMap): PfpAccessory[] {
  const list: PfpAccessory[] = [];
  const sorted = [...PFP_CATEGORIES].sort((a, b) => a.zIndex - b.zIndex);
  for (const cat of sorted) {
    const acc = getAccessory(eq[cat.id]);
    if (acc) list.push(acc);
  }
  return list;
}
