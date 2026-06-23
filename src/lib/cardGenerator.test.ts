import { describe, it, expect } from 'vitest'
import { generateCard, getCardWords, shuffle } from './cardGenerator'
import { CATEGORIES } from '../data/categories'
import type { CategoryId } from '../types'

const CATEGORY_IDS: CategoryId[] = ['agile', 'corporate', 'tech']

describe('shuffle', () => {
  it('returns a new array with the same elements (no mutation)', () => {
    const input = [1, 2, 3, 4, 5]
    const out = shuffle(input)
    expect(out).not.toBe(input)
    expect([...out].sort()).toEqual([...input].sort())
    expect(input).toEqual([1, 2, 3, 4, 5])
  })
})

describe('generateCard', () => {
  it('throws on an unknown category', () => {
    // @ts-expect-error testing invalid input
    expect(() => generateCard('nope')).toThrow()
  })

  it.each(CATEGORY_IDS)('builds a 5x5 grid for "%s"', (id) => {
    const card = generateCard(id)
    expect(card.squares).toHaveLength(5)
    card.squares.forEach((row) => expect(row).toHaveLength(5))
  })

  it('pre-fills only the center FREE space', () => {
    const card = generateCard('agile')
    const center = card.squares[2][2]
    expect(center.isFreeSpace).toBe(true)
    expect(center.isFilled).toBe(true)
    expect(center.word).toBe('FREE')
    expect(typeof center.filledAt).toBe('number')

    const filled = card.squares.flat().filter((sq) => sq.isFilled)
    expect(filled).toHaveLength(1)
    expect(filled[0].id).toBe('2-2')
  })

  it('places 24 unique non-free words + the free center', () => {
    const card = generateCard('tech')
    expect(card.words).toHaveLength(24)
    expect(new Set(card.words).size).toBe(24)

    const placed = card.squares
      .flat()
      .filter((sq) => !sq.isFreeSpace)
      .map((sq) => sq.word)
    expect(placed).toHaveLength(24)
    expect(new Set(placed)).toEqual(new Set(card.words))
  })

  it('assigns "row-col" ids matching position', () => {
    const card = generateCard('corporate')
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const sq = card.squares[r][c]
        expect(sq.id).toBe(`${r}-${c}`)
        expect(sq.row).toBe(r)
        expect(sq.col).toBe(c)
      }
    }
  })

  it('randomizes layout between generations (shuffle is real)', () => {
    const a = generateCard('agile')
    const b = generateCard('agile')
    // Word order matching across two independent shuffles is astronomically
    // unlikely (~1/24!), so differing order confirms a real shuffle.
    expect(a.words).not.toEqual(b.words)
  })

  it('draws selected words only from the requested category pool', () => {
    const techPool = new Set(CATEGORIES.find((c) => c.id === 'tech')!.words)
    const agilePool = new Set(CATEGORIES.find((c) => c.id === 'agile')!.words)
    // 'kubernetes' exists only in the tech pool, never agile.
    expect(techPool.has('kubernetes')).toBe(true)
    expect(agilePool.has('kubernetes')).toBe(false)

    const techCard = generateCard('tech')
    techCard.words.forEach((w) => expect(techPool.has(w)).toBe(true))
  })
})

describe('getCardWords', () => {
  it('returns the flat list of placed words', () => {
    const card = generateCard('agile')
    expect(getCardWords(card)).toBe(card.words)
  })
})
