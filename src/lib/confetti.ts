import confetti from 'canvas-confetti'

/**
 * A discreet, bounded celebration burst (UXR Principle 3 — professional read,
 * no sound). Callers must gate this behind prefers-reduced-motion.
 */
export function fireConfetti(): void {
  const common: confetti.Options = {
    spread: 70,
    startVelocity: 35,
    gravity: 1,
    ticks: 200,
    colors: ['#34d399', '#38bdf8', '#fbbf24', '#f472b6'],
    disableForReducedMotion: true,
  }
  // Two small side bursts — short and bounded, not a screen-filling shower.
  confetti({ ...common, particleCount: 40, origin: { x: 0.2, y: 0.7 } })
  confetti({ ...common, particleCount: 40, origin: { x: 0.8, y: 0.7 } })
}
