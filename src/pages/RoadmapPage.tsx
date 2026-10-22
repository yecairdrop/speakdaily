import { Onboarding } from '../components/Onboarding'
import { PHASES, WEEKS } from '../data/program'
import { useApp } from '../hooks/useApp'
import { addDays, formatDate } from '../lib/dates'
import { getProgramPosition } from '../lib/program'

export default function RoadmapPage() {
  const { settings, progress } = useApp()
  const pos = getProgramPosition(settings.startDate)

  if (!settings.startDate || !pos) return <Onboarding />
  const start = settings.startDate

  const weekActivity = (week: number) => {
    let days = 0
    for (let d = 0; d < 7; d++) {
      if ((progress[addDays(start, (week - 1) * 7 + d)]?.recordings ?? 0) > 0) days++
    }
    return days
  }

  return (
    <div>
      <div className="page-header">
        <h1>12-week roadmap</h1>
        <p>
          Started {formatDate(start)} · ends {formatDate(addDays(start, 83))}
          {pos.status === 'active' && ` · you are in week ${pos.week}, day ${pos.dayOfWeek}`}
          {pos.status === 'not-started' && ` · starts in ${pos.daysUntilStart} day(s)`}
          {pos.status === 'finished' && ' · program complete 🎉'}
        </p>
      </div>

      {PHASES.map((ph) => (
        <section key={ph.phase}>
          <div className="phase-header">
            <span className={`badge badge-phase-${ph.phase}`}>Phase {ph.phase}</span>
            <h2 style={{ margin: 0 }}>{ph.name}</h2>
            <span className="muted small">
              Weeks {ph.weeks[0]}–{ph.weeks[1]} · {ph.defaultSeconds}s answers
            </span>
          </div>
          <p className="muted">{ph.summary}</p>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3>Daily routine</h3>
            <ul className="checklist">
              {ph.routine.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="grid grid-2">
            {WEEKS.filter((w) => w.phase === ph.phase).map((w) => {
              const isCurrent = pos.status === 'active' && pos.week === w.week
              const isPast = pos.status === 'finished' || (pos.status === 'active' && w.week < pos.week)
              const activeDays = weekActivity(w.week)
              return (
                <article
                  key={w.week}
                  className={`card week-card phase-${w.phase}${isCurrent ? ' current' : ''}${isPast ? ' past' : ''}`}
                  style={{ marginTop: 0 }}
                >
                  <div className="card-title">
                    <h3>
                      Week {w.week} · {w.title}
                    </h3>
                    {isCurrent ? (
                      <span className="badge badge-accent">This week</span>
                    ) : (
                      <span className="muted small">{formatDate(addDays(start, (w.week - 1) * 7))}</span>
                    )}
                  </div>
                  <p>{w.goal}</p>
                  <ul className="bullets small muted">
                    {w.focus.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  {(isPast || isCurrent) && (
                    <p className="small" style={{ marginTop: '0.6rem', marginBottom: 0 }}>
                      <span className={activeDays >= 5 ? 'badge badge-success' : 'badge'}>{activeDays}/7 days practised</span>
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
