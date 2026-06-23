import type { BingoSquare as BingoSquareType } from '../types'
import { cn } from '../lib/utils'

interface Props {
  square: BingoSquareType
  /** Part of the completed winning line. */
  isWinning?: boolean
  /** Part of the line that is one square from winning. */
  isOneAway?: boolean
  onToggle: (id: string) => void
}

export function BingoSquare({ square, isWinning, isOneAway, onToggle }: Props) {
  const { isFilled, isFreeSpace, word } = square

  return (
    <button
      type="button"
      onClick={() => onToggle(square.id)}
      disabled={isFreeSpace}
      aria-pressed={isFilled}
      aria-label={`${word}${isFilled ? ', marked' : ''}`}
      className={cn(
        'relative flex aspect-square items-center justify-center overflow-hidden rounded-md border-2 p-1 text-center',
        'text-[11px] font-medium leading-tight sm:text-sm',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-sky-400',
        // Unfilled
        !isFilled && 'border-slate-600 bg-slate-800 text-slate-200 hover:border-slate-400',
        // Filled (color + a non-color check cue via ::before content below)
        isFilled && 'border-emerald-400 bg-emerald-600 text-white',
        // One-away hint (non-winning)
        isOneAway && !isWinning && 'ring-2 ring-amber-400/70',
        // Winning line
        isWinning && 'border-yellow-300 bg-emerald-500 ring-2 ring-yellow-300',
        isFreeSpace && 'cursor-default',
      )}
    >
      {/* Non-color cue: a checkmark badge whenever filled (colorblind-safe). */}
      {isFilled && !isFreeSpace && (
        <span
          aria-hidden="true"
          className="absolute right-0.5 top-0.5 text-[10px] font-bold text-white"
        >
          ✓
        </span>
      )}
      <span className={cn('break-words', isFreeSpace && 'font-bold uppercase tracking-wide')}>
        {isFreeSpace ? '★ FREE' : word}
      </span>
    </button>
  )
}
