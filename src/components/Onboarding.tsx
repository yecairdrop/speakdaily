import { ArrowRight, CircleHelp, Layers, Rocket, Sprout } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PHASES } from '../data/program'
import { useApp } from '../hooks/useApp'
import { useI18n } from '../hooks/useI18n'
import { toDateKey } from '../lib/dates'

const PHASE_ICONS = [Sprout, Layers, Rocket]

export function Onboarding() {
  const { updateSettings } = useApp()
  const { t } = useI18n()
  const [date, setDate] = useState(toDateKey())

  return (
    <div className="card stack-lg" style={{ maxWidth: 640, margin: '1rem auto' }}>
      <div>
        <h1 className="hero-greeting" style={{ fontSize: '2rem' }}>
          {t.onboarding.title}
        </h1>
        <p className="muted m0">{t.onboarding.intro}</p>
      </div>

      <ol className="journey" aria-label={t.roadmap.title}>
        {PHASES.map((ph) => {
          const Icon = PHASE_ICONS[ph.phase - 1]
          const text = t.program.phases[ph.phase - 1]
          return (
            <li key={ph.phase} className={`milestone phase-${ph.phase}`} style={{ marginTop: 0 }}>
              <span className="milestone-icon" aria-hidden>
                <Icon size={26} />
              </span>
              <div className="xs bold muted">{t.onboarding.weeksRange(ph.weeks[0], ph.weeks[1])}</div>
              <div className="bold">{text.name}</div>
              <div className="small muted">{text.summary}</div>
            </li>
          )
        })}
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (date) updateSettings({ startDate: date })
        }}
      >
        <div className="field">
          <label htmlFor="start-date">{t.onboarding.question}</label>
          <input id="start-date" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <span className="hint">{t.onboarding.hint}</span>
        </div>
        <div className="row">
          <button className="btn btn-primary btn-lg" type="submit">
            {t.onboarding.submit}
            <ArrowRight size={18} aria-hidden />
          </button>
          <Link className="btn btn-ghost" to="/help">
            <CircleHelp size={16} aria-hidden />
            {t.onboarding.howItWorks}
          </Link>
        </div>
      </form>
    </div>
  )
}
