import type { GameState } from '../types'
import { CATEGORIES } from '../data/categories'

/** Format a millisecond duration as m:ss. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/** The URL receivers can open to play immediately (viral loop, PRD US-4.3). */
export function getPlayUrl(): string {
  if (typeof window === 'undefined') return ''
  return window.location.origin + window.location.pathname
}

/** Build the shareable result summary, including the play URL. */
export function buildShareText(game: GameState, playUrl: string = getPlayUrl()): string {
  const categoryName =
    CATEGORIES.find((c) => c.id === game.category)?.name ?? 'Meeting Bingo'

  const parts = [`🎉 BINGO! I won Meeting Bingo (${categoryName}).`]
  if (game.startedAt != null && game.completedAt != null) {
    parts.push(`Time to bingo: ${formatDuration(game.completedAt - game.startedAt)}.`)
  }
  if (game.winningWord) {
    parts.push(`Winning buzzword: “${game.winningWord}”.`)
  }
  if (playUrl) parts.push(`Play: ${playUrl}`)
  return parts.join(' ')
}

export type ShareOutcome = 'shared' | 'copied' | 'failed'

/**
 * Share the result via the native share sheet when available (mobile),
 * otherwise copy to the clipboard. Returns what happened so the UI can
 * confirm. A cancelled native share resolves to 'failed' (no surprise copy).
 */
export async function shareResult(
  game: GameState,
  playUrl: string = getPlayUrl(),
): Promise<ShareOutcome> {
  const text = buildShareText(game, playUrl)

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'Meeting Bingo', text })
      return 'shared'
    } catch {
      return 'failed' // cancelled or unavailable
    }
  }

  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
