/** Instant dark shell while a route streams — prevents white flash on open. */
export default function Loading() {
  return (
    <div
      className="grid min-h-[70dvh] place-items-center px-4 pt-28"
      style={{ backgroundColor: "#030306" }}
      aria-busy
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#f5d547] shadow-[0_0_16px_rgba(245,213,71,0.6)]" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
          Pay Attention
        </p>
      </div>
    </div>
  );
}
