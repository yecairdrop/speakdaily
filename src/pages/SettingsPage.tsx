import { useEffect, useState } from 'react'
import { useApp } from '../hooks/useApp'
import { clearDatabase } from '../lib/db'
import { DEFAULT_FILLERS } from '../lib/storage'

const LIMITS = [30, 45, 60, 90, 120, 150, 180, 240, 300]

function parseFillers(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split(/[,\n]/)
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean),
    ),
  )
}

interface StorageInfo {
  usedMb: number
  quotaMb: number
  persisted: boolean
}

async function readStorageInfo(): Promise<StorageInfo | null> {
  if (!navigator.storage?.estimate) return null
  const est = await navigator.storage.estimate()
  const persisted = navigator.storage.persisted ? await navigator.storage.persisted() : false
  return {
    usedMb: Math.round(((est.usage ?? 0) / 1024 / 1024) * 10) / 10,
    quotaMb: Math.round((est.quota ?? 0) / 1024 / 1024),
    persisted,
  }
}

export default function SettingsPage() {
  const { settings, updateSettings, resetAll } = useApp()
  const [fillerText, setFillerText] = useState(settings.fillerWords.join(', '))
  const [saved, setSaved] = useState(false)
  const [storage, setStorage] = useState<StorageInfo | null>(null)
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    let cancelled = false
    readStorageInfo()
      .then((info) => {
        if (!cancelled) setStorage(info)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [cleared])

  const saveFillers = () => {
    const list = parseFillers(fillerText)
    updateSettings({ fillerWords: list.length ? list : DEFAULT_FILLERS })
    setFillerText((list.length ? list : DEFAULT_FILLERS).join(', '))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1500)
  }

  const requestPersist = async () => {
    if (navigator.storage?.persist) await navigator.storage.persist()
    setStorage(await readStorageInfo())
  }

  const clearAll = async () => {
    const ok = window.confirm(
      'Delete ALL recordings, mock sessions, progress and settings from this browser?\n\nThis cannot be undone. Export a zip from the Archive first if you want a backup.',
    )
    if (!ok) return
    await clearDatabase()
    resetAll()
    setFillerText(DEFAULT_FILLERS.join(', '))
    setCleared(true)
  }

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Everything is stored locally in this browser — no account, no server.</p>
      </div>

      {cleared && (
        <div className="alert alert-success">
          <p>All data was deleted. Set a new start date on the Today screen to begin again.</p>
        </div>
      )}

      <div className="card">
        <h2>Program</h2>
        <div className="grid grid-2">
          <div className="field">
            <label htmlFor="start">Start date (day 1)</label>
            <input
              id="start"
              className="input"
              type="date"
              value={settings.startDate ?? ''}
              onChange={(e) => updateSettings({ startDate: e.target.value || null })}
            />
            <span className="hint">Your current week and phase are calculated from this date.</span>
          </div>
          <div className="field">
            <label htmlFor="limit">Daily answer time limit</label>
            <select
              id="limit"
              className="input"
              value={settings.timeLimitOverride ?? ''}
              onChange={(e) => updateSettings({ timeLimitOverride: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Automatic by phase (60s / 120s / 180s)</option>
              {LIMITS.map((s) => (
                <option key={s} value={s}>
                  {s} seconds
                </option>
              ))}
            </select>
            <span className="hint">You can still change the limit on the recorder before each answer.</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Speech</h2>
        <div className="field">
          <label htmlFor="fillers">Filler words to detect</label>
          <textarea
            id="fillers"
            className="input"
            value={fillerText}
            onChange={(e) => setFillerText(e.target.value)}
            rows={3}
          />
          <span className="hint">Comma or line separated. Multi-word fillers like “you know” work too.</span>
        </div>
        <div className="row" style={{ marginBottom: '1rem' }}>
          <button type="button" className="btn btn-primary" onClick={saveFillers}>
            {saved ? 'Saved ✓' : 'Save filler list'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setFillerText(DEFAULT_FILLERS.join(', '))}>
            Reset to defaults
          </button>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="lang">Speech recognition language</label>
          <select id="lang" className="input" value="en-US" disabled>
            <option value="en-US">English (United States) — en-US</option>
          </select>
          <span className="hint">Locked to en-US so the recogniser judges your English, not your native language.</span>
        </div>
      </div>

      <div className="card">
        <h2>Appearance</h2>
        <div className="segmented" role="group" aria-label="Theme">
          {(['dark', 'light'] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={settings.theme === t ? 'active' : ''}
              onClick={() => updateSettings({ theme: t })}
              aria-pressed={settings.theme === t}
            >
              {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Data</h2>
        {storage && (
          <p className="small">
            Using <strong>{storage.usedMb} MB</strong> of ~{storage.quotaMb.toLocaleString()} MB available.{' '}
            {storage.persisted ? (
              <span className="badge badge-success">Persistent storage on</span>
            ) : (
              <>
                <span className="badge badge-warning">Browser may evict data when disk is low</span>{' '}
                <button type="button" className="btn btn-sm" onClick={() => void requestPersist()}>
                  Make storage persistent
                </button>
              </>
            )}
          </p>
        )}
        <p className="small muted">
          Recordings live only in this browser profile. Clearing site data or using another browser means starting
          fresh — export a zip from the Archive regularly as a backup.
        </p>
        <button type="button" className="btn btn-danger" onClick={() => void clearAll()}>
          Clear all data…
        </button>
      </div>
    </div>
  )
}
