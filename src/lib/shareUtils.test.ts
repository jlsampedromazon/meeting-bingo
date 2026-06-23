import { describe, it, expect } from 'vitest'
import { buildShareText, formatDuration } from './shareUtils'
import type { GameState } from '../types'

describe('formatDuration', () => {
  it('formats milliseconds as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(5_000)).toBe('0:05')
    expect(formatDuration(65_000)).toBe('1:05')
    expect(formatDuration(154_000)).toBe('2:34')
  })

  it('clamps negative durations to 0:00', () => {
    expect(formatDuration(-1000)).toBe('0:00')
  })
})

describe('buildShareText', () => {
  const base: GameState = {
    status: 'won',
    category: 'agile',
    card: null,
    isListening: false,
    startedAt: 1_000,
    completedAt: 1_000 + 154_000,
    winningLine: null,
    winningWord: 'sprint',
    filledCount: 6,
  }

  it('includes category, time, winning word, and the play URL', () => {
    const text = buildShareText(base, 'https://example.com/')
    expect(text).toContain('Agile & Scrum')
    expect(text).toContain('2:34')
    expect(text).toContain('sprint')
    expect(text).toContain('Play: https://example.com/')
  })

  it('omits time when timestamps are missing', () => {
    const text = buildShareText(
      { ...base, startedAt: null, completedAt: null },
      'https://example.com/',
    )
    expect(text).not.toContain('Time to bingo')
    expect(text).toContain('Play: https://example.com/')
  })
})
