import { createContext } from 'react'
import type { ProgressLog } from '../lib/storage'
import type { RecordingMeta, Settings, TaskKind } from '../types'

export interface AppState {
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
  progress: ProgressLog
  /** Register a saved recording in the daily activity log. */
  logRecording: (dateKey: string, seconds: number, task?: TaskKind) => void
  /** Recompute seconds/counts from the recordings that still exist (after deletes). */
  rebuildProgress: (metas: RecordingMeta[]) => void
  resetAll: () => void
}

export const AppContext = createContext<AppState | null>(null)
