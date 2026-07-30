/**
 * PFP stack:
 * 1. Main base mascot (always drawn — Desktop/New folder (2))
 * 2. Expression face plate — only when user picks one (starts blank)
 * 3. Costume overlay ON TOP of expression
 * 4. Hat overlay ON TOP (Desktop/New folder (3))
 */

export const MAIN_MASCOT_SRC = "/mascot/main-pfp.png";

export interface PfpCostume {
  id: string;
  name: string;
  src: string;
  /** No costume layer — only the main base mascot */
  isBase?: boolean;
}

export interface PfpExpression {
  id: string;
  name: string;
  src: string;
}

export interface PfpHat {
  id: string;
  name: string;
  src: string;
}

/** Costumes from Desktop/characters (outfits only). Never apply an expression here. */
export const PFP_COSTUMES: PfpCostume[] = [
  {
    id: "classic",
    name: "Classic",
    src: MAIN_MASCOT_SRC,
    isBase: true,
  },
  { id: "char-01", name: "Costume 1", src: "/pfp-characters/char-01.png" },
  { id: "char-04", name: "Costume 4", src: "/pfp-characters/char-04.png" },
  { id: "char-05", name: "Costume 5", src: "/pfp-characters/char-05.png" },
  { id: "char-06", name: "Costume 6", src: "/pfp-characters/char-06.png" },
  /** From Desktop/New folder (4) */
  { id: "char-09", name: "Costume 7", src: "/pfp-characters/char-09.png" },
  { id: "char-10", name: "Costume 8", src: "/pfp-characters/char-10.png" },
  { id: "char-11", name: "Costume 9", src: "/pfp-characters/char-11.png" },
];

/**
 * Face plates from Desktop/New folder.
 * None selected until the user picks one in the Expressions section.
 * exp-01 = Picsart_26-07-28_13-42-40-778.png
 */
export const PFP_EXPRESSIONS: PfpExpression[] = [
  { id: "exp-01", name: "Happy", src: "/pfp-expressions/exp-01.png" },
  { id: "exp-02", name: "Furious", src: "/pfp-expressions/exp-02.png" },
  { id: "exp-03", name: "Shocked", src: "/pfp-expressions/exp-03.png" },
  { id: "exp-04", name: "Meh", src: "/pfp-expressions/exp-04.png" },
  { id: "exp-05", name: "Sly", src: "/pfp-expressions/exp-05.png" },
  { id: "exp-06", name: "Heart Eyes", src: "/pfp-expressions/exp-06.png" },
  { id: "exp-07", name: "Sad", src: "/pfp-expressions/exp-07.png" },
];

/** Hats from Desktop/New folder (3) — optional, blank until selected */
export const PFP_HATS: PfpHat[] = [
  { id: "hat-01", name: "Hat 1", src: "/pfp-hats/hat-01.png" },
  { id: "hat-02", name: "Hat 2", src: "/pfp-hats/hat-02.png" },
  { id: "hat-03", name: "Hat 3", src: "/pfp-hats/hat-03.png" },
  { id: "hat-04", name: "Hat 4", src: "/pfp-hats/hat-04.png" },
  { id: "hat-05", name: "Hat 5", src: "/pfp-hats/hat-05.png" },
];

export const DEFAULT_COSTUME_ID = "classic";

export function getCostume(id: string | null | undefined): PfpCostume | undefined {
  if (!id) return undefined;
  return PFP_COSTUMES.find((c) => c.id === id);
}

export function getExpression(id: string | null | undefined): PfpExpression | undefined {
  if (!id) return undefined;
  return PFP_EXPRESSIONS.find((e) => e.id === id);
}

export function getHat(id: string | null | undefined): PfpHat | undefined {
  if (!id) return undefined;
  return PFP_HATS.find((h) => h.id === id);
}

// Back-compat aliases used during rename
export const PFP_CHARACTERS = PFP_COSTUMES;
export const DEFAULT_CHARACTER_ID = DEFAULT_COSTUME_ID;
export const getCharacter = getCostume;
export type PfpCharacter = PfpCostume;
