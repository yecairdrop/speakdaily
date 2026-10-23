import { createPortal } from 'react-dom'
import { useHoverPronounce } from '../hooks/useHoverPronounce'
import { useI18n } from '../hooks/useI18n'
import { useWordTip } from '../hooks/useWordTip'
import { cleanWord } from '../lib/pronounce'

export interface WordToken {
  word: string
  className?: string
  /** Turkish meaning shown in a tooltip. */
  tip?: string
}

/**
 * English words as buttons: hover (or tap) to hear the word and see its Turkish meaning.
 * Used for unit texts, shadowing passages and the shadowing report.
 */
export function WordButtons({ tokens }: { tokens: readonly WordToken[] }) {
  const { t } = useI18n()
  const { say, hover, leave } = useHoverPronounce()
  const { tip, show, hide } = useWordTip()

  return (
    <>
      {tokens.map((tok, i) => (
        <span key={i}>
          <button
            type="button"
            className={`word-btn${tok.className ? ` ${tok.className}` : ''}`}
            // Hover only for a real mouse: touch screens send a fake mouseleave right after a tap,
            // which would close the tooltip immediately. Taps are handled by onClick below.
            onPointerEnter={(e) => {
              if (e.pointerType !== 'mouse') return
              hover(tok.word)
              show(e.currentTarget, tok.tip)
            }}
            onPointerLeave={(e) => {
              if (e.pointerType !== 'mouse') return
              leave()
              hide()
            }}
            onFocus={(e) => show(e.currentTarget, tok.tip)}
            onBlur={hide}
            onClick={(e) => {
              say(tok.word)
              show(e.currentTarget, tok.tip)
            }}
            aria-label={`${t.similarity.pronounce(cleanWord(tok.word))}${tok.tip ? ` — ${tok.tip}` : ''}`}
          >
            {tok.word}
          </button>{' '}
        </span>
      ))}
      {/* Portal to <body>: a transformed ancestor (e.g. the page transition) would otherwise become
          the containing block of this position:fixed tooltip and misplace it. */}
      {tip &&
        createPortal(
          <span className={`word-tip${tip.below ? ' below' : ''}`} role="tooltip" lang="tr" style={{ left: tip.x, top: tip.y }}>
            {tip.text}
          </span>,
          document.body,
        )}
    </>
  )
}
