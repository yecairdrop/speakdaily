import { Archive, ArrowRight, AudioLines, Download, GitCompareArrows, ListMusic, Search, SearchX, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ComparePanel } from '../components/ComparePanel'
import { RecordingRow } from '../components/RecordingRow'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { SkeletonList } from '../components/ui/Skeleton'
import { useI18n } from '../hooks/useI18n'
import { useRecordings } from '../hooks/useRecordings'
import { toDateKey } from '../lib/dates'
import { downloadBlob, exportRecordingsZip } from '../lib/exportZip'
import type { RecordingKind } from '../types'

type Filter = 'all' | RecordingKind
type View = 'list' | 'compare'

export default function ArchivePage() {
  const [params, setParams] = useSearchParams()
  const { t, locale } = useI18n()
  const compareGroup = params.get('compare')
  const view: View = compareGroup !== null ? 'compare' : 'list'
  const { recordings, loading, error, remove } = useRecordings()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: t.archive.filterAll },
    { id: 'speaking', label: t.archive.filterSpeaking },
    { id: 'shadowing', label: t.archive.filterShadowing },
    { id: 'mock', label: t.archive.filterMock },
  ]

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
      const blob = await exportRecordingsZip(recordings, t.exportFile, locale)
      downloadBlob(blob, `speakdaily-recordings-${toDateKey()}.zip`)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : t.archive.exportFailed)
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async (id: string, label: string) => {
    if (!window.confirm(t.archive.deleteConfirm(label.slice(0, 80)))) return
    await remove(id)
  }

  const totalMinutes = Math.round(recordings.reduce((s, r) => s + r.durationSec, 0) / 60)

  return (
    <div className="stack-lg">
      <PageHeader
        icon={Archive}
        title={t.archive.title}
        subtitle={t.archive.summary(recordings.length, totalMinutes)}
        actions={
          <button type="button" className="btn" onClick={() => void handleExport()} disabled={exporting || recordings.length === 0}>
            <Download size={16} aria-hidden />
            {exporting ? t.archive.exporting : t.archive.export}
          </button>
        }
      />

      {(error || exportError) && (
        <div className="alert alert-danger" role="alert">
          <p className="small">{error ? t.archive.loadError : exportError}</p>
        </div>
      )}

      <div className="segmented" role="tablist" style={{ alignSelf: 'flex-start' }}>
        <button type="button" role="tab" aria-selected={view === 'list'} className={view === 'list' ? 'active' : ''} onClick={() => setParams({})}>
          <ListMusic size={16} aria-hidden />
          {t.archive.tabRecordings}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'compare'}
          className={view === 'compare' ? 'active' : ''}
          onClick={() => setParams({ compare: '' })}
        >
          <GitCompareArrows size={16} aria-hidden />
          {t.archive.tabCompare}
        </button>
      </div>

      {loading ? (
        <section className="card">
          <SkeletonList rows={4} />
        </section>
      ) : recordings.length === 0 ? (
        <section className="card">
          <EmptyState
            icon={AudioLines}
            title={t.archive.emptyTitle}
            text={t.archive.emptyText}
            action={
              <Link className="btn btn-primary" to="/">
                {t.archive.goToday}
                <ArrowRight size={16} aria-hidden />
              </Link>
            }
          />
        </section>
      ) : view === 'compare' ? (
        <section className="card">
          <ComparePanel key={compareGroup} recordings={recordings} initialGroup={compareGroup} />
        </section>
      ) : (
        <section className="card stack">
          <div className="row">
            <div className="segmented">
              {filters.map((f) => (
                <button key={f.id} type="button" className={filter === f.id ? 'active' : ''} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="search">
              <Search size={16} aria-hidden />
              <input
                className="input"
                type="search"
                placeholder={t.archive.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t.archive.search}
              />
            </div>
          </div>
          {visible.length === 0 ? (
            <EmptyState icon={SearchX} title={t.archive.noMatch} />
          ) : (
            <div>
              {visible.map((rec) => (
                <RecordingRow
                  key={rec.id}
                  rec={rec}
                  actions={
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => void handleDelete(rec.id, rec.promptText)}
                      aria-label={t.archive.deleteAria}
                      title={t.archive.deleteAria}
                    >
                      <Trash2 size={16} aria-hidden />
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
