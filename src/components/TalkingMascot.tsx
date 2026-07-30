"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { echoLine, greetingLine, replyToMessage } from "@/lib/mascotChat";
import { pickFx, pickPhrase } from "@/lib/mascotReactions";
import { playSfx, speakChaotic, stopSpeech } from "@/lib/mascotSounds";
import type { MascotPart, MascotReaction } from "@/components/tom/MascotGLB";

const MascotStage = dynamic(
  () =>
    import("@/components/tom/MascotStage").then((m) => m.MascotStage),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center text-sm text-[#f5d547]/70">
        …
      </div>
    ),
  }
);

type Mode = "play" | "echo" | "chat";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    [i: number]: {
      [j: number]: { transcript: string; confidence?: number };
      isFinal?: boolean;
      length: number;
    };
    length: number;
  };
};

type FloatFx = {
  id: string;
  emoji: string;
  x: number;
  y: number;
  delay: number;
};

const PART_LINES: Record<
  MascotPart,
  {
    phrases: string[];
    sfx: "bonk" | "giggle" | "boing" | "pop";
    reaction: MascotReaction;
    fx: string[];
  }
> = {
  head: {
    phrases: [
      "Hey! My head!",
      "Bonk! Careful up there!",
      "Don't mess the tuft!",
      "Ow, reticle dizzy!",
    ],
    sfx: "bonk",
    reaction: "bonk",
    fx: ["💫", "⭐", "💥"],
  },
  body: {
    phrases: [
      "Hahaha that tickles!",
      "Hehe belly mode!",
      "Stoppp, I'm laughing!",
      "Giggle overload!",
    ],
    sfx: "giggle",
    reaction: "laugh",
    fx: ["😂", "💛", "✨"],
  },
  feet: {
    phrases: [
      "My golden toes!!",
      "Jump jump JUMP!",
      "Feet are ticklish!",
      "Up we go!",
    ],
    sfx: "boing",
    reaction: "jump",
    fx: ["👟", "⬆️", "💥"],
  },
};

