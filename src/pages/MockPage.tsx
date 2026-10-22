import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MockSummary } from '../components/MockSummary'
import { RecorderPanel } from '../components/RecorderPanel'
import { StarGuide } from '../components/StarGuide'
import { SupportNotice } from '../components/SupportNotice'
import { CATEGORY_LABELS, PROMPTS, PROMPTS_BY_ID } from '../data/prompts'
import { useApp } from '../hooks/useApp'
import { useRecordings } from '../hooks/useRecordings'
import { formatDateTime, toDateKey } from '../lib/dates'
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
      <div className="stack">
        <SupportNotice />
        <div className="card">
          <div className="row spread">
            <span className="badge badge-accent">
              Question {index + 1} of {questions.length}
            </span>
            <span className="badge">{CATEGORY_LABELS[current.category]}</span>
          </div>
          <div className="progress-bar" style={{ margin: '0.75rem 0' }}>
            <div style={{ width: `${(index / questions.length) * 100}%` }} />
          </div>
          <p className="prompt-text">{current.text}</p>
        </div>
        <div className="card">
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
                {index + 1 >= questions.length ? 'Finish & see summary' : 'Next question →'}
              </button>
            )}
          />
        </div>
        <div className="row">
          <button type="button" className="btn btn-ghost" onClick={next}>
            Skip question
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => void finish()}>
            End interview now
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'summary' && session) {
    return (
      <div className="stack">
        <div className="page-header row spread">
          <div>
            <h1>Mock interview summary</h1>
            <p>{formatDateTime(session.createdAt)}</p>
          </div>
          <button type="button" className="btn" onClick={() => setStage('setup')}>
            ← Back
          </button>
        </div>
        <div className="card">
          <MockSummary questions={questionsOf(session)} answers={answers} />
        </div>
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Mock interview</h1>
        <p>Random interview and STAR questions, one after another — like the real thing. No hints, no second chances (well, you can re-record).</p>
      </div>
      {phase < 2 && (
        <div className="alert">
          <p>
            Mock interviews start in <strong>phase 2</strong> (week 5). You can still try one now as a preview.
          </p>
        </div>
      )}
      <div className="card">
        <div className="grid grid-3">
          <div className="field">
            <label>Questions</label>
            <div className="segmented">
              {[5, 10].map((n) => (
                <button key={n} type="button" className={count === n ? 'active' : ''} onClick={() => setCount(n)}>
                  {n} questions
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="mock-seconds">Time per answer</label>
            <select
              id="mock-seconds"
              className="input"
              value={seconds}
              onChange={(e) => setSeconds(Number(e.target.value))}
            >
              {Array.from(new Set([...SECOND_OPTIONS, seconds]))
                .sort((a, b) => a - b)
                .map((s) => (
                  <option key={s} value={s}>
                    {s} seconds
                  </option>
                ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="mock-video">Camera</label>
            <label className="row small" style={{ fontWeight: 400 }}>
              <input id="mock-video" type="checkbox" checked={video} onChange={(e) => setVideo(e.target.checked)} />
              Record video (practice eye contact &amp; posture)
            </label>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => void start()}>
          Start mock interview
        </button>
        <p className="small muted" style={{ marginTop: '0.6rem', marginBottom: 0 }}>
          Drawn from {pool.length} interview &amp; STAR questions up to phase {Math.max(phase, 2)}.
        </p>
      </div>

      {pastSessions.length > 0 && (
        <div className="card">
          <h2>Past sessions</h2>
          {pastSessions.map((s) => (
            <div key={s.id} className="list-item row spread">
              <div>
                <div style={{ fontWeight: 600 }}>{formatDateTime(s.createdAt)}</div>
                <div className="small muted">
                  {new Set(s.recordingIds).size} answer(s) · {s.questionIds.length} questions
                  {!s.completed && ' · unfinished'}
                </div>
              </div>
              <button type="button" className="btn btn-sm" onClick={() => openPast(s)}>
                View summary
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
