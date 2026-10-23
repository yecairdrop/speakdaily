import type { VocabItem } from '../../types'

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** One word of a term, tolerant of regular inflections: work → works/worked/working, realise → realising, apply → applied. */
function wordPattern(word: string): string {
  const w = word.toLowerCase()
  if (w.length < 3 || !/^[a-z]+$/.test(w)) return escapeRegExp(w).replace(/'/g, "['’]")
  const forms = [`${escapeRegExp(w)}(?:s|es|ed|d|ing)?`]
  if (w.endsWith('e')) forms.push(`${escapeRegExp(w.slice(0, -1))}(?:ing|ed)`)
  if (w.endsWith('y')) forms.push(`${escapeRegExp(w.slice(0, -1))}(?:ies|ied)`)
  return `(?:${forms.join('|')})`
}

function phrasePattern(phrase: string): RegExp {
  const body = phrase.trim().split(/\s+/).map(wordPattern).join('\\s+')
  return new RegExp(`(?<![\\w'’-])${body}(?![\\w'’-])`, 'i')
}

const cache = new Map<string, RegExp[]>()

function patternsFor(item: VocabItem): RegExp[] {
  let list = cache.get(item.id)
  if (!list) {
    list = [item.term, ...(item.alt ?? [])].map(phrasePattern)
    cache.set(item.id, list)
  }
  return list
}

export interface ItemMatch {
  start: number
  end: number
  text: string
}

/** First occurrence of the item (any accepted form) in the text, or null. */
export function matchItem(text: string, item: VocabItem): ItemMatch | null {
  let best: ItemMatch | null = null
  for (const re of patternsFor(item)) {
    const m = re.exec(text)
    if (m && (best === null || m.index < best.start)) best = { start: m.index, end: m.index + m[0].length, text: m[0] }
  }
  return best
}

/** Items that appear in the text (e.g. a transcript of your own speech). */
export function findUsedItems(text: string, items: readonly VocabItem[]): VocabItem[] {
  if (!text.trim()) return []
  return items.filter((item) => matchItem(text, item) !== null)
}

/** Non-overlapping highlight ranges for all items found in the text (longer matches win). */
export function itemRanges(text: string, items: readonly VocabItem[]): (ItemMatch & { item: VocabItem })[] {
  const all = items
    .map((item) => {
      const m = matchItem(text, item)
      return m ? { ...m, item } : null
    })
    .filter((m): m is ItemMatch & { item: VocabItem } => m !== null)
    .sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start))
  const out: typeof all = []
  let lastEnd = -1
  for (const m of all) {
    if (m.start >= lastEnd) {
      out.push(m)
      lastEnd = m.end
    }
  }
  return out
}
