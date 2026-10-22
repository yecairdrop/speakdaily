import { describe, expect, it } from 'vitest'
import { toDateKey } from '../dates'
import { DEFAULT_SETTINGS } from '../storage'
import { getProgramPosition, getTodayPlan } from '../program'
import { currentStreak, longestStreak } from '../stats'

function at(start: string, today: string) {
  const p = getProgramPosition(start, today)
  if (!p) throw new Error('expected a position')
  return p
}

describe('getProgramPosition', () => {
  it('computes week, day and phase', () => {
    expect(getProgramPosition('2026-01-01', '2026-01-01')).toMatchObject({ status: 'active', week: 1, dayOfWeek: 1, phase: 1 })
    expect(getProgramPosition('2026-01-01', '2026-01-29')).toMatchObject({ week: 5, dayOfWeek: 1, phase: 2 })
    expect(getProgramPosition('2026-01-01', '2026-03-25')).toMatchObject({ week: 12, dayOfWeek: 7, phase: 3 })
  })
  it('handles before start and after the end', () => {
    expect(getProgramPosition('2026-01-10', '2026-01-07')).toMatchObject({ status: 'not-started', daysUntilStart: 3, week: 1 })
    expect(getProgramPosition('2026-01-01', '2026-06-01')).toMatchObject({ status: 'finished', week: 12 })
  })
  it('is DST safe (Europe switches clocks in late March)', () => {
    expect(getProgramPosition('2026-03-20', '2026-04-02')?.dayIndex).toBe(13)
  })
})

describe('getTodayPlan', () => {
  const settings = { ...DEFAULT_SETTINGS, startDate: '2026-01-01' }
  it('is deterministic and phase-appropriate', () => {
    const pos = at('2026-01-01', '2026-01-03')
    const a = getTodayPlan(pos, settings)
    const b = getTodayPlan(pos, settings)
    expect(a.speaking.id).toBe(b.speaking.id)
    expect(a.speaking.phase).toBe(1)
    expect(a.star).toBeNull()
    expect(a.seconds).toBe(60)
  })
  it('does not repeat speaking prompts within a phase-1 month', () => {
    const ids = new Set<string>()
    for (let d = 0; d < 28; d++) {
      ids.add(getTodayPlan(at('2026-01-01', toDateKey(new Date(2026, 0, 1 + d))), settings).speaking.id)
    }
    expect(ids.size).toBe(28)
  })
  it('adds STAR questions and the weekly mock interview in phase 2', () => {
    const day36 = getTodayPlan(at('2026-01-01', '2026-02-05'), settings)
    expect(day36.star?.category).toBe('star')
    const day35 = getTodayPlan(at('2026-01-01', '2026-02-04'), settings)
    expect(day35.mockInterview).toBe(true)
    expect(day35.seconds).toBe(120)
  })
  it('respects the time limit override', () => {
    const pos = at('2026-01-01', '2026-01-03')
    expect(getTodayPlan(pos, { ...settings, timeLimitOverride: 90 }).seconds).toBe(90)
  })
})

describe('streaks', () => {
  const day = (recordings: number) => ({ seconds: 60, recordings, tasks: [] })
  it('counts consecutive days ending today or yesterday', () => {
    const log = { '2026-01-01': day(1), '2026-01-02': day(2), '2026-01-03': day(1) }
    expect(currentStreak(log, '2026-01-03')).toBe(3)
    expect(currentStreak(log, '2026-01-04')).toBe(3)
    expect(currentStreak(log, '2026-01-05')).toBe(0)
  })
  it('finds the longest streak', () => {
    const log = { '2026-01-01': day(1), '2026-01-02': day(1), '2026-01-05': day(1), '2026-01-06': day(1), '2026-01-07': day(1) }
    expect(longestStreak(log)).toBe(3)
  })
})
