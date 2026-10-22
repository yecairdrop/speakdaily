import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  DEFAULT_SETTINGS,
  clearLocalData,
  loadProgress,
  loadSettings,
  saveProgress,
  saveSettings,
  type ProgressLog,
} from '../lib/storage'
import type { RecordingMeta, Settings, TaskKind } from '../types'
import { AppContext, type AppState } from './appContext'

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [progress, setProgress] = useState<ProgressLog>(loadProgress)

  useEffect(() => {
    saveSettings(settings)
    document.documentElement.dataset.theme = settings.theme
  }, [settings])

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const logRecording = useCallback((dateKey: string, seconds: number, task?: TaskKind) => {
    setProgress((prev) => {
      const day = prev[dateKey] ?? { seconds: 0, recordings: 0, tasks: [] }
      const tasks = task && !day.tasks.includes(task) ? [...day.tasks, task] : day.tasks
      return {
        ...prev,
        [dateKey]: { seconds: day.seconds + seconds, recordings: day.recordings + 1, tasks },
      }
    })
  }, [])

  const rebuildProgress = useCallback((metas: RecordingMeta[]) => {
    setProgress((prev) => {
      const next: ProgressLog = {}
      for (const m of metas) {
        const day = next[m.dateKey] ?? { seconds: 0, recordings: 0, tasks: [] }
        day.seconds += m.durationSec
        day.recordings += 1
        if (m.task && !day.tasks.includes(m.task)) day.tasks.push(m.task)
        next[m.dateKey] = day
      }
      // Keep task ticks for days that still have recordings.
      for (const key of Object.keys(next)) {
        const old = prev[key]
        if (old) next[key].tasks = Array.from(new Set([...next[key].tasks, ...old.tasks]))
      }
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    clearLocalData()
    setSettings(DEFAULT_SETTINGS)
    setProgress({})
  }, [])

  const value = useMemo<AppState>(
    () => ({ settings, updateSettings, progress, logRecording, rebuildProgress, resetAll }),
    [settings, updateSettings, progress, logRecording, rebuildProgress, resetAll],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
