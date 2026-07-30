/** Full dark shell matching the site — no white flash, no partial UI. */
export default function Loading() {
  return (
    <div
      className="min-h-dvh bg-[#030306] pt-28"
      style={{ backgroundColor: "#030306" }}
      aria-busy
      aria-label="Loading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl space-y-5 py-16">
          <div className="h-6 w-40 rounded-full bg-white/[0.06]" />
          <div className="h-14 w-full max-w-md rounded-xl bg-white/[0.05]" />
          <div className="h-14 w-3/4 max-w-sm rounded-xl bg-white/[0.04]" />
          <div className="h-4 w-full max-w-lg rounded bg-white/[0.04]" />
          <div className="flex gap-2 pt-4">
            <div className="h-11 w-36 rounded-full bg-[#f5d547]/20" />
            <div className="h-11 w-32 rounded-full bg-white/[0.06]" />
          </div>
        </div>
      </div>
    </div>
  );
}
