import type { Settings, TaskKind, VocabProgress } from '../types'

const SETTINGS_KEY = 'speakdaily.settings.v1'
const PROGRESS_KEY = 'speakdaily.progress.v1'
const VOCAB_KEY = 'speakdaily.vocab.v1'

export const DEFAULT_FILLERS = [
  'um',
  'uh',
  'like',
  'you know',
  'basically',
  'actually',
  'so',
  'i mean',
  'kind of',
  'sort of',
]

export const DEFAULT_SETTINGS: Settings = {
  startDate: null,
  timeLimitOverride: null,
  fillerWords: DEFAULT_FILLERS,
  theme: 'dark',
  ttsRate: 0.9,
  ttsVoiceURI: null,
  language: 'tr',
  showHintsTr: true,
}

export interface DayProgress {
  seconds: number
  recordings: number
  tasks: TaskKind[]
}

/** Lightweight per-day activity log; recordings themselves live in IndexedDB. */
export type ProgressLog = Record<string, DayProgress>

function readJson<T>(key: string): Partial<T> | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Partial<T>) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked (private mode) — the app keeps working in memory.
  }
}

export function loadSettings(): Settings {
  const stored = readJson<Settings>(SETTINGS_KEY)
  return { ...DEFAULT_SETTINGS, ...stored }
}

export function saveSettings(settings: Settings): void {
  writeJson(SETTINGS_KEY, settings)
}

export function loadProgress(): ProgressLog {
  return (readJson<ProgressLog>(PROGRESS_KEY) as ProgressLog | null) ?? {}
}

export function saveProgress(progress: ProgressLog): void {
  writeJson(PROGRESS_KEY, progress)
}

export function loadVocab(): VocabProgress {
  const stored = readJson<VocabProgress>(VOCAB_KEY)
  return { items: stored?.items ?? {}, units: stored?.units ?? {} }
}

export function saveVocab(vocab: VocabProgress): void {
  writeJson(VOCAB_KEY, vocab)
}

export function clearLocalData(): void {
  localStorage.removeItem(SETTINGS_KEY)
  localStorage.removeItem(PROGRESS_KEY)
  localStorage.removeItem(VOCAB_KEY)
}
