import { Suspense } from "react";
import { MakerApp } from "@/components/MakerApp";

export const metadata = {
  title: "Meme Generator | ATTENTION $attention",
  description:
    "Generate Attention mascot memes. Templates, captions, PFP maker. The first asset.",
};

export default function MakerPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#030306] pt-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,213,71,0.08),transparent_50%)]" />
      <Suspense
        fallback={
          <div className="grid min-h-[50vh] place-items-center bg-[#030306] pt-24 text-sm text-white/40">
            Loading maker…
          </div>
        }
      >
        <MakerApp />
      </Suspense>
    </div>
  );
}
