import { Target, Volume2 } from 'lucide-react'
import { useMemo } from 'react'
import { ALL_ITEMS } from '../data/units'
import { useI18n } from '../hooks/useI18n'
import type { SimilarityResult } from '../lib/similarity'
import { annotateText } from '../lib/vocab/annotate'
import { ProgressRing } from './ui/ProgressRing'
import { WordButtons } from './WordButtons'

export function SimilarityView({ result, text }: { result: SimilarityResult; text: string }) {
  const { t } = useI18n()
  const missed = result.reference.filter((tok) => tok.status === 'missed').length
  // Reference words are the passage split on whitespace, so they line up with the annotated words.
  const tips = useMemo(() => annotateText(text, ALL_ITEMS).map((w) => w.tip), [text])
  const tokens = result.reference.map((tok, i) => ({
    word: tok.word,
    tip: tips[i],
    className: tok.status === 'ok' ? 'diff-ok' : 'diff-missed',
  }))

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
      <p className="small m0 row" style={{ color: 'var(--secondary)', fontWeight: 700, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
        <Volume2 size={16} aria-hidden />
        {t.similarity.hoverHint}
      </p>
      <div className="transcript" style={{ maxHeight: 'none' }} lang="en">
        <WordButtons tokens={tokens} />
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
