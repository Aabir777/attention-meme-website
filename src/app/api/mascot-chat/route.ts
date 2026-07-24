import { NextResponse } from "next/server";
import { replyToMessage } from "@/lib/mascotChat";

export const runtime = "nodejs";

/**
 * Local-only mascot chat. No external AI / XAI key required.
 * Kept so older clients calling this endpoint still work.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { message?: string };
    const message = (body.message ?? "").trim().slice(0, 500);
    if (!message) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    return NextResponse.json({
      reply: replyToMessage(message),
      source: "local" as const,
    });
  } catch (err) {
    console.error("[mascot-chat]", err);
    return NextResponse.json({
      reply: "My reticle glitched for a sec. Say that again?",
      source: "local" as const,
    });
  }
}

export async function GET() {
  return NextResponse.json({
    aiEnabled: false,
    localOnly: true,
    model: "local-personality",
  });
}
