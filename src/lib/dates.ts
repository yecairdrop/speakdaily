const DAY_MS = 24 * 60 * 60 * 1000

/** Local calendar date as YYYY-MM-DD (not UTC, so late-night practice counts for the right day). */
export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Whole calendar days from a to b (b - a), DST-safe. */
export function daysBetween(a: string, b: string): number {
  const da = fromDateKey(a)
  const db = fromDateKey(b)
  const utcA = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate())
  const utcB = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate())
  return Math.round((utcB - utcA) / DAY_MS)
}

export function addDays(key: string, days: number): string {
  const d = fromDateKey(key)
  d.setDate(d.getDate() + days)
  return toDateKey(d)
}

export function formatDate(key: string, locale = 'en-GB'): string {
  return fromDateKey(key).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(ts: number, locale = 'en-GB'): string {
  return new Date(ts).toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDuration(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}
