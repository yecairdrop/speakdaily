import { formatDuration } from '../lib/dates'
import type { AnalysisResult } from '../types'
import { HighlightedTranscript } from './HighlightedTranscript'

interface Props {
  analysis: AnalysisResult
  transcript: string
  durationSec: number
  showTranscript?: boolean
}

export function StatGrid({ analysis, durationSec }: { analysis: AnalysisResult; durationSec: number }) {
  return (
    <div className="stat-grid">
      <div className="stat">
        <div className="stat-label">Duration</div>
        <div className="stat-value">{formatDuration(durationSec)}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Words</div>
        <div className="stat-value">{analysis.wordCount}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Words / min</div>
        <div className="stat-value">{analysis.wordsPerMinute}</div>
        <div className="stat-sub">target 110–150</div>
      </div>
      <div className="stat">
        <div className="stat-label">Fillers</div>
        <div className="stat-value">{analysis.fillerTotal}</div>
        <div className="stat-sub">{analysis.fillersPerMinute} / min</div>
      </div>
      <div className="stat">
        <div className="stat-label">Longest pause</div>
        <div className="stat-value">{analysis.longestPauseSec === null ? '—' : `${analysis.longestPauseSec}s`}</div>
        <div className="stat-sub">approx.</div>
      </div>
      <div className="stat">
        <div className="stat-label">Vocab variety</div>
        <div className="stat-value">{Math.round(analysis.vocabularyVariety * 100)}%</div>
        <div className="stat-sub">{analysis.uniqueWords} unique words</div>
      </div>
    </div>
  )
}

export function AnalysisView({ analysis, transcript, durationSec, showTranscript = true }: Props) {
  return (
    <div className="stack">
      <StatGrid analysis={analysis} durationSec={durationSec} />

      {showTranscript && (
        <div>
          <h3>Transcript</h3>
          <HighlightedTranscript text={transcript} fillers={analysis.fillers.map((f) => f.word)} />
          <p className="small muted" style={{ marginTop: '0.4rem' }}>
            <mark className="filler">amber</mark> = filler word · <mark className="connector">green</mark> = connector
          </p>
        </div>
      )}

      <div className="grid grid-2">
        <div>
          <h3>Filler words</h3>
          {analysis.fillers.length === 0 ? (
            <p className="muted small">None detected — great!</p>
          ) : (
            <div className="chips">
              {analysis.fillers.map((f) => (
                <span key={f.word} className="chip chip-warning">
                  {f.word} × {f.count}
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3>Connector phrases</h3>
          {analysis.connectorsUsed.length > 0 ? (
            <div className="chips" style={{ marginBottom: '0.6rem' }}>
              {analysis.connectorsUsed.map((c) => (
                <span key={c} className="chip chip-success">
                  ✓ {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted small">No connectors used this time.</p>
          )}
          <p className="small muted" style={{ marginBottom: '0.3rem' }}>
            Try next time:
          </p>
          <div className="chips">
            {analysis.connectorSuggestions.map((c) => (
              <span key={c} className="chip chip-suggest">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {analysis.feedback.length > 0 && (
        <div>
          <h3>Tips</h3>
          <ul className="bullets">
            {analysis.feedback.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
