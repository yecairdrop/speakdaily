import { tokenizeWords } from './analysis/text'

export interface DiffToken {
  word: string
  status: 'ok' | 'missed'
}

export interface SimilarityResult {
  /** 0..100 — share of reference words you said, in order. */
  score: number
  /** Reference words (original spelling/punctuation) with their status, for highlighting. */
  reference: DiffToken[]
  /** Words you said that are not in the passage (substitutions / additions). */
  extra: string[]
}

/**
 * Word-level alignment via longest common subsequence, ignoring case and punctuation.
 * Score = matched reference tokens / total reference tokens.
 */
export function compareToReference(referenceText: string, spokenText: string): SimilarityResult {
  const display = referenceText.split(/\s+/).filter(Boolean)
  // One display word can hold several tokens ("five-year" → five, year).
  const ref: { tok: string; displayIdx: number }[] = []
  display.forEach((w, idx) => tokenizeWords(w).forEach((tok) => ref.push({ tok, displayIdx: idx })))
  const spoken = tokenizeWords(spokenText)
  const n = ref.length
  const m = spoken.length

  // dp[i][j] = LCS length of ref[i..] and spoken[j..]
  const dp: Uint16Array[] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = ref[i].tok === spoken[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const matched = new Array<boolean>(n).fill(false)
  const extra: string[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (ref[i].tok === spoken[j]) {
      matched[i] = true
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++
    } else {
      extra.push(spoken[j])
      j++
    }
  }
  for (; j < m; j++) extra.push(spoken[j])

  const missedDisplay = new Set(ref.filter((_, k) => !matched[k]).map((r) => r.displayIdx))
  return {
    score: n === 0 ? 0 : Math.round((dp[0][0] / n) * 100),
    reference: display.map((word, idx) => ({ word, status: missedDisplay.has(idx) ? 'missed' : 'ok' })),
    extra,
  }
}
