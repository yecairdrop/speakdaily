import type { SimilarityResult } from '../lib/similarity'

export function SimilarityView({ result }: { result: SimilarityResult }) {
  const tone = result.score >= 85 ? 'badge-success' : result.score >= 60 ? 'badge-warning' : ''
  const missed = result.reference.filter((t) => t.status === 'missed').length
  return (
    <div className="stack">
      <div className="row">
        <span className="stat-value">{result.score}%</span>
        <span className={`badge ${tone}`}>word match</span>
        <span className="muted small">
          {missed} word(s) missed or unclear · {result.extra.length} extra / different word(s)
        </span>
      </div>
      <div className="transcript" style={{ maxHeight: 'none' }}>
        {result.reference.map((t, i) => (
          <span key={i} className={t.status === 'ok' ? 'diff-ok' : 'diff-missed'}>
            {t.word}{' '}
          </span>
        ))}
      </div>
      <p className="small muted">
        <span className="diff-ok">green</span> = recognised · <span className="diff-missed">red</span> = missed or
        mispronounced (the recogniser heard something else)
      </p>
      {result.extra.length > 0 && (
        <div>
          <h3>What the recogniser heard instead</h3>
          <div className="chips">
            {Array.from(new Set(result.extra)).slice(0, 30).map((w) => (
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
