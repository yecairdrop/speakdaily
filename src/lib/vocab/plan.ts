import { UNITS } from '../../data/units'
import type { Unit, UnitStep, VocabItem, VocabProgress } from '../../types'
import { LEARNED_BOX } from './srs'

export const UNIT_STEPS: UnitStep[] = ['learn', 'listen', 'practice', 'speak']

export function stepsDone(vocab: VocabProgress, unitId: number): UnitStep[] {
  return vocab.units[unitId] ?? []
}

export function isUnitComplete(vocab: VocabProgress, unitId: number): boolean {
  const done = stepsDone(vocab, unitId)
  return UNIT_STEPS.every((s) => done.includes(s))
}

export function nextStep(vocab: VocabProgress, unitId: number): UnitStep | null {
  const done = stepsDone(vocab, unitId)
  return UNIT_STEPS.find((s) => !done.includes(s)) ?? null
}

/** The first unit you haven't finished (units are meant to be done in order, one per week). */
export function currentUnit(vocab: VocabProgress, units: readonly Unit[] = UNITS): Unit {
  return units.find((u) => !isUnitComplete(vocab, u.id)) ?? units[units.length - 1]
}

export interface UnitStats {
  total: number
  started: number
  learned: number
  usedInSpeech: number
}

export function unitStats(vocab: VocabProgress, unit: Unit): UnitStats {
  let started = 0
  let learned = 0
  let usedInSpeech = 0
  for (const item of unit.items) {
    const p = vocab.items[item.id]
    if (!p) continue
    started++
    if (p.box >= LEARNED_BOX) learned++
    if (p.used > 0) usedInSpeech++
  }
  return { total: unit.items.length, started, learned, usedInSpeech }
}

export function totalStats(vocab: VocabProgress): { learned: number; usedInSpeech: number; started: number } {
  let learned = 0
  let usedInSpeech = 0
  let started = 0
  for (const p of Object.values(vocab.items)) {
    started++
    if (p.box >= LEARNED_BOX) learned++
    if (p.used > 0) usedInSpeech++
  }
  return { learned, usedInSpeech, started }
}

/**
 * Words to try in a speaking answer: from the current unit, the ones you have used least in speech
 * and know least (that's where using them helps most), plus connectors from units up to this one.
 */
export function speakingTargets(vocab: VocabProgress, unit: Unit, words = 3, connectors = 2, units: readonly Unit[] = UNITS): VocabItem[] {
  const rank = (a: VocabItem, b: VocabItem) => {
    const pa = vocab.items[a.id]
    const pb = vocab.items[b.id]
    return (pa?.used ?? 0) - (pb?.used ?? 0) || (pa?.box ?? 0) - (pb?.box ?? 0) || a.id.localeCompare(b.id)
  }
  const unitWords = unit.items.filter((i) => i.kind !== 'connector').sort(rank).slice(0, words)
  const pool = units.filter((u) => u.id <= unit.id).flatMap((u) => u.items.filter((i) => i.kind === 'connector'))
  const conn = pool.sort(rank).slice(0, connectors)
  return [...unitWords, ...conn]
}
