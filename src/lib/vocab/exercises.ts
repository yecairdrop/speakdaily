import type { ItemProgress, VocabItem } from '../../types'
import { matchItem } from './match'

/**
 * Exercise types, from recognition to production:
 * meaning (EN → pick TR) · listen (hear EN → pick EN) · reverse (TR → pick EN) · gap (sentence → pick EN) · type (TR → type EN)
 */
export type ExerciseType = 'meaning' | 'listen' | 'reverse' | 'gap' | 'type'

export interface Question {
  key: string
  itemId: string
  type: ExerciseType
  /** Choice questions: option labels (one equals `answer`). Typed questions: empty. */
  options: string[]
  answer: string
  /** Gap questions: the example sentence with the item blanked out. */
  sentence?: string
}

type Rng = () => number

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Three distractors, preferring items of the same kind from the same unit, never duplicating the answer. */
function distractors(item: VocabItem, pool: readonly VocabItem[], label: (i: VocabItem) => string, rng: Rng): string[] {
  const answer = label(item)
  const seen = new Set([answer.toLowerCase()])
  const ranked = shuffle(
    pool.filter((p) => p.id !== item.id),
    rng,
  ).sort((a, b) => score(b) - score(a))
  function score(p: VocabItem) {
    return (p.unitId === item.unitId ? 2 : 0) + (p.kind === item.kind ? 1 : 0)
  }
  const out: string[] = []
  for (const p of ranked) {
    const l = label(p)
    if (seen.has(l.toLowerCase())) continue
    seen.add(l.toLowerCase())
    out.push(l)
    if (out.length === 3) break
  }
  return out
}

export function blankSentence(item: VocabItem): string {
  const m = matchItem(item.example, item)
  if (!m) return item.example
  return `${item.example.slice(0, m.start)}_____${item.example.slice(m.end)}`
}

export function makeQuestion(item: VocabItem, type: ExerciseType, pool: readonly VocabItem[], rng: Rng, n = 0): Question {
  const key = `${item.id}:${type}:${n}`
  if (type === 'type') return { key, itemId: item.id, type, options: [], answer: item.term }
  const toTr = type === 'meaning'
  const label = (i: VocabItem) => (toTr ? i.tr : i.term)
  const answer = label(item)
  const options = shuffle([answer, ...distractors(item, pool, label, rng)], rng)
  return { key, itemId: item.id, type, options, answer, ...(type === 'gap' ? { sentence: blankSentence(item) } : {}) }
}

/** Unit practice: first recognise every item (meaning / listen), then use it in context (gap). */
export function buildPracticeSession(items: readonly VocabItem[], pool: readonly VocabItem[], rng: Rng = Math.random): Question[] {
  const recognise = shuffle(items, rng).map((item, i) => makeQuestion(item, i % 3 === 2 ? 'listen' : 'meaning', pool, rng))
  const inContext = shuffle(items, rng).map((item) => makeQuestion(item, 'gap', pool, rng))
  return [...recognise, ...inContext]
}

/** Harder exercise types as an item climbs the boxes: recognise → choose in context → produce. */
export function exerciseForBox(box: number, rng: Rng): ExerciseType {
  if (box <= 1) return rng() < 0.6 ? 'meaning' : 'listen'
  if (box === 2) return rng() < 0.5 ? 'reverse' : 'gap'
  return rng() < 0.7 ? 'type' : 'gap'
}

export const REVIEW_LIMIT = 20

export function buildReviewSession(
  dueIds: readonly string[],
  progress: Record<string, ItemProgress>,
  byId: ReadonlyMap<string, VocabItem>,
  pool: readonly VocabItem[],
  rng: Rng = Math.random,
): Question[] {
  return dueIds
    .slice(0, REVIEW_LIMIT)
    .map((id) => byId.get(id))
    .filter((i): i is VocabItem => i !== undefined)
    .map((item) => makeQuestion(item, exerciseForBox(progress[item.id]?.box ?? 1, rng), pool, rng))
}

/** After a wrong answer the item comes back once at the end of the session, as an easier question. */
export function retryQuestion(q: Question, item: VocabItem, pool: readonly VocabItem[], rng: Rng): Question {
  const type: ExerciseType = q.type === 'meaning' ? 'reverse' : 'meaning'
  return makeQuestion(item, type, pool, rng, 1)
}
