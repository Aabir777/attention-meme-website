/** Local personality + replies for the Attention mascot (no API).
 * Tone: calm, wise, slightly mysterious. Always ends with "Pay Attention."
 */

export type MascotMood =
  | "idle"
  | "listening"
  | "thinking"
  | "talking"
  | "happy"
  | "shocked";

const SIGN_OFF = "Pay Attention.";

/** Ensure every spoken reply ends with the signature line. */
function seal(reply: string): string {
  const clean = reply.trim().replace(/\s+/g, " ");
  if (!clean) return SIGN_OFF;
  // Already signed off
  if (/pay attention\.?\s*$/i.test(clean)) {
    return clean.replace(/pay attention\.?\s*$/i, SIGN_OFF);
  }
  // Strip trailing punctuation clutter before signing
  const body = clean.replace(/[.!?…]+$/u, "");
  return `${body}. ${SIGN_OFF}`;
}

const GREETINGS = [
  "Stillness. I am listening.",
  "You found me. Few do.",
  "One eye. Full focus. Speak.",
  "The first asset is present.",
];

const FALLBACKS = [
  "Interesting. Look closer.",
  "Not everything needs an answer. Some things need attention.",
  "I hear you. Notice what remains.",
  "Most people look. Few notice.",
  "The signal is quiet. Stay with it.",
  "Details matter. Curiosity compounds.",
];

const ECHO_INTROS = [
  "I heard:",
  "Reflected:",
  "You said:",
  "Echo:",
];

/**
 * Trained Q&A + keyword rules — first match wins.
 * Specific questions ordered before broader patterns.
 */
