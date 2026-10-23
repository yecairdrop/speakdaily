import {
  ArrowRight,
  Briefcase,
  Check,
  Flame,
  Headphones,
  ListChecks,
  Mic,
  PartyPopper,
  RotateCcw,
  Shuffle,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Onboarding } from '../components/Onboarding'
import { SupportNotice } from '../components/SupportNotice'
import { Disclosure } from '../components/ui/Disclosure'
import { ProgressRing } from '../components/ui/ProgressRing'
import { useApp } from '../hooks/useApp'
import { useI18n } from '../hooks/useI18n'
import { addDays, toDateKey } from '../lib/dates'
import { getProgramPosition, getTodayPlan } from '../lib/program'
import { currentStreak, formatMinutes, totalSeconds } from '../lib/stats'
import type { Messages } from '../i18n'
import type { TaskKind } from '../types'

function greeting(t: Messages, hour: number): string {
  if (hour >= 5 && hour < 12) return t.today.greetingMorning
  if (hour >= 12 && hour < 18) return t.today.greetingAfternoon
  if (hour >= 18 && hour < 23) return t.today.greetingEvening
  return t.today.greetingNight
}

interface TaskCardProps {
  icon: LucideIcon
  tone?: '' | 'mint' | 'sun' | 'rose'
  title: string
  done: boolean
  doneLabel: string
  badge?: ReactNode
  children: ReactNode
  to: string
  actionLabel: string
}

function TaskCard({ icon: Icon, tone = '', title, done, doneLabel, badge, children, to, actionLabel }: TaskCardProps) {
  return (
    <article className={`card task-card${done ? ' done' : ''}`}>
      <div className={`task-icon ${tone}`} aria-hidden>
        {done ? <Check size={26} strokeWidth={3} /> : <Icon size={24} />}
      </div>
      <div className="task-body">
        <h3>
          {title}
          {done && <span className="badge badge-success">{doneLabel}</span>}
          {badge}
        </h3>
        {children}
      </div>
      <div className="task-action">
        <Link className={done ? 'btn' : 'btn btn-primary'} to={to}>
          {done ? <RotateCcw size={16} aria-hidden /> : null}
          {actionLabel}
          {!done && <ArrowRight size={16} aria-hidden />}
        </Link>
      </div>
    </article>
  )
}

