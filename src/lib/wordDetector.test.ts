import { describe, it, expect } from 'vitest'
import { detectWords, normalizeText, WORD_ALIASES } from './wordDetector'

describe('normalizeText', () => {
  it('lowercases, trims, and normalizes smart quotes', () => {
    expect(normalizeText('  Hello ’World“ ')).toBe('hello \'world"')
  })
})

describe('detectWords — single words', () => {
  it('matches on word boundaries, case-insensitively', () => {
    expect(detectWords('We need more SYNERGY today', ['synergy'])).toEqual(['synergy'])
  })

  it('does NOT match a word inside a larger word', () => {
    expect(detectWords('that looks scrumptious', ['scrum'])).toEqual([])
  })

  it('matches a word adjacent to punctuation', () => {
    expect(detectWords('Lower the latency, please.', ['latency'])).toEqual(['latency'])
  })

  it('returns nothing for an empty or blank transcript', () => {
    expect(detectWords('', ['synergy'])).toEqual([])
    expect(detectWords('   ', ['synergy'])).toEqual([])
  })
})

describe('detectWords — phrases', () => {
  it('detects multi-word phrases via substring', () => {
    expect(detectWords('can you do a code review later', ['code review'])).toEqual([
      'code review',
    ])
  })

  it('detects punctuated tokens like "A/B test" and "CI/CD"', () => {
    expect(detectWords('run an a/b test on it', ['A/B test'])).toEqual(['A/B test'])
    expect(detectWords('the ci/cd pipeline failed', ['CI/CD'])).toEqual(['CI/CD'])
  })
})

describe('detectWords — already filled', () => {
  it('skips words already filled (same word twice fills once)', () => {
    const filled = new Set(['synergy'])
    expect(detectWords('more synergy', ['synergy'], filled)).toEqual([])
  })

  it('is case-insensitive about the filled set', () => {
    const filled = new Set(['api'])
    expect(detectWords('the API call', ['API'], filled)).toEqual([])
  })
})

describe('detectWords — aliases', () => {
  it('matches CI/CD via "continuous integration"', () => {
    expect(detectWords('we set up continuous integration', ['CI/CD'])).toEqual(['CI/CD'])
  })

  it('matches MVP via "minimum viable product" and dotted "m.v.p."', () => {
    expect(detectWords('ship the minimum viable product', ['MVP'])).toEqual(['MVP'])
    expect(detectWords('ship the m.v.p. now', ['MVP'])).toEqual(['MVP'])
  })

  it('matches ROI via "return on investment"', () => {
    expect(detectWords('what is the return on investment', ['ROI'])).toEqual(['ROI'])
  })

  it('does NOT alias api -> interface (dropped per plan §6)', () => {
    expect(WORD_ALIASES['api']).toBeUndefined()
    expect(detectWords('tweak the interface', ['API'])).toEqual([])
  })
})

describe('detectWords — multiple', () => {
  it('detects several words in one chunk and preserves card order', () => {
    const card = ['synergy', 'bandwidth', 'pivot']
    expect(detectWords('low bandwidth so we pivot for synergy', card)).toEqual([
      'synergy',
      'bandwidth',
      'pivot',
    ])
  })
})
