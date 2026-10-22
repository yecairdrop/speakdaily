import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { RecorderPanel } from '../components/RecorderPanel'
import { RecordingRow } from '../components/RecordingRow'
import { StarGuide } from '../components/StarGuide'
import { SupportNotice } from '../components/SupportNotice'
import { CATEGORY_LABELS, PROMPTS, PROMPTS_BY_ID } from '../data/prompts'
import { useApp } from '../hooks/useApp'
import { listRecordingsForPrompt } from '../lib/db'
import { getProgramPosition, randomItem } from '../lib/program'
import type { Recording, TaskKind } from '../types'

const TASKS: readonly TaskKind[] = ['speaking', 'star', 'shadowing', 'mock']

function parseTask(value: string | null): TaskKind | undefined {
  return TASKS.find((t) => t === value)
}

export default function RecordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { settings } = useApp()
  const prompt = PROMPTS_BY_ID.get(params.get('prompt') ?? '')
  const task = parseTask(params.get('task'))
  const secondsParam = Number(params.get('seconds'))
  const pos = getProgramPosition(settings.startDate)
  const [history, setHistory] = useState<Recording[]>([])

  const loadHistory = useCallback(() => {
    if (!prompt) return
    listRecordingsForPrompt(prompt.id)
      .then(setHistory)
      .catch(() => setHistory([]))
  }, [prompt])

  useEffect(loadHistory, [loadHistory])

  const goRandom = () => {
    const phase = prompt?.phase ?? pos?.phase ?? 1
    const pool = PROMPTS.filter((p) => p.phase === phase && p.id !== prompt?.id)
    const next = randomItem(pool)
    if (next) navigate(`/record?prompt=${next.id}`)
  }

  if (!prompt) {
    return (
      <div className="card">
        <h1>Pick a prompt</h1>
        <p className="muted">No prompt selected. Choose one from the question bank or get a random one.</p>
        <div className="row">
          <button type="button" className="btn btn-primary" onClick={goRandom}>
            🎲 Random prompt
          </button>
          <Link to="/questions" className="btn">
            Question bank
          </Link>
        </div>
      </div>
    )
  }

  const seconds = secondsParam > 0 ? secondsParam : (settings.timeLimitOverride ?? prompt.suggestedSeconds)
  const allowVideo = prompt.phase === 3 || pos?.phase === 3

  return (
    <div className="stack">
      <SupportNotice />
      <div className="card">
        <div className="row spread">
          <div className="row">
            <span className="badge badge-accent">{CATEGORY_LABELS[prompt.category]}</span>
            <span className={`badge badge-phase-${prompt.phase}`}>Phase {prompt.phase}</span>
            {task && <span className="badge">Today&apos;s {task} task</span>}
          </div>
          <button type="button" className="btn btn-sm btn-ghost" onClick={goRandom}>
            🎲 Another prompt
          </button>
        </div>
        <p className="prompt-text">{prompt.text}</p>
        {prompt.hints && (
          <details>
            <summary className="small muted" style={{ cursor: 'pointer' }}>
              Ideas to mention
            </summary>
            <ul className="bullets small" style={{ marginTop: '0.4rem' }}>
              {prompt.hints.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <div className="card">
        <RecorderPanel
          key={prompt.id}
          promptText={prompt.text}
          promptId={prompt.id}
          category={prompt.category}
          kind="speaking"
          task={task}
          defaultSeconds={seconds}
          allowVideo={allowVideo}
          guide={prompt.category === 'star' ? <StarGuide /> : undefined}
          onSaved={loadHistory}
        />
      </div>

      {history.length > 0 && (
        <div className="card">
          <div className="card-title">
            <h2>Your attempts at this prompt</h2>
            {history.length >= 2 && (
              <Link className="btn btn-sm" to={`/archive?compare=${prompt.id}`}>
                Compare
              </Link>
            )}
          </div>
          {history.map((rec) => (
            <RecordingRow key={rec.id} rec={rec} showPrompt={false} />
          ))}
        </div>
      )}
    </div>
  )
}
