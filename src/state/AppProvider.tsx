import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  DEFAULT_SETTINGS,
  clearLocalData,
  loadProgress,
  loadSettings,
  loadVocab,
  saveProgress,
  saveSettings,
  saveVocab,
  type ProgressLog,
} from '../lib/storage'
import { toDateKey } from '../lib/dates'
import { emptyProgress, applyAnswer, applySpeechUse } from '../lib/vocab/srs'
import type { RecordingMeta, Settings, TaskKind, UnitStep, VocabProgress } from '../types'
import { AppContext, type AppState } from './appContext'

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [progress, setProgress] = useState<ProgressLog>(loadProgress)
  const [vocab, setVocab] = useState<VocabProgress>(loadVocab)

  useEffect(() => {
    saveSettings(settings)
    document.documentElement.dataset.theme = settings.theme
    document.documentElement.lang = settings.language
  }, [settings])

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  useEffect(() => {
    saveVocab(vocab)
  }, [vocab])

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

  const markTask = useCallback((dateKey: string, task: TaskKind) => {
    setProgress((prev) => {
      const day = prev[dateKey] ?? { seconds: 0, recordings: 0, tasks: [] }
      if (day.tasks.includes(task)) return prev
      return { ...prev, [dateKey]: { ...day, tasks: [...day.tasks, task] } }
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
    setVocab(emptyProgress())
  }, [])

  const recordAnswers = useCallback((results: { itemId: string; correct: boolean }[]) => {
    const today = toDateKey()
    setVocab((prev) => {
      const items = { ...prev.items }
      for (const r of results) items[r.itemId] = applyAnswer(items[r.itemId], r.correct, today)
      return { ...prev, items }
    })
  }, [])

  const markUnitStep = useCallback((unitId: number, step: UnitStep) => {
    setVocab((prev) => {
      const done = prev.units[unitId] ?? []
      if (done.includes(step)) return prev
      return { ...prev, units: { ...prev.units, [unitId]: [...done, step] } }
    })
  }, [])

  const recordSpeechUse = useCallback((itemIds: string[]) => {
    if (itemIds.length === 0) return
    const today = toDateKey()
    setVocab((prev) => {
      const items = { ...prev.items }
      for (const id of itemIds) items[id] = applySpeechUse(items[id], today)
      return { ...prev, items }
    })
  }, [])

  const value = useMemo<AppState>(
    () => ({
      settings,
      updateSettings,
      progress,
      logRecording,
      markTask,
      rebuildProgress,
      resetAll,
      vocab,
      recordAnswers,
      markUnitStep,
      recordSpeechUse,
    }),
    [settings, updateSettings, progress, logRecording, markTask, rebuildProgress, resetAll, vocab, recordAnswers, markUnitStep, recordSpeechUse],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
