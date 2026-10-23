import { describe, expect, it } from 'vitest'
import { ALL_ITEMS, ITEMS_BY_ID, UNITS } from '../../data/units'
import { PROMPTS_BY_ID } from '../../data/prompts'
import { checkTyped } from '../vocab/answer'
import { blankSentence, buildPracticeSession, buildReviewSession, makeQuestion } from '../vocab/exercises'
import { findUsedItems, matchItem } from '../vocab/match'
import { applyAnswer, applySpeechUse, dueItemIds, itemLevel } from '../vocab/srs'

/** Deterministic RNG for stable tests. */
function rng(seed = 42) {
  let a = seed
  return () => {
    a = (a * 1664525 + 1013904223) % 4294967296
    return a / 4294967296
  }
}

describe('unit content', () => {
  it('has 12 units × 15 items with unique ids and terms', () => {
    expect(UNITS).toHaveLength(12)
    for (const u of UNITS) expect(u.items, `unit ${u.id}`).toHaveLength(15)
    expect(new Set(ALL_ITEMS.map((i) => i.id)).size).toBe(180)
    expect(new Set(ALL_ITEMS.map((i) => i.term.toLowerCase())).size).toBe(180)
  })

  it('every example sentence contains its item, so gap-fill always works', () => {
    for (const item of ALL_ITEMS) {
      expect(matchItem(item.example, item), `${item.id} "${item.term}" in "${item.example}"`).not.toBeNull()
      expect(blankSentence(item)).toContain('_____')
    }
  })

  it('every model text uses most of its unit (comprehensible input with the target chunks)', () => {
    for (const u of UNITS) {
      const used = findUsedItems(u.modelText, u.items)
      expect(used.length, `unit ${u.id}: ${u.items.filter((i) => !used.includes(i)).map((i) => i.term).join(', ')}`).toBeGreaterThanOrEqual(12)
    }
  })

  it('links every unit to an existing speaking prompt and has Turkish texts', () => {
    for (const u of UNITS) {
      expect(PROMPTS_BY_ID.has(u.promptId), u.promptId).toBe(true)
      expect(u.modelSummaryTr && u.title.tr && u.goal.tr).toBeTruthy()
      for (const i of u.items) expect(i.tr && i.exampleTr, i.id).toBeTruthy()
    }
  })
})

describe('matching your speech', () => {
  const item = (id: string) => {
    const i = ITEMS_BY_ID.get(id)
    if (!i) throw new Error(id)
    return i
  }
  it('recognises regular and irregular forms', () => {
    expect(findUsedItems('I worked on a chat app and fixed two bugs', [item('u4-12'), item('u4-04'), item('u4-03')])).toHaveLength(3)
    expect(matchItem('Everyone took responsibility.', item('u6-10'))).not.toBeNull()
    expect(matchItem('we were applying for jobs', item('u9-01'))).not.toBeNull()
    expect(matchItem('I realized it later', item('u8-02'))).not.toBeNull()
  })
  it('does not match inside other words', () => {
    expect(matchItem('the debugger is great', item('u4-03'))).toBeNull()
    expect(matchItem('a toolbox', item('u4-06'))).toBeNull()
  })
})

describe('spaced repetition', () => {
  it('moves up on correct answers and back to box 1 on mistakes', () => {
    const a = applyAnswer(undefined, true, '2026-01-01')
    expect(a).toMatchObject({ box: 1, due: '2026-01-02', correct: 1 })
    const b = applyAnswer(a, true, '2026-01-02')
    expect(b).toMatchObject({ box: 2, due: '2026-01-05' })
    const c = applyAnswer({ ...b, box: 4 }, false, '2026-01-05')
    expect(c).toMatchObject({ box: 1, due: '2026-01-06', wrong: 1 })
    expect(itemLevel(applyAnswer({ ...b, box: 2 }, true, '2026-01-05'))).toBe('learned')
  })
  it('promotes an item once per day when you use it in speech', () => {
    const p = applySpeechUse({ box: 2, due: '2026-01-10', correct: 2, wrong: 0, used: 0 }, '2026-01-05')
    expect(p).toMatchObject({ box: 3, used: 1, lastUsed: '2026-01-05', due: '2026-01-12' })
    expect(applySpeechUse(p, '2026-01-05')).toMatchObject({ box: 3, used: 2 })
  })
  it('lists due items, lowest box first', () => {
    const items = {
      a: { box: 3, due: '2026-01-01', correct: 0, wrong: 0, used: 0 },
      b: { box: 1, due: '2026-01-02', correct: 0, wrong: 0, used: 0 },
      c: { box: 1, due: '2026-02-01', correct: 0, wrong: 0, used: 0 },
    }
    expect(dueItemIds({ items, units: {} }, '2026-01-02')).toEqual(['b', 'a'])
  })
})

