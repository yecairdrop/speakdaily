import { ArrowLeft, ArrowRight, Briefcase, CircleStop, Flag, History, Info, Play, SkipForward } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MockSummary } from '../components/MockSummary'
import { RecorderPanel } from '../components/RecorderPanel'
import { StarGuide } from '../components/StarGuide'
import { SupportNotice } from '../components/SupportNotice'
import { PageHeader } from '../components/ui/PageHeader'
import { Switch } from '../components/ui/Switch'
import { PROMPTS, PROMPTS_BY_ID } from '../data/prompts'
import { useApp } from '../hooks/useApp'
import { useI18n } from '../hooks/useI18n'
import { useRecordings } from '../hooks/useRecordings'
import { toDateKey } from '../lib/dates'
import { listSessions, newId, saveSession } from '../lib/db'
import { getProgramPosition, sampleWithoutReplacement } from '../lib/program'
import type { MockSession, Prompt, Recording } from '../types'

type Stage = 'setup' | 'running' | 'summary'

const SECOND_OPTIONS = [60, 90, 120, 150, 180]

function questionsOf(session: MockSession): Prompt[] {
  return session.questionIds.map((id) => PROMPTS_BY_ID.get(id)).filter((p): p is Prompt => p !== undefined)
}

export default function MockPage() {
  const [params] = useSearchParams()
  const { settings, markTask } = useApp()
  const { t, formatDateTime } = useI18n()
  const { recordings, refresh } = useRecordings()
  const pos = getProgramPosition(settings.startDate)
  const phase = pos?.phase ?? 2

  const [stage, setStage] = useState<Stage>('setup')
  const [count, setCount] = useState(params.get('count') === '5' ? 5 : 10)
  const [seconds, setSeconds] = useState(settings.timeLimitOverride ?? (phase >= 3 ? 180 : 120))
  const [video, setVideo] = useState(params.get('video') === '1')
  const [session, setSession] = useState<MockSession | null>(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, Recording>>(new Map())
  const [pastSessions, setPastSessions] = useState<MockSession[]>([])

  useEffect(() => {
    let cancelled = false
    listSessions()
      .then((s) => {
        if (!cancelled) setPastSessions(s)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [stage])

  const pool = useMemo(
    () => PROMPTS.filter((p) => (p.category === 'interview' || p.category === 'star') && p.phase <= Math.max(phase, 2)),
    [phase],
  )
  const questions = session ? questionsOf(session) : []
  const current = questions[index]

  const start = async () => {
    const picked = sampleWithoutReplacement(pool, count)
    const s: MockSession = {
      id: newId(),
      createdAt: Date.now(),
      dateKey: toDateKey(),
      questionIds: picked.map((p) => p.id),
      recordingIds: [],
      completed: false,
    }
    await saveSession(s)
    setSession(s)
    setAnswers(new Map())
    setIndex(0)
    setStage('running')
  }

  const handleSaved = (rec: Recording) => {
    if (!session || !current) return
    const updated = { ...session, recordingIds: [...session.recordingIds, rec.id] }
    setSession(updated)
    void saveSession(updated)
    setAnswers((prev) => new Map(prev).set(current.id, rec))
  }

  const finish = async () => {
    if (!session) return
    const updated = { ...session, completed: true }
    setSession(updated)
    await saveSession(updated)
    if (answers.size > 0) markTask(toDateKey(), 'mock')
    await refresh()
    setStage('summary')
  }

  const next = () => {
    if (index + 1 >= questions.length) void finish()
    else setIndex((i) => i + 1)
  }

  const openPast = (s: MockSession) => {
    const byId = new Map(recordings.map((r) => [r.id, r]))
    const map = new Map<string, Recording>()
    // Recording ids are in answer order; a later re-record for the same question wins.
    for (const id of s.recordingIds) {
      const rec = byId.get(id)
      if (rec?.promptId) map.set(rec.promptId, rec)
    }
    setSession(s)
    setAnswers(map)
    setStage('summary')
  }

  if (stage === 'running' && session && current) {
    return (
      <div className="stack-lg">
        <SupportNotice />
        <section className="card prompt-card">
          <div className="row spread">
            <span className="badge badge-accent">{t.mock.questionOf(index + 1, questions.length)}</span>
            <span className="badge">{t.categories[current.category]}</span>
          </div>
          <div className="progress-track" style={{ margin: '14px 0 0' }} aria-hidden>
            <div style={{ width: `${(index / questions.length) * 100}%` }} />
          </div>
          <p className="prompt-text" lang="en">
            {current.text}
          </p>
        </section>
        <section className="card">
          <RecorderPanel
            key={`${session.id}-${index}`}
            promptText={current.text}
            promptId={current.id}
            category={current.category}
            kind="mock"
            sessionId={session.id}
            defaultSeconds={seconds}
            allowVideo
            defaultVideo={video}
            showResult={false}
            guide={current.category === 'star' ? <StarGuide /> : undefined}
            onSaved={handleSaved}
            resultActions={() => (
              <button type="button" className="btn btn-primary" onClick={next}>
                {index + 1 >= questions.length ? <Flag size={16} aria-hidden /> : null}
                {index + 1 >= questions.length ? t.mock.finish : t.mock.next}
                {index + 1 < questions.length && <ArrowRight size={16} aria-hidden />}
              </button>
            )}
          />
        </section>
        <div className="row">
          <button type="button" className="btn btn-ghost" onClick={next}>
            <SkipForward size={16} aria-hidden />
            {t.mock.skip}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => void finish()}>
            <CircleStop size={16} aria-hidden />
            {t.mock.endNow}
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'summary' && session) {
    return (
      <div className="stack-lg">
        <PageHeader
          icon={Briefcase}
          title={t.mock.summaryTitle}
          subtitle={formatDateTime(session.createdAt)}
          actions={
            <button type="button" className="btn" onClick={() => setStage('setup')}>
              <ArrowLeft size={16} aria-hidden />
              {t.common.back}
            </button>
          }
        />
        <section className="card">
          <MockSummary questions={questionsOf(session)} answers={answers} />
        </section>
      </div>
    )
  }

  return (
    <div className="stack-lg">
      <PageHeader icon={Briefcase} title={t.mock.title} subtitle={t.mock.subtitle} />
      {phase < 2 && (
        <div className="alert">
          <Info size={20} aria-hidden />
          <p className="small">{t.mock.phase1Note}</p>
        </div>
      )}
      <section className="card stack">
        <div className="grid grid-3">
          <div className="field m0">
            <span className="field-label">{t.mock.questions}</span>
            <div className="segmented" role="group" aria-label={t.mock.questions}>
              {[5, 10].map((n) => (
                <button key={n} type="button" className={count === n ? 'active' : ''} onClick={() => setCount(n)} aria-pressed={count === n}>
                  {t.mock.nQuestions(n)}
                </button>
              ))}
            </div>
          </div>
          <div className="field m0">
            <label htmlFor="mock-seconds">{t.mock.timePerAnswer}</label>
            <select id="mock-seconds" className="input" value={seconds} onChange={(e) => setSeconds(Number(e.target.value))}>
              {Array.from(new Set([...SECOND_OPTIONS, seconds]))
                .sort((a, b) => a - b)
                .map((s) => (
                  <option key={s} value={s}>
                    {t.common.seconds(s)}
                  </option>
                ))}
            </select>
          </div>
          <div className="field m0">
            <Switch id="mock-video" label={t.mock.camera} hint={t.mock.cameraHint} checked={video} onChange={setVideo} />
          </div>
        </div>
        <div className="row">
          <button type="button" className="btn btn-primary btn-lg" onClick={() => void start()}>
            <Play size={18} fill="currentColor" aria-hidden />
            {t.mock.start}
          </button>
          <span className="xs muted">{t.mock.poolInfo(pool.length, Math.max(phase, 2))}</span>
        </div>
      </section>

      {pastSessions.length > 0 && (
        <section className="card">
          <div className="card-title">
            <h2>
              <History size={20} aria-hidden />
              {t.mock.pastSessions}
            </h2>
          </div>
          {pastSessions.map((s) => (
            <div key={s.id} className="list-item">
              <div className="list-row" style={{ alignItems: 'center' }}>
                <span className="list-icon rose" aria-hidden>
                  <Briefcase size={20} />
                </span>
                <div className="list-main">
                  <div className="bold">{formatDateTime(s.createdAt)}</div>
                  <div className="small muted">
                    {t.mock.answersInfo(new Set(s.recordingIds).size, s.questionIds.length)}
                    {!s.completed && ` · ${t.mock.unfinished}`}
                  </div>
                </div>
                <button type="button" className="btn btn-sm btn-soft" onClick={() => openPast(s)}>
                  {t.mock.viewSummary}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
