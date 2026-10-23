import { matchItem } from '../../lib/vocab/match'
import type { VocabItem } from '../../types'

/** The item's example sentence with the item itself highlighted. */
export function HighlightedExample({ item, text = item.example }: { item: VocabItem; text?: string }) {
  const m = matchItem(text, item)
  if (!m) return <span lang="en">{text}</span>
  return (
    <span lang="en">
      {text.slice(0, m.start)}
      <mark className="vocab">{m.text}</mark>
      {text.slice(m.end)}
    </span>
  )
}
