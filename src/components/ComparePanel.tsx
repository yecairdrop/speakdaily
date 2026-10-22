import { useMemo, useState } from 'react'
import { formatDateTime, formatDuration } from '../lib/dates'
import type { Recording } from '../types'
import { HighlightedTranscript } from './HighlightedTranscript'
import { MediaPlayback } from './MediaPlayback'

interface Metric {
  label: string
  value: (r: Recording) => number | null
  format?: (v: number) => string
  /** Which value is better: higher, lower, or closest to a target. */
  better: 'higher' | 'lower' | { target: number }
}

const TARGET_WPM = 130

const METRICS: Metric[] = [
  { label: 'Duration', value: (r) => r.durationSec, format: formatDuration, better: 'higher' },
  { label: 'Words', value: (r) => r.analysis.wordCount, better: 'higher' },
  { label: 'Words / min', value: (r) => r.analysis.wordsPerMinute, better: { target: TARGET_WPM } },
  { label: 'Fillers', value: (r) => r.analysis.fillerTotal, better: 'lower' },
  { label: 'Fillers / min', value: (r) => r.analysis.fillersPerMinute, better: 'lower' },
  {
    label: 'Longest pause',
    value: (r) => r.analysis.longestPauseSec,
    format: (v) => `${v}s`,
    better: 'lower',
  },
  {
    label: 'Vocab variety',
    value: (r) => r.analysis.vocabularyVariety,
    format: (v) => `${Math.round(v * 100)}%`,
    better: 'higher',
  },
  { label: 'Connectors used', value: (r) => r.analysis.connectorsUsed.length, better: 'higher' },
  { label: 'Shadowing match', value: (r) => r.similarity ?? null, format: (v) => `${v}%`, better: 'higher' },
]

function winner(m: Metric, a: number | null, b: number | null): 'a' | 'b' | null {
  if (a === null || b === null || a === b) return null
  if (m.better === 'higher') return a > b ? 'a' : 'b'
  if (m.better === 'lower') return a < b ? 'a' : 'b'
  const t = m.better.target
  const da = Math.abs(a - t)
  const db = Math.abs(b - t)
  return da === db ? null : da < db ? 'a' : 'b'
}

function groupKey(r: Recording): string {
  return r.promptId ?? r.promptText
}

interface Props {
  recordings: Recording[]
  initialGroup?: string | null
}

/** Pick two attempts at the same prompt and compare their stats side by side. */
export function ComparePanel({ recordings, initialGroup }: Props) {
  const groups = useMemo(() => {
    const map = new Map<string, Recording[]>()
    for (const r of recordings) {
      const key = groupKey(r)
      map.set(key, [...(map.get(key) ?? []), r])
    }
    return Array.from(map, ([key, recs]) => ({ key, recs: recs.sort((x, y) => x.createdAt - y.createdAt) }))
      .filter((g) => g.recs.length >= 2)
      .sort((x, y) => y.recs.length - x.recs.length)
  }, [recordings])

  const [groupId, setGroupId] = useState<string | null>(
    initialGroup && groups.some((g) => g.key === initialGroup) ? initialGroup : (groups[0]?.key ?? null),
  )
  const group = groups.find((g) => g.key === groupId) ?? groups[0]
  const [pick, setPick] = useState<{ a: string | null; b: string | null }>({ a: null, b: null })

  if (!group) {
    return (
      <p className="empty">
        Record the same prompt at least twice (use “Record again”, or revisit an old prompt) to compare attempts.
      </p>
    )
  }

  const recA = group.recs.find((r) => r.id === pick.a) ?? group.recs[0]
  const recB = group.recs.find((r) => r.id === pick.b) ?? group.recs[group.recs.length - 1]

  const selectFor = (side: 'a' | 'b', current: Recording) => (
    <select
      className="input"
      value={current.id}
      onChange={(e) => setPick((p) => ({ ...p, [side]: e.target.value }))}
      aria-label={side === 'a' ? 'First recording' : 'Second recording'}
    >
      {group.recs.map((r) => (
        <option key={r.id} value={r.id}>
          {formatDateTime(r.createdAt)} · {r.analysis.wordsPerMinute} WPM
        </option>
      ))}
    </select>
  )

  return (
    <div className="stack">
      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="compare-prompt">Prompt</label>
        <select
          id="compare-prompt"
          className="input"
          value={group.key}
          onChange={(e) => {
            setGroupId(e.target.value)
            setPick({ a: null, b: null })
          }}
        >
          {groups.map((g) => (
            <option key={g.key} value={g.key}>
              ({g.recs.length}×) {g.recs[0].promptText.slice(0, 90)}
            </option>
          ))}
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="compare-table">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Metric</th>
              <th>{selectFor('a', recA)}</th>
              <th>{selectFor('b', recB)}</th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m) => {
              const a = m.value(recA)
              const b = m.value(recB)
              if (a === null && b === null) return null
              const w = winner(m, a, b)
              const fmt = (v: number | null) => (v === null ? '—' : m.format ? m.format(v) : String(v))
              return (
                <tr key={m.label}>
                  <td className="muted">{m.label}</td>
                  <td className={w === 'a' ? 'better' : ''}>{fmt(a)}</td>
                  <td className={w === 'b' ? 'better' : ''}>{fmt(b)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="small muted" style={{ marginTop: '0.4rem' }}>
          Green = better. For WPM, closer to ~{TARGET_WPM} is better.
        </p>
      </div>

      <div className="grid grid-2">
        {[recA, recB].map((r, i) => (
          <div key={`${r.id}-${i}`} className="stack">
            <strong className="small">{i === 0 ? 'A' : 'B'} · {formatDateTime(r.createdAt)}</strong>
            <MediaPlayback blob={r.audio} video={r.hasVideo} />
            <HighlightedTranscript text={r.transcript} fillers={r.analysis.fillers.map((f) => f.word)} />
          </div>
        ))}
      </div>
    </div>
  )
}
