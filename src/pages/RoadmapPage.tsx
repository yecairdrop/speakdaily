import { Check, GraduationCap, Layers, ListChecks, Map as MapIcon, Rocket, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Onboarding } from '../components/Onboarding'
import { Disclosure } from '../components/ui/Disclosure'
import { PageHeader } from '../components/ui/PageHeader'
import { PHASES, WEEKS } from '../data/program'
import { UNITS_BY_ID } from '../data/units'
import { useApp } from '../hooks/useApp'
import { useI18n } from '../hooks/useI18n'
import { addDays } from '../lib/dates'
import { getProgramPosition } from '../lib/program'

const PHASE_ICONS = [Sprout, Layers, Rocket]

/** The 12 weeks as a journey: a path of nodes (done / current / upcoming) grouped by phase milestones. */
export default function RoadmapPage() {
  const { settings, progress } = useApp()
  const { t, formatDate } = useI18n()
  const pos = getProgramPosition(settings.startDate)

  if (!settings.startDate || !pos) return <Onboarding />
  const start = settings.startDate

  const practisedDays = (week: number) =>
    Array.from({ length: 7 }, (_, d) => (progress[addDays(start, (week - 1) * 7 + d)]?.recordings ?? 0) > 0)

  const stateOf = (week: number): 'done' | 'current' | 'upcoming' => {
    if (pos.status === 'finished') return 'done'
    if (pos.status === 'not-started') return 'upcoming'
    if (week < pos.week) return 'done'
    return week === pos.week ? 'current' : 'upcoming'
  }

  return (
    <div className="stack-lg">
      <PageHeader
        icon={MapIcon}
        title={t.roadmap.title}
        subtitle={
          <>
            {t.roadmap.started(formatDate(start))} · {t.roadmap.ends(formatDate(addDays(start, 83)))}
            <br />
            <strong>
              {pos.status === 'active' && t.roadmap.nowAt(pos.week, pos.dayOfWeek)}
              {pos.status === 'not-started' && t.roadmap.startsIn(pos.daysUntilStart)}
              {pos.status === 'finished' && t.roadmap.complete}
            </strong>
          </>
        }
      />

      <ol className="journey">
        {PHASES.map((ph) => {
          const Icon = PHASE_ICONS[ph.phase - 1]
          const text = t.program.phases[ph.phase - 1]
          return [
            <li key={`phase-${ph.phase}`} className={`milestone phase-${ph.phase}`}>
              <span className="milestone-icon" aria-hidden>
                <Icon size={28} />
              </span>
              <div className="row">
                <span className={`badge badge-phase-${ph.phase}`}>{t.common.phase(ph.phase)}</span>
                <span className="xs muted bold">
                  {t.roadmap.weeksRange(ph.weeks[0], ph.weeks[1])} · {t.roadmap.answers(ph.defaultSeconds)}
                </span>
              </div>
              <h2 style={{ margin: '4px 0' }}>{text.name}</h2>
              <p className="muted small">{text.summary}</p>
              <Disclosure summary={t.roadmap.routine} icon={ListChecks}>
                <ul className="checklist small">
                  {text.routine.map((r) => (
                    <li key={r}>
                      <Check size={16} aria-hidden />
                      {r}
                    </li>
                  ))}
                </ul>
              </Disclosure>
            </li>,
            ...WEEKS.filter((w) => w.phase === ph.phase).map((w) => {
              const state = stateOf(w.week)
              const week = t.program.weeks[w.week - 1]
              const days = practisedDays(w.week)
              const count = days.filter(Boolean).length
              return (
                <li key={w.week} className={`step-node ${state}`} aria-current={state === 'current' ? 'step' : undefined}>
                  <span className="node" aria-hidden>
                    {state === 'done' ? <Check size={20} strokeWidth={3} /> : w.week}
                  </span>
                  <article className="card card-compact week-card">
                    <div className="card-title" style={{ marginBottom: 6 }}>
                      <h3>
                        <span className="sr-only">{t.common.week(w.week)}: </span>
                        {week.title}
                      </h3>
                      {state === 'current' ? (
                        <span className="badge badge-accent">{t.roadmap.youAreHere}</span>
                      ) : state === 'done' ? (
                        <span className="badge badge-success">{t.roadmap.completed}</span>
                      ) : (
                        <span className="xs muted bold">{formatDate(addDays(start, (w.week - 1) * 7))}</span>
                      )}
                    </div>
                    <p className="small" style={{ marginBottom: 8 }}>
                      {week.goal}
                    </p>
                    <div className="chips">
                      {UNITS_BY_ID.get(w.week) && (
                        <Link to={`/units/${w.week}`} className="chip chip-suggest" style={{ padding: '3px 10px', fontSize: '0.78rem', textDecoration: 'none' }}>
                          <GraduationCap size={13} aria-hidden />
                          {t.roadmap.unitChip(w.week, UNITS_BY_ID.get(w.week)?.title[settings.language] ?? '')}
                        </Link>
                      )}
                      {week.focus.map((f) => (
                        <span key={f} className="chip xs" style={{ padding: '3px 10px', fontSize: '0.78rem' }}>
                          {f}
                        </span>
                      ))}
                    </div>
                    {state !== 'upcoming' && (
                      <div className="row" style={{ marginTop: 10 }}>
                        <span className="mini-dots" aria-hidden>
                          {days.map((on, i) => (
                            <span key={i} className={on ? 'on' : ''} />
                          ))}
                        </span>
                        <span className="xs muted bold">{t.roadmap.daysPractised(count)}</span>
                      </div>
                    )}
                  </article>
                </li>
              )
            }),
          ]
        })}
      </ol>
    </div>
  )
}
