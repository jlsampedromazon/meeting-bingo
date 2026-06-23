import type { BingoCard as BingoCardType } from '../types'
import { BingoSquare } from './BingoSquare'

interface Props {
  card: BingoCardType
  /** Square IDs in the completed winning line. */
  winningIds?: Set<string>
  /** Square IDs in the one-away line (highlighted hint). */
  oneAwayIds?: Set<string>
  onToggle: (id: string) => void
}

export function BingoCard({ card, winningIds, oneAwayIds, onToggle }: Props) {
  return (
    <div
      role="group"
      aria-label="Bingo card"
      className="grid grid-cols-5 gap-1.5 sm:gap-2"
    >
      {card.squares.flat().map((square) => (
        <BingoSquare
          key={square.id}
          square={square}
          isWinning={winningIds?.has(square.id)}
          isOneAway={oneAwayIds?.has(square.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}
