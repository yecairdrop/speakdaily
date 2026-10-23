import { Target, Volume2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useApp } from '../hooks/useApp'
import { useI18n } from '../hooks/useI18n'
import { cleanWord, pronounceWord } from '../lib/pronounce'
import type { SimilarityResult } from '../lib/similarity'
import { ProgressRing } from './ui/ProgressRing'

/** Wait briefly on hover so sweeping the mouse across the text doesn't fire every word. */
const HOVER_DELAY_MS = 180

export function SimilarityView({ result }: { result: SimilarityResult }) {
  const { t } = useI18n()
  const { settings } = useApp()
  const missed = result.reference.filter((tok) => tok.status === 'missed').length
  const hoverTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(hoverTimer.current), [])

  const say = (word: string) => {
    window.clearTimeout(hoverTimer.current)
    pronounceWord(word, { rate: settings.ttsRate, voiceURI: settings.ttsVoiceURI })
  }
  const sayAfterHover = (word: string) => {
    window.clearTimeout(hoverTimer.current)
    hoverTimer.current = window.setTimeout(() => say(word), HOVER_DELAY_MS)
  }
  const cancelHover = () => window.clearTimeout(hoverTimer.current)

  return (
    <div className="stack">
      <div className="row" style={{ gap: 16 }}>
        <ProgressRing
          value={result.score / 100}
          size={92}
          stroke={10}
          ariaLabel={`${result.score}% ${t.similarity.label}`}
          label={<strong>{result.score}%</strong>}
        />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="row bold">
            <Target size={18} aria-hidden />
            {t.similarity.label}
          </div>
          <p className="small muted m0">{t.similarity.summary(missed, result.extra.length)}</p>
        </div>
      </div>
      <p className="small m0 row" style={{ color: 'var(--secondary)', fontWeight: 700 }}>
        <Volume2 size={16} aria-hidden />
        {t.similarity.hoverHint}
      </p>
      <div className="transcript" style={{ maxHeight: 'none' }} lang="en">
        {result.reference.map((tok, i) => (
          <span key={i}>
            <button
              type="button"
              className={`word-btn ${tok.status === 'ok' ? 'diff-ok' : 'diff-missed'}`}
              onMouseEnter={() => sayAfterHover(tok.word)}
              onMouseLeave={cancelHover}
              onClick={() => say(tok.word)}
              aria-label={t.similarity.pronounce(cleanWord(tok.word))}
            >
              {tok.word}
            </button>{' '}
          </span>
        ))}
      </div>
      <p className="xs muted m0">
        <span className="diff-ok bold">{t.similarity.legendOk}</span> = {t.similarity.legendOkText} ·{' '}
        <span className="diff-missed">{t.similarity.legendMissed}</span> = {t.similarity.legendMissedText}
      </p>
      <p className="small muted m0">{t.similarity.explain}</p>
      {result.extra.length > 0 && (
        <div>
          <h3>{t.similarity.heardInstead}</h3>
          <div className="chips" lang="en">
            {Array.from(new Set(result.extra))
              .slice(0, 30)
              .map((w) => (
                <span key={w} className="chip">
                  {w}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
