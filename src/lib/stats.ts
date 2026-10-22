import { addDays, toDateKey } from './dates'
import type { ProgressLog } from './storage'

/**
 * Consecutive days with at least one recording, ending today.
 * If today has no recording yet, the streak still counts up to yesterday (it isn't broken until midnight).
 */
export function currentStreak(progress: ProgressLog, today: string = toDateKey()): number {
  const active = (key: string) => (progress[key]?.recordings ?? 0) > 0
  let day = active(today) ? today : addDays(today, -1)
  let streak = 0
  while (active(day)) {
    streak++
    day = addDays(day, -1)
  }
  return streak
}

export function longestStreak(progress: ProgressLog): number {
  const keys = Object.keys(progress)
    .filter((k) => progress[k].recordings > 0)
    .sort()
  let best = 0
  let run = 0
  let prev: string | null = null
  for (const key of keys) {
    run = prev && addDays(prev, 1) === key ? run + 1 : 1
    best = Math.max(best, run)
    prev = key
  }
  return best
}

export function totalSeconds(progress: ProgressLog): number {
  return Object.values(progress).reduce((sum, d) => sum + d.seconds, 0)
}

export function formatMinutes(seconds: number): string {
  const minutes = seconds / 60
  return minutes < 10 ? minutes.toFixed(1) : String(Math.round(minutes))
}
