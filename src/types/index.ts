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

/* ---------- Vocabulary units ---------- */

export type VocabKind = 'word' | 'phrase' | 'connector'

/** A word or chunk to learn. English stays English; Turkish is the learning aid. */
export interface VocabItem {
  id: string
  unitId: number
  /** Base form shown to the learner, e.g. "take responsibility". */
  term: string
  /** Other forms to recognise in speech / sentences, e.g. irregular past "took responsibility". */
  alt?: string[]
  tr: string
  /** English example sentence that contains the term (or one of `alt`). */
  example: string
  exampleTr: string
  kind: VocabKind
}

export interface Unit {
  id: number
  title: { tr: string; en: string }
  goal: { tr: string; en: string }
  items: VocabItem[]
  /** Short English model text that uses the unit's items (comprehensible input). */
  modelText: string
  modelSummaryTr: string
  /** Question bank prompt used for the unit's speaking step. */
  promptId: string
}

export type UnitStep = 'learn' | 'listen' | 'practice' | 'speak'

/** Spaced-repetition state of one item (Leitner box 1..5). */
export interface ItemProgress {
  box: number
  /** Date key (YYYY-MM-DD) when the item is due for review. */
  due: string
  correct: number
  wrong: number
  /** Times the item was detected in your own recorded speech. */
  used: number
  lastUsed?: string
}

export interface VocabProgress {
  items: Record<string, ItemProgress>
  units: Record<string, UnitStep[]>
}

export type Language = 'tr' | 'en'

export interface Settings {
  /** ISO date (YYYY-MM-DD) of program day 1, or null before onboarding. */
  startDate: string | null
  /** Overrides the phase-based recording time limit when set (seconds). */
  timeLimitOverride: number | null
  fillerWords: string[]
  theme: ThemeMode
  ttsRate: number
  ttsVoiceURI: string | null
  /** UI language. Practice content (prompts, passages) always stays English. */
  language: Language
  /** Show the Turkish one-line hints under English prompts. */
  showHintsTr: boolean
}

export type RecordingKind = 'speaking' | 'shadowing' | 'mock'

/** Daily task slots shown on the Today screen. */
export type TaskKind = 'review' | 'unit' | 'shadowing' | 'speaking' | 'star' | 'mock'

export interface FillerHit {
  word: string
  count: number
}

export type TipId =
  | 'noSpeech'
  | 'slow'
  | 'fast'
  | 'goodPace'
  | 'manyFillers'
  | 'fewFillers'
  | 'longPause'
  | 'moreConnectors'
  | 'repetition'
  | 'longSilences'

export interface Tip {
  id: TipId
  value?: string | number
}

export type FeedbackItem = Tip | string

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
  /** Tips: codes from the local analyzer (translated in the UI) or free text from e.g. an LLM analyzer. */
  feedback: FeedbackItem[]
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
