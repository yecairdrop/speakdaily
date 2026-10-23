import { Briefcase, ChevronUp, Gauge, Headphones, MessageCircleWarning, Mic, Play, Target, Timer, Video } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useI18n } from '../hooks/useI18n'
import { formatDuration } from '../lib/dates'
import type { Recording } from '../types'
import { HighlightedTranscript } from './HighlightedTranscript'
import { MediaPlayback } from './MediaPlayback'

interface Props {
  rec: Recording
  showPrompt?: boolean
  actions?: ReactNode
}

const KIND_ICON = { speaking: Mic, shadowing: Headphones, mock: Briefcase } as const
const KIND_TONE = { speaking: '', shadowing: 'mint', mock: 'rose' } as const

/** One recording in a list: key stats, lazy audio player and expandable transcript. */
export function RecordingRow({ rec, showPrompt = true, actions }: Props) {
  const { t, formatDateTime } = useI18n()
  const [open, setOpen] = useState(false)
  const Icon = KIND_ICON[rec.kind]

  return (
    <div className="list-item">
      <div className="list-row">
        <span className={`list-icon ${KIND_TONE[rec.kind]}`} aria-hidden>
          <Icon size={20} />
        </span>
        <div className="list-main">
          <div className="row xs muted" style={{ gap: 6 }}>
            <span className="bold">{formatDateTime(rec.createdAt)}</span>
            <span className="badge">{t.categories[rec.category]}</span>
            {rec.kind === 'mock' && <span className="badge badge-accent">{t.archive.mockBadge}</span>}
            {rec.hasVideo && (
              <span className="badge">
                <Video size={12} aria-hidden /> {t.archive.video}
              </span>
            )}
          </div>
          {showPrompt && (
            <div className="list-title" lang="en">
              {rec.promptText}
            </div>
          )}
          <div className="meta-row">
            <span>
              <Timer size={14} aria-hidden /> {formatDuration(rec.durationSec)}
            </span>
            <span>
              <Gauge size={14} aria-hidden /> {t.archive.wpm(rec.analysis.wordsPerMinute)}
            </span>
            <span>
              <MessageCircleWarning size={14} aria-hidden /> {t.archive.fillers(rec.analysis.fillerTotal)}
            </span>
            {rec.similarity !== undefined && (
              <span>
                <Target size={14} aria-hidden /> {t.archive.match(rec.similarity)}
              </span>
            )}
          </div>
        </div>
        <div className="list-actions">
          <button type="button" className="btn btn-sm btn-soft" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? <ChevronUp size={16} aria-hidden /> : <Play size={14} fill="currentColor" aria-hidden />}
            {open ? t.common.hide : t.common.listen}
          </button>
          {actions}
        </div>
      </div>
      {open && (
        <div className="stack" style={{ animation: 'pop-in 200ms ease both' }}>
          <MediaPlayback blob={rec.audio} video={rec.hasVideo} />
          <HighlightedTranscript text={rec.transcript} fillers={rec.analysis.fillers.map((f) => f.word)} />
        </div>
      )}
    </div>
  )
}
