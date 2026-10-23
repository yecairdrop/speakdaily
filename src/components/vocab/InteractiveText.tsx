import { useMemo } from 'react'
import { useHoverPronounce } from '../../hooks/useHoverPronounce'
import { useI18n } from '../../hooks/useI18n'
import { cleanWord } from '../../lib/pronounce'
import { itemRanges } from '../../lib/vocab/match'
import type { VocabItem } from '../../types'

interface Props {
  text: string
  /** Items to highlight (the unit's chunks). */
  items: readonly VocabItem[]
  /** Character offset of the word currently spoken by text-to-speech. */
  charIndex: number | null
}

/** English text where every word can be hovered/tapped to hear it; the unit's chunks are highlighted. */
export function InteractiveText({ text, items, charIndex }: Props) {
  const { t } = useI18n()
  const { say, hover, leave } = useHoverPronounce()

  const words = useMemo(() => {
    const ranges = itemRanges(text, items)
    const out: { word: string; start: number; vocab: boolean }[] = []
    for (const m of text.matchAll(/\S+/g)) {
      const start = m.index ?? 0
      out.push({ word: m[0], start, vocab: ranges.some((r) => start >= r.start && start < r.end) })
    }
    return out
  }, [text, items])

  let current = -1
  if (charIndex !== null) {
    for (let i = 0; i < words.length && words[i].start <= charIndex; i++) current = i
  }

  return (
    <p className="passage" lang="en">
      {words.map((w, i) => (
        <span key={i}>
          <button
            type="button"
            className={`word-btn${w.vocab ? ' vocab-word' : ''}${i === current ? ' current' : ''}`}
            onMouseEnter={() => hover(w.word)}
            onMouseLeave={leave}
            onClick={() => say(w.word)}
            aria-label={t.similarity.pronounce(cleanWord(w.word))}
          >
            {w.word}
          </button>{' '}
        </span>
      ))}
    </p>
  )
}
