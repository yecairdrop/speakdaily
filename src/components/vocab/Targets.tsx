import { CircleCheck, Circle, Crosshair } from 'lucide-react'
import { useApp } from '../../hooks/useApp'
import { useI18n } from '../../hooks/useI18n'
import { ALL_ITEMS } from '../../data/units'
import { findUsedItems } from '../../lib/vocab/match'
import type { VocabItem } from '../../types'
import { SpeakButton } from './SpeakButton'

/** Before / while recording: the chunks to try to use. */
export function TargetsPanel({ targets }: { targets: readonly VocabItem[] }) {
  const { t } = useI18n()
  if (targets.length === 0) return null
  return (
    <div className="targets">
      <div className="row bold" style={{ color: 'var(--accent)' }}>
        <Crosshair size={18} aria-hidden />
        {t.targets.title}
      </div>
      <p className="xs muted m0">{t.targets.hint}</p>
      <ul className="target-list">
        {targets.map((item) => (
          <li key={item.id}>
            <span className={`chip ${item.kind === 'connector' ? 'chip-success' : 'chip-suggest'}`} lang="en">
              {item.term}
            </span>
            <span className="xs muted" lang="tr">
              {item.tr}
            </span>
            <SpeakButton text={item.term} label={t.units.listenItem(item.term)} size={14} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** After recording: which targets you actually used, plus other learned chunks you used. */
export function TargetsResult({ targets, transcript }: { targets: readonly VocabItem[]; transcript: string }) {
  const { t } = useI18n()
  const { vocab } = useApp()
  const used = new Set(findUsedItems(transcript, targets).map((i) => i.id))
  const others = findUsedItems(
    transcript,
    ALL_ITEMS.filter((i) => vocab.items[i.id] && !targets.some((tg) => tg.id === i.id)),
  )

  return (
    <div className="targets">
      <div className="row spread">
        <span className="row bold">
          <Crosshair size={18} aria-hidden style={{ color: 'var(--accent)' }} />
          {t.targets.resultTitle}
        </span>
        <span className={`badge ${used.size > 0 ? 'badge-success' : ''}`}>{t.targets.usedCount(used.size, targets.length)}</span>
      </div>
      <ul className="target-list">
        {targets.map((item) => (
          <li key={item.id} className={used.has(item.id) ? 'used' : 'unused'}>
            {used.has(item.id) ? (
              <CircleCheck size={18} aria-hidden style={{ color: 'var(--success)' }} />
            ) : (
              <Circle size={18} aria-hidden className="subtle" />
            )}
            <span className="bold" lang="en">
              {item.term}
            </span>
            <span className="xs muted" lang="tr">
              {item.tr}
            </span>
          </li>
        ))}
      </ul>
      {used.size === 0 && <p className="small muted m0">{t.targets.none}</p>}
      {others.length > 0 && (
        <div>
          <p className="xs bold muted" style={{ margin: '8px 0 6px' }}>
            {t.targets.alsoUsed}
          </p>
          <div className="chips" lang="en">
            {others.map((i) => (
              <span key={i.id} className="chip chip-success">
                ✓ {i.term}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
