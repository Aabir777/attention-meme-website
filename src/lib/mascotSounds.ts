/** SFX + natural browser speech synthesis for the mascot companion. */

import type { VoiceEmotion } from "./voiceEmotions";

let audioCtx: AudioContext | null = null;
let speechGeneration = 0;
let cachedVoice: SpeechSynthesisVoice | null = null;
let cachedVoiceAt = 0;

export type SpeakOpts = {
  chaos?: VoiceEmotion;
  emotion?: VoiceEmotion;
  /** Prefer calm conversational delivery (Grok answers) */
  natural?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onSource?: (
    source: "browser" | "silent" | "error",
    detail?: string
  ) => void;
};

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

function beep(
  frequency: number,
  duration: number,
  type: OscillatorType = "square",
  gain = 0.08,
  slideTo?: number
) {
  const c = ctx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, c.currentTime);
  if (slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, slideTo),
      c.currentTime + duration
    );
  }
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(g);
  g.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration + 0.02);
}

export type SfxKind =
  | "boing"
  | "squeak"
  | "bonk"
  | "giggle"
  | "angry"
  | "tickle"
  | "pop"
  | "random";

export function playSfx(kind: SfxKind = "random") {
  const pick =
    kind === "random"
      ? (["boing", "squeak", "bonk", "giggle", "pop"] as const)[
          Math.floor(Math.random() * 5)
        ]
      : kind;

  switch (pick) {
    case "boing":
      beep(180, 0.18, "sine", 0.12, 520);
      setTimeout(() => beep(420, 0.12, "triangle", 0.06, 120), 80);
      break;
    case "squeak":
      beep(900, 0.08, "square", 0.05, 1400);
      setTimeout(() => beep(1200, 0.06, "square", 0.04, 700), 60);
      break;
    case "bonk":
      beep(90, 0.12, "sawtooth", 0.1, 40);
      setTimeout(() => beep(60, 0.15, "sine", 0.08), 40);
      break;
    case "giggle":
      [700, 900, 750, 1100, 800].forEach((f, i) => {
        setTimeout(() => beep(f, 0.07, "triangle", 0.05, f + 200), i * 70);
      });
      break;
    case "angry":
      beep(140, 0.2, "sawtooth", 0.1, 80);
      setTimeout(() => beep(100, 0.25, "square", 0.08, 50), 100);
      break;
    case "tickle":
      for (let i = 0; i < 6; i++) {
        setTimeout(
          () => beep(600 + Math.random() * 800, 0.05, "sine", 0.04),
          i * 45
        );
      }
      break;
    case "pop":
      beep(300, 0.05, "sine", 0.1, 80);
      break;
  }
}

export function stopSpeech() {
  speechGeneration += 1;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = v.name;
  const lang = v.lang || "";
  let s = 0;

  if (/^en(-|_|$)/i.test(lang)) s += 25;
  else if (/en/i.test(lang)) s += 10;
  else s -= 40;

  if (/neural|natural|premium|enhanced|online|wavenet|studio/i.test(name)) {
    s += 45;
  }
  if (
    /google us english|google uk english|microsoft (aria|jenny|guy|davis|sara|sonia|ana|ryan|christopher|michelle)/i.test(
      name
    )
  ) {
    s += 40;
  }
  if (
    /samantha|karen|moira|tessa|fiona|daniel|alex|victoria|allison|ava|susan/i.test(
      name
    )
  ) {
    s += 30;
  }
  if (/zira|mark|hazel/i.test(name)) s += 14;
  if (v.localService === false) s += 14; // cloud voices often more natural
  if (/en-US/i.test(lang)) s += 6;
  if (/en-GB/i.test(lang)) s += 4;
  if (/compact|espeak|novelty|robot|dummy/i.test(name)) s -= 55;

  return s;
}

export function pickBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }
  const now = Date.now();
  if (cachedVoice && now - cachedVoiceAt < 60_000) return cachedVoice;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const ranked = [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  cachedVoice = ranked[0] ?? null;
  cachedVoiceAt = now;
  return cachedVoice;
}

export function refreshVoices() {
  cachedVoice = null;
  cachedVoiceAt = 0;
  return pickBestVoice();
}

/** Shape text for clearer spoken delivery. */
export function shapeForSpeech(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/([,;:])\s*/g, "$1 ")
    .replace(/([.!?])\s*/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();
}

function applyEmotion(
  utter: SpeechSynthesisUtterance,
  emotion: VoiceEmotion,
  natural: boolean
) {
  if (natural || emotion === "normal") {
    // Conversational companion voice — warm, not cartoon-chipmunk
    utter.pitch = 1.05;
    utter.rate = 1.02;
    utter.volume = 1;
    return;
  }

  switch (emotion) {
    case "wild":
    case "excited":
      utter.pitch = 1.2;
      utter.rate = 1.1;
      utter.volume = 1;
      break;
    case "happy":
      utter.pitch = 1.1;
      utter.rate = 1.04;
      utter.volume = 1;
      break;
    case "echo":
      utter.pitch = 1.15;
      utter.rate = 1.05;
      utter.volume = 1;
      break;
    case "angry":
      utter.pitch = 0.88;
      utter.rate = 1.12;
      utter.volume = 1;
      break;
    case "sad":
      utter.pitch = 0.92;
      utter.rate = 0.9;
      utter.volume = 0.95;
      break;
    case "whisper":
      utter.pitch = 1.0;
      utter.rate = 0.92;
      utter.volume = 0.72;
      break;
    default:
      utter.pitch = 1.06;
      utter.rate = 1.02;
      utter.volume = 1;
  }
}

/**
 * Speak with the browser's most natural available voice.
 * Use natural:true for smart Grok answers.
 */
export function speakChaotic(text: string, opts?: SpeakOpts): void {
  const clean = shapeForSpeech(text);
  if (!clean) {
    opts?.onSource?.("silent");
    opts?.onEnd?.();
    return;
  }

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    opts?.onSource?.("error", "Speech synthesis not supported in this browser");
    opts?.onEnd?.();
    return;
  }

  stopSpeech();
  const gen = speechGeneration;
  const emotion: VoiceEmotion = opts?.emotion ?? opts?.chaos ?? "normal";
  const natural = opts?.natural === true || emotion === "normal";

  ctx();

  const utter = new SpeechSynthesisUtterance(clean);
  applyEmotion(utter, emotion, natural);

  const voice = pickBestVoice();
  if (voice) {
    utter.voice = voice;
    utter.lang = voice.lang || "en-US";
  }

  utter.onstart = () => {
    if (speechGeneration !== gen) return;
    opts?.onSource?.(
      "browser",
      voice ? `Voice: ${voice.name}` : "Browser speech synthesis"
    );
    opts?.onStart?.();
  };
  utter.onend = () => {
    if (speechGeneration !== gen) return;
    opts?.onEnd?.();
  };
  utter.onerror = () => {
    if (speechGeneration !== gen) return;
    opts?.onEnd?.();
  };

  const speakNow = () => {
    if (speechGeneration !== gen) return;
    window.speechSynthesis.cancel();
    // Re-pick if voices loaded late
    const v = pickBestVoice();
    if (v) {
      utter.voice = v;
      utter.lang = v.lang || "en-US";
    }
    window.speechSynthesis.speak(utter);
  };

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    const onVoices = () => {
      window.speechSynthesis.onvoiceschanged = null;
      refreshVoices();
      speakNow();
    };
    window.speechSynthesis.onvoiceschanged = onVoices;
    setTimeout(onVoices, 300);
  } else {
    refreshVoices();
    speakNow();
  }
}