describe('exercises', () => {
  const unit = UNITS[0]
  it('builds 30 practice questions: recognise every item, then use it in context', () => {
    const qs = buildPracticeSession(unit.items, ALL_ITEMS, rng())
    expect(qs).toHaveLength(30)
    expect(qs.slice(15).every((q) => q.type === 'gap')).toBe(true)
    for (const q of qs) {
      expect(q.options).toHaveLength(4)
      expect(q.options).toContain(q.answer)
      expect(new Set(q.options.map((o) => o.toLowerCase())).size).toBe(4)
    }
  })
  it('meaning questions offer Turkish options, others English ones', () => {
    const item = unit.items[0]
    expect(makeQuestion(item, 'meaning', ALL_ITEMS, rng()).answer).toBe(item.tr)
    expect(makeQuestion(item, 'reverse', ALL_ITEMS, rng()).answer).toBe(item.term)
  })
  it('review asks harder questions for higher boxes', () => {
    const ids = unit.items.slice(0, 5).map((i) => i.id)
    const progress = Object.fromEntries(ids.map((id) => [id, { box: 4, due: '2026-01-01', correct: 3, wrong: 0, used: 0 }]))
    const qs = buildReviewSession(ids, progress, ITEMS_BY_ID, ALL_ITEMS, rng())
    expect(qs.every((q) => q.type === 'type' || q.type === 'gap')).toBe(true)
  })
  it('accepts small typos in typed answers but not wrong words', () => {
    expect(checkTyped('Take responsibility', ['take responsibility'])).toBe('correct')
    expect(checkTyped('take responsability', ['take responsibility'])).toBe('typo')
    expect(checkTyped('make a decision', ['take responsibility'])).toBe('wrong')
    expect(checkTyped('grew up', ['grow up', 'grew up'])).toBe('correct')
  })
})

describe('unit plan', async () => {
  const { currentUnit, isUnitComplete, nextStep, speakingTargets, unitStats } = await import('../vocab/plan')
  it('starts at unit 1 and moves on once all four steps are done', () => {
    const vocab = { items: {}, units: {} as Record<string, ('learn' | 'listen' | 'practice' | 'speak')[]> }
    expect(currentUnit(vocab).id).toBe(1)
    expect(nextStep(vocab, 1)).toBe('learn')
    vocab.units[1] = ['learn', 'listen', 'practice', 'speak']
    expect(isUnitComplete(vocab, 1)).toBe(true)
    expect(currentUnit(vocab).id).toBe(2)
  })
  it('suggests unit words you have not used yet plus connectors', () => {
    const unit = UNITS[1]
    const used = Object.fromEntries(unit.items.slice(0, 3).map((i) => [i.id, { box: 3, due: '2026-01-01', correct: 1, wrong: 0, used: 2 }]))
    const targets = speakingTargets({ items: used, units: {} }, unit)
    expect(targets).toHaveLength(5)
    expect(targets.slice(0, 3).every((t) => t.unitId === 2 && t.kind !== 'connector' && !(t.id in used))).toBe(true)
    expect(targets.slice(3).every((t) => t.kind === 'connector' && t.unitId <= 2)).toBe(true)
    expect(unitStats({ items: used, units: {} }, unit)).toMatchObject({ learned: 3, usedInSpeech: 3, total: 15 })
  })
})
