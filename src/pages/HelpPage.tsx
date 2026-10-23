import {
  Archive,
  ArrowRight,
  BookOpenText,
  Briefcase,
  CircleHelp,
  GraduationCap,
  Headphones,
  House,
  Layers,
  Library,
  Lightbulb,
  Map as MapIcon,
  Rocket,
  Settings,
  Sprout,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { PHASES } from '../data/program'
import { useI18n } from '../hooks/useI18n'
import type { Messages } from '../i18n'

const PHASE_ICONS = [Sprout, Layers, Rocket]

const SCREENS: { key: keyof Messages['help']['screens']; to: string; icon: LucideIcon; nav: keyof Messages['nav'] }[] = [
  { key: 'today', to: '/', icon: House, nav: 'today' },
  { key: 'units', to: '/units', icon: GraduationCap, nav: 'units' },
  { key: 'roadmap', to: '/roadmap', icon: MapIcon, nav: 'roadmap' },
  { key: 'shadowing', to: '/shadowing', icon: Headphones, nav: 'shadowing' },
  { key: 'questions', to: '/questions', icon: Library, nav: 'questions' },
  { key: 'mock', to: '/mock', icon: Briefcase, nav: 'mock' },
  { key: 'archive', to: '/archive', icon: Archive, nav: 'archive' },
  { key: 'progress', to: '/progress', icon: TrendingUp, nav: 'progress' },
  { key: 'settings', to: '/settings', icon: Settings, nav: 'settings' },
]

/** Plain-language tutorial: the program, the daily routine, every screen and the key terms. */
export default function HelpPage() {
  const { t } = useI18n()
  const h = t.help

  return (
    <div className="stack-lg">
      <PageHeader icon={CircleHelp} title={h.title} subtitle={h.intro} />

      <section className="card stack">
        <h2 className="m0">{h.programTitle}</h2>
        <p className="muted m0">{h.programText}</p>
        <div className="help-phases">
          {PHASES.map((ph) => {
            const Icon = PHASE_ICONS[ph.phase - 1]
            const text = t.program.phases[ph.phase - 1]
            return (
              <div key={ph.phase} className="help-phase">
                <div className="row" style={{ marginBottom: 6 }}>
                  <Icon size={20} aria-hidden style={{ color: `var(--phase-${ph.phase})` }} />
                  <span className="xs bold muted">{t.roadmap.weeksRange(ph.weeks[0], ph.weeks[1])}</span>
                </div>
                <h3 style={{ marginBottom: 4 }}>{text.name}</h3>
                <p className="small muted m0">{text.summary}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="card stack">
        <h2 className="m0">{h.routineTitle}</h2>
        <ol className="numbered">
          {h.routine.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </section>

      <section className="card stack">
        <h2 className="m0">{h.screensTitle}</h2>
        <div className="screen-list">
          {SCREENS.map((s) => (
            <Link key={s.key} to={s.to} className="screen-item">
              <span className="list-icon" aria-hidden>
                <s.icon size={20} />
              </span>
              <span>
                <strong>{t.nav[s.nav]}</strong>
                <span>{h.screens[s.key]}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-2">
        <section className="card stack">
          <h2 className="m0 row">
            <BookOpenText size={20} aria-hidden />
            {h.glossaryTitle}
          </h2>
          <dl className="glossary">
            {h.glossary.map((g) => [<dt key={`t-${g.term}`}>{g.term}</dt>, <dd key={`d-${g.term}`}>{g.text}</dd>])}
          </dl>
        </section>
        <section className="card stack">
          <h2 className="m0 row">
            <Lightbulb size={20} aria-hidden />
            {h.tipsTitle}
          </h2>
          <ul className="checklist">
            {h.tips.map((tip) => (
              <li key={tip}>
                <Lightbulb size={16} aria-hidden />
                {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div>
        <Link className="btn btn-primary btn-lg" to="/">
          {h.cta}
          <ArrowRight size={18} aria-hidden />
        </Link>
      </div>
    </div>
  )
}
