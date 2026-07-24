import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import {
  shapeSpeechText,
  voiceSettingsFor,
  type VoiceEmotion,
} from "@/lib/voiceEmotions";

export const runtime = "nodejs";

const MAX_CHARS = 500;

const EMOTIONS = new Set<VoiceEmotion>([
  "wild",
  "happy",
  "angry",
  "echo",
  "normal",
  "sad",
  "whisper",
  "excited",
]);

function getConfig() {
  const apiKey = env("ELEVENLABS_API_KEY");
  const voiceId = env("ELEVENLABS_VOICE_ID") || "21m00Tcm4TlvDq8ikWAM";
  const modelId = env("ELEVENLABS_MODEL_ID") || "eleven_multilingual_v2";
  const useAudioTags =
    /v3/i.test(modelId) || env("ELEVENLABS_USE_AUDIO_TAGS") === "true";
  return { apiKey, voiceId, modelId, useAudioTags, configured: Boolean(apiKey) };
}

/**
 * POST /api/tts
 * Body: { text, emotion? }
 * Returns: audio/mpeg from ElevenLabs
 */
export async function POST(req: Request) {
  try {
    const { apiKey, voiceId, modelId, useAudioTags, configured } = getConfig();

    if (!configured) {
      return NextResponse.json(
        {
          error: "ELEVENLABS_API_KEY is empty in .env.local",
          configured: false,
          hint: "Add ELEVENLABS_API_KEY=sk_... then restart npm run dev",
        },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      text?: string;
      emotion?: string;
    };

    const raw = (body.text ?? "").trim().slice(0, MAX_CHARS);
    if (!raw) {
      return NextResponse.json({ error: "Empty text" }, { status: 400 });
    }

    const emotion = (
      EMOTIONS.has(body.emotion as VoiceEmotion)
        ? body.emotion
        : "normal"
    ) as VoiceEmotion;

    const text = shapeSpeechText(raw, emotion, useAudioTags);
    const voice_settings = voiceSettingsFor(emotion);

    // Some models reject "style" — send a safe payload
    const payload: Record<string, unknown> = {
      text,
      model_id: modelId,
      voice_settings: {
        stability: voice_settings.stability,
        similarity_boost: voice_settings.similarity_boost,
        use_speaker_boost: true,
      },
    };

    // style is supported on multilingual_v2; skip on flash/turbo if issues arise
    if (!/flash|turbo/i.test(modelId)) {
      (payload.voice_settings as Record<string, unknown>).style =
        voice_settings.style;
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[tts] ElevenLabs error", res.status, errText.slice(0, 500));

      let hint = "Check API key, voice ID, and account credits.";
      if (res.status === 401) hint = "Invalid ELEVENLABS_API_KEY.";
      if (res.status === 402) {
        // Free plan: library voices blocked on API
        if (/paid_plan|Free users cannot use library voices/i.test(errText)) {
          hint =
            "Your ElevenLabs plan is FREE. Library voices cannot be used via API. Upgrade to Starter (or higher) at elevenlabs.io/app/subscription, then click Test voice again.";
        } else {
          hint = "ElevenLabs payment/quota issue — add credits or upgrade plan.";
        }
      }
      if (res.status === 404) hint = "Voice ID not found — set ELEVENLABS_VOICE_ID.";
      if (res.status === 422) hint = "Bad model/settings — try eleven_multilingual_v2.";

      return NextResponse.json(
        {
          error: "ElevenLabs TTS failed",
          status: res.status,
          detail: errText.slice(0, 300),
          hint,
          configured: true,
        },
        { status: 502 }
      );
    }

    const audio = await res.arrayBuffer();
    if (!audio.byteLength) {
      return NextResponse.json(
        { error: "Empty audio from ElevenLabs", configured: true },
        { status: 502 }
      );
    }

    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "X-Voice-Emotion": emotion,
        "X-Voice-Model": modelId,
        "X-Voice-Source": "elevenlabs",
      },
    });
  } catch (err) {
    console.error("[tts]", err);
    return NextResponse.json(
      {
        error: "TTS route failed",
        detail: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { configured, modelId, voiceId, apiKey } = getConfig();
  return NextResponse.json({
    configured,
    model: modelId,
    voiceId: voiceId.slice(0, 4) + "…",
    keyPrefix: configured ? apiKey.slice(0, 6) + "…" : null,
    message: configured
      ? "ElevenLabs ready"
      : "Add ELEVENLABS_API_KEY to .env.local and restart the server",
  });
}
