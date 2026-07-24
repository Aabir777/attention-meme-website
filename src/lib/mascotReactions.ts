import type { CSSProperties } from "react";
import type { SfxKind } from "./mascotSounds";

export type BodyZone = "head" | "eye" | "belly" | "leftArm" | "rightArm" | "feet";

export type ReactionAnim =
  | "idle"
  | "listening"
  | "thinking"
  | "talking"
  | "poke-head"
  | "poke-eye"
  | "poke-belly"
  | "poke-arm-l"
  | "poke-arm-r"
  | "poke-feet"
  | "laugh"
  | "angry"
  | "dizzy"
  | "jump"
  | "tickle"
  | "spin"
  | "squish";

export interface BodyReaction {
  zone: BodyZone;
  anim: ReactionAnim;
  sfx: SfxKind;
  chaos: "wild" | "happy" | "angry" | "echo" | "normal";
  phrases: string[];
  /** floating emoji/particles */
  fx: string[];
  durationMs: number;
}

export const ZONE_META: Record<
  BodyZone,
  { label: string; style: CSSProperties }
> = {
  head: {
    label: "Head",
    style: { left: "32%", top: "6%", width: "36%", height: "18%" },
  },
  eye: {
    label: "Eye",
    style: { left: "34%", top: "28%", width: "32%", height: "22%" },
  },
  leftArm: {
    label: "Arm",
    style: { left: "4%", top: "42%", width: "18%", height: "28%" },
  },
  rightArm: {
    label: "Arm",
    style: { left: "78%", top: "42%", width: "18%", height: "28%" },
  },
  belly: {
    label: "Belly",
    style: { left: "28%", top: "52%", width: "44%", height: "24%" },
  },
  feet: {
    label: "Feet",
    style: { left: "24%", top: "78%", width: "52%", height: "18%" },
  },
};

export const ZONE_REACTIONS: Record<BodyZone, BodyReaction> = {
  head: {
    zone: "head",
    anim: "poke-head",
    sfx: "bonk",
    chaos: "wild",
    phrases: [
      "Hey! My head!",
      "Ouch, careful up there!",
      "Don't mess the hair tuft!",
      "Bonk! Hehe.",
      "Brain shake! Pay attention!",
    ],
    fx: ["💫", "⭐", "💥"],
    durationMs: 900,
  },
  eye: {
    zone: "eye",
    anim: "poke-eye",
    sfx: "squeak",
    chaos: "wild",
    phrases: [
      "My reticle!!",
      "Eyes on me means DON'T poke!",
      "Ow my one eye!",
      "Focus… FOOSH!",
      "That's my first asset!",
    ],
    fx: ["👀", "✨", "🎯"],
    durationMs: 1000,
  },
  belly: {
    zone: "belly",
    anim: "laugh",
    sfx: "giggle",
    chaos: "happy",
    phrases: [
      "Hahaha that tickles!",
      "Hehehe stoppp!",
      "HA HA HA, belly mode!",
      "I'm gonna bounce!",
      "Giggle overload!",
    ],
    fx: ["😂", "💛", "✨"],
    durationMs: 1400,
  },
  leftArm: {
    zone: "leftArm",
    anim: "poke-arm-l",
    sfx: "boing",
    chaos: "happy",
    phrases: [
      "Boing! Left wing!",
      "High five? Oof!",
      "Arm go wiggle!",
      "Tickle the left!",
    ],
    fx: ["👈", "✨"],
    durationMs: 800,
  },
  rightArm: {
    zone: "rightArm",
    anim: "poke-arm-r",
    sfx: "boing",
    chaos: "happy",
    phrases: [
      "Right side boing!",
      "Hehe arm attack!",
      "Wiggle wiggle!",
      "Don't pull me!",
    ],
    fx: ["👉", "💫"],
    durationMs: 800,
  },
  feet: {
    zone: "feet",
    anim: "jump",
    sfx: "pop",
    chaos: "wild",
    phrases: [
      "My golden toes!!",
      "Jump jump JUMP!",
      "Feet are ticklish!",
      "Up we go!",
      "Dance mode!",
    ],
    fx: ["👟", "⬆️", "💥"],
    durationMs: 1100,
  },
};

export const ANGRY_REACTION: BodyReaction = {
  zone: "belly",
  anim: "angry",
  sfx: "angry",
  chaos: "angry",
  phrases: [
    "HEY! Too much poking!",
    "I'm getting mad…",
    "Grrrr, chill!",
    "Last warning, human!",
  ],
  fx: ["💢", "😠", "⚡"],
  durationMs: 1200,
};

export const DIZZY_REACTION: BodyReaction = {
  zone: "head",
  anim: "dizzy",
  sfx: "boing",
  chaos: "wild",
  phrases: [
    "Wooo dizzy…",
    "Stars everywhere…",
    "My reticle is spinning…",
  ],
  fx: ["😵", "⭐", "🌀"],
  durationMs: 1500,
};

export function pickPhrase(phrases: string[]) {
  return phrases[Math.floor(Math.random() * phrases.length)];
}

export function pickFx(fx: string[], count = 5): { id: string; emoji: string; x: number; y: number; delay: number }[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
    emoji: fx[Math.floor(Math.random() * fx.length)],
    x: 20 + Math.random() * 60,
    y: 15 + Math.random() * 55,
    delay: i * 60,
  }));
}
