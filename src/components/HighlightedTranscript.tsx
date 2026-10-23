import { Fragment, type ReactNode } from 'react'
import { useI18n } from '../hooks/useI18n'
import { CONNECTORS, findPhraseMatches } from '../lib/analysis'

interface Props {
  text: string
  fillers: readonly string[]
  connectors?: readonly string[]
}

/** Transcript with filler words (amber) and connector phrases (green) highlighted. */
export function HighlightedTranscript({ text, fillers, connectors = CONNECTORS }: Props) {
  const { t } = useI18n()
  if (!text.trim()) {
    return (
      <div className="transcript">
        <span className="placeholder">{t.analysis.noSpeech}</span>
      </div>
    )
  }

  const fillerSet = new Set(fillers.map((f) => f.toLowerCase()))
  const matches = findPhraseMatches(text, [...fillers, ...connectors])
  const parts: ReactNode[] = []
  let cursor = 0
  matches.forEach((m, i) => {
    if (m.start > cursor) parts.push(<Fragment key={`t${i}`}>{text.slice(cursor, m.start)}</Fragment>)
    const isFiller = fillerSet.has(m.phrase)
    parts.push(
      <mark
        key={`m${i}`}
        className={isFiller ? 'filler' : 'connector'}
        title={isFiller ? t.analysis.legendFillerText : t.analysis.legendConnectorText}
      >
        {text.slice(m.start, m.end)}
      </mark>,
    )
    cursor = m.end
  })
  if (cursor < text.length) parts.push(<Fragment key="end">{text.slice(cursor)}</Fragment>)

  return (
    <div className="transcript" lang="en">
      {parts}
    </div>
  )
}
