/** Normalises a typed answer: case, curly quotes, extra spaces and trailing punctuation don't matter. */
export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9' -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return dp[b.length]
}

export type AnswerCheck = 'correct' | 'typo' | 'wrong'

/** Exact (after normalising) = correct; a small typo (1 edit per ~6 letters) = typo, still counts as correct. */
export function checkTyped(input: string, accepted: readonly string[]): AnswerCheck {
  const a = normalizeAnswer(input)
  if (!a) return 'wrong'
  let best = Infinity
  let target = ''
  for (const option of accepted) {
    const n = normalizeAnswer(option)
    if (n === a) return 'correct'
    const d = levenshtein(a, n)
    if (d < best) {
      best = d
      target = n
    }
  }
  return best <= Math.max(1, Math.floor(target.length / 6)) ? 'typo' : 'wrong'
}
