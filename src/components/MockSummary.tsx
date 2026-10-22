import { formatDuration } from '../lib/dates'
import type { Prompt, Recording } from '../types'
import { RecordingRow } from './RecordingRow'

interface Props {
  questions: Prompt[]
  /** Latest answer per question id. */
  answers: Map<string, Recording>
}

function avg(values: number[]): number {
  return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0
}

export function MockSummary({ questions, answers }: Props) {
  const recs = questions.map((q) => answers.get(q.id)).filter((r): r is Recording => r !== undefined)
  const totalSec = recs.reduce((s, r) => s + r.durationSec, 0)
  const totalFillers = recs.reduce((s, r) => s + r.analysis.fillerTotal, 0)
  const connectors = new Set(recs.flatMap((r) => r.analysis.connectorsUsed))

  return (
    <div className="stack">
      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label">Answered</div>
          <div className="stat-value">
            {recs.length}/{questions.length}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Speaking time</div>
          <div className="stat-value">{formatDuration(totalSec)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Avg WPM</div>
          <div className="stat-value">{Math.round(avg(recs.map((r) => r.analysis.wordsPerMinute)))}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Fillers</div>
          <div className="stat-value">{totalFillers}</div>
          <div className="stat-sub">{totalSec > 0 ? (totalFillers / (totalSec / 60)).toFixed(1) : 0} / min</div>
        </div>
        <div className="stat">
          <div className="stat-label">Connectors</div>
          <div className="stat-value">{connectors.size}</div>
          <div className="stat-sub">different ones used</div>
        </div>
        <div className="stat">
          <div className="stat-label">Vocab variety</div>
          <div className="stat-value">{Math.round(avg(recs.map((r) => r.analysis.vocabularyVariety)) * 100)}%</div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="compare-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Time</th>
              <th>WPM</th>
              <th>Fillers</th>
              <th>Connectors</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, i) => {
              const r = answers.get(q.id)
              return (
                <tr key={q.id}>
                  <td className="muted">{i + 1}</td>
                  <td>{q.text}</td>
                  {r ? (
                    <>
                      <td>{formatDuration(r.durationSec)}</td>
                      <td>{r.analysis.wordsPerMinute}</td>
                      <td>{r.analysis.fillerTotal}</td>
                      <td>{r.analysis.connectorsUsed.length}</td>
                    </>
                  ) : (
                    <td colSpan={4} className="muted">
                      skipped
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {recs.length > 0 && (
        <div>
          <h3>Listen back</h3>
          {recs.map((r) => (
            <RecordingRow key={r.id} rec={r} />
          ))}
        </div>
      )}
    </div>
  )
}
