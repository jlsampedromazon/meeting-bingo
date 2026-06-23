/**
 * Persistent banner shown when the Web Speech API is unavailable (Firefox) or
 * present-but-disabled at runtime (e.g. Brave blocks the speech backend).
 * The game stays fully playable via manual taps (plan §5 Phase 2.5).
 */
export function UnsupportedBanner() {
  return (
    <div
      role="status"
      className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-center text-sm text-amber-200"
    >
      Speech recognition isn&rsquo;t available in this browser (some, like Brave, disable
      it) — tap squares manually to play. Try Chrome or Safari for auto-fill.
    </div>
  )
}
