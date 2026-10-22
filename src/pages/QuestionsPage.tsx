import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CATEGORIES, CATEGORY_LABELS, PROMPTS } from '../data/prompts'
import { useRecordings } from '../hooks/useRecordings'
import { randomItem } from '../lib/program'
import type { Phase, PromptCategory } from '../types'

type CategoryFilter = 'all' | PromptCategory
type PhaseFilter = 'all' | Phase

export default function QuestionsPage() {
  const navigate = useNavigate()
  const { recordings } = useRecordings()
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [phase, setPhase] = useState<PhaseFilter>('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const attempts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of recordings) if (r.promptId) counts.set(r.promptId, (counts.get(r.promptId) ?? 0) + 1)
    return counts
  }, [recordings])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PROMPTS.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (phase === 'all' || p.phase === phase) &&
        (!q || p.text.toLowerCase().includes(q)),
    )
  }, [category, phase, query])

  const random = () => {
    const pick = randomItem(filtered)
    if (pick) navigate(`/record?prompt=${pick.id}`)
  }

  return (
    <div className="stack">
      <div className="page-header row spread">
        <div>
          <h1>Question bank</h1>
          <p>
            {PROMPTS.length} prompts for interview, tech, daily life and opinion practice.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={random} disabled={filtered.length === 0}>
          🎲 Random prompt
        </button>
      </div>

      <div className="card">
        <div className="stack">
          <div className="chips" role="group" aria-label="Category">
            {(['all', ...CATEGORIES] as const).map((c) => (
              <button
                key={c}
                type="button"
                className={`chip${category === c ? ' selected' : ''}`}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
              >
                {c === 'all' ? 'All categories' : CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
          <div className="row">
            <div className="segmented" role="group" aria-label="Phase">
              {(['all', 1, 2, 3] as const).map((ph) => (
                <button
                  key={ph}
                  type="button"
                  className={phase === ph ? 'active' : ''}
                  onClick={() => setPhase(ph)}
                  aria-pressed={phase === ph}
                >
                  {ph === 'all' ? 'All phases' : `Phase ${ph}`}
                </button>
              ))}
            </div>
            <input
              className="input"
              style={{ flex: 1, minWidth: 180 }}
              type="search"
              placeholder="Search questions…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search questions"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <p className="small muted" style={{ marginBottom: 0 }}>
          {filtered.length} prompt(s)
        </p>
        {filtered.map((p) => {
          const count = attempts.get(p.id) ?? 0
          const open = openId === p.id
          return (
            <div key={p.id} className="list-item">
              <div className="row spread" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row small" style={{ gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-accent">{CATEGORY_LABELS[p.category]}</span>
                    <span className={`badge badge-phase-${p.phase}`}>Phase {p.phase}</span>
                    <span className="muted">{p.suggestedSeconds}s</span>
                    {count > 0 && <span className="badge badge-success">{count}× practised</span>}
                  </div>
                  <div style={{ fontWeight: 600 }}>{p.text}</div>
                  {open && p.hints && (
                    <ul className="bullets small muted" style={{ marginTop: '0.4rem' }}>
                      {p.hints.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="row">
                  {p.hints && (
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => setOpenId(open ? null : p.id)}
                      aria-expanded={open}
                    >
                      {open ? 'Hide hints' : 'Hints'}
                    </button>
                  )}
                  <Link className="btn btn-sm" to={`/record?prompt=${p.id}`}>
                    🎙 Practise
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
