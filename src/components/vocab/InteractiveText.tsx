import { useMemo } from 'react'
import { annotateText } from '../../lib/vocab/annotate'
import type { VocabItem } from '../../types'
import { WordButtons } from '../WordButtons'

interface Props {
  text: string
  /** Chunks to highlight (e.g. the unit's items); hovering them shows the chunk's meaning. */
  items: readonly VocabItem[]
  /** Character offset of the word currently spoken by text-to-speech. */
  charIndex: number | null
  /** Highlight `items` in orange (unit texts) or only use them for meanings (shadowing). */
  highlight?: boolean
}

/** English text where every word can be hovered/tapped to hear it and see its Turkish meaning. */
export function InteractiveText({ text, items, charIndex, highlight = true }: Props) {
  const words = useMemo(() => annotateText(text, items), [text, items])

  let current = -1
  if (charIndex !== null) {
    for (let i = 0; i < words.length && words[i].start <= charIndex; i++) current = i
  }

  const tokens = words.map((w, i) => ({
    word: w.word,
    tip: w.tip,
    className: [highlight && w.item ? 'vocab-word' : '', i === current ? 'current' : ''].filter(Boolean).join(' '),
  }))

  return (
    <p className="passage" lang="en">
      <WordButtons tokens={tokens} />
    </p>
  )
}
