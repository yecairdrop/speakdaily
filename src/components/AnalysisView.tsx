import { Gauge, Lightbulb, Link2, MessageCircleWarning, Pause, Sparkles, Timer, type LucideIcon } from 'lucide-react'
import { connectorMeaningTr } from '../data/connectorsTr'
import { useI18n } from '../hooks/useI18n'
import { formatDuration } from '../lib/dates'
import { tipText } from '../i18n'
import type { AnalysisResult } from '../types'
import { HighlightedTranscript } from './HighlightedTranscript'
import { Disclosure } from './ui/Disclosure'

interface StatCardProps {
  icon: LucideIcon
  tone?: '' | 'mint' | 'sun'
  label: string
  value: string | number
  sub?: string
}

export function StatCard({ icon: Icon, tone = '', label, value, sub }: StatCardProps) {
  return (
    <div className="stat">
      <span className={`stat-icon ${tone}`} aria-hidden>
        <Icon size={18} />
      </span>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  )
}

export function StatGrid({ analysis, durationSec }: { analysis: AnalysisResult; durationSec: number }) {
  const { t } = useI18n()
  return (
    <div className="stat-grid stat-grid-6">
      <StatCard icon={Gauge} label={t.analysis.wpm} value={analysis.wordsPerMinute} sub={t.analysis.wpmTarget} />
      <StatCard
        icon={MessageCircleWarning}
        tone="sun"
        label={t.analysis.fillers}
        value={analysis.fillerTotal}
        sub={t.analysis.perMin(analysis.fillersPerMinute)}
      />
      <StatCard icon={Link2} tone="mint" label={t.analysis.connectorsUsed} value={analysis.connectorsUsed.length} />
      <StatCard
        icon={Timer}
        label={t.analysis.duration}
        value={formatDuration(durationSec)}
        sub={`${analysis.wordCount} ${t.analysis.words.toLowerCase()}`}
      />
      <StatCard
        icon={Pause}
        tone="sun"
        label={t.analysis.longestPause}
        value={analysis.longestPauseSec === null ? '—' : `${analysis.longestPauseSec}s`}
        sub={t.common.approx}
      />
      <StatCard
        icon={Sparkles}
        tone="mint"
        label={t.analysis.variety}
        value={`${Math.round(analysis.vocabularyVariety * 100)}%`}
        sub={t.analysis.uniqueWords(analysis.uniqueWords)}
      />
    </div>
  )
}

function ConnectorList({ phrases, chip }: { phrases: string[]; chip: string }) {
  return (
    <ul className="term-list">
      {phrases.map((c) => (
        <li key={c}>
          <span className={`chip ${chip}`} lang="en">
            {c}
          </span>
          {connectorMeaningTr(c) && (
            <span className="meaning" lang="tr">
              {connectorMeaningTr(c)}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

interface Props {
  analysis: AnalysisResult
  transcript: string
  durationSec: number
}

export function AnalysisView({ analysis, transcript, durationSec }: Props) {
  const { t } = useI18n()
  return (
    <div className="stack-lg">
      <StatGrid analysis={analysis} durationSec={durationSec} />

      <div className="stack" style={{ gap: 8 }}>
        <h3 className="m0">{t.analysis.transcript}</h3>
        <HighlightedTranscript text={transcript} fillers={analysis.fillers.map((f) => f.word)} />
        <p className="xs muted m0">
          <mark className="filler">{t.analysis.legendFiller}</mark> = {t.analysis.legendFillerText} ·{' '}
          <mark className="connector">{t.analysis.legendConnector}</mark> = {t.analysis.legendConnectorText}
        </p>
      </div>

      <div className="grid grid-2">
        <div className="card card-compact" style={{ boxShadow: 'none' }}>
          <h3>{t.analysis.fillersTitle}</h3>
          {analysis.fillers.length === 0 ? (
            <p className="small muted m0">{t.analysis.noFillers}</p>
          ) : (
            <div className="chips">
              {analysis.fillers.map((f) => (
                <span key={f.word} className="chip chip-warning" lang="en">
                  {f.word} × {f.count}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="card card-compact" style={{ boxShadow: 'none' }}>
          <h3>{t.analysis.connectorsTitle}</h3>
          {analysis.connectorsUsed.length > 0 ? (
            <ConnectorList phrases={analysis.connectorsUsed} chip="chip-success" />
          ) : (
            <p className="small muted">{t.analysis.noConnectors}</p>
          )}
          <p className="small bold" style={{ margin: '12px 0 8px' }}>
            {t.analysis.tryNext}
          </p>
          <ConnectorList phrases={analysis.connectorSuggestions} chip="chip-suggest" />
        </div>
      </div>

      {analysis.feedback.length > 0 && (
        <div className="alert">
          <Lightbulb size={20} aria-hidden style={{ color: 'var(--warning)' }} />
          <div>
            <p className="bold" style={{ marginBottom: 4 }}>
              {t.analysis.tipsTitle}
            </p>
            <ul className="bullets small">
              {analysis.feedback.map((f, i) => (
                <li key={i}>{tipText(t, f)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Disclosure summary={t.analysis.explainTitle} icon={Lightbulb}>
        <dl className="glossary small">
          <dt>WPM</dt>
          <dd>{t.analysis.explain.wpm}</dd>
          <dt>{t.analysis.fillers}</dt>
          <dd>{t.analysis.explain.fillers}</dd>
          <dt>{t.analysis.connectorsTitle}</dt>
          <dd>{t.analysis.explain.connectors}</dd>
          <dt>{t.analysis.longestPause}</dt>
          <dd>{t.analysis.explain.pause}</dd>
          <dt>{t.analysis.variety}</dt>
          <dd>{t.analysis.explain.variety}</dd>
        </dl>
      </Disclosure>
    </div>
  )
}
