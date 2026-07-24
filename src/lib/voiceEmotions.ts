/** Emotion → ElevenLabs delivery (audio tags + voice_settings). */

export type VoiceEmotion =
  | "wild"
  | "happy"
  | "angry"
  | "echo"
  | "normal"
  | "sad"
  | "whisper"
  | "excited";

export interface VoiceDelivery {
  /** Bracket tags for Eleven v3 expressive models */
  audioTags: string[];
  /** 0–1: lower = more expressive / less flat */
  stability: number;
  /** 0–1: style exaggeration (multilingual v2 / turbo) */
  style: number;
  /** 0–1: similarity to original voice */
  similarityBoost: number;
  /** Soft speed hint applied via text pacing */
  pace: "slow" | "natural" | "fast";
}

export const EMOTION_DELIVERY: Record<VoiceEmotion, VoiceDelivery> = {
  normal: {
    audioTags: [],
    stability: 0.45,
    style: 0.35,
    similarityBoost: 0.8,
    pace: "natural",
  },
  happy: {
    audioTags: ["happily", "warmly"],
    stability: 0.32,
    style: 0.55,
    similarityBoost: 0.75,
    pace: "natural",
  },
  excited: {
    audioTags: ["excited", "enthusiastically"],
    stability: 0.28,
    style: 0.7,
    similarityBoost: 0.7,
    pace: "fast",
  },
  wild: {
    audioTags: ["playfully", "excited", "laughs"],
    stability: 0.22,
    style: 0.75,
    similarityBoost: 0.65,
    pace: "fast",
  },
  angry: {
    audioTags: ["angrily", "sternly"],
    stability: 0.35,
    style: 0.6,
    similarityBoost: 0.78,
    pace: "fast",
  },
  echo: {
    audioTags: ["cheerfully", "playfully"],
    stability: 0.3,
    style: 0.5,
    similarityBoost: 0.72,
    pace: "natural",
  },
  sad: {
    audioTags: ["sadly", "softly"],
    stability: 0.5,
    style: 0.4,
    similarityBoost: 0.8,
    pace: "slow",
  },
  whisper: {
    audioTags: ["whispers", "softly"],
    stability: 0.55,
    style: 0.3,
    similarityBoost: 0.85,
    pace: "slow",
  },
};

/**
 * Shape text for expressive rhythm + optional v3 audio tags.
 * Eleven v3 understands [emotion] tags in the text stream.
 */
export function shapeSpeechText(
  raw: string,
  emotion: VoiceEmotion,
  useAudioTags: boolean
): string {
  let text = raw.trim().replace(/\s+/g, " ");
  if (!text) return text;

  const delivery = EMOTION_DELIVERY[emotion] ?? EMOTION_DELIVERY.normal;

  // Natural rhythm: pause after commas / clauses; avoid run-on blurts
  text = text
    .replace(/([,;:])\s*/g, "$1 ")
    .replace(/([.!?])\s*/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();

  if (delivery.pace === "slow") {
    // Extra breath pauses for thoughtful delivery
    text = text.replace(/([.!?])\s+/g, "$1 ... ");
  } else if (delivery.pace === "fast") {
    // Keep energy but leave short beats after !
    text = text.replace(/!\s*/g, "! ");
  }

  if (useAudioTags && delivery.audioTags.length > 0) {
    // One leading emotion tag (v3) — keeps delivery consistent
    const tag = delivery.audioTags[0];
    // Avoid double-tagging if caller already added tags
    if (!/^\s*\[/.test(text)) {
      text = `[${tag}] ${text}`;
    }
  }

  return text;
}

export function voiceSettingsFor(emotion: VoiceEmotion) {
  const d = EMOTION_DELIVERY[emotion] ?? EMOTION_DELIVERY.normal;
  return {
    stability: d.stability,
    similarity_boost: d.similarityBoost,
    style: d.style,
    use_speaker_boost: true,
  };
}
