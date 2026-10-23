import { GitCompareArrows, Languages, Library, Lightbulb, MessageSquareText, Shuffle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { RecorderPanel } from '../components/RecorderPanel'
import { RecordingRow } from '../components/RecordingRow'
import { StarGuide } from '../components/StarGuide'
import { SupportNotice } from '../components/SupportNotice'
import { Disclosure } from '../components/ui/Disclosure'
import { EmptyState } from '../components/ui/EmptyState'
import { PROMPTS, PROMPTS_BY_ID } from '../data/prompts'
import { useApp } from '../hooks/useApp'
import { useI18n } from '../hooks/useI18n'
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
  const { t } = useI18n()
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
        <EmptyState
          icon={MessageSquareText}
          title={t.record.pickTitle}
          text={t.record.pickText}
          action={
            <div className="row center">
              <button type="button" className="btn btn-primary" onClick={goRandom}>
                <Shuffle size={16} aria-hidden />
                {t.record.randomPrompt}
              </button>
              <Link to="/questions" className="btn">
                <Library size={16} aria-hidden />
                {t.record.bank}
              </Link>
            </div>
          }
        />
      </div>
    )
  }

  const seconds = secondsParam > 0 ? secondsParam : (settings.timeLimitOverride ?? prompt.suggestedSeconds)
  const allowVideo = prompt.phase === 3 || pos?.phase === 3

  return (
    <div className="stack-lg">
      <SupportNotice />
      <section className="card prompt-card">
        <div className="row spread">
          <div className="row">
            <span className="badge badge-accent">{t.categories[prompt.category]}</span>
            <span className={`badge badge-phase-${prompt.phase}`}>{t.common.phase(prompt.phase)}</span>
            {task && <span className="badge badge-secondary">{t.record.todaysTask}</span>}
          </div>
          <button type="button" className="btn btn-sm btn-ghost" onClick={goRandom}>
            <Shuffle size={16} aria-hidden />
            {t.record.another}
          </button>
        </div>
        <p className="prompt-text" lang="en">
          {prompt.text}
        </p>
        <div className="stack" style={{ gap: 8 }}>
          {settings.showHintsTr && (
            <Disclosure summary={t.record.hintTr} icon={Languages} className="hint-tr" defaultOpen>
              <p className="m0" lang="tr">
                {prompt.hintTr}
              </p>
            </Disclosure>
          )}
          {prompt.hints && (
            <Disclosure summary={t.record.ideas} icon={Lightbulb}>
              <ul className="bullets small" lang="en">
                {prompt.hints.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </Disclosure>
          )}
        </div>
      </section>

      <section className="card">
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
      </section>

      {history.length > 0 && (
        <section className="card">
          <div className="card-title">
            <h2>{t.record.attemptsTitle}</h2>
            {history.length >= 2 && (
              <Link className="btn btn-sm btn-soft" to={`/archive?compare=${prompt.id}`}>
                <GitCompareArrows size={16} aria-hidden />
                {t.record.compare}
              </Link>
            )}
          </div>
          {history.map((rec) => (
            <RecordingRow key={rec.id} rec={rec} showPrompt={false} />
          ))}
        </section>
      )}
    </div>
  )
}
