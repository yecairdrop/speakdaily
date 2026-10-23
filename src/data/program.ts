import type { Phase } from '../types'

/** Program structure only — names, goals and routines live in the i18n dictionaries (src/i18n). */
export interface PhaseInfo {
  phase: Phase
  weeks: [number, number]
  defaultSeconds: number
}

export interface WeekInfo {
  week: number
  phase: Phase
}

export const PROGRAM_WEEKS = 12
export const PROGRAM_DAYS = PROGRAM_WEEKS * 7

export const PHASES: PhaseInfo[] = [
  { phase: 1, weeks: [1, 4], defaultSeconds: 60 },
  { phase: 2, weeks: [5, 8], defaultSeconds: 120 },
  { phase: 3, weeks: [9, 12], defaultSeconds: 180 },
]

export function phaseForWeek(week: number): Phase {
  if (week <= 4) return 1
  if (week <= 8) return 2
  return 3
}

export const WEEKS: WeekInfo[] = Array.from({ length: PROGRAM_WEEKS }, (_, i) => ({
  week: i + 1,
  phase: phaseForWeek(i + 1),
}))

export function phaseInfo(phase: Phase): PhaseInfo {
  return PHASES[phase - 1]
}
