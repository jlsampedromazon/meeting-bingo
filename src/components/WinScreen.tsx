import { useEffect, useMemo, useState } from 'react'
import type { GameState } from '../types'
import { CATEGORIES } from '../data/categories'
import { fireConfetti } from '../lib/confetti'
import { formatDuration, shareResult, type ShareOutcome } from '../lib/shareUtils'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { BingoCard } from './BingoCard'
import { Button } from './ui/Button'

interface Props {
  game: GameState
  onNewCard: () => void
  onChangeCategory: () => void
}

const SHARE_FEEDBACK: Record<ShareOutcome, string> = {
  shared: 'Shared!',
  copied: 'Copied to clipboard!',
  failed: 'Could not share — try again.',
}

export function WinScreen({ game, onNewCard, onChangeCategory }: Props) {
  const reducedMotion = useReducedMotion()
  const [shareMsg, setShareMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!reducedMotion) fireConfetti()
  }, [reducedMotion])

  const categoryName = CATEGORIES.find((c) => c.id === game.category)?.name ?? '—'
  const filledCount = Math.max(0, game.filledCount - 1)
  const timeToBingo =
    game.startedAt != null && game.completedAt != null
      ? formatDuration(game.completedAt - game.startedAt)
      : null

  const winningIds = useMemo(
    () => new Set(game.winningLine?.squares ?? []),
    [game.winningLine],
  )

  const handleShare = async () => {
    const outcome = await shareResult(game)
    setShareMsg(SHARE_FEEDBACK[outcome])
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 text-center">
      {/* role="alert" is announced when inserted into the DOM (this mounts on win). */}
      <p role="alert" className="sr-only">
        Bingo! You won{game.winningWord ? ` with ${game.winningWord}` : ''}.
      </p>

      <h1 className="text-5xl font-extrabold tracking-tight text-emerald-400">BINGO!</h1>

      <dl className="grid w-full grid-cols-2 gap-3 text-left">
        <Stat label="Category" value={categoryName} />
        <Stat label="Time to bingo" value={timeToBingo ?? '—'} />
        <Stat label="Winning word" value={game.winningWord ?? '—'} />
        <Stat label="Squares marked" value={`${filledCount}/24`} />
      </dl>

      {game.card && (
        <BingoCard card={game.card} winningIds={winningIds} interactive={false} />
      )}

      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={handleShare}>Share result</Button>
          <Button variant="secondary" onClick={onNewCard}>
            New card
          </Button>
          <Button variant="ghost" onClick={onChangeCategory}>
            Change category
          </Button>
        </div>
        <p className="h-4 text-xs text-slate-400" aria-live="polite">
          {shareMsg}
        </p>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-800/60 px-3 py-2">
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-100">{value}</dd>
    </div>
  )
}
