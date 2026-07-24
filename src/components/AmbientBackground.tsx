/** Lightweight ambient luxury — CSS particles + soft gold glows (no canvas). */

export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* Soft gold atmosphere */}
      <div className="glow-orb -left-24 top-[-10%] h-[42vh] w-[42vh] bg-[#f5d547]/[0.07]" />
      <div className="glow-orb right-[-15%] top-[30%] h-[36vh] w-[36vh] bg-[#c9a227]/[0.06]" />
      <div className="glow-orb bottom-[-5%] left-[20%] h-[30vh] w-[30vh] bg-[#f5d547]/[0.04]" />

      {/* Subtle grid fade */}
      <div className="bg-grid absolute inset-0 opacity-80" />

      {/* Gold dust particles */}
      <div className="gold-dust">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      {/* Edge vignette */}
      <div className="bg-vignette absolute inset-0" />
    </div>
  );
}