/** How long after last final/interim speech before we treat the utterance as done */
const UTTERANCE_SILENCE_MS = 900;
/** Brief bounce reaction while user is mid-sentence */
const HEARING_REACT_MS = 650;

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function TalkingMascot() {
  const [mode, setMode] = useState<Mode>("chat");
  const [reaction, setReaction] = useState<MascotReaction>("idle");
  const [talking, setTalking] = useState(false);
  // Fixed initial bubble — random greetings must only run on client (avoids hydration mismatch)
  const [bubble, setBubble] = useState("Pay Attention.");
  const [heard, setHeard] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [alwaysOn, setAlwaysOn] = useState(false);
  const [hearing, setHearing] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  const [supported, setSupported] = useState({ mic: false, speak: false });
  const [fx, setFx] = useState<FloatFx[]>([]);
  /** Defer heavy WebGL/GLB until stage is near viewport — cleaner first open */
  const [stageReady, setStageReady] = useState(false);
  const stageMountRef = useRef<HTMLDivElement | null>(null);

  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  const busyRef = useRef(false);
  const pokeWindow = useRef<number[]>([]);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alwaysOnRef = useRef(false);
  const talkingRef = useRef(false);
  const thinkingRef = useRef(false);
  const modeRef = useRef<Mode>("chat");
  const sfxOnRef = useRef(true);
  const voiceOnRef = useRef(true);
  const pendingFinalRef = useRef("");
  const interimRef = useRef("");
  const lastHeardAtRef = useRef(0);
  const mountedRef = useRef(true);
  const startAlwaysListenRef = useRef<() => void>(() => {});
  const processUtteranceRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    alwaysOnRef.current = alwaysOn;
  }, [alwaysOn]);

  useEffect(() => {
    talkingRef.current = talking;
  }, [talking]);

  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    sfxOnRef.current = sfxOn;
  }, [sfxOn]);

  useEffect(() => {
    voiceOnRef.current = voiceOn;
  }, [voiceOn]);

  useEffect(() => {
    const el = stageMountRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setStageReady(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStageReady(true);
          io.disconnect();
        }
      },
      { rootMargin: "280px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    setSupported({
      mic: !!getSpeechRecognition(),
      speak: "speechSynthesis" in window,
    });
    // Random greeting only after mount (SSR-safe — avoids hydration mismatch)
    setBubble(greetingLine());
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => {
      mountedRef.current = false;
      stopSpeech();
      if (reactionTimer.current) clearTimeout(reactionTimer.current);
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      if (restartTimer.current) clearTimeout(restartTimer.current);
      try {
        recogRef.current?.abort();
      } catch {
        /* ignore */
      }
      recogRef.current = null;
    };
  }, []);

  const spawnFx = useCallback((emojis: string[]) => {
    setFx(pickFx(emojis, 7));
    setTimeout(() => setFx([]), 1100);
  }, []);

  const playReaction = useCallback((r: MascotReaction, ms = 900) => {
    setReaction(r);
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    if (
      r !== "talk" &&
      r !== "listen" &&
      r !== "think" &&
      r !== "idle"
    ) {
      reactionTimer.current = setTimeout(() => {
        setReaction((cur) => (cur === r ? "idle" : cur));
      }, ms);
    }
  }, []);

  const resumeListeningSoon = useCallback(() => {
    if (restartTimer.current) clearTimeout(restartTimer.current);
    restartTimer.current = setTimeout(() => {
      if (
        mountedRef.current &&
        alwaysOnRef.current &&
        !talkingRef.current &&
        !thinkingRef.current &&
        !busyRef.current
      ) {
        startAlwaysListenRef.current();
      }
    }, 280);
  }, []);

  const sayWithMouth = useCallback(
    (
      phrase: string,
      chaos:
        | "wild"
        | "happy"
        | "angry"
        | "echo"
        | "normal"
        | "excited" = "wild",
      opts?: { natural?: boolean }
    ) => {
      setBubble(phrase);

      const finishTalk = () => {
        setTalking(false);
        talkingRef.current = false;
        setReaction("idle");
        resumeListeningSoon();
      };

      if (!voiceOnRef.current) {
        setTalking(true);
        talkingRef.current = true;
        playReaction("talk");
        setTimeout(finishTalk, Math.min(4000, 700 + phrase.length * 40));
        return;
      }
      if (
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      ) {
        setTalking(true);
        talkingRef.current = true;
        playReaction("talk");
        setTimeout(finishTalk, 1000);
        return;
      }

      // Pause mic so TTS doesn't get heard as user speech
      try {
        recogRef.current?.abort();
      } catch {
        /* ignore */
      }
      setListening(false);
      setHearing(false);

      setTalking(true);
      talkingRef.current = true;
      playReaction("talk", 30000);

      const natural =
        opts?.natural === true ||
        chaos === "normal" ||
        chaos === "happy";

      speakChaotic(phrase, {
        emotion: natural ? "normal" : chaos,
        chaos: natural ? "normal" : chaos,
        natural,
        onStart: () => {
          setTalking(true);
          talkingRef.current = true;
          playReaction("talk", 30000);
        },
        onEnd: finishTalk,
      });
    },
    [playReaction, resumeListeningSoon]
  );

  const onPartClick = useCallback(
    (part: MascotPart) => {
      const now = Date.now();
      pokeWindow.current = pokeWindow.current.filter((t) => now - t < 2500);
      pokeWindow.current.push(now);

      if (sfxOnRef.current) playSfx("pop");

      if (pokeWindow.current.length >= 8) {
        pokeWindow.current = [];
        if (sfxOnRef.current) playSfx("boing");
        spawnFx(["😵", "⭐", "🌀"]);
        playReaction("dizzy", 1400);
        sayWithMouth("Wooo dizzy… stars everywhere!", "wild");
        return;
      }
      if (pokeWindow.current.length >= 5) {
        if (sfxOnRef.current) playSfx("angry");
        spawnFx(["💢", "😠", "⚡"]);
        playReaction("angry", 1200);
        sayWithMouth("HEY! Too much poking!", "angry");
        return;
      }

      const cfg = PART_LINES[part];
      if (sfxOnRef.current) playSfx(cfg.sfx);
      spawnFx(cfg.fx);
      playReaction(cfg.reaction, 950);
      sayWithMouth(
        pickPhrase(cfg.phrases),
        cfg.reaction === "laugh" ? "happy" : "wild"
      );
    },
    [playReaction, sayWithMouth, spawnFx]
  );

  const respond = useCallback(
    async (userText: string) => {
      const clean = userText.trim();
      if (!clean || busyRef.current) return;
      busyRef.current = true;
      thinkingRef.current = true;
      setHeard(clean);
      setLiveTranscript("");
      setThinking(true);
      setHearing(false);

      // Pause mic while we process / speak
      try {
        recogRef.current?.abort();
      } catch {
        /* ignore */
      }
      setListening(false);

      try {
        // Chat: fully local personality (no external API)
        if (modeRef.current === "chat") {
          setBubble("…");
          playReaction("think");
          // Tiny pause so think animation reads as “alive”
          await new Promise((r) => setTimeout(r, 280 + Math.random() * 220));
          if (!mountedRef.current) return;
          const reply = replyToMessage(clean);
          spawnFx(["💬", "✨", "💛"]);
          sayWithMouth(reply, "happy", { natural: true });
          return;
        }

        // Play / Echo — classic Talking Tom mirror
        spawnFx(["🔊", "🗣️", "😂"]);
        if (sfxOnRef.current) playSfx("giggle");
        playReaction("laugh", 700);
        const line =
          modeRef.current === "echo" ? echoLine(clean) : clean;
        setBubble(
          modeRef.current === "echo" ? line : `Hehe: “${clean}”`
        );
        sayWithMouth(clean, modeRef.current === "echo" ? "echo" : "wild");
      } catch {
        setBubble("Reticle glitch. Try again!");
        playReaction("dizzy", 800);
        resumeListeningSoon();
      } finally {
        setThinking(false);
        thinkingRef.current = false;
        busyRef.current = false;
      }
    },
    [playReaction, resumeListeningSoon, sayWithMouth, spawnFx]
  );

  const processUtterance = useCallback(
    (raw: string) => {
      const clean = raw.trim().replace(/\s+/g, " ");
      if (!clean || busyRef.current || talkingRef.current) return;
      pendingFinalRef.current = "";
      setLiveTranscript("");
      setHearing(false);

      // Fun reactive beat before reply
      playReaction("happy", HEARING_REACT_MS);
      spawnFx(["👂", "✨", "💛"]);
      if (sfxOnRef.current) playSfx("pop");

      void respond(clean);
    },
    [playReaction, respond, spawnFx]
  );

  useEffect(() => {
    processUtteranceRef.current = processUtterance;
  }, [processUtterance]);

  const scheduleUtteranceFlush = useCallback(() => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => {
      const text = (
        pendingFinalRef.current ||
        interimRef.current ||
        ""
      ).trim();
      if (text) {
        interimRef.current = "";
        processUtteranceRef.current(text);
      }
    }, UTTERANCE_SILENCE_MS);
  }, []);

  const startAlwaysListen = useCallback(() => {
    if (!mountedRef.current) return;
    if (talkingRef.current || thinkingRef.current || busyRef.current) return;

    const Ctor = getSpeechRecognition();
    if (!Ctor) return;

    // Tear down previous instance
    try {
      recogRef.current?.abort();
    } catch {
      /* ignore */
    }

    const recog = new Ctor();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";
    if (typeof recog.maxAlternatives === "number") {
      recog.maxAlternatives = 1;
    }
    recogRef.current = recog;

    recog.onstart = () => {
      if (!mountedRef.current) return;
      setListening(true);
      if (!talkingRef.current && !thinkingRef.current) {
        setReaction((r) =>
          r === "talk" || r === "laugh" || r === "angry" || r === "dizzy"
            ? r
            : "listen"
        );
      }
    };

    recog.onspeechstart = () => {
      if (talkingRef.current || busyRef.current) return;
      setHearing(true);
      playReaction("listen");
      lastHeardAtRef.current = Date.now();
    };

    recog.onspeechend = () => {
      // Flush shortly after browser detects speech end
      scheduleUtteranceFlush();
    };

    recog.onresult = (event) => {
      if (talkingRef.current || busyRef.current || thinkingRef.current) return;

      let interim = "";
      let finals = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript ?? "";
        const isFinal = event.results[i].isFinal === true;
        if (isFinal) finals += piece;
        else interim += piece;
      }

      if (finals) {
        pendingFinalRef.current = (
          pendingFinalRef.current +
          " " +
          finals
        ).trim();
        interimRef.current = "";
        lastHeardAtRef.current = Date.now();
        setHeard(pendingFinalRef.current);
        setLiveTranscript(pendingFinalRef.current);
        setBubble(`Hearing: “${pendingFinalRef.current}”`);
        setHearing(true);
        // Head bob / happy twitch while they talk
        playReaction("happy", 500);
        scheduleUtteranceFlush();
      } else if (interim) {
        interimRef.current = interim;
        const live = (pendingFinalRef.current + " " + interim).trim();
        lastHeardAtRef.current = Date.now();
        setLiveTranscript(live);
        setBubble(`Hearing: “${live}”`);
        setHearing(true);
        setReaction("listen");
        // Keep extending the flush window while they keep talking
        scheduleUtteranceFlush();
      }
    };

    recog.onerror = (e) => {
      if (!mountedRef.current) return;
      if (
        e.error === "aborted" ||
        e.error === "no-speech" ||
        e.error === "network"
      ) {
        setHearing(false);
        return;
      }
      if (e.error === "not-allowed") {
        setAlwaysOn(false);
        alwaysOnRef.current = false;
        setListening(false);
        setHearing(false);
        setBubble("Mic blocked.");
      }
    };

    recog.onend = () => {
      if (!mountedRef.current) return;
      setListening(false);
      // Auto-restart continuous listening (browsers end sessions often)
      if (
        alwaysOnRef.current &&
        !talkingRef.current &&
        !thinkingRef.current &&
        !busyRef.current
      ) {
        if (restartTimer.current) clearTimeout(restartTimer.current);
        restartTimer.current = setTimeout(() => {
          if (
            alwaysOnRef.current &&
            !talkingRef.current &&
            !thinkingRef.current
          ) {
            startAlwaysListenRef.current();
          }
        }, 200);
      }
    };

    try {
      recog.start();
      setAlwaysOn(true);
      alwaysOnRef.current = true;
    } catch {
      setListening(true);
      setAlwaysOn(true);
      alwaysOnRef.current = true;
    }
  }, [playReaction, scheduleUtteranceFlush]);

  useEffect(() => {
    startAlwaysListenRef.current = startAlwaysListen;
  }, [startAlwaysListen]);

  const stopAlwaysListen = useCallback(() => {
    alwaysOnRef.current = false;
    setAlwaysOn(false);
    setListening(false);
    setHearing(false);
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    if (restartTimer.current) clearTimeout(restartTimer.current);
    try {
      recogRef.current?.abort();
    } catch {
      /* ignore */
    }
    recogRef.current = null;
    pendingFinalRef.current = "";
    setLiveTranscript("");
    setBubble(greetingLine());
    setReaction("idle");
  }, []);

  const toggleAlwaysListen = useCallback(() => {
    if (alwaysOnRef.current) {
      stopAlwaysListen();
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.getVoices();
      }
      startAlwaysListen();
      if (sfxOnRef.current) playSfx("pop");
      playReaction("listen");
    }
  }, [playReaction, startAlwaysListen, stopAlwaysListen]);

  return (
    <section
      id="talk"
      className="relative scroll-mt-28 border-t border-white/[0.06] py-16 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(245,213,71,0.07),transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section heading */}
        <div className="mb-10 text-center sm:mb-12">
          <p className="section-label">Live companion</p>
          <h2 className="font-display mt-3 text-3xl uppercase tracking-[0.06em] text-white sm:text-5xl">
            Talk to our{" "}
            <span className="text-gold-gradient">mascot</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/45 sm:text-base">
            Chat, poke, and play. Always listening. Pay Attention.
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-[#f5d547]/50 to-transparent" />
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          {/* 3D STAGE */}
          <div className="relative">
            {/* Speech bubble */}
            <div className="absolute left-1/2 top-3 z-30 w-[min(100%,20rem)] -translate-x-1/2 sm:top-4">
              <div
                key={bubble + (liveTranscript ? "-live" : "")}
                className={`speech-bubble relative rounded-2xl border px-4 py-3 backdrop-blur transition ${
                  hearing
                    ? "border-emerald-400/40 bg-[#0f1a14]/95"
                    : talking
                      ? "border-[#f5d547]/45 bg-[#1a1608]/95"
                      : "border-[#f5d547]/30 bg-[#141414]/95"
                }`}
              >
                <p className="text-center text-sm font-semibold leading-snug text-white">
                  {bubble}
                </p>
                {(heard || liveTranscript) && (
                  <p className="mt-1.5 text-center text-[11px] text-white/40">
                    {liveTranscript || heard}
                  </p>
                )}
                <span className="speech-tail" />
              </div>
            </div>

            {/* Soft status dot only */}
            {alwaysOn && (
              <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
                <span
                  className={`block h-2 w-2 rounded-full ${
                    hearing
                      ? "bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse"
                      : listening
                        ? "bg-[#f5d547] shadow-[0_0_12px_#f5d547] animate-pulse"
                        : "bg-white/30"
                  }`}
                />
              </div>
            )}

            {fx.map((p) => (
              <span
                key={p.id}
                className="tom-fx pointer-events-none absolute z-20 text-2xl"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  animationDelay: `${p.delay}ms`,
                }}
              >
                {p.emoji}
              </span>
            ))}

            <div
              ref={stageMountRef}
              className="mascot-hero-frame relative mx-auto aspect-[4/5] w-full max-w-xl min-h-[420px] bg-[#08080c]"
            >
              <div className="pointer-events-none absolute -inset-6 z-0 rounded-[2.5rem] bg-[radial-gradient(ellipse_at_50%_60%,rgba(245,213,71,0.16),transparent_70%)] blur-2xl" />
              <div className="relative z-[1] h-full min-h-[420px] w-full">
                {stageReady ? (
                  <MascotStage
                    reaction={reaction}
                    talking={talking}
                    listening={listening || alwaysOn}
                    hearing={hearing}
                    onPartClick={onPartClick}
                  />
                ) : (
                  <div className="grid h-full min-h-[420px] place-items-center rounded-3xl border border-white/10 bg-[#0a0a10]">
                    <div className="flex flex-col items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#f5d547]" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                        Loading mascot
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="stage-glow-ring z-[2]" />
            </div>
          </div>

          {/* CLEAN CHAT */}
          <div className="glass-panel sticky top-24 rounded-[1.75rem] p-5 sm:p-6">
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f5d547]/80">
                Chatbot
              </p>
              <h3 className="font-display mt-1 text-xl uppercase tracking-wide text-white sm:text-2xl">
                Talk to our mascot
              </h3>
            </div>
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="inline-flex rounded-full border border-white/[0.08] bg-black/50 p-1">
                {(
                  [
                    ["chat", "Chat"],
                    ["play", "Play"],
                    ["echo", "Echo"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMode(id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                      mode === id
                        ? "bg-[#f5d547] text-black"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={!supported.mic || thinking}
                onClick={toggleAlwaysListen}
                className={`flex h-12 w-12 items-center justify-center rounded-full text-xl transition ${
                  alwaysOn
                    ? hearing
                      ? "bg-emerald-500 text-white tom-mic-pulse"
                      : "bg-red-500/90 text-white"
                    : "bg-[#f5d547] text-black hover:brightness-110"
                } disabled:opacity-40`}
                aria-label={alwaysOn ? "Mute mic" : "Enable mic"}
              >
                {alwaysOn ? "●" : "🎤"}
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!text.trim() || thinking) return;
                const msg = text;
                setText("");
                void respond(msg);
              }}
              className="flex gap-2"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={thinking}
                placeholder="Message…"
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#f5d547]/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={thinking || !text.trim()}
                className="rounded-2xl bg-[#f5d547] px-5 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-40"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
