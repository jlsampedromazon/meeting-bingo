import type { BingoCard, BingoSquare, WinningLine } from '../types'

/** The 12 winning lines as (name, squares) for reuse across checks. */
function allLines(
  squares: BingoSquare[][],
): { type: WinningLine['type']; index: number; name: string; cells: BingoSquare[] }[] {
  const lines: ReturnType<typeof allLines> = []

  for (let row = 0; row < 5; row++) {
    lines.push({ type: 'row', index: row, name: `Row ${row + 1}`, cells: squares[row] })
  }
  for (let col = 0; col < 5; col++) {
    lines.push({
      type: 'column',
      index: col,
      name: `Column ${col + 1}`,
      cells: squares.map((r) => r[col]),
    })
  }
  lines.push({
    type: 'diagonal',
    index: 0,
    name: 'Diagonal ↘',
    cells: [0, 1, 2, 3, 4].map((i) => squares[i][i]),
  })
  lines.push({
    type: 'diagonal',
    index: 1,
    name: 'Diagonal ↙',
    cells: [0, 1, 2, 3, 4].map((i) => squares[i][4 - i]),
  })

  return lines
}

/**
 * Return the first complete winning line (5 rows + 5 cols + 2 diagonals = 12),
 * or null. The FREE center participates in its row, column, and both diagonals.
 */
export function checkForBingo(card: BingoCard): WinningLine | null {
  for (const line of allLines(card.squares)) {
    if (line.cells.every((sq) => sq.isFilled)) {
      return { type: line.type, index: line.index, squares: line.cells.map((sq) => sq.id) }
    }
  }
  return null
}

/**
 * Count filled squares across the whole card (includes the FREE space).
 */
export function countFilled(card: BingoCard): number {
  return card.squares.flat().filter((sq) => sq.isFilled).length
}

export interface ClosestLine {
  /** Squares still needed to complete this line (1-4). */
  needed: number
  /** Human-readable line name, e.g. "Row 3". */
  line: string
  /** IDs of every square in the line (for highlighting). */
  squares: string[]
}

/**
 * The line closest to completion that is not already won, for the
 * X/24 counter's "one-away" hint. Returns null if no line is partially filled
 * beyond the baseline or a bingo already exists.
 */
export function getClosestToWin(card: BingoCard): ClosestLine | null {
  let closest: ClosestLine | null = null

  for (const line of allLines(card.squares)) {
    const filled = line.cells.filter((sq) => sq.isFilled).length
    const needed = 5 - filled
    if (needed > 0 && (closest === null || needed < closest.needed)) {
      closest = { needed, line: line.name, squares: line.cells.map((sq) => sq.id) }
    }
  }

  return closest
}
