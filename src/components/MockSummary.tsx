import { CircleCheck, Gauge, Link2, MessageCircleWarning, Sparkles, Timer } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { formatDuration } from '../lib/dates'
import type { Prompt, Recording } from '../types'
import { StatCard } from './AnalysisView'
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
  const { t } = useI18n()
  const recs = questions.map((q) => answers.get(q.id)).filter((r): r is Recording => r !== undefined)
  const totalSec = recs.reduce((s, r) => s + r.durationSec, 0)
  const totalFillers = recs.reduce((s, r) => s + r.analysis.fillerTotal, 0)
  const connectors = new Set(recs.flatMap((r) => r.analysis.connectorsUsed))
  const fillersPerMin = totalSec > 0 ? Math.round((totalFillers / (totalSec / 60)) * 10) / 10 : 0

  return (
    <div className="stack-lg">
      <div className="stat-grid stat-grid-6">
        <StatCard icon={CircleCheck} tone="mint" label={t.mock.answered} value={`${recs.length}/${questions.length}`} />
        <StatCard icon={Timer} label={t.mock.speakingTime} value={formatDuration(totalSec)} />
        <StatCard icon={Gauge} label={t.mock.avgWpm} value={Math.round(avg(recs.map((r) => r.analysis.wordsPerMinute)))} />
        <StatCard icon={MessageCircleWarning} tone="sun" label={t.mock.fillers} value={totalFillers} sub={t.analysis.perMin(fillersPerMin)} />
        <StatCard icon={Link2} tone="mint" label={t.mock.connectors} value={connectors.size} sub={t.mock.differentOnes} />
        <StatCard
          icon={Sparkles}
          tone="sun"
          label={t.mock.variety}
          value={`${Math.round(avg(recs.map((r) => r.analysis.vocabularyVariety)) * 100)}%`}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="compare-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t.mock.colQuestion}</th>
              <th>{t.mock.colTime}</th>
              <th>{t.mock.colWpm}</th>
              <th>{t.mock.colFillers}</th>
              <th>{t.mock.colConnectors}</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, i) => {
              const r = answers.get(q.id)
              return (
                <tr key={q.id}>
                  <td className="muted">{i + 1}</td>
                  <td lang="en">{q.text}</td>
                  {r ? (
                    <>
                      <td>{formatDuration(r.durationSec)}</td>
                      <td>{r.analysis.wordsPerMinute}</td>
                      <td>{r.analysis.fillerTotal}</td>
                      <td>{r.analysis.connectorsUsed.length}</td>
                    </>
                  ) : (
                    <td colSpan={4} className="muted">
                      {t.mock.skipped}
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
          <h3>{t.mock.listenBack}</h3>
          {recs.map((r) => (
            <RecordingRow key={r.id} rec={r} />
          ))}
        </div>
      )}
    </div>
  )
}
