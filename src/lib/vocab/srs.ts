import { addDays } from '../dates'
import type { ItemProgress, VocabProgress } from '../../types'

/** Days until the next review for each Leitner box (1..5). */
export const INTERVALS: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 }
export const MAX_BOX = 5
/** An item counts as "learned" once it survived two spaced reviews. */
export const LEARNED_BOX = 3

export function emptyProgress(): VocabProgress {
  return { items: {}, units: {} }
}

/**
 * Record one answer. Correct → move up a box and wait longer; wrong → back to box 1, due tomorrow
 * (the session itself already re-asks it). New items start in box 1 either way.
 */
export function applyAnswer(prev: ItemProgress | undefined, correct: boolean, today: string): ItemProgress {
  const base: ItemProgress = prev ?? { box: 0, due: today, correct: 0, wrong: 0, used: 0 }
  const box = correct ? Math.min(MAX_BOX, Math.max(1, base.box + 1)) : 1
  return {
    ...base,
    box,
    due: addDays(today, INTERVALS[box]),
    correct: base.correct + (correct ? 1 : 0),
    wrong: base.wrong + (correct ? 0 : 1),
  }
}

/** Using an item in your own speech is the strongest evidence: count it and promote once per day. */
export function applySpeechUse(prev: ItemProgress | undefined, today: string): ItemProgress {
  const base: ItemProgress = prev ?? { box: 0, due: today, correct: 0, wrong: 0, used: 0 }
  if (base.lastUsed === today) return { ...base, used: base.used + 1 }
  const box = Math.min(MAX_BOX, Math.max(1, base.box + 1))
  return { ...base, box, due: addDays(today, INTERVALS[box]), used: base.used + 1, lastUsed: today }
}

export function isDue(p: ItemProgress | undefined, today: string): boolean {
  return p !== undefined && p.due <= today
}

export function dueItemIds(progress: VocabProgress, today: string): string[] {
  return Object.entries(progress.items)
    .filter(([, p]) => isDue(p, today))
    .sort(([, a], [, b]) => a.box - b.box || a.due.localeCompare(b.due))
    .map(([id]) => id)
}

export type ItemLevel = 'new' | 'learning' | 'learned' | 'mastered'

export function itemLevel(p: ItemProgress | undefined): ItemLevel {
  if (!p || p.box === 0) return 'new'
  if (p.box >= MAX_BOX) return 'mastered'
  if (p.box >= LEARNED_BOX) return 'learned'
  return 'learning'
}
