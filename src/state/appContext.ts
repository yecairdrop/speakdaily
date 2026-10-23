import { createContext } from 'react'
import type { ProgressLog } from '../lib/storage'
import type { RecordingMeta, Settings, TaskKind, UnitStep, VocabProgress } from '../types'

export interface AppState {
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
  progress: ProgressLog
  /** Register a saved recording in the daily activity log. */
  logRecording: (dateKey: string, seconds: number, task?: TaskKind) => void
  /** Tick a daily task without adding a recording (e.g. a finished mock interview). */
  markTask: (dateKey: string, task: TaskKind) => void
  /** Recompute seconds/counts from the recordings that still exist (after deletes). */
  rebuildProgress: (metas: RecordingMeta[]) => void
  resetAll: () => void
  /** Vocabulary units + spaced repetition. */
  vocab: VocabProgress
  /** One result per item (first attempt of a practice/review session). */
  recordAnswers: (results: { itemId: string; correct: boolean }[]) => void
  markUnitStep: (unitId: number, step: UnitStep) => void
  /** Items detected in your own recorded speech. */
  recordSpeechUse: (itemIds: string[]) => void
}

export const AppContext = createContext<AppState | null>(null)
