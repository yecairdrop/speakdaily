import { glossTr } from '../../data/glossaryTr'
import type { VocabItem } from '../../types'
import { itemRanges } from './match'

export interface AnnotatedWord {
  word: string
  start: number
  /** The unit chunk this word belongs to, if any. */
  item?: VocabItem
  /** Turkish tooltip: the chunk's meaning if the word is part of one, otherwise the word's own gloss. */
  tip?: string
}

/** Splits an English text into words and attaches the Turkish meaning to show on hover. */
export function annotateText(text: string, items: readonly VocabItem[]): AnnotatedWord[] {
  const ranges = itemRanges(text, items)
  const out: AnnotatedWord[] = []
  for (const m of text.matchAll(/\S+/g)) {
    const start = m.index ?? 0
    const range = ranges.find((r) => start >= r.start && start < r.end)
    const tip = range ? `${range.item.term} — ${range.item.tr}` : glossTr(m[0])
    out.push({ word: m[0], start, ...(range ? { item: range.item } : {}), ...(tip ? { tip } : {}) })
  }
  return out
}
