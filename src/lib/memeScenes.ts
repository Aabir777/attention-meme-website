/**
 * Ready-to-use Attention meme scenes (Chog-style generator presets).
 * Each scene places the mascot + text slots so users generate in 1–2 clicks.
 */

export interface MemeScene {
  id: string;
  name: string;
  description: string;
  /** solid fill or brand image path */
  background: {
    type: "color" | "image";
    value: string;
    /** optional dark overlay 0–1 for image backgrounds (default ~0.22) */
    overlay?: number;
  };
  /** default mascot sticker id from assets */
  mascotId: string;
  /** mascot placement on 512 canvas */
  mascot: { x: number; y: number; scale: number; rotation?: number };
  /** when false, scene art already includes the character */
  showMascot?: boolean;
  topText: string;
  bottomText: string;
  topY?: number;
  bottomY?: number;
  topColor?: string;
  bottomColor?: string;
}

/** Full-scene templates only (scene art includes mascot) */
export const MEME_SCENES: MemeScene[] = [
  {
    id: "tpl-n01",
    name: "Boardroom",
    description: "Everyone wants a piece",
    background: {
      type: "image",
      value: "/templates/n01.jpg",
      overlay: 0.08,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "EVERYONE WANTS IN",
    bottomText: "ON $attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n02",
    name: "Join Us",
    description: "Shoulder tap at sunset",
    background: {
      type: "image",
      value: "/templates/n02.jpg",
      overlay: 0.06,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "COME WITH ME",
    bottomText: "PAY ATTENTION",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n03",
    name: "Hard Choice",
    description: "Two buttons, same answer",
    background: {
      type: "image",
      value: "/templates/n03.jpg",
      overlay: 0.05,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "HARD CHOICE",
    bottomText: "BOTH SAY BUY $attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 28,
    bottomY: 478,
  },
  {
    id: "tpl-n04",
    name: "Keynote",
    description: "Suit speech to the room",
    background: {
      type: "image",
      value: "/templates/n04.jpg",
      overlay: 0.06,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "LADIES AND GENTS",
    bottomText: "THE FIRST ASSET",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n05",
    name: "I Surrender",
    description: "Hands up in the chair",
    background: {
      type: "image",
      value: "/templates/n05.jpg",
      overlay: 0.05,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "I SURRENDER",
    bottomText: "TO $attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n06",
    name: "Gala Night",
    description: "Champagne toast energy",
    background: {
      type: "image",
      value: "/templates/n06.jpg",
      overlay: 0.08,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "TO THE MOON",
    bottomText: "PAY ATTENTION",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n07",
    name: "Still Fine",
    description: "Room on fire, still holding",
    background: {
      type: "image",
      value: "/templates/n07.jpg",
      overlay: 0.04,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "THIS IS FINE",
    bottomText: "HOLDING $attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n08",
    name: "Touch Grass",
    description: "4-panel field flop",
    background: {
      type: "image",
      value: "/templates/n08.jpg",
      overlay: 0.05,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "TOUCH GRASS?",
    bottomText: "I TOUCHED $attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 28,
    bottomY: 478,
  },
  {
    id: "tpl-n09",
    name: "Red Pill",
    description: "Matrix choice moment",
    background: {
      type: "image",
      value: "/templates/n09.jpg",
      overlay: 0.06,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "RED OR BLUE",
    bottomText: "PICK $attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n10",
    name: "Town Hall",
    description: "Whole room pays attention",
    background: {
      type: "image",
      value: "/templates/n10.jpg",
      overlay: 0.08,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "THE WHOLE TOWN",
    bottomText: "PAYS ATTENTION",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  // ——— New pack from Desktop/New folder (5) ———
  {
    id: "tpl-n11",
    name: "Laser Focus",
    description: "Green beam on the laptop grind",
    background: {
      type: "image",
      value: "/templates/n11.jpg",
      overlay: 0.05,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "LOCKED IN",
    bottomText: "ON $attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n12",
    name: "Strong Buy",
    description: "Charts behind the king",
    background: {
      type: "image",
      value: "/templates/n12.jpg",
      overlay: 0.04,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "STRONG BUY",
    bottomText: "PAY ATTENTION",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n13",
    name: "Chief Overthinker",
    description: "Office chaos, still calm",
    background: {
      type: "image",
      value: "/templates/n13.jpg",
      overlay: 0.06,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "CHIEF OVERTHINKER",
    bottomText: "STILL HOLDING $attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 32,
    bottomY: 476,
  },
  {
    id: "tpl-n14",
    name: "Album Mode",
    description: "Beanbag + headphones + wall of covers",
    background: {
      type: "image",
      value: "/templates/n14.png",
      overlay: 0.05,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "ONLY PLAYING",
    bottomText: "$attention ON REPEAT",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n15",
    name: "Hype Pose",
    description: "Clean studio flex",
    background: {
      type: "image",
      value: "/templates/n15.jpg",
      overlay: 0.03,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "ME AFTER",
    bottomText: "BUYING $attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n16",
    name: "Hulk Swing",
    description: "Tiny king on the swing",
    background: {
      type: "image",
      value: "/templates/n16.jpg",
      overlay: 0.04,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "JUST CHILLIN",
    bottomText: "WHILE $attention RIPS",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n17",
    name: "Game Day",
    description: "Stadium seats, main character energy",
    background: {
      type: "image",
      value: "/templates/n17.jpg",
      overlay: 0.08,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "HER: WHO ARE YOU",
    bottomText: "ME: $attention HOLDER",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 32,
    bottomY: 476,
  },
  {
    id: "tpl-n18",
    name: "Barrel Fail",
    description: "Hunter meme 4-panel energy",
    background: {
      type: "image",
      value: "/templates/n18.jpg",
      overlay: 0.02,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "WHEN YOU SHORT",
    bottomText: "$attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 28,
    bottomY: 478,
  },
  {
    id: "tpl-n19",
    name: "Rest in Peace",
    description: "Peace sign at the grave",
    background: {
      type: "image",
      value: "/templates/n19.jpg",
      overlay: 0.06,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "RIP DOUBTERS",
    bottomText: "$attention STILL HERE",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n20",
    name: "Press Swarm",
    description: "Mic wall interview",
    background: {
      type: "image",
      value: "/templates/n20.jpg",
      overlay: 0.07,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "MEDIA: WHATS NEXT",
    bottomText: "ME: PAY ATTENTION",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 32,
    bottomY: 476,
  },
  {
    id: "tpl-n21",
    name: "Desk Dealer",
    description: "Dual monitor trading den",
    background: {
      type: "image",
      value: "/templates/n21.jpg",
      overlay: 0.04,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "ME WATCHING",
    bottomText: "$attention ALL DAY",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n22",
    name: "GM Blast",
    description: "Jumping into the timeline",
    background: {
      type: "image",
      value: "/templates/n22.jpg",
      overlay: 0.03,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "GM CT",
    bottomText: "PAY ATTENTION",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n23",
    name: "300",
    description: "One eye vs the army",
    background: {
      type: "image",
      value: "/templates/n23.jpg",
      overlay: 0.08,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "THIS IS",
    bottomText: "$attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n24",
    name: "Army Spawn",
    description: "Diamond hands army drop",
    background: {
      type: "image",
      value: "/templates/n24.jpg",
      overlay: 0.05,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "SENDING THE ARMY",
    bottomText: "OF $attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n25",
    name: "Champions",
    description: "Crowd carries the king",
    background: {
      type: "image",
      value: "/templates/n25.jpg",
      overlay: 0.1,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "WHEN $attention",
    bottomText: "HITS THE TIMELINE",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n26",
    name: "Ultrasound",
    description: "Born ready meme",
    background: {
      type: "image",
      value: "/templates/n26.jpg",
      overlay: 0.04,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "BORN READY",
    bottomText: "FOR $attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n27",
    name: "Worm Ride",
    description: "Dune sandworm energy",
    background: {
      type: "image",
      value: "/templates/n27.jpg",
      overlay: 0.08,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "RIDING THE WAVE",
    bottomText: "OF $attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n28",
    name: "Supra Flex",
    description: "Suit + sports car cool",
    background: {
      type: "image",
      value: "/templates/n28.jpg",
      overlay: 0.08,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "BAG LOOKING CLEAN",
    bottomText: "SINCE $attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n29",
    name: "Empty Pockets",
    description: "Patrick pants energy",
    background: {
      type: "image",
      value: "/templates/n29.jpg",
      overlay: 0.04,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "WALLET AFTER",
    bottomText: "BUYING $attention",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
  {
    id: "tpl-n30",
    name: "City Watch",
    description: "Giant mascot over traffic",
    background: {
      type: "image",
      value: "/templates/n30.jpg",
      overlay: 0.1,
    },
    mascotId: "main",
    mascot: { x: 256, y: 280, scale: 1 },
    showMascot: false,
    topText: "THE WHOLE CITY",
    bottomText: "PAYS ATTENTION",
    topColor: "#ffffff",
    bottomColor: "#f5d547",
    topY: 36,
    bottomY: 472,
  },
];

export type CaptionPackId = "viral" | "lore" | "degen" | "raid";

export interface CaptionPack {
  id: CaptionPackId;
  name: string;
  pairs: { top: string; bottom: string }[];
}

/** Caption packs for the meme generator */
export const CAPTION_PACKS: CaptionPack[] = [
  {
    id: "viral",
    name: "Viral",
    pairs: [
      { top: "WHEN THEY ASK", bottom: "WHATS THE UTILITY" },
      { top: "NOBODY:", bottom: "ME RAIDING WITH $attention MEMES" },
      { top: "TOUCH GRASS?", bottom: "I TOUCHED $attention" },
      { top: "SILENTLY JUDGING", bottom: "YOUR BAG" },
      { top: "DONT BLINK", bottom: "OR YOULL MISS IT" },
      { top: "POV: YOU JUST", bottom: "DISCOVERED ATTENTION" },
      { top: "ME TO MY BAG", bottom: "WE GONNA MAKE IT" },
      { top: "CHART LOOKING AT YOU", bottom: "PAY ATTENTION" },
      { top: "ONE EYED KING", bottom: "OF THE TIMELINE" },
    ],
  },
  {
    id: "lore",
    name: "Lore",
    pairs: [
      { top: "EVERYTHING VALUABLE", bottom: "BEGINS WITH ATTENTION" },
      { top: "THE FIRST ASSET", bottom: "$attention" },
      { top: "MOST PEOPLE LOOK", bottom: "FEW NOTICE" },
      { top: "NOT A TREND", bottom: "A THESIS" },
      { top: "ATTENTION IS", bottom: "THE REAL LIQUIDITY" },
    ],
  },
  {
    id: "degen",
    name: "Degen",
    pairs: [
      { top: "BOUGHT THE DIP", bottom: "OF MY DIGNITY" },
      { top: "LEVERAGE?", bottom: "I LEVERAGE ATTENTION" },
      { top: "NGMI?", bottom: "NOT WITH $attention" },
      { top: "I AINT SELLING", bottom: "I AINT BLINKING" },
      { top: "WAGMI ONLY", bottom: "IF YOU PAY ATTENTION" },
    ],
  },
  {
    id: "raid",
    name: "Raid",
    pairs: [
      { top: "GM CT", bottom: "PAY ATTENTION" },
      { top: "QUOTE THIS", bottom: "IF YOURE EARLY" },
      { top: "FOLLOW + RT", bottom: "FOR $attention" },
      { top: "TIMELINE RAID", bottom: "INCOMING" },
      { top: "SEND IT", bottom: "$attention" },
    ],
  },
];

export function getScene(id: string): MemeScene | undefined {
  return MEME_SCENES.find((s) => s.id === id);
}

export function randomScene(): MemeScene {
  return MEME_SCENES[Math.floor(Math.random() * MEME_SCENES.length)] ?? MEME_SCENES[0];
}

export function randomCaption(
  packId: CaptionPackId | "all" = "viral"
): { top: string; bottom: string } {
  const pairs =
    packId === "all"
      ? CAPTION_PACKS.flatMap((p) => p.pairs)
      : (CAPTION_PACKS.find((p) => p.id === packId) ?? CAPTION_PACKS[0]).pairs;
  return pairs[Math.floor(Math.random() * pairs.length)] ?? {
    top: "PAY ATTENTION",
    bottom: "$attention",
  };
}

/** @deprecated use randomCaption */
export function randomCaptionPair(packId: CaptionPackId | "all" = "viral") {
  return randomCaption(packId);
}
