import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Onboarding } from '../components/Onboarding'
import { SupportNotice } from '../components/SupportNotice'
import { CATEGORY_LABELS } from '../data/prompts'
import { phaseInfo, WEEKS } from '../data/program'
import { useApp } from '../hooks/useApp'
import { formatDate, toDateKey } from '../lib/dates'
import { getProgramPosition, getTodayPlan } from '../lib/program'
import { currentStreak, formatMinutes, totalSeconds } from '../lib/stats'
import type { TaskKind } from '../types'

interface TaskCardProps {
  icon: string
  title: string
  done: boolean
  children: ReactNode
  action: ReactNode
}

function TaskCard({ icon, title, done, children, action }: TaskCardProps) {
  return (
    <div className={`card task${done ? ' done' : ''}`}>
      <div className="task-icon" aria-hidden>
        {done ? '✓' : icon}
      </div>
      <div className="task-body">
        <div className="row spread">
          <h3 style={{ margin: 0 }}>{title}</h3>
          {done && <span className="badge badge-success">Done</span>}
        </div>
        <div style={{ margin: '0.4rem 0 0.75rem' }}>{children}</div>
        {action}
      </div>
    </div>
  )
}

export default function TodayPage() {
  const { settings, progress } = useApp()
  const [offset, setOffset] = useState(0)
  const pos = getProgramPosition(settings.startDate)

  if (!pos) return <Onboarding />

  const today = toDateKey()
  const plan = getTodayPlan(pos, settings, offset)
  const ph = phaseInfo(pos.phase)
  const week = WEEKS[pos.week - 1]
  const todayLog = progress[today]
  const isDone = (t: TaskKind) => todayLog?.tasks.includes(t) ?? false
  const streak = currentStreak(progress, today)

  return (
    <div className="stack">
      <SupportNotice needSynthesis />

      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="row" style={{ marginBottom: '0.3rem' }}>
          <span className={`badge badge-phase-${pos.phase}`}>
            Phase {pos.phase} · {ph.name}
          </span>
          <span className="muted small">{formatDate(today)}</span>
        </div>
        <h1>
          {pos.status === 'active' && `Week ${pos.week}, day ${pos.dayOfWeek} — ${week.title}`}
          {pos.status === 'not-started' && `Your program starts in ${pos.daysUntilStart} day(s)`}
          {pos.status === 'finished' && 'Program complete 🎉 Keep practising!'}
        </h1>
        <p>{pos.status === 'not-started' ? 'You can already warm up with the day-1 tasks below.' : week.goal}</p>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label">Streak</div>
          <div className="stat-value">🔥 {streak}</div>
          <div className="stat-sub">day{streak === 1 ? '' : 's'} in a row</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total spoken</div>
          <div className="stat-value">{formatMinutes(totalSeconds(progress))}</div>
          <div className="stat-sub">minutes</div>
        </div>
        <div className="stat">
          <div className="stat-label">Today</div>
          <div className="stat-value">{formatMinutes(todayLog?.seconds ?? 0)}</div>
          <div className="stat-sub">min · {todayLog?.recordings ?? 0} recording(s)</div>
        </div>
        <div className="stat">
          <div className="stat-label">Answer length</div>
          <div className="stat-value">{plan.seconds}s</div>
          <div className="stat-sub">{settings.timeLimitOverride ? 'custom' : `phase ${pos.phase} default`}</div>
        </div>
      </div>

      <div className="row spread">
        <h2 style={{ margin: 0 }}>Today&apos;s tasks</h2>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOffset((o) => o + 1)}>
          🔀 Different tasks
        </button>
      </div>

      <TaskCard
        icon="🎧"
        title="1 · Shadowing"
        done={isDone('shadowing')}
        action={
          <Link className="btn btn-primary" to={`/shadowing?passage=${plan.shadowing.id}&task=shadowing`}>
            Start shadowing
          </Link>
        }
      >
        <strong>{plan.shadowing.title}</strong>
        <p className="muted small" style={{ margin: 0 }}>
          Listen → speak along → record yourself and get a match score.
        </p>
      </TaskCard>

      <TaskCard
        icon="🎙️"
        title={`2 · Speak for ${plan.seconds} seconds`}
        done={isDone('speaking')}
        action={
          <Link
            className="btn btn-primary"
            to={`/record?prompt=${plan.speaking.id}&task=speaking&seconds=${plan.seconds}`}
          >
            Start
          </Link>
        }
      >
        <span className="badge" style={{ marginBottom: '0.3rem' }}>
          {CATEGORY_LABELS[plan.speaking.category]}
        </span>
        <p style={{ fontWeight: 600, margin: '0.3rem 0 0' }}>{plan.speaking.text}</p>
      </TaskCard>

      {plan.star && (
        <TaskCard
          icon="⭐"
          title="3 · STAR interview question"
          done={isDone('star')}
          action={
            <Link className="btn btn-primary" to={`/record?prompt=${plan.star.id}&task=star`}>
              Start
            </Link>
          }
        >
          <p style={{ fontWeight: 600, margin: 0 }}>{plan.star.text}</p>
          <p className="muted small" style={{ margin: '0.2rem 0 0' }}>
            Situation → Task → Action → Result. The guide is shown while you record.
          </p>
        </TaskCard>
      )}

      {plan.mockInterview && (
        <TaskCard
          icon="💼"
          title={plan.finalVideoInterview ? 'Final: full mock video interview' : 'Weekly mock interview'}
          done={isDone('mock')}
          action={
            <Link className="btn btn-primary" to={`/mock?count=10${plan.finalVideoInterview ? '&video=1' : ''}`}>
              Start mock interview
            </Link>
          }
        >
          <p className="muted small" style={{ margin: 0 }}>
            10 random interview and STAR questions, one after another, with a summary at the end.
            {plan.finalVideoInterview && ' Turn your camera on — this is your final exam!'}
          </p>
        </TaskCard>
      )}

      <div className="card">
        <h3>Phase {pos.phase} routine</h3>
        <ul className="checklist small">
          {ph.routine.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
