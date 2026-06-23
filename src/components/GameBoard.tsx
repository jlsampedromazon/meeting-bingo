import { useMemo } from 'react'
import type { GameState } from '../types'
import { getClosestToWin } from '../lib/bingoChecker'
import { CATEGORIES } from '../data/categories'
import { BingoCard } from './BingoCard'
import { GameControls } from './GameControls'

interface Props {
  game: GameState
  onToggle: (id: string) => void
  onNewCard: () => void
  onChangeCategory: () => void
}

/** 24 togglable (non-free) squares per card. */
const TOGGLABLE_SQUARES = 24

export function GameBoard({ game, onToggle, onNewCard, onChangeCategory }: Props) {
  const { card, category, filledCount } = game

  const closest = useMemo(() => (card ? getClosestToWin(card) : null), [card])
  const oneAwayIds = useMemo(
    () => (closest?.needed === 1 ? new Set(closest.squares) : undefined),
    [closest],
  )

  if (!card) return null

  const categoryName = CATEGORIES.find((c) => c.id === category)?.name ?? 'Bingo'
  // filledCount includes the FREE center; the counter tracks the 24 real squares.
  const markedReal = Math.max(0, filledCount - 1)

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <header className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-slate-100">{categoryName}</h1>
        <p className="text-sm text-slate-400" aria-live="polite">
          <span className="font-semibold text-slate-200">
            {markedReal}/{TOGGLABLE_SQUARES}
          </span>{' '}
          marked
        </p>
      </header>

      {closest?.needed === 1 && (
        <p
          className="rounded-md bg-amber-500/15 px-3 py-1.5 text-center text-sm font-medium text-amber-300"
          aria-live="polite"
        >
          One away on {closest.line}!
        </p>
      )}

      <BingoCard card={card} oneAwayIds={oneAwayIds} onToggle={onToggle} />

      <GameControls onNewCard={onNewCard} onChangeCategory={onChangeCategory} />
    </div>
  )
}
