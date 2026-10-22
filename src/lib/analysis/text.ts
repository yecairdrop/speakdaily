/** Text helpers shared by the analyzer and the transcript highlighter. */

export function tokenizeWords(text: string): string[] {
  return (text.toLowerCase().replace(/[’‘]/g, "'").match(/[a-z0-9]+(?:'[a-z]+)?/g) ?? []) as string[]
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Whole-word, case-insensitive regex for a (possibly multi-word) phrase; tolerant of ’ vs ' and extra spaces. */
export function phraseRegExp(phrase: string): RegExp {
  const body = phrase
    .trim()
    .split(/\s+/)
    .map((w) => escapeRegExp(w).replace(/'/g, "['’]"))
    .join('\\s+')
  return new RegExp(`(?<![\\w'’])${body}(?![\\w'’])`, 'gi')
}

export interface PhraseMatch {
  start: number
  end: number
  phrase: string
}

/** All non-overlapping occurrences of the given phrases (longer phrases win on overlap). */
export function findPhraseMatches(text: string, phrases: readonly string[]): PhraseMatch[] {
  const all: PhraseMatch[] = []
  const unique = Array.from(new Set(phrases.map((p) => p.trim().toLowerCase()).filter(Boolean)))
  for (const phrase of unique) {
    for (const m of text.matchAll(phraseRegExp(phrase))) {
      if (m.index === undefined) continue
      all.push({ start: m.index, end: m.index + m[0].length, phrase })
    }
  }
  all.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start))
  const out: PhraseMatch[] = []
  let lastEnd = -1
  for (const m of all) {
    if (m.start >= lastEnd) {
      out.push(m)
      lastEnd = m.end
    }
  }
  return out
}

export function countPhrases(text: string, phrases: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const m of findPhraseMatches(text, phrases)) counts.set(m.phrase, (counts.get(m.phrase) ?? 0) + 1)
  return counts
}
