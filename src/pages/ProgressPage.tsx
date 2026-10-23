import { BookOpenCheck, CalendarDays, ChartLine, Flame, Gauge, MessageCircleWarning, Mic, Table, Timer, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { StatCard } from '../components/AnalysisView'
import { Disclosure } from '../components/ui/Disclosure'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { useApp } from '../hooks/useApp'
import { useI18n } from '../hooks/useI18n'
import { useRecordings } from '../hooks/useRecordings'
import { useThemeColors, type ThemeColors } from '../hooks/useThemeColors'
import { toDateKey } from '../lib/dates'
import { dailySpeakingStats, heatmapCells, weeklyMinutes } from '../lib/progressData'
import { currentStreak, formatMinutes, longestStreak, totalSeconds } from '../lib/stats'
import { totalStats } from '../lib/vocab/plan'

function axisProps(c: ThemeColors) {
  return {
    stroke: c.border,
    tick: { fill: c.muted, fontSize: 12 },
    tickLine: false,
    axisLine: false,
  }
}

function tooltipProps(c: ThemeColors) {
  return {
    contentStyle: {
      background: c.surface,
      border: `1px solid ${c.border}`,
      borderRadius: 12,
      color: c.text,
      fontSize: 13,
      fontFamily: 'inherit',
    },
    labelStyle: { color: c.muted },
    itemStyle: { color: c.text },
    cursor: { stroke: c.border, fill: c.border, fillOpacity: 0.3 },
  }
}

export default function ProgressPage() {
  const { settings, progress, vocab } = useApp()
  const { t, formatDate } = useI18n()
  const { recordings, loading } = useRecordings()
  const c = useThemeColors()

  const daily = useMemo(() => dailySpeakingStats(recordings), [recordings])
  const weekly = useMemo(() => weeklyMinutes(progress, settings.startDate), [progress, settings.startDate])
  const cells = useMemo(() => heatmapCells(progress, settings.startDate), [progress, settings.startDate])
  const today = toDateKey()

  const first = daily.slice(0, 5)
  const last = daily.slice(-5)
  const avgWpm = (pts: typeof daily) => (pts.length ? Math.round(pts.reduce((s, p) => s + p.wpm, 0) / pts.length) : 0)
  const avgFpm = (pts: typeof daily) => (pts.length ? (pts.reduce((s, p) => s + p.fillersPerMin, 0) / pts.length).toFixed(1) : '0')

  if (loading) {
    return (
      <div className="stack-lg" aria-busy="true">
        <Skeleton height={56} width="50%" />
        <div className="stat-grid">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} height={120} style={{ borderRadius: 18 }} />
          ))}
        </div>
        <Skeleton height={260} style={{ borderRadius: 26 }} />
      </div>
    )
  }

  return (
    <div className="stack-lg">
      <PageHeader icon={TrendingUp} title={t.progress.title} subtitle={t.progress.subtitle} />

      <div className="stat-grid">
        <StatCard icon={Flame} label={t.progress.currentStreak} value={currentStreak(progress)} sub={t.progress.best(longestStreak(progress))} />
        <StatCard icon={Timer} tone="mint" label={t.progress.minutesSpoken} value={formatMinutes(totalSeconds(progress))} sub={t.progress.recordings(recordings.length)} />
        <StatCard icon={Gauge} label={t.progress.wpm} value={avgWpm(last)} sub={t.progress.recentVsFirst(avgWpm(first))} />
        <StatCard icon={MessageCircleWarning} tone="sun" label={t.progress.fillersPerMin} value={avgFpm(last)} sub={t.progress.recentVsFirst(avgFpm(first))} />
        <StatCard
          icon={BookOpenCheck}
          tone="mint"
          label={t.progress.wordsLearned}
          value={`${totalStats(vocab).learned}/180`}
          sub={t.progress.wordsUsed(totalStats(vocab).usedInSpeech)}
        />
      </div>

      <section className="card">
        <div className="card-title">
          <h2>
            <CalendarDays size={20} aria-hidden />
            {t.progress.calendar}
          </h2>
          <span className="xs muted bold">
            {settings.startDate ? t.progress.programWeeks(formatDate(settings.startDate)) : t.progress.last12}
          </span>
        </div>
        <div className="heatmap" role="img" aria-label={t.progress.calendarAria}>
          {cells.map((cell) => (
            <div
              key={cell.dateKey}
              className={`heat-cell l${cell.level}${cell.dateKey === today ? ' today' : ''}${cell.dateKey > today ? ' future' : ''}`}
              title={t.progress.cellTitle(formatDate(cell.dateKey), cell.minutes.toFixed(1))}
            />
          ))}
        </div>
        <div className="row spread" style={{ marginTop: 10 }}>
          <span className="xs muted">{t.progress.calendarHint}</span>
          <div className="heat-legend">
            {t.progress.less} <div className="heat-cell" /> <div className="heat-cell l1" /> <div className="heat-cell l2" />
            <div className="heat-cell l3" /> {t.progress.more}
          </div>
        </div>
      </section>

      {daily.length < 2 ? (
        <section className="card">
          <EmptyState
            icon={ChartLine}
            title={t.empty.chartsTitle}
            text={t.progress.needTwoDays}
            action={
              <Link className="btn btn-primary" to="/">
                <Mic size={16} aria-hidden />
                {t.progress.practiceNow}
              </Link>
            }
          />
        </section>
      ) : (
        <div className="grid grid-2">
          <section className="card">
            <h2>{t.progress.wpmChart}</h2>
            <p className="xs muted">{t.progress.wpmBand}</p>
            <div className="chart-box">
              <ResponsiveContainer>
                <LineChart data={daily} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke={c.border} vertical={false} strokeOpacity={0.6} />
                  <ReferenceArea y1={110} y2={150} fill={c.secondary} fillOpacity={0.1} stroke="none" />
                  <XAxis dataKey="label" {...axisProps(c)} minTickGap={16} />
                  <YAxis {...axisProps(c)} allowDecimals={false} />
                  <Tooltip {...tooltipProps(c)} formatter={(v) => [`${String(v)} WPM`, t.progress.pace]} />
                  <Line
                    type="monotone"
                    dataKey="wpm"
                    stroke={c.accent}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: c.accent, stroke: c.surface, strokeWidth: 2 }}
                    activeDot={{ r: 6, stroke: c.surface, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card">
            <h2>{t.progress.fillersChart}</h2>
            <p className="xs muted">{t.progress.fillersHint}</p>
            <div className="chart-box">
              <ResponsiveContainer>
                <LineChart data={daily} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke={c.border} vertical={false} strokeOpacity={0.6} />
                  <XAxis dataKey="label" {...axisProps(c)} minTickGap={16} />
                  <YAxis {...axisProps(c)} />
                  <Tooltip {...tooltipProps(c)} formatter={(v) => [`${String(v)} ${t.progress.perMinUnit}`, t.progress.fillersLabel]} />
                  <Line
                    type="monotone"
                    dataKey="fillersPerMin"
                    stroke={c.accent}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: c.accent, stroke: c.surface, strokeWidth: 2 }}
                    activeDot={{ r: 6, stroke: c.surface, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}

      {weekly.some((w) => w.minutes > 0) && (
        <section className="card">
          <h2>{t.progress.weeklyChart}</h2>
          <div className="chart-box">
            <ResponsiveContainer>
              <BarChart data={weekly} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
                <CartesianGrid stroke={c.border} vertical={false} strokeOpacity={0.6} />
                <XAxis dataKey="label" {...axisProps(c)} />
                <YAxis {...axisProps(c)} />
                <Tooltip {...tooltipProps(c)} formatter={(v) => [`${String(v)} ${t.common.minutesShort}`, t.progress.spoken]} />
                <Bar dataKey="minutes" fill={c.accent} radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {daily.length > 0 && (
        <Disclosure summary={t.progress.showTable} icon={Table}>
          <div style={{ overflowX: 'auto' }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>{t.progress.colDate}</th>
                  <th>{t.progress.colAnswers}</th>
                  <th>{t.progress.colWpm}</th>
                  <th>{t.progress.colFillers}</th>
                </tr>
              </thead>
              <tbody>
                {daily.map((d) => (
                  <tr key={d.dateKey}>
                    <td>{formatDate(d.dateKey)}</td>
                    <td>{d.count}</td>
                    <td>{d.wpm}</td>
                    <td>{d.fillersPerMin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Disclosure>
      )}
    </div>
  )
}
