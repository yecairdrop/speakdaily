import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ComparePanel } from '../components/ComparePanel'
import { RecordingRow } from '../components/RecordingRow'
import { useRecordings } from '../hooks/useRecordings'
import { toDateKey } from '../lib/dates'
import { downloadBlob, exportRecordingsZip } from '../lib/exportZip'
import type { RecordingKind } from '../types'

type Filter = 'all' | RecordingKind
type View = 'list' | 'compare'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'speaking', label: 'Speaking' },
  { id: 'shadowing', label: 'Shadowing' },
  { id: 'mock', label: 'Mock interviews' },
]

export default function ArchivePage() {
  const [params, setParams] = useSearchParams()
  const compareGroup = params.get('compare')
  const view: View = compareGroup !== null ? 'compare' : 'list'
  const { recordings, loading, error, remove } = useRecordings()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return recordings.filter(
      (r) =>
        (filter === 'all' || r.kind === filter) &&
        (!q || r.promptText.toLowerCase().includes(q) || r.transcript.toLowerCase().includes(q)),
    )
  }, [recordings, filter, query])

  const handleExport = async () => {
    setExporting(true)
    setExportError(null)
    try {
      const blob = await exportRecordingsZip(recordings)
      downloadBlob(blob, `speakdaily-recordings-${toDateKey()}.zip`)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async (id: string, label: string) => {
    if (!window.confirm(`Delete this recording?\n\n“${label.slice(0, 80)}”\n\nThis cannot be undone.`)) return
    await remove(id)
  }

  const totalMinutes = Math.round(recordings.reduce((s, r) => s + r.durationSec, 0) / 60)

  return (
    <div className="stack">
      <div className="page-header row spread">
        <div>
          <h1>Archive</h1>
          <p>
            {recordings.length} recording(s) · {totalMinutes} min · stored only in this browser
          </p>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => void handleExport()}
          disabled={exporting || recordings.length === 0}
        >
          {exporting ? 'Preparing zip…' : '⬇ Export all (.zip)'}
        </button>
      </div>

      {(error || exportError) && (
        <div className="alert alert-danger">
          <p>{error ?? exportError}</p>
        </div>
      )}

      <div className="segmented" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'list'}
          className={view === 'list' ? 'active' : ''}
          onClick={() => setParams({})}
        >
          Recordings
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'compare'}
          className={view === 'compare' ? 'active' : ''}
          onClick={() => setParams({ compare: '' })}
        >
          Compare
        </button>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : recordings.length === 0 ? (
        <div className="card empty">
          <p>No recordings yet.</p>
          <Link className="btn btn-primary" to="/">
            Go to today&apos;s tasks
          </Link>
        </div>
      ) : view === 'compare' ? (
        <div className="card">
          <ComparePanel key={compareGroup} recordings={recordings} initialGroup={compareGroup} />
        </div>
      ) : (
        <div className="card">
          <div className="row" style={{ marginBottom: '0.5rem' }}>
            <div className="segmented">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={filter === f.id ? 'active' : ''}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <input
              className="input"
              style={{ flex: 1, minWidth: 180 }}
              type="search"
              placeholder="Search prompts and transcripts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search recordings"
            />
          </div>
          {visible.length === 0 ? (
            <p className="empty">Nothing matches this filter.</p>
          ) : (
            visible.map((rec) => (
              <RecordingRow
                key={rec.id}
                rec={rec}
                actions={
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => void handleDelete(rec.id, rec.promptText)}
                    aria-label="Delete recording"
                  >
                    🗑
                  </button>
                }
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
