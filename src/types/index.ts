export type Phase = 1 | 2 | 3

export type PromptCategory = 'interview' | 'tech' | 'daily' | 'opinion' | 'star'

export interface Prompt {
  id: string
  text: string
  category: PromptCategory
  phase: Phase
  suggestedSeconds: number
  hints?: [string, string, string]
  /** One-line Turkish explanation of what the question asks and what to mention. */
  hintTr: string
}

export interface Passage {
  id: string
  title: string
  text: string
  /** Short Turkish summary shown before listening. */
  summaryTr: string
}

export type ThemeMode = 'dark' | 'light'

export interface Settings {
  /** ISO date (YYYY-MM-DD) of program day 1, or null before onboarding. */
  startDate: string | null
  /** Overrides the phase-based recording time limit when set (seconds). */
  timeLimitOverride: number | null
  fillerWords: string[]
  theme: ThemeMode
  ttsRate: number
  ttsVoiceURI: string | null
}

export type RecordingKind = 'speaking' | 'shadowing' | 'mock'

/** Daily task slots shown on the Today screen. */
export type TaskKind = 'shadowing' | 'speaking' | 'star' | 'mock'

export interface FillerHit {
  word: string
  count: number
}

/** Output of an analyzer. Kept serialisable so it can be stored and later produced by an API. */
export interface AnalysisResult {
  wordCount: number
  wordsPerMinute: number
  fillerTotal: number
  fillers: FillerHit[]
  fillersPerMinute: number
  /** Approximate longest silence in seconds, null when not measurable. */
  longestPauseSec: number | null
  connectorsUsed: string[]
  connectorSuggestions: string[]
  uniqueWords: number
  /** unique words / total words, 0..1 */
  vocabularyVariety: number
  /** Free-form feedback lines (empty for the local analyzer; reserved for an LLM analyzer). */
  feedback: string[]
}

export interface Recording {
  id: string
  createdAt: number
  /** Local date key YYYY-MM-DD the recording counts towards. */
  dateKey: string
  kind: RecordingKind
  promptId: string | null
  promptText: string
  category: PromptCategory | 'shadowing'
  durationSec: number
  transcript: string
  audio: Blob
  mimeType: string
  hasVideo: boolean
  analysis: AnalysisResult
  /** Shadowing only: word-level match percentage 0..100. */
  similarity?: number
  sessionId?: string
  task?: TaskKind
}

export type RecordingMeta = Omit<Recording, 'audio'>

export interface MockSession {
  id: string
  createdAt: number
  dateKey: string
  questionIds: string[]
  recordingIds: string[]
  completed: boolean
}
