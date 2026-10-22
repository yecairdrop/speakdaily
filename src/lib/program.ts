import { PASSAGES } from '../data/passages'
import { PROGRAM_DAYS, phaseForWeek, phaseInfo } from '../data/program'
import { PROMPTS } from '../data/prompts'
import type { Passage, Phase, Prompt, Settings } from '../types'
import { daysBetween, toDateKey } from './dates'

export type ProgramStatus = 'not-started' | 'active' | 'finished'

export interface ProgramPosition {
  status: ProgramStatus
  /** 0-based day index since start (clamped to the program for scheduling). */
  dayIndex: number
  week: number
  /** 1..7 */
  dayOfWeek: number
  phase: Phase
  daysUntilStart: number
}

export function getProgramPosition(startDate: string | null, today: string = toDateKey()): ProgramPosition | null {
  if (!startDate) return null
  const diff = daysBetween(startDate, today)
  const status: ProgramStatus = diff < 0 ? 'not-started' : diff >= PROGRAM_DAYS ? 'finished' : 'active'
  const dayIndex = Math.min(Math.max(diff, 0), PROGRAM_DAYS - 1)
  const week = Math.floor(dayIndex / 7) + 1
  return {
    status,
    dayIndex,
    week,
    dayOfWeek: (dayIndex % 7) + 1,
    phase: phaseForWeek(week),
    daysUntilStart: Math.max(0, -diff),
  }
}

/** Mulberry32 — tiny deterministic PRNG so "today's prompt" is stable across reloads. */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const rand = seededRandom(seed)
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Picks from a per-phase shuffled list so consecutive days don't repeat until the pool is exhausted. */
function pickForDay<T>(pool: readonly T[], dayIndex: number, salt: string, startDate: string, offset = 0): T {
  const shuffled = seededShuffle(pool, hashString(`${startDate}:${salt}`))
  return shuffled[(dayIndex + offset) % shuffled.length]
}

export interface TodayPlan {
  shadowing: Passage
  speaking: Prompt
  star: Prompt | null
  mockInterview: boolean
  finalVideoInterview: boolean
  seconds: number
}

export function speakingPool(phase: Phase): Prompt[] {
  return PROMPTS.filter((pr) => pr.phase === phase && pr.category !== 'star')
}

export function starPool(phase: Phase): Prompt[] {
  // Phase 3 also revisits phase-2 STAR questions.
  return PROMPTS.filter((pr) => pr.category === 'star' && pr.phase <= phase)
}

export function getTodayPlan(pos: ProgramPosition, settings: Settings, offset = 0): TodayPlan {
  const start = settings.startDate ?? ''
  const phase = pos.phase
  const shadowing = pickForDay(PASSAGES, pos.dayIndex, 'shadow', start, offset)
  const speaking = pickForDay(speakingPool(phase), pos.dayIndex, `speak-${phase}`, start, offset)
  // STAR questions on alternate days in phases 2 and 3.
  const star = phase >= 2 && pos.dayIndex % 2 === 1 ? pickForDay(starPool(phase), pos.dayIndex, `star-${phase}`, start, offset) : null
  const mockInterview = phase >= 2 && pos.dayOfWeek === 7
  return {
    shadowing,
    speaking,
    star,
    mockInterview,
    finalVideoInterview: pos.week === 12 && pos.dayOfWeek === 7,
    seconds: timeLimitFor(phase, settings),
  }
}

export function timeLimitFor(phase: Phase, settings: Settings): number {
  return settings.timeLimitOverride ?? phaseInfo(phase).defaultSeconds
}

export function randomItem<T>(items: readonly T[]): T | undefined {
  if (items.length === 0) return undefined
  return items[Math.floor(Math.random() * items.length)]
}

export function sampleWithoutReplacement<T>(items: readonly T[], n: number): T[] {
  return seededShuffle(items, Math.floor(Math.random() * 2 ** 31)).slice(0, n)
}
