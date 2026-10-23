import { ChevronUp, Lightbulb, Library, Mic, SearchX, Search, Shuffle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { CATEGORIES, PROMPTS } from '../data/prompts'
import { useApp } from '../hooks/useApp'
import { useI18n } from '../hooks/useI18n'
import { useRecordings } from '../hooks/useRecordings'
import { randomItem } from '../lib/program'
import type { Phase, PromptCategory } from '../types'

type CategoryFilter = 'all' | PromptCategory
type PhaseFilter = 'all' | Phase

export default function QuestionsPage() {
  const navigate = useNavigate()
  const { settings } = useApp()
  const { t } = useI18n()
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
    const q = query.trim().toLocaleLowerCase()
    return PROMPTS.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (phase === 'all' || p.phase === phase) &&
        (!q || p.text.toLowerCase().includes(q) || p.hintTr.toLocaleLowerCase('tr').includes(q)),
    )
  }, [category, phase, query])

  const random = () => {
    const pick = randomItem(filtered)
    if (pick) navigate(`/record?prompt=${pick.id}`)
  }

  return (
    <div className="stack-lg">
      <PageHeader
        icon={Library}
        title={t.questions.title}
        subtitle={t.questions.subtitle(PROMPTS.length)}
        actions={
          <button type="button" className="btn btn-primary" onClick={random} disabled={filtered.length === 0}>
            <Shuffle size={16} aria-hidden />
            {t.questions.random}
          </button>
        }
      />

      <section className="card stack">
        <div className="chips" role="group" aria-label={t.questions.category}>
          {(['all', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              className={`chip${category === c ? ' selected' : ''}`}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
            >
              {c === 'all' ? t.questions.allCategories : t.categories[c]}
            </button>
          ))}
        </div>
        <div className="row">
          <div className="segmented" role="group" aria-label={t.questions.phase}>
            {(['all', 1, 2, 3] as const).map((ph) => (
              <button
                key={ph}
                type="button"
                className={phase === ph ? 'active' : ''}
                onClick={() => setPhase(ph)}
                aria-pressed={phase === ph}
              >
                {ph === 'all' ? t.questions.allPhases : t.common.phase(ph)}
              </button>
            ))}
          </div>
          <div className="search">
            <Search size={16} aria-hidden />
            <input
              className="input"
              type="search"
              placeholder={t.questions.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t.questions.search}
            />
          </div>
        </div>
      </section>

      <section className="card">
        <p className="small muted bold">{t.questions.count(filtered.length)}</p>
        {filtered.length === 0 && <EmptyState icon={SearchX} title={t.questions.noMatch} />}
        {filtered.map((p) => {
          const count = attempts.get(p.id) ?? 0
          const open = openId === p.id
          return (
            <div key={p.id} className="list-item">
              <div className="list-row">
                <div className="list-main">
                  <div className="row" style={{ gap: 6 }}>
                    <span className="badge badge-accent">{t.categories[p.category]}</span>
                    <span className={`badge badge-phase-${p.phase}`}>{t.common.phase(p.phase)}</span>
                    <span className="xs muted bold">{p.suggestedSeconds}s</span>
                    {count > 0 && <span className="badge badge-success">{t.questions.practised(count)}</span>}
                  </div>
                  <div className="list-title" lang="en">
                    {p.text}
                  </div>
                  {settings.showHintsTr && (
                    <p className="small muted m0" lang="tr">
                      {p.hintTr}
                    </p>
                  )}
                  {open && p.hints && (
                    <ul className="bullets small" style={{ marginTop: 8 }} lang="en">
                      {p.hints.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="list-actions">
                  {p.hints && (
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => setOpenId(open ? null : p.id)}
                      aria-expanded={open}
                    >
                      {open ? <ChevronUp size={16} aria-hidden /> : <Lightbulb size={16} aria-hidden />}
                      {open ? t.questions.hideIdeas : t.questions.ideas}
                    </button>
                  )}
                  <Link className="btn btn-sm btn-primary" to={`/record?prompt=${p.id}`}>
                    <Mic size={16} aria-hidden />
                    {t.questions.practise}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
