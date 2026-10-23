import type { AnalysisResult, Tip } from '../../types'
import { CONNECTORS } from './connectors'
import { countPhrases, tokenizeWords } from './text'
import type { Analyzer, AnalyzerInput } from './types'

/** Ignore gaps shorter than this; recognition events naturally arrive every few hundred ms. */
const MIN_PAUSE_MS = 600

function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Longest gap between consecutive recognition events. Interim results fire continuously while you
 * speak, so a long gap ≈ silence. Leading/trailing silence is excluded (thinking time / reaching for Stop).
 */
export function estimateLongestPause(eventTimesMs: number[] | undefined): number | null {
  if (!eventTimesMs || eventTimesMs.length < 3) return null
  let longest = 0
  for (let i = 1; i < eventTimesMs.length; i++) {
    longest = Math.max(longest, eventTimesMs[i] - eventTimesMs[i - 1])
  }
  return longest < MIN_PAUSE_MS ? 0 : Math.round(longest / 100) / 10
}

function buildFeedback(r: Omit<AnalysisResult, 'feedback'>, durationSec: number): Tip[] {
  if (r.wordCount === 0) return [{ id: 'noSpeech' }]
  const tips: Tip[] = []
  if (r.wordsPerMinute < 90) tips.push({ id: 'slow' })
  else if (r.wordsPerMinute > 170) tips.push({ id: 'fast' })
  else tips.push({ id: 'goodPace' })

  if (r.fillersPerMinute > 6) tips.push({ id: 'manyFillers' })
  else if (r.fillersPerMinute <= 2) tips.push({ id: 'fewFillers' })

  if (r.longestPauseSec !== null && r.longestPauseSec >= 4) tips.push({ id: 'longPause', value: r.longestPauseSec })
  if (r.connectorsUsed.length < 2) tips.push({ id: 'moreConnectors', value: r.connectorSuggestions[0] ?? 'for example' })
  if (r.wordCount >= 40 && r.vocabularyVariety < 0.4) tips.push({ id: 'repetition' })
  if (durationSec >= 50 && r.wordCount < durationSec * 1.2) tips.push({ id: 'longSilences' })
  return tips
}

export function analyzeLocally(input: AnalyzerInput): AnalysisResult {
  const words = tokenizeWords(input.transcript)
  const wordCount = words.length
  const minutes = input.durationSec / 60
  const wordsPerMinute = minutes > 0 ? Math.round(wordCount / minutes) : 0

  const fillerCounts = countPhrases(input.transcript, input.fillerWords)
  const fillers = Array.from(fillerCounts, ([word, count]) => ({ word, count })).sort((a, b) => b.count - a.count)
  const fillerTotal = fillers.reduce((s, f) => s + f.count, 0)

  const connectorCounts = countPhrases(input.transcript, CONNECTORS)
  const connectorsUsed = CONNECTORS.filter((c) => connectorCounts.has(c.toLowerCase()))
  const connectorSuggestions = shuffle(CONNECTORS.filter((c) => !connectorCounts.has(c.toLowerCase()))).slice(0, 3)

  const uniqueWords = new Set(words).size
  const base: Omit<AnalysisResult, 'feedback'> = {
    wordCount,
    wordsPerMinute,
    fillerTotal,
    fillers,
    fillersPerMinute: minutes > 0 ? Math.round((fillerTotal / minutes) * 10) / 10 : 0,
    longestPauseSec: estimateLongestPause(input.speechEventTimesMs),
    connectorsUsed,
    connectorSuggestions,
    uniqueWords,
    vocabularyVariety: wordCount > 0 ? Math.round((uniqueWords / wordCount) * 100) / 100 : 0,
  }
  return { ...base, feedback: buildFeedback(base, input.durationSec) }
}

export const localAnalyzer: Analyzer = {
  id: 'local-rules-v1',
  analyze: (input) => Promise.resolve(analyzeLocally(input)),
}
