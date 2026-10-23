import { Target } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import type { SimilarityResult } from '../lib/similarity'
import { ProgressRing } from './ui/ProgressRing'

export function SimilarityView({ result }: { result: SimilarityResult }) {
  const { t } = useI18n()
  const missed = result.reference.filter((tok) => tok.status === 'missed').length
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
      <div className="transcript" style={{ maxHeight: 'none' }} lang="en">
        {result.reference.map((tok, i) => (
          <span key={i} className={tok.status === 'ok' ? 'diff-ok' : 'diff-missed'}>
            {tok.word}{' '}
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