export default function TodayPage() {
  const { settings, progress } = useApp()
  const { t } = useI18n()
  const [offset, setOffset] = useState(0)
  const [hour] = useState(() => new Date().getHours())
  const pos = getProgramPosition(settings.startDate)

  if (!pos || !settings.startDate) return <Onboarding />

  const today = toDateKey()
  const plan = getTodayPlan(pos, settings, offset)
  const phaseText = t.program.phases[pos.phase - 1]
  const weekText = t.program.weeks[pos.week - 1]
  const todayLog = progress[today]
  const isDone = (task: TaskKind) => todayLog?.tasks.includes(task) ?? false
  const streak = currentStreak(progress, today)
  const practisedToday = (todayLog?.recordings ?? 0) > 0

  // The current program week as 7 day dots.
  const weekStart = addDays(settings.startDate, (pos.week - 1) * 7)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const key = addDays(weekStart, i)
    const done = (progress[key]?.recordings ?? 0) > 0
    const state = key === today ? 'today' : key > today ? 'upcoming' : done ? 'done' : 'missed'
    return { day: i + 1, key, done, state }
  })
  const weekCount = weekDays.filter((d) => d.done).length

  const tasks: TaskKind[] = ['shadowing', 'speaking', ...(plan.star ? (['star'] as const) : []), ...(plan.mockInterview ? (['mock'] as const) : [])]
  const doneCount = tasks.filter(isDone).length
  const allDone = doneCount === tasks.length

  const stateLabel = (s: string) =>
    s === 'today' ? t.today.dayToday : s === 'upcoming' ? t.today.dayUpcoming : s === 'done' ? t.today.dayDone : t.today.dayMissed

  return (
    <div className="stack-lg">
      <SupportNotice needSynthesis />

      <section>
        <div className="row">
          <span className={`badge badge-phase-${pos.phase}`}>
            {t.common.phase(pos.phase)} · {phaseText.name}
          </span>
          {pos.status === 'active' && <span className="badge">{t.today.weekDay(pos.week, pos.dayOfWeek)}</span>}
        </div>
        <h1 className="hero-greeting">
          {greeting(t, hour)} 👋
        </h1>
        <p className="hero-sub">
          {pos.status === 'active' && (
            <>
              <strong>{weekText.title}:</strong> {weekText.goal}
            </>
          )}
          {pos.status === 'not-started' && `${t.today.notStarted(pos.daysUntilStart)} · ${t.today.warmup}`}
          {pos.status === 'finished' && t.today.finished}
        </p>
      </section>

      <section className="today-stats">
        <div className="card streak-card" title={t.today.streakExplain}>
          <div className={`flame${streak === 0 ? ' off' : ''}`} aria-hidden>
            <Flame size={40} strokeWidth={2.2} fill={streak > 0 ? 'currentColor' : 'none'} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="row" style={{ alignItems: 'baseline' }}>
              <span className="streak-number">{streak}</span>
              <span className="bold muted">{t.today.streakUnit}</span>
            </div>
            <p className="small m0" style={{ marginTop: 4 }}>
              {practisedToday ? t.today.streakSafe : streak > 0 ? t.today.streakAtRisk : t.today.streakZero}
            </p>
            <div className="day-dots" role="list">
              {weekDays.map((d) => (
                <span
                  key={d.key}
                  role="listitem"
                  className={`day-dot${d.done ? ' done' : ''}${d.state === 'today' ? ' today' : ''}${d.state === 'missed' ? ' missed' : ''}`}
                  title={t.today.dayDot(d.day, stateLabel(d.state))}
                  aria-label={t.today.dayDot(d.day, stateLabel(d.state))}
                >
                  {d.done ? <Check size={13} strokeWidth={3.5} /> : d.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card ring-card">
          <ProgressRing
            value={weekCount / 7}
            size={104}
            stroke={11}
            ariaLabel={t.today.weekRingLabel(weekCount)}
            label={
              <span>
                <strong>{weekCount}/7</strong>
                <br />
                <span className="xs muted">{t.today.thisWeek}</span>
              </span>
            }
          />
          <div className="mini-stats">
            <div className="mini-stat">
              <strong>{formatMinutes(totalSeconds(progress))}</strong>
              <span>{t.today.totalMinutes}</span>
            </div>
            <div className="mini-stat">
              <strong>{formatMinutes(todayLog?.seconds ?? 0)}</strong>
              <span>{t.today.todayMinutes}</span>
            </div>
            <div className="mini-stat">
              <strong>{plan.seconds}s</strong>
              <span>{t.today.answerLength}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stack">
        <div className="row spread">
          <div>
            <h2 className="m0">{t.today.tasksTitle}</h2>
            <span className="small muted">{t.today.progressOfTasks(doneCount, tasks.length)}</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOffset((o) => o + 1)}>
            <Shuffle size={16} aria-hidden />
            {t.today.shuffle}
          </button>
        </div>

        {allDone && (
          <div className="card celebrate" role="status">
            <div className="celebrate-icon" aria-hidden>
              <PartyPopper size={28} />
            </div>
            <div>
              <h3 className="m0">{t.today.allDoneTitle}</h3>
              <p className="small muted m0">{t.today.allDoneText}</p>
            </div>
          </div>
        )}

        <TaskCard
          icon={Headphones}
          tone="mint"
          title={t.today.taskShadowingTitle}
          done={isDone('shadowing')}
          doneLabel={t.common.done}
          to={`/shadowing?passage=${plan.shadowing.id}&task=shadowing`}
          actionLabel={isDone('shadowing') ? t.today.againTask : t.today.startTask}
        >
          <p className="task-prompt" lang="en">
            {plan.shadowing.title}
          </p>
          <p className="small muted">{t.today.taskShadowingDesc}</p>
        </TaskCard>

        <TaskCard
          icon={Mic}
          title={t.today.taskSpeakingTitle(plan.seconds)}
          done={isDone('speaking')}
          doneLabel={t.common.done}
          badge={<span className="badge">{t.categories[plan.speaking.category]}</span>}
          to={`/record?prompt=${plan.speaking.id}&task=speaking&seconds=${plan.seconds}`}
          actionLabel={isDone('speaking') ? t.today.againTask : t.today.startTask}
        >
          <p className="task-prompt" lang="en">
            {plan.speaking.text}
          </p>
          {settings.showHintsTr && <p className="small muted">{plan.speaking.hintTr}</p>}
        </TaskCard>

        {plan.star && (
          <TaskCard
            icon={Star}
            tone="sun"
            title={t.today.taskStarTitle}
            done={isDone('star')}
            doneLabel={t.common.done}
            to={`/record?prompt=${plan.star.id}&task=star`}
            actionLabel={isDone('star') ? t.today.againTask : t.today.startTask}
          >
            <p className="task-prompt" lang="en">
              {plan.star.text}
            </p>
            <p className="small muted">{t.today.taskStarDesc}</p>
          </TaskCard>
        )}

        {plan.mockInterview && (
          <TaskCard
            icon={Briefcase}
            tone="rose"
            title={plan.finalVideoInterview ? t.today.taskFinalTitle : t.today.taskMockTitle}
            done={isDone('mock')}
            doneLabel={t.common.done}
            to={`/mock?count=10${plan.finalVideoInterview ? '&video=1' : ''}`}
            actionLabel={isDone('mock') ? t.today.againTask : t.today.startTask}
          >
            <p className="small muted">
              {t.today.taskMockDesc} {plan.finalVideoInterview && t.today.taskFinalDesc}
            </p>
          </TaskCard>
        )}
      </section>

      <Disclosure summary={t.today.routineTitle(pos.phase)} icon={ListChecks}>
        <ul className="checklist small">
          {phaseText.routine.map((r) => (
            <li key={r}>
              <Check size={16} aria-hidden />
              {r}
            </li>
          ))}
        </ul>
      </Disclosure>
    </div>
  )
}
