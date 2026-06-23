import { useCallback, useState } from 'react'
import type { BingoCard, CategoryId, GameState } from '../types'
import { generateCard } from '../lib/cardGenerator'
import { checkForBingo, countFilled } from '../lib/bingoChecker'

const INITIAL_STATE: GameState = {
  status: 'idle',
  category: null,
  card: null,
  isListening: false,
  startedAt: null,
  completedAt: null,
  winningLine: null,
  winningWord: null,
  filledCount: 0,
}

/** Deep-ish clone of a card so toggles never mutate prior state. */
function cloneCard(card: BingoCard): BingoCard {
  return {
    words: card.words,
    squares: card.squares.map((row) => row.map((sq) => ({ ...sq }))),
  }
}

function freshGameForCategory(categoryId: CategoryId): GameState {
  const card = generateCard(categoryId)
  return {
    ...INITIAL_STATE,
    status: 'playing',
    category: categoryId,
    card,
    startedAt: Date.now(),
    filledCount: countFilled(card),
  }
}

export interface UseGame {
  game: GameState
  startGame: (categoryId: CategoryId) => void
  /** New card from the current category. */
  newCard: () => void
  /** Toggle a square's filled state (no-op on the FREE space). */
  toggleSquare: (id: string) => void
  /** Auto-fill squares matching detected words (from speech). */
  autoFill: (words: string[]) => void
  /** Back to the initial idle state. */
  reset: () => void
}

export function useGame(): UseGame {
  const [game, setGame] = useState<GameState>(INITIAL_STATE)

  const startGame = useCallback((categoryId: CategoryId) => {
    setGame(freshGameForCategory(categoryId))
  }, [])

  const newCard = useCallback(() => {
    setGame((prev) => (prev.category ? freshGameForCategory(prev.category) : prev))
  }, [])

  const reset = useCallback(() => setGame(INITIAL_STATE), [])

  const toggleSquare = useCallback((id: string) => {
    setGame((prev) => {
      if (!prev.card || prev.status === 'won') return prev

      const card = cloneCard(prev.card)
      let toggledWord: string | null = null
      for (const row of card.squares) {
        for (const sq of row) {
          if (sq.id === id && !sq.isFreeSpace) {
            sq.isFilled = !sq.isFilled
            sq.isAutoFilled = false // manual action overrides auto-fill flag
            sq.filledAt = sq.isFilled ? Date.now() : null
            toggledWord = sq.isFilled ? sq.word : null
          }
        }
      }

      const filledCount = countFilled(card)
      const winningLine = checkForBingo(card)

      if (winningLine) {
        return {
          ...prev,
          card,
          filledCount,
          status: 'won',
          winningLine,
          winningWord: toggledWord,
          completedAt: Date.now(),
        }
      }

      return { ...prev, card, filledCount }
    })
  }, [])

  const autoFill = useCallback((words: string[]) => {
    if (words.length === 0) return
    setGame((prev) => {
      if (!prev.card || prev.status === 'won') return prev

      const wanted = new Set(words.map((w) => w.toLowerCase()))
      const card = cloneCard(prev.card)
      let lastFilledWord: string | null = null
      let changed = false

      for (const row of card.squares) {
        for (const sq of row) {
          if (!sq.isFreeSpace && !sq.isFilled && wanted.has(sq.word.toLowerCase())) {
            sq.isFilled = true
            sq.isAutoFilled = true
            sq.filledAt = Date.now()
            lastFilledWord = sq.word
            changed = true
          }
        }
      }

      if (!changed) return prev

      const filledCount = countFilled(card)
      const winningLine = checkForBingo(card)

      if (winningLine) {
        return {
          ...prev,
          card,
          filledCount,
          status: 'won',
          winningLine,
          winningWord: lastFilledWord,
          completedAt: Date.now(),
        }
      }

      return { ...prev, card, filledCount }
    })
  }, [])

  return { game, startGame, newCard, toggleSquare, autoFill, reset }
}
