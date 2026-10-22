import { useState, type ReactNode } from 'react'
import { CATEGORY_LABELS } from '../data/prompts'
import { formatDateTime, formatDuration } from '../lib/dates'
import type { Recording } from '../types'
import { HighlightedTranscript } from './HighlightedTranscript'
import { MediaPlayback } from './MediaPlayback'

interface Props {
  rec: Recording
  showPrompt?: boolean
  actions?: ReactNode
  selected?: boolean
}

/** One recording in a list: key stats, lazy audio player and expandable transcript. */
export function RecordingRow({ rec, showPrompt = true, actions, selected = false }: Props) {
  const [open, setOpen] = useState(false)
  const label = rec.category === 'shadowing' ? 'Shadowing' : CATEGORY_LABELS[rec.category]

  return (
    <div className={`list-item${selected ? ' selected' : ''}`}>
      <div className="row spread" style={{ alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="row small muted" style={{ gap: '0.4rem' }}>
            <span>{formatDateTime(rec.createdAt)}</span>
            <span className="badge">{label}</span>
            {rec.kind === 'mock' && <span className="badge badge-accent">Mock</span>}
            {rec.hasVideo && <span className="badge">🎥 Video</span>}
          </div>
          {showPrompt && <div style={{ fontWeight: 600, margin: '0.25rem 0' }}>{rec.promptText}</div>}
          <div className="row small" style={{ gap: '0.9rem' }}>
            <span>⏱ {formatDuration(rec.durationSec)}</span>
            <span>{rec.analysis.wordsPerMinute} WPM</span>
            <span>{rec.analysis.fillerTotal} fillers</span>
            {rec.similarity !== undefined && <span>{rec.similarity}% match</span>}
          </div>
        </div>
        <div className="row">
          <button type="button" className="btn btn-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? 'Hide' : '▶ Listen'}
          </button>
          {actions}
        </div>
      </div>
      {open && (
        <div className="stack" style={{ marginTop: '0.75rem' }}>
          <MediaPlayback blob={rec.audio} video={rec.hasVideo} />
          <HighlightedTranscript text={rec.transcript} fillers={rec.analysis.fillers.map((f) => f.word)} />
        </div>
      )}
    </div>
  )
}
