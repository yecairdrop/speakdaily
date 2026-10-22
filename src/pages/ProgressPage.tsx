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
import { useApp } from '../hooks/useApp'
import { useRecordings } from '../hooks/useRecordings'
import { useThemeColors, type ThemeColors } from '../hooks/useThemeColors'
import { formatDate, toDateKey } from '../lib/dates'
import { dailySpeakingStats, heatmapCells, weeklyMinutes } from '../lib/progressData'
import { currentStreak, formatMinutes, longestStreak, totalSeconds } from '../lib/stats'

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
      borderRadius: 8,
      color: c.text,
      fontSize: 13,
    },
    labelStyle: { color: c.muted },
    itemStyle: { color: c.text },
    cursor: { stroke: c.border, fill: c.border, fillOpacity: 0.3 },
  }
}

export default function ProgressPage() {
  const { settings, progress } = useApp()
  const { recordings, loading } = useRecordings()
  const c = useThemeColors()

  const daily = useMemo(() => dailySpeakingStats(recordings), [recordings])
  const weekly = useMemo(() => weeklyMinutes(progress, settings.startDate), [progress, settings.startDate])
  const cells = useMemo(() => heatmapCells(progress, settings.startDate), [progress, settings.startDate])
  const today = toDateKey()

  const first = daily.slice(0, 5)
  const last = daily.slice(-5)
  const avgWpm = (pts: typeof daily) => (pts.length ? Math.round(pts.reduce((s, p) => s + p.wpm, 0) / pts.length) : 0)
  const avgFpm = (pts: typeof daily) =>
    pts.length ? (pts.reduce((s, p) => s + p.fillersPerMin, 0) / pts.length).toFixed(1) : '0'

  if (loading) return <p className="muted">Loading…</p>

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Progress</h1>
        <p>WPM and filler charts use free-speaking answers only (shadowing is reading, so it is excluded).</p>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label">Current streak</div>
          <div className="stat-value">🔥 {currentStreak(progress)}</div>
          <div className="stat-sub">best: {longestStreak(progress)} days</div>
        </div>
        <div className="stat">
          <div className="stat-label">Minutes spoken</div>
          <div className="stat-value">{formatMinutes(totalSeconds(progress))}</div>
          <div className="stat-sub">{recordings.length} recordings</div>
        </div>
        <div className="stat">
          <div className="stat-label">WPM</div>
          <div className="stat-value">{avgWpm(last)}</div>
          <div className="stat-sub">recent days · first days: {avgWpm(first)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Fillers / min</div>
          <div className="stat-value">{avgFpm(last)}</div>
          <div className="stat-sub">recent days · first days: {avgFpm(first)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <h2>Practice calendar</h2>
          <span className="small muted">
            {settings.startDate ? `12 program weeks from ${formatDate(settings.startDate)}` : 'Last 12 weeks'}
          </span>
        </div>
        <div className="heatmap" role="img" aria-label="Calendar heatmap of minutes spoken per day">
          {cells.map((cell) => (
            <div
              key={cell.dateKey}
              className={`heat-cell l${cell.level}${cell.dateKey === today ? ' today' : ''}${cell.dateKey > today ? ' out' : ''}`}
              title={`${formatDate(cell.dateKey)}: ${cell.minutes.toFixed(1)} min`}
            />
          ))}
        </div>
        <div className="row spread" style={{ marginTop: '0.5rem' }}>
          <span className="small muted">Columns = weeks, rows = days 1–7</span>
          <div className="heat-legend">
            Less <div className="heat-cell" /> <div className="heat-cell l1" /> <div className="heat-cell l2" />
            <div className="heat-cell l3" /> More
          </div>
        </div>
      </div>

      {daily.length < 2 ? (
        <div className="card empty">
          <p>Charts appear after you have practised on at least two different days.</p>
          <Link className="btn btn-primary" to="/">
            Practise now
          </Link>
        </div>
      ) : (
        <div className="grid grid-2">
          <div className="card" style={{ marginTop: 0 }}>
            <h2>Words per minute</h2>
            <p className="small muted">Shaded band = natural conversational pace (110–150).</p>
            <div className="chart-box">
              <ResponsiveContainer>
                <LineChart data={daily} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke={c.border} strokeDasharray="0" vertical={false} strokeOpacity={0.6} />
                  <ReferenceArea y1={110} y2={150} fill={c.success} fillOpacity={0.08} stroke="none" />
                  <XAxis dataKey="label" {...axisProps(c)} minTickGap={16} />
                  <YAxis {...axisProps(c)} allowDecimals={false} />
                  <Tooltip {...tooltipProps(c)} formatter={(v) => [`${String(v)} WPM`, 'Pace']} />
                  <Line
                    type="monotone"
                    dataKey="wpm"
                    stroke={c.accent}
                    strokeWidth={2}
                    dot={{ r: 3, fill: c.accent, stroke: c.surface, strokeWidth: 2 }}
                    activeDot={{ r: 5, stroke: c.surface, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ marginTop: 0 }}>
            <h2>Filler words per minute</h2>
            <p className="small muted">Lower is better. Aim for fewer than 3 per minute.</p>
            <div className="chart-box">
              <ResponsiveContainer>
                <LineChart data={daily} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke={c.border} vertical={false} strokeOpacity={0.6} />
                  <XAxis dataKey="label" {...axisProps(c)} minTickGap={16} />
                  <YAxis {...axisProps(c)} />
                  <Tooltip {...tooltipProps(c)} formatter={(v) => [`${String(v)} / min`, 'Fillers']} />
                  <Line
                    type="monotone"
                    dataKey="fillersPerMin"
                    stroke={c.accent}
                    strokeWidth={2}
                    dot={{ r: 3, fill: c.accent, stroke: c.surface, strokeWidth: 2 }}
                    activeDot={{ r: 5, stroke: c.surface, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {weekly.some((w) => w.minutes > 0) && (
        <div className="card">
          <h2>Minutes spoken per week</h2>
          <div className="chart-box">
            <ResponsiveContainer>
              <BarChart data={weekly} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
                <CartesianGrid stroke={c.border} vertical={false} strokeOpacity={0.6} />
                <XAxis dataKey="label" {...axisProps(c)} />
                <YAxis {...axisProps(c)} />
                <Tooltip {...tooltipProps(c)} formatter={(v) => [`${String(v)} min`, 'Spoken']} />
                <Bar dataKey="minutes" fill={c.accent} radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {daily.length > 0 && (
        <details className="card">
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Show data table</summary>
          <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Answers</th>
                  <th>WPM</th>
                  <th>Fillers / min</th>
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
        </details>
      )}
    </div>
  )
}
