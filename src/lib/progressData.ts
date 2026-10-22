import { addDays, daysBetween, toDateKey } from './dates'
import type { ProgressLog } from './storage'
import type { Recording } from '../types'

export interface DailyPoint {
  dateKey: string
  label: string
  wpm: number
  fillersPerMin: number
  count: number
}

export interface WeeklyPoint {
  label: string
  minutes: number
}

export interface HeatCell {
  dateKey: string
  minutes: number
  level: 0 | 1 | 2 | 3
}

function shortLabel(key: string): string {
  const [, m, d] = key.split('-')
  return `${Number(d)}/${Number(m)}`
}

/** Daily averages of free-speaking answers (shadowing is reading aloud, so it would skew WPM). */
export function dailySpeakingStats(recordings: Recording[]): DailyPoint[] {
  const byDay = new Map<string, Recording[]>()
  for (const r of recordings) {
    if (r.kind === 'shadowing' || r.analysis.wordCount === 0) continue
    byDay.set(r.dateKey, [...(byDay.get(r.dateKey) ?? []), r])
  }
  return Array.from(byDay, ([dateKey, recs]) => {
    const minutes = recs.reduce((s, r) => s + r.durationSec, 0) / 60
    const words = recs.reduce((s, r) => s + r.analysis.wordCount, 0)
    const fillers = recs.reduce((s, r) => s + r.analysis.fillerTotal, 0)
    return {
      dateKey,
      label: shortLabel(dateKey),
      wpm: minutes > 0 ? Math.round(words / minutes) : 0,
      fillersPerMin: minutes > 0 ? Math.round((fillers / minutes) * 10) / 10 : 0,
      count: recs.length,
    }
  }).sort((a, b) => a.dateKey.localeCompare(b.dateKey))
}

/** Minutes spoken per program week (or per 7-day block from the first recording if no start date). */
export function weeklyMinutes(progress: ProgressLog, startDate: string | null): WeeklyPoint[] {
  const keys = Object.keys(progress).sort()
  const origin = startDate ?? keys[0]
  if (!origin) return []
  const lastWeek = Math.max(
    startDate ? 12 : 1,
    ...keys.map((k) => Math.floor(daysBetween(origin, k) / 7) + 1),
  )
  const weeks: WeeklyPoint[] = Array.from({ length: lastWeek }, (_, i) => ({ label: `W${i + 1}`, minutes: 0 }))
  for (const k of keys) {
    const w = Math.floor(daysBetween(origin, k) / 7)
    if (w >= 0 && w < weeks.length) weeks[w].minutes += progress[k].seconds / 60
  }
  return weeks.map((w) => ({ ...w, minutes: Math.round(w.minutes * 10) / 10 }))
}

/** 12 program weeks × 7 days (columns = weeks). Without a start date: the last 12 weeks. */
export function heatmapCells(progress: ProgressLog, startDate: string | null): HeatCell[] {
  const origin = startDate ?? addDays(toDateKey(), -83)
  return Array.from({ length: 84 }, (_, i) => {
    const dateKey = addDays(origin, i)
    const minutes = (progress[dateKey]?.seconds ?? 0) / 60
    const level: HeatCell['level'] = minutes === 0 ? 0 : minutes < 3 ? 1 : minutes < 8 ? 2 : 3
    return { dateKey, minutes, level }
  })
}