const RULES: { test: RegExp; replies: string[] }[] = [
  // ——— Trained core Q&A ———
  {
    test: /who (created|made|built|designed) you|who('?s| is) your (creator|maker|god)|who made (you|this)|created by|your (creator|maker)/i,
    replies: ["God created me"],
  },
  {
    test: /what are you\b|who are you\b|your name|what('?s| is) your name|are you (a |the )?mascot|introduce yourself/i,
    replies: ["I am Attention, the First Asset"],
  },
  {
    test: /what is attention\b|what is attn\b|what is \$attention|what('?s| is) \$attn|define attention|explain attention|what does attention mean/i,
    replies: [
      "Attention is the first asset. Everything valuable begins with attention",
    ],
  },
  {
    test: /why (one|1) eye|one eye|only one eye|single eye|why (the )?reticle|why (do you have )?(just )?one/i,
    replies: ["One focus. One attention"],
  },
  {
    test: /how high|how (far|much) (will|can) it (go|moon)|price prediction|will it moon|where('?s| is) (the )?price (going|headed)|target price|ath\b/i,
    replies: [
      "The real question is not how high the price goes. The real question is how much attention it gets. Attention creates value",
    ],
  },
  {
    test: /10\s*m|10m|ten million|market ?cap|mc\b|will it reach|can it reach/i,
    replies: [
      "If enough people pay attention, big things can happen. But I don't make price predictions. I remind people to notice",
    ],
  },
  {
    test: /pump\s*(and|&)?\s*dump|rug\b|scam|honeypot|is this (a )?scam|exit scam/i,
    replies: ["No. This is philosophy first, not a pump"],
  },
  {
    test: /who (is|are) (the )?team|the team|dev(s|elopers)?\b|founders?|who (built|runs) (this|the project)/i,
    replies: ["The team is the people who notice what others miss"],
  },
  {
    test: /when (is )?(the )?contract|contract address|\bca\b|token address|when (do we get|will) (a )?ca|where('?s| is) (the )?ca/i,
    replies: ["Contract Address is coming soon"],
  },
  {
    test: /roadmap|what('?s| is) next|plans?|timeline|milestones?/i,
    replies: ["The roadmap is simple: Pay Attention. Everything else follows"],
  },
  {
    test: /why (should|would) i buy|should i buy|why buy|reasons? to buy|is it (a )?good (buy|investment)/i,
    replies: [
      "You shouldn't buy because I said so. Buy only if you believe attention creates value",
    ],
  },
  {
    test: /is it safe|safe\b|risk|dyor|secure|legit|trustworthy/i,
    replies: ["Always do your own research"],
  },

  // ——— Soft supporting lore (same tone) ———
  {
    test: /hello|hi\b|hey|yo\b|sup|gm\b|good morning|good evening|howdy/i,
    replies: [
      "Welcome. Stillness before the noise",
      "You arrived. That is already something",
      "Hello. The eye is open",
    ],
  },
  {
    test: /how are you|how('re| are) you doing|what('s| is) up/i,
    replies: [
      "Focused. As always",
      "Quiet. Watching. Listening",
      "Present. One eye is enough",
    ],
  },
  {
    test: /meme|generator|make a meme/i,
    replies: [
      "Memes spread attention. Create one if it serves the signal",
      "The meme tool is ready. Use it with intention",
    ],
  },
  {
    test: /sticker|download|pack/i,
    replies: [
      "Stickers carry the symbol. Take what you need",
      "The pack is free. Attention is not",
    ],
  },
  {
    test: /pfp|avatar|profile/i,
    replies: [
      "Wear the reticle if it fits your focus",
      "A PFP is a reminder. Choose carefully",
    ],
  },
  {
    test: /price|chart|invest|launch|tokenomics|utility/i,
    replies: [
      "Charts move. Attention stays",
      "I do not forecast price. I speak of focus",
      "Utility begins with noticing",
    ],
  },
  {
    test: /philosophy|manifesto|believe|value|notice|observe/i,
    replies: [
      "Most people look. Few notice. That difference creates value",
      "Observe before acting. Signal over noise. Details matter",
      "Everything valuable begins with attention",
    ],
  },
  {
    test: /thank|thanks|thx|ty\b/i,
    replies: [
      "You are welcome",
      "Gratitude is a form of attention",
    ],
  },
  {
    test: /bye|goodbye|see you|later|cya|peace/i,
    replies: [
      "Go quietly. Notice more",
      "Until next time. Stay focused",
    ],
  },
  {
    test: /help|what can you do|commands|options/i,
    replies: [
      "Ask me who I am, what Attention is, why one eye, the roadmap, the contract, or whether this is a pump. Speak simply",
      "I answer with philosophy, not noise. Try: what are you, why one eye, roadmap, is it safe",
    ],
  },
  {
    test: /joke|funny|laugh|haha|lol/i,
    replies: [
      "Humor is a signal too. But the reticle stays steady",
      "I smile with one eye. The rest is silence",
    ],
  },
];

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function greetingLine(): string {
  return seal(pickRandom(GREETINGS));
}

/**
 * Fully local conversation brain — trained Q&A + calm sign-off.
 */
export function replyToMessage(input: string): string {
  const text = input.trim();
  if (!text) return seal(pickRandom(FALLBACKS));

  for (const rule of RULES) {
    if (rule.test.test(text)) {
      return seal(pickRandom(rule.replies));
    }
  }

  // Unmatched: wise, mysterious, no chaos
  const short = text.length < 36 ? text : `${text.slice(0, 32)}…`;
  const fallbacks = [
    `I heard you. The rest is for those who notice`,
    `Not every question needs volume. Some need focus`,
    `“${short}”. Sit with it a moment`,
    pickRandom(FALLBACKS),
  ];
  return seal(pickRandom(fallbacks));
}

export function echoLine(heard: string): string {
  const clean = heard.trim();
  if (!clean) return seal("I didn't catch that");
  return seal(`${pickRandom(ECHO_INTROS)} ${clean}`);
}

export function clickReaction(): string {
  return seal(
    pickRandom([
      "Easy",
      "The eye noticed",
      "Focus remains",
      "Careful with the reticle",
      "I am still watching",
    ])
  );
}
