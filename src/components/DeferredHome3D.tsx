"use client";

import dynamic from "next/dynamic";

/**
 * Heavy 3D never blocks first paint — client-only + reserved layout shells.
 */

function AboutStageShell() {
  return (
    <div
      className="mx-auto aspect-[4/5] w-full max-w-sm rounded-[1.75rem] border border-white/10 bg-[#08080c] lg:max-w-none"
      aria-hidden
    >
      <div className="grid h-full min-h-[280px] place-items-center">
        <span className="h-2 w-2 rounded-full bg-[#f5d547]/50" />
      </div>
    </div>
  );
}

function TalkSectionShell() {
  return (
    <section
      className="relative min-h-[70vh] border-t border-white/[0.06] bg-[#030306] py-16 sm:py-24"
      aria-hidden
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 h-20 rounded-2xl bg-white/[0.02]" />
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="aspect-[4/5] min-h-[420px] rounded-[2rem] border border-white/10 bg-[#08080c]" />
          <div className="h-80 rounded-[1.75rem] border border-white/10 bg-[#121212]/80" />
        </div>
      </div>
    </section>
  );
}

const AboutMascot3D = dynamic(
  () =>
    import("@/components/AboutMascot3D").then((m) => m.AboutMascot3D),
  { ssr: false, loading: () => <AboutStageShell /> }
);

const TalkingMascot = dynamic(
  () =>
    import("@/components/TalkingMascot").then((m) => m.TalkingMascot),
  { ssr: false, loading: () => <TalkSectionShell /> }
);

export function AboutMascotSlot() {
  return <AboutMascot3D />;
}

export function TalkingMascotSlot() {
  return <TalkingMascot />;
}
