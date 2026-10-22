import type { AnalysisResult } from '../../types'
import { localAnalyzer } from './localAnalyzer'
import type { Analyzer, AnalyzerInput } from './types'

export { CONNECTORS } from './connectors'
export { findPhraseMatches, tokenizeWords } from './text'
export type { Analyzer, AnalyzerInput } from './types'

/**
 * The analyzer the app uses. To add LLM feedback later, implement `Analyzer` (e.g. a `claudeAnalyzer`
 * that sends the transcript + prompt to an API) and compose it with the local stats here.
 */
let activeAnalyzer: Analyzer = localAnalyzer

export function setAnalyzer(analyzer: Analyzer): void {
  activeAnalyzer = analyzer
}

export async function analyzeAnswer(input: AnalyzerInput): Promise<AnalysisResult> {
  try {
    return await activeAnalyzer.analyze(input)
  } catch {
    // A remote analyzer must never block saving a recording — fall back to local stats.
    return localAnalyzer.analyze(input)
  }
}
