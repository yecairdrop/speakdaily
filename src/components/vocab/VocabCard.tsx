import { useApp } from '../../hooks/useApp'
import { useI18n } from '../../hooks/useI18n'
import { itemLevel } from '../../lib/vocab/srs'
import type { VocabItem } from '../../types'
import { HighlightedExample } from './HighlightedExample'
import { SpeakButton } from './SpeakButton'

export function VocabCard({ item }: { item: VocabItem }) {
  const { settings, vocab } = useApp()
  const { t } = useI18n()
  const level = itemLevel(vocab.items[item.id])

  return (
    <article className={`vocab-card kind-${item.kind}`}>
      <div className="row spread" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <div className="row" style={{ gap: 6, marginBottom: 2 }}>
            <span className={`badge ${item.kind === 'connector' ? 'badge-secondary' : ''}`}>{t.units.kind[item.kind]}</span>
            {level !== 'new' && <span className={`badge level-${level}`}>{t.units.levels[level]}</span>}
          </div>
          <div className="vocab-term" lang="en">
            {item.term}
          </div>
          <div className="vocab-tr" lang="tr">
            {item.tr}
          </div>
        </div>
        <SpeakButton text={item.term} label={t.units.listenItem(item.term)} size={20} />
      </div>
      <div className="vocab-example">
        <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: 4 }}>
          <p className="m0" style={{ flex: 1 }}>
            <HighlightedExample item={item} />
          </p>
          <SpeakButton text={item.example} label={t.units.listenExample} size={16} />
        </div>
        {settings.showHintsTr && (
          <p className="small muted m0" lang="tr">
            {item.exampleTr}
          </p>
        )}
      </div>
    </article>
  )
}
