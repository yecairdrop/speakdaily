import type { AnalysisResult } from '../../types'

export interface AnalyzerInput {
  transcript: string
  durationSec: number
  promptText: string
  fillerWords: string[]
  /** Timestamps (ms from start) of speech-recognition events, used to estimate pauses. */
  speechEventTimesMs?: number[]
}

/**
 * Anything that turns a spoken answer into feedback. The local implementation is synchronous rule-based
 * text statistics; a future implementation could call an LLM (e.g. the Claude API) and fill `feedback`.
 */
export interface Analyzer {
  readonly id: string
  analyze(input: AnalyzerInput): Promise<AnalysisResult>
}
