import { toDateKey } from './dates'
import { toMeta } from './db'
import type { Recording } from '../types'

function extensionFor(mime: string): string {
  if (mime.includes('mp4')) return mime.startsWith('video') ? 'mp4' : 'm4a'
  if (mime.includes('ogg')) return 'ogg'
  return 'webm'
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

function transcriptFile(rec: Recording): string {
  const a = rec.analysis
  return [
    `Prompt: ${rec.promptText}`,
    `Date: ${new Date(rec.createdAt).toLocaleString('en-GB')}`,
    `Type: ${rec.kind} (${rec.category})`,
    `Duration: ${rec.durationSec}s`,
    `Words: ${a.wordCount} · WPM: ${a.wordsPerMinute} · Fillers: ${a.fillerTotal} (${a.fillersPerMinute}/min)`,
    `Longest pause: ${a.longestPauseSec ?? 'n/a'}s · Vocabulary variety: ${Math.round(a.vocabularyVariety * 100)}%`,
    `Connectors used: ${a.connectorsUsed.join(', ') || 'none'}`,
    ...(rec.similarity !== undefined ? [`Shadowing match: ${rec.similarity}%`] : []),
    '',
    'Transcript:',
    rec.transcript || '(no speech recognised)',
    '',
  ].join('\n')
}

/** Builds a zip with one folder per recording (audio + transcript.txt) and a JSON index. */
export async function exportRecordingsZip(recordings: Recording[]): Promise<Blob> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const root = zip.folder(`speakdaily-${toDateKey()}`)
  if (!root) throw new Error('Could not create zip folder')

  const used = new Set<string>()
  for (const rec of [...recordings].sort((a, b) => a.createdAt - b.createdAt)) {
    const stamp = new Date(rec.createdAt).toISOString().slice(0, 16).replace(/[:T]/g, '-')
    let name = `${stamp}_${slug(rec.promptText) || rec.kind}`
    while (used.has(name)) name += '-x'
    used.add(name)
    const folder = root.folder(name)
    if (!folder) continue
    folder.file(`${rec.hasVideo ? 'video' : 'audio'}.${extensionFor(rec.mimeType)}`, rec.audio)
    folder.file('transcript.txt', transcriptFile(rec))
  }
  root.file('recordings.json', JSON.stringify(recordings.map(toMeta), null, 2))
  return zip.generateAsync({ type: 'blob' })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
