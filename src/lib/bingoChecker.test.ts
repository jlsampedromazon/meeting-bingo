import { describe, it, expect } from 'vitest'
import { checkForBingo, countFilled, getClosestToWin } from './bingoChecker'
import type { BingoCard, BingoSquare } from '../types'

/** Build a card from a 5x5 boolean fill matrix; (2,2) is the FREE space. */
function makeCard(filled: boolean[][]): BingoCard {
  const squares: BingoSquare[][] = []
  for (let row = 0; row < 5; row++) {
    const rowSquares: BingoSquare[] = []
    for (let col = 0; col < 5; col++) {
      const isFreeSpace = row === 2 && col === 2
      rowSquares.push({
        id: `${row}-${col}`,
        word: isFreeSpace ? 'FREE' : `${row}-${col}`,
        isFilled: filled[row][col],
        isAutoFilled: false,
        isFreeSpace,
        filledAt: filled[row][col] ? 1 : null,
        row,
        col,
      })
    }
    squares.push(rowSquares)
  }
  return { squares, words: [] }
}

const emptyGrid = (): boolean[][] =>
  Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => false))

/** Empty grid with the FREE center filled, like a fresh card. */
const freshGrid = (): boolean[][] => {
  const g = emptyGrid()
  g[2][2] = true
  return g
}

describe('checkForBingo', () => {
  it('returns null on a fresh card', () => {
    expect(checkForBingo(makeCard(freshGrid()))).toBeNull()
  })

  it('detects all 5 rows', () => {
    for (let r = 0; r < 5; r++) {
      const g = freshGrid()
      for (let c = 0; c < 5; c++) g[r][c] = true
      const win = checkForBingo(makeCard(g))
      expect(win).toMatchObject({ type: 'row', index: r })
      expect(win?.squares).toEqual([`${r}-0`, `${r}-1`, `${r}-2`, `${r}-3`, `${r}-4`])
    }
  })

  it('detects all 5 columns', () => {
    for (let c = 0; c < 5; c++) {
      const g = freshGrid()
      for (let r = 0; r < 5; r++) g[r][c] = true
      const win = checkForBingo(makeCard(g))
      expect(win).toMatchObject({ type: 'column', index: c })
      expect(win?.squares).toEqual([`0-${c}`, `1-${c}`, `2-${c}`, `3-${c}`, `4-${c}`])
    }
  })

  it('detects both diagonals (FREE center participates)', () => {
    const d1 = freshGrid()
    for (let i = 0; i < 5; i++) d1[i][i] = true
    expect(checkForBingo(makeCard(d1))).toMatchObject({ type: 'diagonal', index: 0 })

    const d2 = freshGrid()
    for (let i = 0; i < 5; i++) d2[i][4 - i] = true
    expect(checkForBingo(makeCard(d2))).toMatchObject({ type: 'diagonal', index: 1 })
  })

  it('does not falsely report a near-complete line', () => {
    const g = freshGrid()
    for (let c = 0; c < 4; c++) g[0][c] = true // 4 of 5 in row 0
    expect(checkForBingo(makeCard(g))).toBeNull()
  })
})

describe('countFilled', () => {
  it('counts every filled square including FREE', () => {
    expect(countFilled(makeCard(freshGrid()))).toBe(1)
    const g = freshGrid()
    g[0][0] = true
    g[4][4] = true
    expect(countFilled(makeCard(g))).toBe(3)
  })
})

describe('getClosestToWin', () => {
  it('reports the line needing the fewest squares', () => {
    const g = freshGrid()
    // Row 0 has 4 filled -> needs 1 (the closest).
    for (let c = 0; c < 4; c++) g[0][c] = true
    const closest = getClosestToWin(makeCard(g))
    expect(closest?.needed).toBe(1)
    expect(closest?.line).toBe('Row 1')
    expect(closest?.squares).toEqual(['0-0', '0-1', '0-2', '0-3', '0-4'])
  })

  it('returns a value even for a fresh card (center seeds three lines)', () => {
    const closest = getClosestToWin(makeCard(freshGrid()))
    // Row 3 / Col 3 / both diagonals each have the center filled -> need 4.
    expect(closest?.needed).toBe(4)
  })

  it('still returns the last partial line when a bingo exists', () => {
    const g = freshGrid()
    for (let c = 0; c < 5; c++) g[0][c] = true
    // getClosestToWin reports nearest *incomplete* line; a complete one is skipped.
    const closest = getClosestToWin(makeCard(g))
    expect(closest).not.toBeNull()
    expect(closest?.needed).toBeGreaterThan(0)
  })
})
