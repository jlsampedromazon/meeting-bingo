/**
 * Escape special regex characters so a word can be embedded in a pattern.
 */
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Lowercase, normalize smart quotes, and trim.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .trim()
}

/**
 * Common spoken variations mapped to a card word.
 *
 * NOTE: the architecture doc's `api: ['interface']` alias is intentionally
 * DROPPED — "interface" fires on unrelated UI/design talk and tanks precision
 * (plan §6). Dotted forms like "m.v.p." are matched by substring here (not via
 * \b word boundaries, which the dots would break).
 */
export const WORD_ALIASES: Record<string, string[]> = {
  'ci/cd': ['ci cd', 'cicd', 'continuous integration', 'c i c d'],
  mvp: ['minimum viable product', 'm.v.p.', 'm v p'],
  roi: ['return on investment', 'r.o.i.', 'r o i'],
  devops: ['dev ops', 'dev-ops'],
}

/** True if the (already-normalized) transcript contains the word/phrase. */
function transcriptHasWord(normalizedTranscript: string, word: string): boolean {
  const normalizedWord = normalizeText(word)
  if (normalizedWord.includes(' ') || !/^[\w'-]+$/.test(normalizedWord)) {
    // Phrases and tokens with punctuation (e.g. "ci/cd", "a/b test") use
    // substring matching — \b boundaries are unreliable around non-word chars.
    return normalizedTranscript.includes(normalizedWord)
  }
  // Single plain words: word-boundary match to avoid substring false hits
  // (e.g. "scrum" must not fire inside "scrumptious").
  const regex = new RegExp(`\\b${escapeRegex(normalizedWord)}\\b`)
  return regex.test(normalizedTranscript)
}

/**
 * Detect which of `cardWords` appear in `transcript`. Single words match on
 * word boundaries; phrases and punctuated tokens match by substring; aliases
 * are checked as a fallback. Words in `alreadyFilled` (lowercased) are skipped.
 *
 * Run this on each NEW final chunk — not the accumulated transcript (plan §8.5).
 */
export function detectWords(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string> = new Set(),
): string[] {
  const normalizedTranscript = normalizeText(transcript)
  if (!normalizedTranscript) return []

  const detected: string[] = []

  for (const word of cardWords) {
    if (alreadyFilled.has(word.toLowerCase())) continue

    if (transcriptHasWord(normalizedTranscript, word)) {
      detected.push(word)
      continue
    }

    const aliases = WORD_ALIASES[word.toLowerCase()]
    if (aliases?.some((alias) => normalizedTranscript.includes(normalizeText(alias)))) {
      detected.push(word)
    }
  }

  return detected
}
