import { ArrowRight, BookOpenCheck, Check, GraduationCap, Mic, RotateCcw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCard } from '../components/AnalysisView'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressRing } from '../components/ui/ProgressRing'
import { UNITS } from '../data/units'
import { useApp } from '../hooks/useApp'
import { useI18n } from '../hooks/useI18n'
import { toDateKey } from '../lib/dates'
import { UNIT_STEPS, currentUnit, isUnitComplete, stepsDone, totalStats, unitStats } from '../lib/vocab/plan'
import { dueItemIds } from '../lib/vocab/srs'
import { UNIT_FALLBACK_ICON, UNIT_ICONS } from '../lib/vocab/unitIcons'

export default function UnitsPage() {
  const { vocab, settings } = useApp()
  const { t } = useI18n()
  const due = dueItemIds(vocab, toDateKey()).length
  const current = currentUnit(vocab)
  const totals = totalStats(vocab)
  const lang = settings.language

  return (
    <div className="stack-lg">
      <PageHeader icon={GraduationCap} title={t.units.title} subtitle={t.units.subtitle} />

      <div className="stat-grid">
        <StatCard icon={BookOpenCheck} tone="mint" label={t.units.statLearned} value={`${totals.learned}/180`} />
        <StatCard icon={Mic} label={t.units.statUsed} value={totals.usedInSpeech} />
        <StatCard icon={RotateCcw} tone="sun" label={t.units.statDue} value={due} />
      </div>

      <section className={`card review-banner${due > 0 ? ' has-due' : ''}`}>
        <div className="row spread">
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <span className="task-icon sun" aria-hidden>
              <RotateCcw size={24} />
            </span>
            <div>
              <h3 className="m0">{t.review.title}</h3>
              <p className="small muted m0">{due > 0 ? t.units.dueToday(due) : t.units.noDue}</p>
            </div>
          </div>
          {due > 0 && (
            <Link className="btn btn-primary" to="/review">
              {t.units.reviewNow}
              <ArrowRight size={16} aria-hidden />
            </Link>
          )}
        </div>
      </section>

      <div className="unit-grid">
        {UNITS.map((unit) => {
          const Icon = UNIT_ICONS[unit.id - 1] ?? UNIT_FALLBACK_ICON
          const stats = unitStats(vocab, unit)
          const done = stepsDone(vocab, unit.id)
          const complete = isUnitComplete(vocab, unit.id)
          const isCurrent = unit.id === current.id && !complete
          const started = done.length > 0
          return (
            <Link key={unit.id} to={`/units/${unit.id}`} className={`card unit-card${isCurrent ? ' current' : ''}${complete ? ' complete' : ''}`}>
              <div className="row spread" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                <span className="unit-icon" aria-hidden>
                  {complete ? <Check size={26} strokeWidth={3} /> : <Icon size={24} />}
                </span>
                <ProgressRing
                  value={stats.learned / stats.total}
                  size={52}
                  stroke={6}
                  ariaLabel={t.units.learnedOf(stats.learned, stats.total)}
                  label={<span className="xs bold">{Math.round((stats.learned / stats.total) * 100)}%</span>}
                />
              </div>
              <div className="row" style={{ gap: 6, marginTop: 10 }}>
                <span className="xs bold muted">
                  {t.units.unitN(unit.id)} · {t.units.weekUnit(unit.id)}
                </span>
                {isCurrent && <span className="badge badge-accent">{t.units.current}</span>}
                {complete && <span className="badge badge-success">{t.units.completed}</span>}
              </div>
              <h3 style={{ margin: '4px 0' }}>{unit.title[lang]}</h3>
              <p className="small muted m0">{unit.goal[lang]}</p>
              <div className="row spread" style={{ marginTop: 12 }}>
                <span className="step-dots" aria-label={done.map((s) => t.units.steps[s]).join(', ')}>
                  {UNIT_STEPS.map((s) => (
                    <span key={s} className={done.includes(s) ? 'on' : ''} title={t.units.steps[s]} />
                  ))}
                </span>
                <span className="small bold unit-cta">
                  {complete ? <Sparkles size={14} aria-hidden /> : null}
                  {complete ? t.units.open : started ? t.units.continue : t.units.start}
                  <ArrowRight size={14} aria-hidden />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
